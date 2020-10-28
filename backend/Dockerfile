FROM python:3.8-slim

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn","-b", "0.0.0.0:80", "-w", "1", "-k", "uvicorn.workers.UvicornWorker", "app.main:sio_app"]