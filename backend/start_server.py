import os

import uvicorn

LOG_LEVEL = os.environ.get('LOG_LEVEL', 'DEBUG')

if __name__ == "__main__":
    uvicorn.run(
        'app.main:sio_app', 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )
