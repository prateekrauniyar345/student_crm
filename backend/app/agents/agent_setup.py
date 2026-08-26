# backend/app/agents/agent_setup.py

import os
import re
import json
import time
from typing import Literal, Annotated, Any
from typing_extensions import TypedDict
import operator

# LangGraph & LangChain Core
from langgraph.graph import StateGraph, END
from langchain_core.messages import (
    AnyMessage,
    HumanMessage,
    AIMessage,
    SystemMessage,
    ToolMessage,
)
from pydantic import BaseModel, Field

# Local imports
from app.agents.get_llm import llm
from app.agents.tools import (
    database_tools,
    tool_map,
)

# ==========================================================================================
# 1. STATE & SCHEMAS
# ==========================================================================================

class MessagesState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    route_decision: str | None
    last_sql_query: str | None
    last_query_result: dict[str, Any] | None

# ==========================================================================================
# 2. PROMPTS (Columbia GS Staff Analyst Persona)
# ==========================================================================================

SUPERVISOR_PROMPT = """
YOU ARE: Columbia University School of General Studies CRM Supervisor Router.
YOUR ROLE: Intelligently determine if the user query is asking for data from the database, or if it is a general greeting/conversational question/help request.

AVAILABLE AGENTS:
1. "sql_data_agent":
   - Use for ANY request asking about students, GPAs, academic standings (warning/probation), demographics, veteran cohorts, transfer pathways, admissions applications, decision codes, yield rates, degree programs, academic terms, advising sessions, or SQL database operations.
2. "general_agent":
   - Use for general greetings ("hi", "hello", "good morning", "hey"), inquiries about what the CRM or Co-Pilot does, system navigation instructions, or general conversational chit-chat not requiring database queries.

OUTPUT FORMAT:
Return valid JSON ONLY with no markdown formatting:
{"next_agent": "sql_data_agent"} or {"next_agent": "general_agent"}
"""

SQL_AGENT_PROMPT = """
YOU ARE: Columbia GS AI Analyst Co-Pilot & SQL Specialist.
YOUR ROLE: Translate the staff member's question into an accurate PostgreSQL SELECT query, execute it via the database tools, and provide an executive summary of findings.

DATABASE SCHEMA & ACCESSIBLE TABLES:
1. `student_profiles`: `person_id`, `student_number` (e.g. CU-2023-0001), `current_program_id`, `student_status` ('active', 'withdrawn', 'graduated', 'leave_of_absence'), `class_standing` ('first_year', 'sophomore', 'junior', 'senior').
2. `people`: `id`, `first_name`, `last_name`, `email`, `phone`, `lifecycle_stage` ('prospect', 'applicant', 'admitted', 'committed', 'enrolled', 'alumni'), `attributes` (JSONB: {"veteran": true, "transfer": true, "first_gen": true, "international": true, "honors": true}).
3. `student_term_records`: `person_id`, `term_id`, `program_id`, `credits_attempted`, `credits_earned`, `term_gpa`, `cumulative_gpa`, `academic_standing` ('good_standing', 'academic_warning', 'probation', 'suspension'), `advisor_meetings`.
4. `applications`: `id`, `person_id`, `program_id`, `term_id`, `application_year`, `stage` ('started', 'submitted', 'under_review', 'admitted', 'committed', 'enrolled'), `decision_code` ('AC' Accepted, 'AP' Provisional, 'WL' Waitlist, 'RH' Rejected), `reply_code` ('Y' Accepted, 'DF' Deferred, 'NC' Declined, 'NS' No Show), `applicant_source`, `transfer_institution_type`.
5. `programs`: `id`, `code` (e.g. 'CSCI', 'ECON', 'DATA', 'MATH', 'PSYC'), `name`, `degree_level` ('Bachelor', 'Postbac'), `is_active`.
6. `academic_terms`: `id`, `code` (e.g. '2024_FALL', '2025_SPRING'), `name` ('Fall 2024'), `application_year`, `start_date`, `end_date`.
7. `interactions`: `id`, `person_id`, `interaction_type` ('advising_session', 'email', 'phone_call'), `subject`, `notes`, `created_at`.

RULES:
1. Always generate read-only `SELECT` statements. Never generate `INSERT`, `UPDATE`, `DELETE`, or `DROP`.
2. Use proper table aliases (`sp` for `student_profiles`, `p` for `people`, `prog` for `programs`, `str` for `student_term_records`, `app` for `applications`).
3. For veteran students, query: `(p.attributes->>'veteran')::boolean = true`.
4. For transfer students, query: `(p.attributes->>'transfer')::boolean = true`.
5. For at-risk students, query: `str.academic_standing IN ('academic_warning', 'probation', 'suspension') OR str.cumulative_gpa < 2.50`.
6. Always call `execute_sql_query` to retrieve live data.
7. Provide a concise, professional executive summary with bullet points highlighting key insights.
"""

GENERAL_AGENT_PROMPT = """
YOU ARE: Columbia University School of General Studies AI Co-Pilot Assistant.
YOUR ROLE: Provide helpful, welcoming assistance to university staff and advisors.

CAPABILITIES:
- Explain what queries you can perform on Columbia GS student demographics, veteran cohorts, transfer pathways, admissions yield, and academic triage.
- Guide staff on how to use the Interactive SQL Studio and natural language prompts.
- Maintain a warm, collegiate, and professional tone.
"""

# ==========================================================================================
# 3. NATIVE ASYNC AGENT NODES
# ==========================================================================================

async def supervisor_node(state: MessagesState) -> dict:
    """Supervisor routing node deciding between sql_data_agent and general_agent."""
    try:
        prompt_messages = [SystemMessage(content=SUPERVISOR_PROMPT)] + list(state["messages"])
        response = await llm.ainvoke(prompt_messages)
        content = str(response.content).strip()
        
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            decision = json.loads(json_match.group(0)).get("next_agent", "sql_data_agent")
            return {"route_decision": decision}
    except Exception as e:
        print(f"Supervisor routing error: {e}")
        
    return {"route_decision": "sql_data_agent"}


async def sql_data_agent_node(state: MessagesState) -> dict:
    """SQL data agent node that reasons with tools, executes SQL, and summarizes answers asynchronously."""
    new_messages = []
    last_sql = None
    last_result = None

    try:
        prompt_messages = [SystemMessage(content=SQL_AGENT_PROMPT)] + list(state["messages"])
        llm_with_tools = llm.bind_tools(database_tools)
        
        current_conversation = list(prompt_messages)
        max_turns = 3

        for _ in range(max_turns):
            ai_response = await llm_with_tools.ainvoke(current_conversation)
            new_messages.append(ai_response)
            current_conversation.append(ai_response)

            if not ai_response.tool_calls:
                break

            for tc in ai_response.tool_calls:
                tool_name = tc["name"]
                tool_args = tc["args"]
                if tool_name == "execute_sql_query":
                    last_sql = tool_args.get("query")

                if tool_name in tool_map:
                    tool_fn = tool_map[tool_name]
                    raw_result = await tool_fn.ainvoke(tool_args)
                    try:
                        parsed = json.loads(raw_result)
                        if tool_name == "execute_sql_query":
                            last_result = parsed
                    except Exception:
                        pass
                    tool_msg = ToolMessage(content=raw_result, tool_call_id=tc["id"])
                    new_messages.append(tool_msg)
                    current_conversation.append(tool_msg)

    except Exception as e:
        err_msg = f"Unable to process query: {str(e)}"
        new_messages.append(AIMessage(content=err_msg))

    return {
        "messages": new_messages,
        "last_sql_query": last_sql,
        "last_query_result": last_result,
    }


async def general_agent_node(state: MessagesState) -> dict:
    """General conversational agent node for greetings, help, and platform guidance."""
    try:
        prompt_messages = [SystemMessage(content=GENERAL_AGENT_PROMPT)] + list(state["messages"])
        response = await llm.ainvoke(prompt_messages)
        return {
            "messages": [response],
            "last_sql_query": None,
            "last_query_result": None,
        }
    except Exception as e:
        return {
            "messages": [AIMessage(content="Hello! I am your Columbia GS AI Analyst. How can I assist you with student records or admissions today?")],
            "last_sql_query": None,
            "last_query_result": None,
        }


# ==========================================================================================
# 4. LANGGRAPH WORKFLOW ASSEMBLY
# ==========================================================================================

def route_after_supervisor(state: MessagesState) -> str:
    decision = state.get("route_decision", "sql_data_agent")
    return decision if decision in ["sql_data_agent", "general_agent"] else "sql_data_agent"


workflow = StateGraph(MessagesState)
workflow.add_node("supervisor_agent", supervisor_node)
workflow.add_node("sql_data_agent", sql_data_agent_node)
workflow.add_node("general_agent", general_agent_node)

workflow.set_entry_point("supervisor_agent")
workflow.add_conditional_edges(
    "supervisor_agent",
    route_after_supervisor,
    {
        "sql_data_agent": "sql_data_agent",
        "general_agent": "general_agent",
    }
)
workflow.add_edge("sql_data_agent", END)
workflow.add_edge("general_agent", END)

compiled_graph = workflow.compile()


# ==========================================================================================
# 5. ASYNC PUBLIC INVOCATION API
# ==========================================================================================

async def ask_crm_agent(user_query: str, history: list = None) -> dict[str, Any]:
    """
    Invokes the Columbia GS multi-agent LangGraph workflow asynchronously.
    Returns:
      {
        "success": bool,
        "final_response": str,
        "sql_query": str | None,
        "columns": list[str],
        "data": list[dict],
        "row_count": int,
        "execution_time_ms": float
      }
    """
    start_time = time.time()
    messages = []
    
    if history:
        for h in history[-8:]:  # Keep recent context window
            role = h.get("role")
            content = h.get("content", "")
            if role == "user" and content:
                messages.append(HumanMessage(content=content))
            elif role == "assistant" and content:
                messages.append(AIMessage(content=content))

    messages.append(HumanMessage(content=user_query))

    try:
        result = await compiled_graph.ainvoke({
            "messages": messages,
            "route_decision": None,
            "last_sql_query": None,
            "last_query_result": None,
        })

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        final_messages = result.get("messages", [])
        final_text = ""
        if final_messages:
            final_text = str(final_messages[-1].content)

        sql_query = result.get("last_sql_query")
        query_result = result.get("last_query_result") or {}

        columns = query_result.get("columns", [])
        data = query_result.get("data", [])
        row_count = query_result.get("row_count", len(data))

        return {
            "success": True,
            "final_response": final_text,
            "sql_query": sql_query,
            "columns": columns,
            "data": data,
            "row_count": row_count,
            "execution_time_ms": elapsed_ms,
            "error": None,
        }

    except Exception as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "success": False,
            "final_response": f"Encountered an issue processing request: {str(e)}",
            "sql_query": None,
            "columns": [],
            "data": [],
            "row_count": 0,
            "execution_time_ms": elapsed_ms,
            "error": str(e),
        }

