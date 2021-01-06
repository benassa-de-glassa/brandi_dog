import os

import uvicorn

HOST = os.environ.get('HOST', '0.0.0.0')
PORT = int(os.environ.get('PORT', 8000))

if __name__ == "__main__":
    uvicorn.run(
        'app.main:sio_app',
        host=HOST, 
        port=PORT, 
        reload=True
    )

# gunicorn 
# gunicorn -w 1 -k uvicorn.workers.UvicornWorker app.main:sio_app -b '[2a04:ee41:3:b127:1ca6:b77:5ef0:48fe]:8000'