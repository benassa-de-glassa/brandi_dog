import uvicorn
from app.main import sio_app


if __name__ == "__main__":
    uvicorn.run(
        'app.main:sio_app', 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level='info')
