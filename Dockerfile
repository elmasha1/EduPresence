# EduPresence backend — production image for Render.
# Lives at the repo root so it works regardless of whether Render's "Root
# Directory" service setting is empty (default) or "backend".

FROM php:8.2-cli

# System deps + PHP extensions needed by Laravel + Postgres driver.
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libpq-dev \
        libzip-dev \
        libicu-dev \
        libonig-dev \
    && docker-php-ext-install \
        pdo_pgsql \
        pgsql \
        mbstring \
        bcmath \
        intl \
        zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_MEMORY_LIMIT=-1 \
    COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1

WORKDIR /app

# Copy only the backend's composer files first for better layer caching.
COPY backend/composer.json backend/composer.lock ./

RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist

# Copy the rest of the backend source on top.
COPY backend/ ./

# Generate optimized autoloader now that all app files are present.
RUN composer dump-autoload --optimize --no-scripts --no-dev \
    && mkdir -p \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Render injects PORT. Default 8000 for local docker run.
ENV PORT=8000
EXPOSE 8000

# On boot: discover packages, run pending migrations (idempotent), warm caches,
# then serve. Seeding (`php artisan db:seed`) is a one-shot — run from the
# Render shell on first deploy if you want demo data.
CMD sh -c "php artisan package:discover --ansi \
 && php artisan migrate --force \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan serve --host=0.0.0.0 --port=${PORT}"
