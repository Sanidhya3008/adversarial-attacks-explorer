FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Create required directories
RUN mkdir -p /app/data /app/static/uploads /app/static/precomputed /app/pretrained

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend code and models
COPY backend/ .

# Enable CORS for frontend access
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Expose port
EXPOSE 7860

# Hugging Face spaces use port 7860
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app"]