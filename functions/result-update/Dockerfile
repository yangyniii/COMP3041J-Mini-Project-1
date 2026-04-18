# Result Update Function container simulator
FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir flask requests
COPY . /app
EXPOSE 8080
CMD ["python", "app.py"]
