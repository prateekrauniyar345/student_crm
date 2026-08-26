# backend/app/agents/tools.py

import json
from datetime import datetime, date
from typing import Any
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from sqlalchemy import text

from app.db.db import async_session
from app.routes.sql_copilot import (
    sanitize_and_validate_sql,
    ALLOWED_TABLES,
    ALLOWED_SCHEMA_METADATA,
)

# ==========================================================================================
# 1. ASYNC DATABASE EXECUTION
# ==========================================================================================

async def execute_sql_async(query: str) -> dict[str, Any]:
    """Execute read-only SQL query asynchronously on PostgreSQL using asyncpg."""
    valid_query = sanitize_and_validate_sql(query)
    async with async_session() as session:
        result = await session.execute(text(valid_query))
        keys = list(result.keys()) if result.returns_rows else []
        rows = []
        if result.returns_rows:
            for r in result.fetchall():
                row_dict = {}
                for idx, col_name in enumerate(keys):
                    val = r[idx]
                    if isinstance(val, (datetime, date)):
                        row_dict[col_name] = val.isoformat()
                    elif hasattr(val, "__str__") and not isinstance(val, (int, float, bool, list, dict, type(None))):
                        row_dict[col_name] = str(val)
                    else:
                        row_dict[col_name] = val
                rows.append(row_dict)
        return {
            "columns": keys,
            "data": rows,
            "row_count": len(rows),
            "success": True,
        }


# ==========================================================================================
# 2. TOOL INPUT SCHEMAS
# ==========================================================================================

class SQLQueryInput(BaseModel):
    query: str = Field(description="The read-only SELECT SQL query to execute on PostgreSQL.")

class TableSchemaInput(BaseModel):
    table_name: str = Field(
        default="student_profiles",
        description="The academic table name to inspect (e.g., 'student_profiles', 'people', 'student_term_records', 'applications', 'programs', 'academic_terms', 'interactions').",
    )


# ==========================================================================================
# 3. NATIVE ASYNC LANGCHAIN DATABASE TOOLS
# ==========================================================================================

@tool("list_database_tables")
async def list_database_tables_tool() -> str:
    """
    Lists all accessible academic database tables in the Columbia GS Student CRM with their descriptions.
    """
    try:
        tables = [
            {"table_name": t["table_name"], "description": t["description"], "column_count": len(t["columns"])}
            for t in ALLOWED_SCHEMA_METADATA
        ]
        return json.dumps({"accessible_tables": tables}, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@tool("get_table_schema", args_schema=TableSchemaInput)
async def get_table_schema_tool(table_name: str = "student_profiles") -> str:
    """
    Retrieves column names, data types, descriptions, and key constraints (PK, FK) for a specified academic table.
    """
    try:
        clean_name = table_name.lower().strip()
        matched = next((t for t in ALLOWED_SCHEMA_METADATA if t["table_name"] == clean_name), None)
        if not matched:
            return json.dumps({
                "error": f"Table '{table_name}' not found. Available tables: {list(ALLOWED_TABLES)}."
            })
        return json.dumps({
            "table_name": matched["table_name"],
            "description": matched["description"],
            "columns": matched["columns"],
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@tool("execute_sql_query", args_schema=SQLQueryInput)
async def execute_sql_query_tool(query: str) -> str:
    """
    Executes a SELECT SQL query against the Columbia GS academic database asynchronously.
    Returns column names, result rows, and row count.
    Strictly read-only; mutations and system/user tables are blocked.
    """
    try:
        res = await execute_sql_async(query)
        return json.dumps(res, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e), "success": False})


@tool("get_student_summary_metrics")
async def get_student_summary_metrics_tool() -> str:
    """
    Returns high-level aggregate metrics across the student body asynchronously:
    active student headcount, total applications, admit rate, yield rate, at-risk student count, and average cumulative GPA.
    """
    sql = """
    SELECT
        (SELECT COUNT(*) FROM student_profiles WHERE student_status = 'active') AS active_students,
        (SELECT COUNT(*) FROM applications) AS total_applications,
        (SELECT COUNT(*) FROM student_term_records WHERE academic_standing IN ('academic_warning', 'probation', 'suspension') OR cumulative_gpa < 2.50) AS at_risk_count,
        (SELECT ROUND(AVG(cumulative_gpa), 2) FROM student_term_records WHERE cumulative_gpa IS NOT NULL) AS avg_cumulative_gpa,
        (SELECT COUNT(*) FROM people WHERE (attributes->>'veteran')::boolean = true) AS veteran_students_count;
    """
    try:
        res = await execute_sql_async(sql)
        return json.dumps(res, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


# List of tools for LLM binding
database_tools = [
    list_database_tables_tool,
    get_table_schema_tool,
    execute_sql_query_tool,
    get_student_summary_metrics_tool,
]

tool_map = {
    "list_database_tables": list_database_tables_tool,
    "get_table_schema": get_table_schema_tool,
    "execute_sql_query": execute_sql_query_tool,
    "get_student_summary_metrics": get_student_summary_metrics_tool,
}

