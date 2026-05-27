# EduPresence backend — production image for Render.
# Uses PHP CLI + built-in server. Sufficient for a small SaaS demo on Render's
# free tier; for higher traffic, swap to php-fpm + nginx via supervisord.

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

# Composer from the official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_MEMORY_LIMIT=-1 \
    COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1

WORKDIR /app

# Step 1 — diagnose runtime so failures are easy to read in build logs.
RUN php --version \
    && composer --version \
    && composer diagnose || true

# Step 2 — install deps with composer.json + lock only first (better cache).
COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --verbose

# Step 3 — copy the rest of the application code.
COPY . .

# Step 4 — generate the production autoloader now that all app files exist.
RUN composer dump-autoload --optimize --no-scripts --no-dev

# Step 5 — ensure Laravel writable directories exist with the right perms.
RUN mkdir -p \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Render injects PORT. Default to 8000 for local docker run.
ENV PORT=8000
EXPOSE 8000

# On boot: discover packages, run pending migrations (idempotent), warm caches,
# then serve. Seeding (php artisan db:seed) is a one-shot — run from the
# Render shell on first deploy if you want demo data.
CMD sh -c "php artisan package:discover --ansi \
 && php artisan migrate --force \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan serve --host=0.0.0.0 --port=${PORT}"
