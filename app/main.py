from fastapi import FastAPI
import uvicorn 


app = FastAPI(title='BIG Bro algorythm visualizer')


@app.get('/health-check')
async def health():
    return {
        'status': 'OK',
        'message': 'YA jiv!!!'
    }


if __name__ == '__main__':
    uvicorn.run(
        app='app.main:app',
        host='0.0.0.0',
        port=8000,
        reload=True
    )