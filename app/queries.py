
from typing import Optional 

from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, UserArrayConfiguration
from sqlalchemy import select 


async def get_user_by_email(email: str, db: AsyncSession) -> Optional[User]:
    query = await db.execute(
        select(User).where(User.email == email)
    )
    user = query.scalars().first() 
    return user 
    


async def get_user_settings(user_id: int, db: AsyncSession) -> Optional[UserArrayConfiguration]:
    query = await db.execute(
        select(UserArrayConfiguration).where(UserArrayConfiguration.user_id == user_id)
    )
    user_settings = query.scalars().first()
    return user_settings



