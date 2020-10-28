import uvicorn
from app.main import sio_app


if __name__ == "__main__":
    uvicorn.run(
        'app.main:sio_app', 
        host="2a04:ee41:3:b127:84b3:2a12:61ac:f4b2", 
        port=8049, 
        # reload=True,
        log_level='info')
