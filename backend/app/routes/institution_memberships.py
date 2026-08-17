from app.auth.auth import get_current_user
from app.models.institution_membership import InstitutionMembershipCreate, InstitutionMembershipUpdate, InstitutionMembershipResponse
from app.schema.institution_memberships import InstitutionMembership
from uuid import UUID
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.db import get_session
from dotenv import load_dotenv
from typing import Annotated
from app.models.user import UserResponse

# load environment variables from .env file
load_dotenv()

institution_membership_routes = APIRouter(
    prefix=f"{os.getenv('API_PREFIX')}/institution-memberships",
    tags=["institution-memberships"]
)


# GET all memberships with optional filters
@institution_membership_routes.get("/")
async def get_institution_memberships(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    institution_id: UUID | None = None,
    user_id: UUID | None = None,
    role: str | None = None,
    department: str | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[InstitutionMembershipResponse]:
    """
    Get institution memberships with optional filters.
    Can filter by institution_id, user_id, role, or department.
    """
    try:
        statement = select(InstitutionMembership)

        if institution_id:
            statement = statement.where(InstitutionMembership.institution_id == institution_id)
        if user_id:
            statement = statement.where(InstitutionMembership.user_id == user_id)
        if role:
            statement = statement.where(InstitutionMembership.role.ilike(f"%{role}%"))
        if department:
            statement = statement.where(InstitutionMembership.department.ilike(f"%{department}%"))

        result = await session.execute(statement)
        memberships = result.scalars().all()

        return [InstitutionMembershipResponse.model_validate(m) for m in memberships]
    except Exception as e:
        print(f"Error fetching memberships: {e}")
        return []


# POST create new membership
@institution_membership_routes.post("/")
async def create_institution_membership(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    membership_data: InstitutionMembershipCreate,
    session: AsyncSession = Depends(get_session),
) -> InstitutionMembershipResponse:
    """
    Create a new institution membership.
    Requires institution_id and user_id (composite key).
    """
    try:
        new_membership = InstitutionMembership(
            institution_id=membership_data.institution_id,
            user_id=membership_data.user_id,
            role=membership_data.role,
            department=membership_data.department,
        )
        session.add(new_membership)
        await session.commit()
        await session.refresh(new_membership)

        return InstitutionMembershipResponse.model_validate(new_membership)
    except Exception as e:
        print(f"Error creating membership: {e}")
        raise HTTPException(status_code=500, detail="Error creating membership")


# PATCH update membership (by composite key: institution_id + user_id)
@institution_membership_routes.patch("/")
async def update_institution_membership(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    institution_id: UUID,
    user_id: UUID,
    membership_update: InstitutionMembershipUpdate,
    session: AsyncSession = Depends(get_session),
) -> InstitutionMembershipResponse:
    """
    Partially update a membership by institution_id and user_id.
    Query params: institution_id, user_id
    Body: role and/or department
    """
    try:
        statement = select(InstitutionMembership).where(
            (InstitutionMembership.institution_id == institution_id)
            & (InstitutionMembership.user_id == user_id)
        )
        result = await session.execute(statement)
        db_membership = result.scalars().first()

        if not db_membership:
            raise HTTPException(status_code=404, detail="Membership not found")

        if membership_update.role is not None:
            db_membership.role = membership_update.role
        if membership_update.department is not None:
            db_membership.department = membership_update.department

        await session.commit()
        await session.refresh(db_membership)

        return InstitutionMembershipResponse.model_validate(db_membership)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating membership: {e}")
        raise HTTPException(status_code=500, detail="Error updating membership")


# DELETE membership (by composite key: institution_id + user_id)
@institution_membership_routes.delete("/")
async def delete_institution_membership(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    institution_id: UUID,
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Delete a membership by institution_id and user_id.
    Query params: institution_id, user_id
    """
    try:
        statement = select(InstitutionMembership).where(
            (InstitutionMembership.institution_id == institution_id)
            & (InstitutionMembership.user_id == user_id)
        )
        result = await session.execute(statement)
        db_membership = result.scalars().first()

        if not db_membership:
            raise HTTPException(status_code=404, detail="Membership not found")

        await session.delete(db_membership)
        await session.commit()

        return {
            "status": "success",
            "detail": f"Membership deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting membership: {e}")
        raise HTTPException(status_code=500, detail="Error deleting membership")