# backend/app/routes/people.py

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
from app.models.people import PeopleResponse, PeopleCreate, PeopleUpdate, LifecycleStage
from app.auth import get_current_user
from app.models.user import UserResponse
from app.schema.people import People

load_dotenv()

people_routes = APIRouter(
    prefix=f"{os.getenv('API_PREFIX')}/people",
    tags=["people"]
)


@people_routes.get("/")
async def get_people(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    # Exact match filters
    id: UUID | None = None,
    institution_id: UUID | None = None,
    lifecycle_stage: LifecycleStage | None = None,
    # LIKE filters (case-insensitive)
    external_reference: str | None = None,
    first_name: str | None = None,
    last_name: str | None = None,
    preferred_name: str | None = None,
    email: str | None = None,
    # Date range filters
    created_at_from: datetime | None = None,
    created_at_to: datetime | None = None,
    updated_at_from: datetime | None = None,
    updated_at_to: datetime | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[PeopleResponse]:
    """
    Get all people with advanced filtering options.
    Requires authentication.
    
    Query Parameters:
    - id: Exact UUID match for person ID
    - institution_id: Exact UUID match for institution
    - lifecycle_stage: Exact match (dropdown selection)
      - prospect: New prospect in the CRM
      - applicant: Has submitted an application
      - admitted: Accepted to a program
      - committed: Confirmed enrollment intent
      - enrolled: Currently enrolled
      - alumni: Graduated/completed program
      - inactive: No longer active
    - external_reference: LIKE search (case-insensitive)
    - first_name: LIKE search (case-insensitive)
    - last_name: LIKE search (case-insensitive)
    - preferred_name: LIKE search (case-insensitive)
    - email: LIKE search (case-insensitive)
    - created_at_from: Filter records created after this date (ISO format)
    - created_at_to: Filter records created before this date (ISO format)
    - updated_at_from: Filter records updated after this date (ISO format)
    - updated_at_to: Filter records updated before this date (ISO format)
    """
    try:
        statement = select(People)

        # Exact match filters
        if id:
            statement = statement.where(People.id == id)
        if institution_id:
            statement = statement.where(People.institution_id == institution_id)
        if lifecycle_stage:
            statement = statement.where(People.lifecycle_stage == lifecycle_stage)

        # LIKE filters (case-insensitive)
        if external_reference:
            statement = statement.where(People.external_reference.ilike(f"%{external_reference}%"))
        if first_name:
            statement = statement.where(People.first_name.ilike(f"%{first_name}%"))
        if last_name:
            statement = statement.where(People.last_name.ilike(f"%{last_name}%"))
        if preferred_name:
            statement = statement.where(People.preferred_name.ilike(f"%{preferred_name}%"))
        if email:
            statement = statement.where(People.email.ilike(f"%{email}%"))

        # Date range filters
        if created_at_from:
            statement = statement.where(People.created_at >= created_at_from)
        if created_at_to:
            statement = statement.where(People.created_at <= created_at_to)
        if updated_at_from:
            statement = statement.where(People.updated_at >= updated_at_from)
        if updated_at_to:
            statement = statement.where(People.updated_at <= updated_at_to)

        statement = statement.order_by(People.last_name, People.first_name)

        result = await session.execute(statement)
        people = result.scalars().all()

        return [PeopleResponse.model_validate(person) for person in people]

    except Exception as e:
        print(f"Error fetching people: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch people",
        )


@people_routes.post("/")
async def create_person(
    person_data: PeopleCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> PeopleResponse:
    """
    Create a new person.
    Requires authentication.
    
    UNIQUE CONSTRAINT: institution_id + email must be unique.
    """
    try:
        new_person = People(
            institution_id=person_data.institution_id,
            external_reference=person_data.external_reference,
            first_name=person_data.first_name,
            last_name=person_data.last_name,
            preferred_name=person_data.preferred_name,
            email=person_data.email,
            phone=person_data.phone,
            date_of_birth=person_data.date_of_birth,
            lifecycle_stage=person_data.lifecycle_stage,
            attributes=person_data.attributes,
        )

        session.add(new_person)
        await session.commit()
        await session.refresh(new_person)

        return PeopleResponse.model_validate(new_person)

    except IntegrityError as e:
        await session.rollback()
        if "people_institution_email_key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A person with this institution_id and email already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity constraint violation",
        )
    except Exception as e:
        await session.rollback()
        print(f"Error creating person: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create person",
        )


@people_routes.patch("/{person_id}")
async def update_person(
    person_id: UUID,
    person_data: PeopleUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> PeopleResponse:
    """
    Partially update an existing person.
    Requires authentication.
    """
    try:
        statement = select(People).where(People.id == person_id)
        result = await session.execute(statement)
        person = result.scalars().first()

        if not person:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Person with ID {person_id} not found",
            )

        # Update only provided fields
        if person_data.external_reference is not None:
            person.external_reference = person_data.external_reference
        if person_data.first_name is not None:
            person.first_name = person_data.first_name
        if person_data.last_name is not None:
            person.last_name = person_data.last_name
        if person_data.preferred_name is not None:
            person.preferred_name = person_data.preferred_name
        if person_data.email is not None:
            person.email = person_data.email
        if person_data.phone is not None:
            person.phone = person_data.phone
        if person_data.date_of_birth is not None:
            person.date_of_birth = person_data.date_of_birth
        if person_data.lifecycle_stage is not None:
            person.lifecycle_stage = person_data.lifecycle_stage
        if person_data.attributes is not None:
            person.attributes = person_data.attributes

        await session.commit()
        await session.refresh(person)

        return PeopleResponse.model_validate(person)

    except HTTPException:
        raise
    except IntegrityError as e:
        await session.rollback()
        if "people_institution_email_key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A person with this institution_id and email already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity constraint violation",
        )
    except Exception as e:
        await session.rollback()
        print(f"Error updating person: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update person",
        )


@people_routes.delete("/{person_id}")
async def delete_person(
    person_id: UUID,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Delete a person by ID.
    Requires authentication.
    """
    try:
        statement = select(People).where(People.id == person_id)
        result = await session.execute(statement)
        person = result.scalars().first()

        if not person:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Person with ID {person_id} not found",
            )

        await session.delete(person)
        await session.commit()

        return {
            "message": "Person deleted successfully",
            "person_id": str(person_id),
        }

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        print(f"Error deleting person: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete person",
        )
