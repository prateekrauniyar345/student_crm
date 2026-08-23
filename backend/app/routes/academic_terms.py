# backend/app/routes/academic_terms.py

from fastapi import APIRouter, Depends, HTTPException, status
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
import os
from uuid import UUID
from typing import Annotated
from datetime import datetime

from app.db.db import get_session
from app.models.academic_term import (
    AcademicTermResponse,
    AcademicTermCreate,
    AcademicTermUpdate,
)
from app.auth import get_current_user
from app.models.user import UserResponse
from app.schema.academic_terms import AcademicTerm

load_dotenv()

academic_term_routes = APIRouter(
    prefix=f"{os.getenv('API_PREFIX')}/academic-terms",
    tags=["academic-terms"],
)


@academic_term_routes.get("/")
async def get_academic_terms(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    # Exact match filters
    id: UUID | None = None,
    institution_id: UUID | None = None,
    application_year: int | None = None,
    # LIKE filters
    code: str | None = None,
    name: str | None = None,
    # Date range filters
    start_date_from: datetime | None = None,
    start_date_to: datetime | None = None,
    end_date_from: datetime | None = None,
    end_date_to: datetime | None = None,
    created_at_from: datetime | None = None,
    created_at_to: datetime | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[AcademicTermResponse]:
    """
    Get all academic terms with advanced filtering options.
    Requires authentication.
    
    Query Parameters:
    - id: Exact UUID match for academic term ID
    - institution_id: Exact UUID match for institution
    - application_year: Exact match for application year (integer)
    - code: Partial match for term code (case-insensitive)
    - name: Partial match for term name (case-insensitive)
    - start_date_from: Filter terms starting on or after this date (ISO format)
    - start_date_to: Filter terms starting on or before this date (ISO format)
    - end_date_from: Filter terms ending on or after this date (ISO format)
    - end_date_to: Filter terms ending on or before this date (ISO format)
    - created_at_from: Filter terms created after this date (ISO format)
    - created_at_to: Filter terms created before this date (ISO format)
    """
    try:
        statement = select(AcademicTerm)

        # Exact match filters
        if id:
            statement = statement.where(AcademicTerm.id == id)
        if institution_id:
            statement = statement.where(AcademicTerm.institution_id == institution_id)
        if application_year is not None:
            statement = statement.where(AcademicTerm.application_year == application_year)

        # LIKE filters
        if code:
            statement = statement.where(AcademicTerm.code.ilike(f"%{code}%"))
        if name:
            statement = statement.where(AcademicTerm.name.ilike(f"%{name}%"))

        # Date range filters
        if start_date_from:
            statement = statement.where(AcademicTerm.start_date >= start_date_from)
        if start_date_to:
            statement = statement.where(AcademicTerm.start_date <= start_date_to)
        if end_date_from:
            statement = statement.where(AcademicTerm.end_date >= end_date_from)
        if end_date_to:
            statement = statement.where(AcademicTerm.end_date <= end_date_to)
        if created_at_from:
            statement = statement.where(AcademicTerm.created_at >= created_at_from)
        if created_at_to:
            statement = statement.where(AcademicTerm.created_at <= created_at_to)

        statement = statement.order_by(AcademicTerm.start_date.desc())

        result = await session.execute(statement)
        terms = result.scalars().all()

        return [AcademicTermResponse.model_validate(term) for term in terms]

    except Exception as e:
        print(f"Error fetching academic terms: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch academic terms",
        )




@academic_term_routes.post("/")
async def create_academic_term(
    term_data: AcademicTermCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> AcademicTermResponse:
    """
    Create a new academic term.
    Requires authentication.
    
    RULES:
    - end_date must be >= start_date
    - institution_id + code must be unique
    """
    try:
        new_term = AcademicTerm(
            institution_id=term_data.institution_id,
            code=term_data.code,
            name=term_data.name,
            start_date=term_data.start_date,
            end_date=term_data.end_date,
            application_year=term_data.application_year,
        )

        session.add(new_term)
        await session.commit()
        await session.refresh(new_term)

        return AcademicTermResponse.model_validate(new_term)

    except IntegrityError as e:
        await session.rollback()
        if "academic_terms_institution_id_code_key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An academic term with this institution_id and code already exists",
            )
        if "academic_terms_end_date_check" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_date must be greater than or equal to start_date",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity constraint violation",
        )
    except ValueError as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        await session.rollback()
        print(f"Error creating academic term: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create academic term",
        )


@academic_term_routes.patch("/{term_id}")
async def update_academic_term(
    term_id: UUID,
    term_data: AcademicTermUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> AcademicTermResponse:
    """
    Partially update an existing academic term.
    Requires authentication.
    """
    try:
        statement = select(AcademicTerm).where(AcademicTerm.id == term_id)
        result = await session.execute(statement)
        term = result.scalars().first()

        if not term:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Academic term with ID {term_id} not found",
            )

        # Update only provided fields
        if term_data.code is not None:
            term.code = term_data.code
        if term_data.name is not None:
            term.name = term_data.name
        if term_data.start_date is not None:
            term.start_date = term_data.start_date
        if term_data.end_date is not None:
            term.end_date = term_data.end_date
        if term_data.application_year is not None:
            term.application_year = term_data.application_year

        await session.commit()
        await session.refresh(term)

        return AcademicTermResponse.model_validate(term)

    except HTTPException:
        raise
    except IntegrityError as e:
        await session.rollback()
        if "academic_terms_institution_id_code_key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An academic term with this institution_id and code already exists",
            )
        if "academic_terms_end_date_check" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_date must be greater than or equal to start_date",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity constraint violation",
        )
    except Exception as e:
        await session.rollback()
        print(f"Error updating academic term: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update academic term",
        )


@academic_term_routes.delete("/{term_id}")
async def delete_academic_term(
    term_id: UUID,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Delete an academic term by ID.
    Requires authentication.
    """
    try:
        statement = select(AcademicTerm).where(AcademicTerm.id == term_id)
        result = await session.execute(statement)
        term = result.scalars().first()

        if not term:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Academic term with ID {term_id} not found",
            )

        await session.delete(term)
        await session.commit()

        return {
            "message": "Academic term deleted successfully",
            "term_id": str(term_id),
        }

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        print(f"Error deleting academic term: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete academic term",
        )
