from fastapi import FastAPI
import uvicorn 

from app.routes import router as main_router
from app.models import Base, engine


async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title='BIG Bro algorithm visualizer', lifespan=lifespan)

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
