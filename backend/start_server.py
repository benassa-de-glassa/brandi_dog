import os

import uvicorn

from dotenv import load_dotenv

load_dotenv()   # (try to) load environment variables from .env

if __name__ == "__main__":
    uvicorn.run(
        'app.main:sio_app', 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )
