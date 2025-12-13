from fastapi import APIRouter, Depends, Request
from app.database import get_session
from app.schemas import (
    UserCreateRequest,
    UserCreateResponse,
    UserLoginRequest,
    UserLoginResponse,
    GetUserSettingsResponse, 
    UpdateUserSettingsRequest,
    UpdateUserSettingsResponse
)

from app.services import (
    save_user, login_user, get_user_settings_service, update_user_settings_service
)


router = APIRouter(prefix='/api/v1', tags=['main'])



@router.post('/users/create', name='Создание пользователя', response_model=UserCreateResponse)  
async def create_user(
        data: UserCreateRequest,
        db = Depends(get_session)):
    user_id = await save_user(data=data, db=db)
    return UserCreateResponse(user_id=user_id)


@router.post('/users/login', name='Авторизация пользователя', response_model=UserLoginResponse)
async def login(
    data: UserLoginRequest,
    db = Depends(get_session)
):
    user_id = await login_user(data=data, db=db)
    return UserLoginResponse(user_id=user_id)


@router.get('/users/settings', name='Получение настроек пользователя', response_model=GetUserSettingsResponse)
async def get_user_settings(user_id: int, db = Depends(get_session)):
    user_settings = await get_user_settings_service(user_id=user_id, db=db)
    return GetUserSettingsResponse(**user_settings.__dict__)



@router.patch('/users/settings', name='Обновление настроек пользователя', response_model=UpdateUserSettingsResponse)
async def update_user_settings(data: UpdateUserSettingsRequest, db = Depends(get_session)):
    user_settings = await update_user_settings_service(data=data, db=db)
    return UpdateUserSettingsResponse(**user_settings.__dict__)
    
