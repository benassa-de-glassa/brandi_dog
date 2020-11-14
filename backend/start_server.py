import os

import uvicorn

from dotenv import load_dotenv

load_dotenv()   # (try to) load environment variables from .env

HOST = os.environ.get('HOST', '0.0.0.0')
PORT = os.environ.get('PORT', 8000)

if __name__ == "__main__":
    uvicorn.run(
        'app.main:sio_app',
        host=HOST, 
        port=PORT, 
        reload=True
    )
