# backend/app/routes/programs.py

from fastapi import APIRouter, Depends, HTTPException, status
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
import os
from uuid import UUID
from typing import Annotated

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
    institution_id: UUID | None = None,
    code: str | None = None,
    is_active: bool | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[ProgramResponse]:
    """
    Get all programs with optional filters.
    Requires authentication.
    """
    try:
        statement = select(Program)

        if institution_id:
            statement = statement.where(Program.institution_id == institution_id)
        if code:
            statement = statement.where(Program.code.ilike(f"%{code}%"))
        if is_active is not None:
            statement = statement.where(Program.is_active == is_active)

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
