FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend code and models
COPY backend/ .
COPY pretrained/ ./pretrained/

# Enable CORS for frontend access
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Expose port
EXPOSE 7860

# Hugging Face spaces use port 7860
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app"]