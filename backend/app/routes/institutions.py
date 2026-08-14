from app.auth.auth import get_current_user
from app.models.institution import  InstitutionCreate, InstitutionUpdate, InstitutionResponse
from app.schema.institutions import Institution
from uuid import UUID
import os
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.db import get_session
from dotenv import load_dotenv
from typing import Annotated
from app.models.user import UserResponse
from fastapi import HTTPException 

# load environment variables from .env file
load_dotenv()


institution_routes = APIRouter(prefix=f"{os.getenv('API_PREFIX')}/institutions", tags=["institutions"])




# get routes to get the institutions from the database
@institution_routes.get("/")
async def get_institutions(
    # current_user: Annotated[UserResponse, Depends(get_current_user)],
    id: UUID | None = None, 
    name: str | None = None,
    code : str | None = None,
    timezone: str | None = None,
    session: AsyncSession = Depends(get_session),  
) -> list[InstitutionResponse]:
    """
    Get all institutions from the database.
    This is a public endpoint - returns only non-sensitive fields.
    """
    try:
        # Query institutions from Supabase (will be from the student_crm.institutions table)
        # For now, returning hardcoded data as a placeholder
        # When database is fully set up, this will query the actual table
        
        institutions = []
        statement = select(Institution)

        if id:
            statement = statement.where(Institution.id == id)
        if name:
            statement = statement.where(Institution.name.ilike(f"%{name}%"))
        if code:
            statement = statement.where(Institution.code.ilike(f"%{code}%"))
        if timezone:
            statement = statement.where(Institution.timezone.ilike(f"%{timezone}%"))
            
        result = await session.execute(statement)
        institutions = result.scalars().all()
        
        return [InstitutionResponse.model_validate(institution) for institution in institutions]
    except Exception as e:
        print(f"Error fetching institutions: {e}")
        return []




@institution_routes.post("/")
async def create_institution(
    inst_data: InstitutionCreate,
    session: AsyncSession = Depends(get_session),
    # current_user: Annotated[UserResponse, Depends(get_current_user)] = None
) -> InstitutionResponse:
    """
    Create a new institution in the database.
    The id and created_at are generated automatically by the database.
    """
    try:
        new_institution = Institution(
            name=inst_data.name,
            code=inst_data.code,
            timezone=inst_data.timezone
        )
        session.add(new_institution)
        await session.commit()
        await session.refresh(new_institution)
        
        return InstitutionResponse.model_validate(new_institution)
    except Exception as e:
        print(f"Error creating institution: {e}")
        raise HTTPException(status_code=500, detail="Error creating institution")






@institution_routes.patch("/{institution_id}")
async def update_institution(
    institution_id: UUID,
    inst_update: InstitutionUpdate,
    session: AsyncSession = Depends(get_session),
    # current_user: Annotated[UserResponse, Depends(get_current_user)] = None
) -> InstitutionResponse:
    """
    Partially updates an institution's information.
    Only provided fields are updated.
    """
    try:
        statement = select(Institution).where(Institution.id == institution_id)
        result = await session.execute(statement)
        db_institution = result.scalars().first()
        
        if not db_institution:
            raise HTTPException(status_code=404, detail="Institution not found")

        if inst_update.name is not None:
            db_institution.name = inst_update.name
        if inst_update.code is not None:
            db_institution.code = inst_update.code
        if inst_update.timezone is not None:
            db_institution.timezone = inst_update.timezone

        await session.commit()
        await session.refresh(db_institution)
        
        return InstitutionResponse.model_validate(db_institution)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating institution: {e}")
        raise HTTPException(status_code=500, detail="Error updating institution")






@institution_routes.delete("/{institution_id}")
async def delete_institution(
    institution_id: UUID,
    session: AsyncSession = Depends(get_session),
    # current_user: Annotated[UserResponse, Depends(get_current_user)] = None
) -> dict:
    """
    Deletes an institution from the database by its ID.
    """
    try:
        statement = select(Institution).where(Institution.id == institution_id)
        result = await session.execute(statement)
        db_institution = result.scalars().first()
        
        if not db_institution:
            raise HTTPException(status_code=404, detail="Institution not found")

        await session.delete(db_institution)
        await session.commit()
        
        return {
            "status": "success",
            "detail": f"Institution '{db_institution.name}' deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting institution: {e}")
        raise HTTPException(status_code=500, detail="Error deleting institution")