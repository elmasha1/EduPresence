# Mirror of ./Dockerfile at the repo root.
# Kept here so Render services whose dashboard "Dockerfile Path" still points
# to ./backend/Dockerfile continue to build without dashboard changes.
# The canonical Dockerfile is at the repo root; both expect the build context
# to be the repo root (Render's default when "Root Directory" is empty).

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

ENV PORT=8000
EXPOSE 8000

CMD sh -c "php artisan package:discover --ansi \
 && php artisan migrate --force \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan serve --host=0.0.0.0 --port=${PORT}"
