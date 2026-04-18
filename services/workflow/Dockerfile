# Workflow Service Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app
ENV FLASK_APP=main.py
EXPOSE 5001
CMD ["python", "main.py"]
