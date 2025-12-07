from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

 
DATABASE_URL = "postgresql+asyncpg://postgres:admin@localhost:5432/algo_viz"  # Use aiosqlite driver for async SQLite

engine = create_async_engine(DATABASE_URL)

AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

Base = declarative_base()


async def get_session():
    async with AsyncSessionLocal() as session:
        yield session
         

