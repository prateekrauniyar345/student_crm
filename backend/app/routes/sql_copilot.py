# backend/app/routes/sql_copilot.py

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import os
import re
import time
import asyncio
from datetime import datetime, date
from typing import Annotated, Any, Optional

from app.db.db import get_session
from app.auth import get_current_user
from app.models.user import UserResponse

load_dotenv()

api_prefix = os.getenv("API_PREFIX", "/api/v1")

sql_copilot_routes = APIRouter(
    prefix=f"{api_prefix}/sql",
    tags=["sql-copilot"]
)

# ==========================================================================================
# 1. SECURITY DEFINITIONS & GUARDRAILS
# ==========================================================================================

ALLOWED_TABLES = {
    "people",
    "student_profiles",
    "student_term_records",
    "programs",
    "academic_terms",
    "applications",
    "interactions",
}

FORBIDDEN_TABLES = {
    "users",
    "institutions",
    "institution_memberships",
    "alembic_version",
}

FORBIDDEN_KEYWORDS = [
    r"\bINSERT\b",
    r"\bUPDATE\b",
    r"\bDELETE\b",
    r"\bDROP\b",
    r"\bALTER\b",
    r"\bTRUNCATE\b",
    r"\bGRANT\b",
    r"\bREVOKE\b",
    r"\bCREATE\b",
    r"\bREPLACE\b",
    r"\bEXEC\b",
    r"\bEXECUTE\b",
    r"\bCOPY\b",
    r"\bINTO\b",
    r"\bPG_\w+\b",
    r"\bINFORMATION_SCHEMA\b",
]

def strip_sql_comments(sql: str) -> str:
    """
    Strips single-line (--) and multi-line (/* ... */) SQL comments
    for security inspection while preserving the underlying executable statements.
    """
    # Remove block comments /* ... */
    no_block_comments = re.sub(r"/\*[\s\S]*?\*/", " ", sql)
    # Remove single-line comments -- ...
    no_line_comments = re.sub(r"--.*$", " ", no_block_comments, flags=re.MULTILINE)
    return no_line_comments.strip()

def sanitize_and_validate_sql(query: str) -> str:
    """
    Validates that query is strictly read-only and operates exclusively on allowed tables.
    Supports comments (-- or /* */) anywhere in the query (top, inline, between clauses).
    Raises HTTPException if security rules are violated.
    """
    cleaned = query.strip()
    if not cleaned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SQL query cannot be empty."
        )

    # Strip comments to inspect the executable SQL code
    executable_sql = strip_sql_comments(cleaned)
    if not executable_sql:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SQL query contains only comments without executable statements."
        )

    # Check that query starts with SELECT or WITH
    upper_query = executable_sql.upper()
    if not (upper_query.startswith("SELECT") or upper_query.startswith("WITH")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Security Violation: Only read-only SELECT and WITH statements are permitted."
        )

    # Check for forbidden keywords/mutations on executable code
    for pattern in FORBIDDEN_KEYWORDS:
        if re.search(pattern, executable_sql, re.IGNORECASE):
            match = re.search(pattern, executable_sql, re.IGNORECASE).group(0)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Security Violation: Mutation keyword or system table '{match}' is strictly blocked."
            )

    # Check for forbidden tables (users, institutions, etc.)
    for forbidden_tbl in FORBIDDEN_TABLES:
        pattern = rf"\b{forbidden_tbl}\b"
        if re.search(pattern, executable_sql, re.IGNORECASE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Table '{forbidden_tbl}' contains sensitive institutional authentication data and cannot be queried."
            )

    return cleaned

# ==========================================================================================
# 2. REQUEST & RESPONSE MODELS
# ==========================================================================================

class ExecuteSqlRequest(BaseModel):
    query: str = Field(..., description="The SELECT SQL statement to execute.")

class ExecuteSqlResponse(BaseModel):
    success: bool
    columns: list[str]
    data: list[dict[str, Any]]
    row_count: int
    execution_time_ms: float
    error: Optional[str] = None

class AICopilotRequest(BaseModel):
    prompt: str = Field(..., description="Natural language question about students, GPAs, programs, or admissions.")
    history: Optional[list[dict[str, str]]] = Field(default=[], description="Previous conversation history.")

class AICopilotResponse(BaseModel):
    success: bool
    sql_query: Optional[str] = None
    explanation: str
    columns: list[str] = []
    data: list[dict[str, Any]] = []
    row_count: int = 0
    execution_time_ms: float = 0.0
    error: Optional[str] = None

# ==========================================================================================
# 3. SCHEMA DICTIONARY (FOR SCHEMA BROWSER)
# ==========================================================================================

ALLOWED_SCHEMA_METADATA = [
    {
        "table_name": "student_profiles",
        "description": "Student degree audit profiles and academic progression identifiers",
        "columns": [
            {"name": "person_id", "type": "UUID (PK, FK)", "description": "References people.id"},
            {"name": "student_number", "type": "VARCHAR (Unique)", "description": "Institutional ID (e.g. CU-2024-0001)"},
            {"name": "student_status", "type": "VARCHAR", "description": "active, leave, graduated, withdrawn, dismissed"},
            {"name": "current_program_id", "type": "UUID (FK)", "description": "References programs.id"},
            {"name": "entry_term_id", "type": "UUID (FK)", "description": "References academic_terms.id"},
            {"name": "expected_graduation_date", "type": "DATE", "description": "Projected degree completion date"},
        ]
    },
    {
        "table_name": "people",
        "description": "Person identity, non-traditional cohort tags, and contact records",
        "columns": [
            {"name": "id", "type": "UUID (PK)", "description": "Primary key identifier"},
            {"name": "first_name", "type": "VARCHAR", "description": "Legal first name"},
            {"name": "last_name", "type": "VARCHAR", "description": "Legal last name"},
            {"name": "preferred_name", "type": "VARCHAR", "description": "Preferred chosen name"},
            {"name": "email", "type": "VARCHAR", "description": "Institutional email address"},
            {"name": "phone", "type": "VARCHAR", "description": "Contact phone number"},
            {"name": "lifecycle_stage", "type": "VARCHAR", "description": "lead, applicant, admitted, deposited, enrolled, alumni"},
            {"name": "attributes", "type": "JSONB", "description": "Cohort flags: {\"veteran\": true, \"transfer\": true, \"first_gen\": true, \"international\": true, \"honors\": true}"},
        ]
    },
    {
        "table_name": "student_term_records",
        "description": "Semester-by-semester transcript records, GPAs, credits, and standings",
        "columns": [
            {"name": "person_id", "type": "UUID (PK, FK)", "description": "References people.id"},
            {"name": "term_id", "type": "UUID (PK, FK)", "description": "References academic_terms.id"},
            {"name": "program_id", "type": "UUID (FK)", "description": "Program during term"},
            {"name": "credits_attempted", "type": "DECIMAL", "description": "Attempted credit points"},
            {"name": "credits_earned", "type": "DECIMAL", "description": "Earned/passed credit points"},
            {"name": "term_gpa", "type": "DECIMAL", "description": "Semester GPA (0.00 - 4.00)"},
            {"name": "cumulative_gpa", "type": "DECIMAL", "description": "Institutional cumulative GPA"},
            {"name": "academic_standing", "type": "VARCHAR", "description": "good_standing, academic_warning, probation, suspension"},
        ]
    },
    {
        "table_name": "applications",
        "description": "Admissions applicant files, decision codes, and yield replies",
        "columns": [
            {"name": "id", "type": "UUID (PK)", "description": "Application identifier"},
            {"name": "person_id", "type": "UUID (FK)", "description": "References people.id"},
            {"name": "program_id", "type": "UUID (FK)", "description": "Target major program"},
            {"name": "term_id", "type": "UUID (FK)", "description": "Intake semester term"},
            {"name": "application_year", "type": "INTEGER", "description": "Admissions cycle year (e.g. 2024)"},
            {"name": "stage", "type": "VARCHAR", "description": "started, submitted, under_review, admitted, committed, enrolled"},
            {"name": "decision_code", "type": "VARCHAR", "description": "AC (Accepted), AP (Provisional), WL (Waitlist), RH (Rejected)"},
            {"name": "reply_code", "type": "VARCHAR", "description": "Y (Accepted), DF (Deferred), NC (Declined), NS (No Show)"},
            {"name": "applicant_source", "type": "VARCHAR", "description": "Recruitment outreach source channel"},
            {"name": "transfer_institution_type", "type": "VARCHAR", "description": "community_college, four_year, international, other"},
            {"name": "submitted_at", "type": "TIMESTAMP", "description": "Application submission timestamp"},
            {"name": "decided_at", "type": "TIMESTAMP", "description": "Committee decision timestamp"},
        ]
    },
    {
        "table_name": "programs",
        "description": "Degree major programs and academic departments",
        "columns": [
            {"name": "id", "type": "UUID (PK)", "description": "Program identifier"},
            {"name": "code", "type": "VARCHAR (Unique)", "description": "Major code (e.g. CSCI, ECON, MATH, PSYC)"},
            {"name": "name", "type": "VARCHAR", "description": "Full degree program title"},
            {"name": "degree_level", "type": "VARCHAR", "description": "Bachelor, Postbac, Dual Degree, Certificate"},
            {"name": "is_active", "type": "BOOLEAN", "description": "Active enrollment status"},
        ]
    },
    {
        "table_name": "academic_terms",
        "description": "Academic calendar terms and application cycle intake windows",
        "columns": [
            {"name": "id", "type": "UUID (PK)", "description": "Term identifier"},
            {"name": "code", "type": "VARCHAR (Unique)", "description": "Term code (e.g. 2024_FALL, 2025_SPRING)"},
            {"name": "name", "type": "VARCHAR", "description": "Display name (e.g. Fall 2024)"},
            {"name": "application_year", "type": "INTEGER", "description": "Admissions cycle year"},
            {"name": "start_date", "type": "DATE", "description": "Term start date"},
            {"name": "end_date", "type": "DATE", "description": "Term end date"},
        ]
    },
]

# ==========================================================================================
# 4. ENDPOINTS
# ==========================================================================================

@sql_copilot_routes.get("/schema")
async def get_allowed_schema(
    current_user: Annotated[UserResponse, Depends(get_current_user)]
):
    """
    Returns the sanitized academic database schema for the SQL Studio Schema Browser.
    Excludes users and institutions tables.
    """
    return {"tables": ALLOWED_SCHEMA_METADATA}


@sql_copilot_routes.post("/execute", response_model=ExecuteSqlResponse)
async def execute_sql_query(
    request: ExecuteSqlRequest,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session)
):
    """
    Executes a read-only SQL query strictly on allowed academic tables.
    Security guardrails prevent mutations and access to sensitive user/tenant tables.
    """
    start_time = time.time()
    valid_query = sanitize_and_validate_sql(request.query)

    try:
        result = await session.execute(text(valid_query))
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        # Extract column names
        keys = list(result.keys()) if result.returns_rows else []
        
        # Fetch rows
        rows = []
        if result.returns_rows:
            fetched = result.fetchall()
            for r in fetched:
                row_dict = {}
                for idx, col_name in enumerate(keys):
                    val = r[idx]
                    # Format serialization
                    if isinstance(val, (datetime, date)):
                        row_dict[col_name] = val.isoformat()
                    elif hasattr(val, "__str__") and not isinstance(val, (int, float, bool, list, dict, type(None))):
                        row_dict[col_name] = str(val)
                    else:
                        row_dict[col_name] = val
                rows.append(row_dict)

        return ExecuteSqlResponse(
            success=True,
            columns=keys,
            data=rows,
            row_count=len(rows),
            execution_time_ms=elapsed_ms,
            error=None
        )

    except Exception as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return ExecuteSqlResponse(
            success=False,
            columns=[],
            data=[],
            row_count=0,
            execution_time_ms=elapsed_ms,
            error=str(e)
        )


@sql_copilot_routes.post("/ai-copilot", response_model=AICopilotResponse)
async def ai_copilot_query(
    request: AICopilotRequest,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session)
):
    """
    AI Analyst Natural Language to SQL & Insights Engine.
    Uses multi-agent LangGraph orchestration with Supervisor, SQL Data Agent, and General Agent.
    """
    prompt_text = request.prompt.strip()
    if not prompt_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt query cannot be empty."
        )

    from app.agents import ask_crm_agent

    result = await ask_crm_agent(prompt_text, request.history or [])

    return AICopilotResponse(
        success=result.get("success", True),
        sql_query=result.get("sql_query"),
        explanation=result.get("final_response", ""),
        columns=result.get("columns", []),
        data=result.get("data", []),
        row_count=result.get("row_count", 0),
        execution_time_ms=result.get("execution_time_ms", 0.0),
        error=result.get("error")
    )

