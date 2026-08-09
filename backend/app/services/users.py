# from app.db.db import get_session
# from app.db.models import User as DBUser
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from app.models.user import UserResponse



# async def get_user_by_email(email: str, session: AsyncSession) -> UserResponse | None:
#     """
#     Fetches a user by email from the database.
#     Returns a UserResponse object if found, else None.
#     """
#     result = await session.execute(select(DBUser).filter(DBUser.email == email))
#     user = result.scalars().first()
#     if user:
#         return UserResponse.from_orm(user)
#     return None