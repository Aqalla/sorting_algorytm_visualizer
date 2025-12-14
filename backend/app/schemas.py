from pydantic import BaseModel, Field
import datetime 


class UserCreateRequest(BaseModel):
    email: str = Field(..., description='Email пользователя')


class UserCreateResponse(BaseModel):
    user_id: int = Field(..., desciption='Идентификатор созданного пользователя')


class UserLoginRequest(BaseModel):
    email: str = Field(..., description='Email пользователя')


class UserLoginResponse(BaseModel):
    user_id: int = Field(..., description='Идентификатор пользователя')


class GetUserSettingsResponse(BaseModel):
    array_size: int = Field(..., description='Размер массива')
    speed: int = Field(..., description='Скорость алгоритма')
    updated_at: datetime.datetime = Field(..., description='Дата обновления настроек')
    user_id: int = Field(..., description='Идентификатор пользователя')
    
    class Config:
        from_attributes = True

class UpdateUserSettingsRequest(BaseModel):
    array_size: int = Field(..., description='Размер массива')
    speed: int = Field(..., description='Скорость алгоритма')
    user_id: int = Field(..., description='Идентификатор пользователя')


class UpdateUserSettingsResponse(BaseModel):
    array_size: int = Field(..., description='Размер массива')
    speed: int = Field(..., description='Скорость алгоритма')
    user_id: int = Field(..., description='Идентификатор пользователя')


