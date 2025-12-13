from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
import uvicorn 

from app.routes import router as main_router
from app.models import Base, engine


async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title='BIG Bro algorithm visualizer', lifespan=lifespan)

origins = ['185.117.151.123']

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],          
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


if __name__ == '__main__':
    uvicorn.run(
        app='app.main:app',
        host='0.0.0.0',
        port=8000,
        reload=True
    )
