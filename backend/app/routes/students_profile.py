# backend/app/routes/student_profiles.py

from fastapi import APIRouter, Depends, HTTPException, status
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
import os
from uuid import UUID
from typing import Annotated
from datetime import datetime, date

from app.db.db import get_session
from app.models.student_profile import (
    StudentProfileResponse,
    StudentProfileCreate,
    StudentProfileUpdate,
    StudentStatus,
)
from app.auth import get_current_user
from app.models.user import UserResponse
from app.schema.students_profile import StudentProfile

load_dotenv()

student_profile_routes = APIRouter(
    prefix=f"{os.getenv('API_PREFIX')}/student-profiles",
    tags=["student-profiles"]
)


@student_profile_routes.get("/")
async def get_student_profiles(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    # Exact match filters
    person_id: UUID | None = None,
    entry_term_id: UUID | None = None,
    current_program_id: UUID | None = None,
    student_status: StudentStatus | None = None,
    # LIKE filters (case-insensitive)
    student_number: str | None = None,
    # Date filters
    expected_graduation_date_from: date | None = None,
    expected_graduation_date_to: date | None = None,
    created_at_from: datetime | None = None,
    created_at_to: datetime | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[StudentProfileResponse]:
    """
    Get all student profiles with advanced filtering options.
    Requires authentication.
    
    Query Parameters:
    - person_id: Exact UUID match for person/student
    - entry_term_id: Exact UUID match for entry term
    - current_program_id: Exact UUID match for current program
    - student_status: Exact match (dropdown selection)
      - active: Currently enrolled and active
      - leave: On leave of absence
      - graduated: Completed program
      - withdrawn: Withdrew from institution
      - dismissed: Dismissed from institution
    - student_number: LIKE search for student number (case-insensitive)
    - expected_graduation_date_from: Filter profiles with expected graduation on/after this date
    - expected_graduation_date_to: Filter profiles with expected graduation on/before this date
    - created_at_from: Filter records created after this date (ISO format)
    - created_at_to: Filter records created before this date (ISO format)
    """
    try:
        statement = select(StudentProfile)

        # Exact match filters
        if person_id:
            statement = statement.where(StudentProfile.person_id == person_id)
        if entry_term_id:
            statement = statement.where(StudentProfile.entry_term_id == entry_term_id)
        if current_program_id:
            statement = statement.where(StudentProfile.current_program_id == current_program_id)
        if student_status:
            statement = statement.where(StudentProfile.student_status == student_status)

        # LIKE filters (case-insensitive)
        if student_number:
            statement = statement.where(StudentProfile.student_number.ilike(f"%{student_number}%"))

        # Date filters
        if expected_graduation_date_from:
            statement = statement.where(StudentProfile.expected_graduation_date >= expected_graduation_date_from)
        if expected_graduation_date_to:
            statement = statement.where(StudentProfile.expected_graduation_date <= expected_graduation_date_to)
        if created_at_from:
            statement = statement.where(StudentProfile.created_at >= created_at_from)
        if created_at_to:
            statement = statement.where(StudentProfile.created_at <= created_at_to)

        statement = statement.order_by(StudentProfile.created_at.desc())

        result = await session.execute(statement)
        profiles = result.scalars().all()

        return [StudentProfileResponse.model_validate(profile) for profile in profiles]

    except Exception as e:
        print(f"Error fetching student profiles: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch student profiles",
        )


@student_profile_routes.post("/")
async def create_student_profile(
    profile_data: StudentProfileCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> StudentProfileResponse:
    """
    Create a new student profile.
    Requires authentication.
    
    UNIQUE CONSTRAINT: person_id is the primary key (one profile per person).
    UNIQUE CONSTRAINT: student_number must be unique.
    """
    try:
        new_profile = StudentProfile(
            person_id=profile_data.person_id,
            student_number=profile_data.student_number,
            entry_term_id=profile_data.entry_term_id,
            current_program_id=profile_data.current_program_id,
            student_status=profile_data.student_status,
            expected_graduation_date=profile_data.expected_graduation_date,
        )

        session.add(new_profile)
        await session.commit()
        await session.refresh(new_profile)

        return StudentProfileResponse.model_validate(new_profile)

    except IntegrityError as e:
        await session.rollback()
        if "student_profiles_pkey" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A student profile for this person already exists",
            )
        if "student_profiles_student_number_key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This student number is already in use",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity constraint violation",
        )
    except Exception as e:
        await session.rollback()
        print(f"Error creating student profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create student profile",
        )


@student_profile_routes.patch("/{person_id}")
async def update_student_profile(
    person_id: UUID,
    profile_data: StudentProfileUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> StudentProfileResponse:
    """
    Partially update an existing student profile.
    Requires authentication.
    """
    try:
        statement = select(StudentProfile).where(StudentProfile.person_id == person_id)
        result = await session.execute(statement)
        profile = result.scalars().first()

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile for person {person_id} not found",
            )

        # Update only provided fields
        if profile_data.student_number is not None:
            profile.student_number = profile_data.student_number
        if profile_data.entry_term_id is not None:
            profile.entry_term_id = profile_data.entry_term_id
        if profile_data.current_program_id is not None:
            profile.current_program_id = profile_data.current_program_id
        if profile_data.student_status is not None:
            profile.student_status = profile_data.student_status
        if profile_data.expected_graduation_date is not None:
            profile.expected_graduation_date = profile_data.expected_graduation_date

        await session.commit()
        await session.refresh(profile)

        return StudentProfileResponse.model_validate(profile)

    except HTTPException:
        raise
    except IntegrityError as e:
        await session.rollback()
        if "student_profiles_student_number_key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This student number is already in use",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity constraint violation",
        )
    except Exception as e:
        await session.rollback()
        print(f"Error updating student profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update student profile",
        )


@student_profile_routes.delete("/{person_id}")
async def delete_student_profile(
    person_id: UUID,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Delete a student profile by person ID.
    Requires authentication.
    """
    try:
        statement = select(StudentProfile).where(StudentProfile.person_id == person_id)
        result = await session.execute(statement)
        profile = result.scalars().first()

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile for person {person_id} not found",
            )

        await session.delete(profile)
        await session.commit()

        return {
            "message": "Student profile deleted successfully",
            "person_id": str(person_id),
        }

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        print(f"Error deleting student profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete student profile",
        )
