from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.settings import settings
 
print(settings.database_url)
engine = create_async_engine(settings.database_url)

AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

Base = declarative_base()


async def get_session():
    async with AsyncSessionLocal() as session:
        yield session
         

