from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 

from app.routes import router as main_router
from app.models import Base, engine


async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title='BIG Bro algorithm visualizer', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://209.74.71.173:80',
        'http://209.74.71.173',
        'http://localhost:80',
        'http://localhost'
    ],          
    allow_credentials=True,         
    allow_methods=["*"],            
    allow_headers=["*"],            
)

app.include_router(main_router)


@app.get('/health-check')
async def health(): 
    return {
        'status': 'OK',
    }

