FROM python:3.12-slim

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps via uv (fast)
RUN pip install --no-cache-dir uv

COPY pyproject.toml .
# Stub the package so hatchling can resolve deps before source is copied
RUN mkdir -p app && touch app/__init__.py
RUN uv pip install --system --no-cache -e .

COPY . .

# Create non-root user
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
