# backend/app/routes/applications.py

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
from app.models.application import (
    ApplicationResponse,
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationStage,
    DecisionCode,
    ReplyCode,
    TransferInstitutionType,
)
from app.auth import get_current_user
from app.models.user import UserResponse
from app.schema.applications import Application

load_dotenv()

application_routes = APIRouter(
    prefix=f"{os.getenv('API_PREFIX')}/applications",
    tags=["applications"]
)


@application_routes.get("/")
async def get_applications(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    # Exact match filters
    id: UUID | None = None,
    person_id: UUID | None = None,
    program_id: UUID | None = None,
    term_id: UUID | None = None,
    application_year: int | None = None,
    stage: ApplicationStage | None = None,
    decision_code: DecisionCode | None = None,
    reply_code: ReplyCode | None = None,
    transfer_institution_type: TransferInstitutionType | None = None,
    # LIKE filters (case-insensitive)
    applicant_source: str | None = None,
    # Date range filters
    submitted_at_from: datetime | None = None,
    submitted_at_to: datetime | None = None,
    decided_at_from: datetime | None = None,
    decided_at_to: datetime | None = None,
    created_at_from: datetime | None = None,
    created_at_to: datetime | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[ApplicationResponse]:
    """
    Get all applications with advanced filtering options.
    Requires authentication.
    
    Query Parameters:
    - id: Exact UUID match for application ID
    - person_id: Exact UUID match for person/applicant
    - program_id: Exact UUID match for program
    - term_id: Exact UUID match for term
    - application_year: Exact match for application year (integer)
    - stage: Exact match (dropdown selection)
      - started: Application started but not submitted
      - submitted: Application submitted
      - under_review: Being reviewed by admissions
      - admitted: Admission offered
      - waitlisted: Placed on waitlist
      - denied: Application denied
      - committed: Accepted and committed
      - withdrawn: Applicant withdrew
    - decision_code: Institution admission decision (dropdown selection)
      - AC: Accepted
      - AP: Accepted Provisional
      - WL: Waitlisted
      - RH: Rejected/Held
    - reply_code: Applicant's response (dropdown selection)
      - Y: Yes/Accepted
      - DF: Deferred
      - NC: No/Declined
      - NS: No Show
      - NR: No Reply
    - transfer_institution_type: Type of transfer institution (dropdown selection)
      - community_college: From community college
      - four_year: From 4-year institution
      - international: From international institution
      - other: Other type
    - applicant_source: Where applicant came from (LIKE search, case-insensitive)
    - submitted_at_from: Filter applications submitted after this date (ISO format)
    - submitted_at_to: Filter applications submitted before this date (ISO format)
    - decided_at_from: Filter applications decided after this date (ISO format)
    - decided_at_to: Filter applications decided before this date (ISO format)
    - created_at_from: Filter records created after this date (ISO format)
    - created_at_to: Filter records created before this date (ISO format)
    """
    try:
        statement = select(Application)

        # Exact match filters
        if id:
            statement = statement.where(Application.id == id)
        if person_id:
            statement = statement.where(Application.person_id == person_id)
        if program_id:
            statement = statement.where(Application.program_id == program_id)
        if term_id:
            statement = statement.where(Application.term_id == term_id)
        if application_year is not None:
            statement = statement.where(Application.application_year == application_year)
        if stage:
            statement = statement.where(Application.stage == stage)
        if decision_code:
            statement = statement.where(Application.decision_code == decision_code)
        if reply_code:
            statement = statement.where(Application.reply_code == reply_code)
        if transfer_institution_type:
            statement = statement.where(Application.transfer_institution_type == transfer_institution_type)

        # LIKE filters (case-insensitive)
        if applicant_source:
            statement = statement.where(Application.applicant_source.ilike(f"%{applicant_source}%"))

        # Date range filters
        if submitted_at_from:
            statement = statement.where(Application.submitted_at >= submitted_at_from)
        if submitted_at_to:
            statement = statement.where(Application.submitted_at <= submitted_at_to)
        if decided_at_from:
            statement = statement.where(Application.decided_at >= decided_at_from)
        if decided_at_to:
            statement = statement.where(Application.decided_at <= decided_at_to)
        if created_at_from:
            statement = statement.where(Application.created_at >= created_at_from)
        if created_at_to:
            statement = statement.where(Application.created_at <= created_at_to)

        statement = statement.order_by(Application.created_at.desc())

        result = await session.execute(statement)
        applications = result.scalars().all()

        return [ApplicationResponse.model_validate(app) for app in applications]

    except Exception as e:
        print(f"Error fetching applications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch applications",
        )


@application_routes.post("/")
async def create_application(
    application_data: ApplicationCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> ApplicationResponse:
    """
    Create a new application.
    Requires authentication.
    
    UNIQUE CONSTRAINT: person_id + program_id + application_year must be unique.
    """
    try:
        new_application = Application(
            person_id=application_data.person_id,
            program_id=application_data.program_id,
            term_id=application_data.term_id,
            application_year=application_data.application_year,
            stage=application_data.stage,
            decision_code=application_data.decision_code,
            reply_code=application_data.reply_code,
            applicant_source=application_data.applicant_source,
            transfer_institution_type=application_data.transfer_institution_type,
            submitted_at=application_data.submitted_at,
            decided_at=application_data.decided_at,
        )

        session.add(new_application)
        await session.commit()
        await session.refresh(new_application)

        return ApplicationResponse.model_validate(new_application)

    except IntegrityError as e:
        await session.rollback()
        if "applications_person_program_year_key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An application with this person_id, program_id, and application_year already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity constraint violation",
        )
    except Exception as e:
        await session.rollback()
        print(f"Error creating application: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create application",
        )


@application_routes.patch("/{application_id}")
async def update_application(
    application_id: UUID,
    application_data: ApplicationUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> ApplicationResponse:
    """
    Partially update an existing application.
    Requires authentication.
    """
    try:
        statement = select(Application).where(Application.id == application_id)
        result = await session.execute(statement)
        application = result.scalars().first()

        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with ID {application_id} not found",
            )

        # Update only provided fields
        if application_data.term_id is not None:
            application.term_id = application_data.term_id
        if application_data.stage is not None:
            application.stage = application_data.stage
        if application_data.decision_code is not None:
            application.decision_code = application_data.decision_code
        if application_data.reply_code is not None:
            application.reply_code = application_data.reply_code
        if application_data.applicant_source is not None:
            application.applicant_source = application_data.applicant_source
        if application_data.transfer_institution_type is not None:
            application.transfer_institution_type = application_data.transfer_institution_type
        if application_data.submitted_at is not None:
            application.submitted_at = application_data.submitted_at
        if application_data.decided_at is not None:
            application.decided_at = application_data.decided_at

        await session.commit()
        await session.refresh(application)

        return ApplicationResponse.model_validate(application)

    except HTTPException:
        raise
    except IntegrityError as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity constraint violation",
        )
    except Exception as e:
        await session.rollback()
        print(f"Error updating application: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update application",
        )


@application_routes.delete("/{application_id}")
async def delete_application(
    application_id: UUID,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Delete an application by ID.
    Requires authentication.
    """
    try:
        statement = select(Application).where(Application.id == application_id)
        result = await session.execute(statement)
        application = result.scalars().first()

        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with ID {application_id} not found",
            )

        await session.delete(application)
        await session.commit()

        return {
            "message": "Application deleted successfully",
            "application_id": str(application_id),
        }

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        print(f"Error deleting application: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete application",
        )
