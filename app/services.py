from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, UserArrayConfiguration
from app.schemas import UserCreateRequest, UpdateUserSettingsRequest, UserLoginRequest, UserLoginResponse
from app.queries import (
    get_user_by_email, get_user_settings
)


async def save_user(data: UserCreateRequest, db: AsyncSession) -> int:
    user: User = await get_user_by_email(email=data.email, db=db)
    
    if user: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Пользователь с таким email уже существует'
        )
    
    user = User(
        email=data.email
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    await save_user_settings(user_id = user.id, db=db)
    return user.id 


async def login_user(data: UserLoginRequest, db: AsyncSession) -> int:
    user: User = await get_user_by_email(email=data.email, db=db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Пользователь с таким email не найден'
        )   
    return user.id


async def save_user_settings(user_id: int, db: AsyncSession) -> UserArrayConfiguration:
    user_settings = UserArrayConfiguration(
        user_id=user_id
    )
    db.add(user_settings)
    await db.commit()
    await db.refresh(user_settings)
    return user_settings


async def get_user_settings_service(user_id: int, db: AsyncSession) -> UserArrayConfiguration:
    user_settings = await get_user_settings(user_id=user_id, db=db)
    
    if not user_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Настройки пользователя не найдены'
        )
    return user_settings


async def update_user_settings_service(data: UpdateUserSettingsRequest, db: AsyncSession) -> UserArrayConfiguration:
    user_settings = await get_user_settings(user_id=data.user_id, db=db)

    if not user_settings:
        raise HTTPException(
            status_code=status.http_404_not_found,
            detail='настройки пользователя не найдены'
        )

    user_settings.array_size = data.array_size if data.array_size else user_settings.array_size
    user_settings.speed = data.speed if data.speed else user_settings.speed

    await db.commit()
    await db.refresh(user_settings)
    return user_settings
