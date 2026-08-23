# backend/app/routes/programs.py

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
from app.models.program import ProgramResponse, ProgramCreate, ProgramUpdate
from app.auth import get_current_user
from app.models.user import UserResponse
from app.schema.programs import Program

load_dotenv()

program_routes = APIRouter(
    prefix=f"{os.getenv('API_PREFIX')}/programs",
    tags=["programs"]
)


@program_routes.get("/")
async def get_programs(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    # Exact match filters
    id: UUID | None = None,
    institution_id: UUID | None = None,
    is_active: bool | None = None,
    # LIKE filters
    code: str | None = None,
    name: str | None = None,
    degree_level: str | None = None,
    # Date range filters
    created_at_from: datetime | None = None,
    created_at_to: datetime | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[ProgramResponse]:
    """
    Get all programs with advanced filtering options.
    Requires authentication.
    
    Query Parameters:
    - id: Exact UUID match for program ID
    - institution_id: Exact UUID match for institution
    - code: Partial match for program code (case-insensitive)
    - name: Partial match for program name (case-insensitive)
    - degree_level: Exact match for degree level (e.g., Bachelor, Master, PhD, Certificate)
    - is_active: Filter by active status (true/false)
    - created_at_from: Filter programs created after this date (ISO format)
    - created_at_to: Filter programs created before this date (ISO format)
    """
    try:
        statement = select(Program)

        # Exact match filters
        if id:
            statement = statement.where(Program.id == id)
        if institution_id:
            statement = statement.where(Program.institution_id == institution_id)
        if is_active is not None:
            statement = statement.where(Program.is_active == is_active)

        # LIKE filters
        if code:
            statement = statement.where(Program.code.ilike(f"%{code}%"))
        if name:
            statement = statement.where(Program.name.ilike(f"%{name}%"))
        if degree_level:
            statement = statement.where(Program.degree_level.ilike(f"%{degree_level}%"))

        # Date range filters
        if created_at_from:
            statement = statement.where(Program.created_at >= created_at_from)
        if created_at_to:
            statement = statement.where(Program.created_at <= created_at_to)

        statement = statement.order_by(Program.name)

        result = await session.execute(statement)
        programs = result.scalars().all()

        return [ProgramResponse.model_validate(program) for program in programs]

    except Exception as e:
        print(f"Error fetching programs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch programs",
        )




@program_routes.post("/")
async def create_program(
    program_data: ProgramCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> ProgramResponse:
    """
    Create a new program.
    Requires authentication.
    
    UNIQUE CONSTRAINT: institution_id + code must be unique.
    """
    try:
        new_program = Program(
            institution_id=program_data.institution_id,
            code=program_data.code,
            name=program_data.name,
            degree_level=program_data.degree_level,
            is_active=program_data.is_active,
        )

        session.add(new_program)
        await session.commit()
        await session.refresh(new_program)

        return ProgramResponse.model_validate(new_program)

    except IntegrityError as e:
        await session.rollback()
        if "programs_institution_id_code_key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A program with this institution_id and code already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity constraint violation",
        )
    except Exception as e:
        await session.rollback()
        print(f"Error creating program: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create program",
        )


@program_routes.patch("/{program_id}")
async def update_program(
    program_id: UUID,
    program_data: ProgramUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> ProgramResponse:
    """
    Partially update an existing program.
    Requires authentication.
    """
    try:
        statement = select(Program).where(Program.id == program_id)
        result = await session.execute(statement)
        program = result.scalars().first()

        if not program:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Program with ID {program_id} not found",
            )

        # Update only provided fields
        if program_data.code is not None:
            program.code = program_data.code
        if program_data.name is not None:
            program.name = program_data.name
        if program_data.degree_level is not None:
            program.degree_level = program_data.degree_level
        if program_data.is_active is not None:
            program.is_active = program_data.is_active

        await session.commit()
        await session.refresh(program)

        return ProgramResponse.model_validate(program)

    except HTTPException:
        raise
    except IntegrityError as e:
        await session.rollback()
        if "programs_institution_id_code_key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A program with this institution_id and code already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity constraint violation",
        )
    except Exception as e:
        await session.rollback()
        print(f"Error updating program: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update program",
        )


@program_routes.delete("/{program_id}")
async def delete_program(
    program_id: UUID,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Delete a program by ID.
    Requires authentication.
    """
    try:
        statement = select(Program).where(Program.id == program_id)
        result = await session.execute(statement)
        program = result.scalars().first()

        if not program:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Program with ID {program_id} not found",
            )

        await session.delete(program)
        await session.commit()

        return {
            "message": "Program deleted successfully",
            "program_id": str(program_id),
        }

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        print(f"Error deleting program: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete program",
        )
