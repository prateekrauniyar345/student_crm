# backend/app/routes/student_term_records.py

from fastapi import APIRouter, Depends, HTTPException, status
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
import os
from uuid import UUID
from typing import Annotated
from datetime import datetime
from decimal import Decimal

from app.db.db import get_session
from app.models.student_term_record import (
    StudentTermRecordResponse,
    StudentTermRecordCreate,
    StudentTermRecordUpdate,
    AcademicStanding,
)
from app.auth import get_current_user
from app.models.user import UserResponse
from app.schema.student_term_records import StudentTermRecord

load_dotenv()

student_term_record_routes = APIRouter(
    prefix=f"{os.getenv('API_PREFIX')}/student-term-records",
    tags=["student-term-records"]
)


@student_term_record_routes.get("/")
async def get_student_term_records(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    # Exact match filters
    id: UUID | None = None,
    person_id: UUID | None = None,
    term_id: UUID | None = None,
    program_id: UUID | None = None,
    academic_standing: AcademicStanding | None = None,
    advisor_meetings: int | None = None,
    # Decimal range filters
    credits_attempted_min: Decimal | None = None,
    credits_attempted_max: Decimal | None = None,
    credits_earned_min: Decimal | None = None,
    credits_earned_max: Decimal | None = None,
    term_gpa_min: Decimal | None = None,
    term_gpa_max: Decimal | None = None,
    cumulative_gpa_min: Decimal | None = None,
    cumulative_gpa_max: Decimal | None = None,
    # Date range filters
    created_at_from: datetime | None = None,
    created_at_to: datetime | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[StudentTermRecordResponse]:
    """
    Get all student term records with advanced filtering options.
    Requires authentication.
    
    Query Parameters:
    - id: Exact UUID match for term record ID
    - person_id: Exact UUID match for person/student
    - term_id: Exact UUID match for academic term
    - program_id: Exact UUID match for program
    - academic_standing: Exact match (dropdown selection)
      - good: Good standing
      - warning: Academic warning
      - probation: On academic probation
      - suspension: Suspended
    - advisor_meetings: Exact match for number of advisor meetings (integer)
    - credits_attempted_min: Filter records with credits attempted >= this value
    - credits_attempted_max: Filter records with credits attempted <= this value
    - credits_earned_min: Filter records with credits earned >= this value
    - credits_earned_max: Filter records with credits earned <= this value
    - term_gpa_min: Filter records with term GPA >= this value (0-4 range)
    - term_gpa_max: Filter records with term GPA <= this value (0-4 range)
    - cumulative_gpa_min: Filter records with cumulative GPA >= this value (0-4 range)
    - cumulative_gpa_max: Filter records with cumulative GPA <= this value (0-4 range)
    - created_at_from: Filter records created after this date (ISO format)
    - created_at_to: Filter records created before this date (ISO format)
    """
    try:
        statement = select(StudentTermRecord)

        # Exact match filters
        if id:
            statement = statement.where(StudentTermRecord.id == id)
        if person_id:
            statement = statement.where(StudentTermRecord.person_id == person_id)
        if term_id:
            statement = statement.where(StudentTermRecord.term_id == term_id)
        if program_id:
            statement = statement.where(StudentTermRecord.program_id == program_id)
        if academic_standing:
            statement = statement.where(StudentTermRecord.academic_standing == academic_standing)
        if advisor_meetings is not None:
            statement = statement.where(StudentTermRecord.advisor_meetings == advisor_meetings)

        # Decimal range filters
        if credits_attempted_min is not None:
            statement = statement.where(StudentTermRecord.credits_attempted >= credits_attempted_min)
        if credits_attempted_max is not None:
            statement = statement.where(StudentTermRecord.credits_attempted <= credits_attempted_max)
        if credits_earned_min is not None:
            statement = statement.where(StudentTermRecord.credits_earned >= credits_earned_min)
        if credits_earned_max is not None:
            statement = statement.where(StudentTermRecord.credits_earned <= credits_earned_max)
        if term_gpa_min is not None:
            statement = statement.where(StudentTermRecord.term_gpa >= term_gpa_min)
        if term_gpa_max is not None:
            statement = statement.where(StudentTermRecord.term_gpa <= term_gpa_max)
        if cumulative_gpa_min is not None:
            statement = statement.where(StudentTermRecord.cumulative_gpa >= cumulative_gpa_min)
        if cumulative_gpa_max is not None:
            statement = statement.where(StudentTermRecord.cumulative_gpa <= cumulative_gpa_max)

        # Date range filters
        if created_at_from:
            statement = statement.where(StudentTermRecord.created_at >= created_at_from)
        if created_at_to:
            statement = statement.where(StudentTermRecord.created_at <= created_at_to)

        statement = statement.order_by(StudentTermRecord.created_at.desc())

        result = await session.execute(statement)
        records = result.scalars().all()

        return [StudentTermRecordResponse.model_validate(record) for record in records]

    except Exception as e:
        print(f"Error fetching student term records: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch student term records",
        )


@student_term_record_routes.post("/")
async def create_student_term_record(
    record_data: StudentTermRecordCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> StudentTermRecordResponse:
    """
    Create a new student term record.
    Requires authentication.
    
    UNIQUE CONSTRAINT: person_id + term_id must be unique.
    VALIDATION: term_gpa and cumulative_gpa must be between 0 and 4.
    """
    try:
        new_record = StudentTermRecord(
            person_id=record_data.person_id,
            term_id=record_data.term_id,
            program_id=record_data.program_id,
            credits_attempted=record_data.credits_attempted,
            credits_earned=record_data.credits_earned,
            term_gpa=record_data.term_gpa,
            cumulative_gpa=record_data.cumulative_gpa,
            academic_standing=record_data.academic_standing,
            advisor_meetings=record_data.advisor_meetings,
            attributes=record_data.attributes,
        )

        session.add(new_record)
        await session.commit()
        await session.refresh(new_record)

        return StudentTermRecordResponse.model_validate(new_record)

    except IntegrityError as e:
        await session.rollback()
        if "student_term_records_person_term_key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A term record for this person and term already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity constraint violation",
        )
    except ValueError as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}",
        )
    except Exception as e:
        await session.rollback()
        print(f"Error creating student term record: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create student term record",
        )


@student_term_record_routes.patch("/{record_id}")
async def update_student_term_record(
    record_id: UUID,
    record_data: StudentTermRecordUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> StudentTermRecordResponse:
    """
    Partially update an existing student term record.
    Requires authentication.
    """
    try:
        statement = select(StudentTermRecord).where(StudentTermRecord.id == record_id)
        result = await session.execute(statement)
        record = result.scalars().first()

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student term record with ID {record_id} not found",
            )

        # Update only provided fields
        if record_data.program_id is not None:
            record.program_id = record_data.program_id
        if record_data.credits_attempted is not None:
            record.credits_attempted = record_data.credits_attempted
        if record_data.credits_earned is not None:
            record.credits_earned = record_data.credits_earned
        if record_data.term_gpa is not None:
            record.term_gpa = record_data.term_gpa
        if record_data.cumulative_gpa is not None:
            record.cumulative_gpa = record_data.cumulative_gpa
        if record_data.academic_standing is not None:
            record.academic_standing = record_data.academic_standing
        if record_data.advisor_meetings is not None:
            record.advisor_meetings = record_data.advisor_meetings
        if record_data.attributes is not None:
            record.attributes = record_data.attributes

        await session.commit()
        await session.refresh(record)

        return StudentTermRecordResponse.model_validate(record)

    except HTTPException:
        raise
    except ValueError as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}",
        )
    except Exception as e:
        await session.rollback()
        print(f"Error updating student term record: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update student term record",
        )


@student_term_record_routes.delete("/{record_id}")
async def delete_student_term_record(
    record_id: UUID,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Delete a student term record by ID.
    Requires authentication.
    """
    try:
        statement = select(StudentTermRecord).where(StudentTermRecord.id == record_id)
        result = await session.execute(statement)
        record = result.scalars().first()

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student term record with ID {record_id} not found",
            )

        await session.delete(record)
        await session.commit()

        return {
            "message": "Student term record deleted successfully",
            "record_id": str(record_id),
        }

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        print(f"Error deleting student term record: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete student term record",
        )
