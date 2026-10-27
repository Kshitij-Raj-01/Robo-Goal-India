FROM python:3.14-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && groupadd --gid 10001 rgi && useradd --uid 10001 --gid rgi --no-create-home rgi
COPY --chown=rgi:rgi . .
RUN mkdir -p media staticfiles && chown -R rgi:rgi media staticfiles \
    && DJANGO_DEBUG=true DJANGO_SECRET_KEY=build-only-collectstatic-not-a-runtime-secret python manage.py collectstatic --noinput \
    && chown -R rgi:rgi staticfiles
USER rgi
EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2", "--threads", "2", "--timeout", "45", "--max-requests", "1000", "--max-requests-jitter", "100", "--no-control-socket", "--access-logfile", "-", "--error-logfile", "-"]
