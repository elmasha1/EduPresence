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

# Give composer enough memory on Render's free tier.
ENV COMPOSER_MEMORY_LIMIT=-1 \
    COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app

COPY . .

# Install production deps WITHOUT running post-install scripts.
# `package:discover` (post-autoload-dump) boots the framework, which on a cold
# Render build can fail if APP_KEY / env vars aren't present yet — so we defer
# package discovery + config caching to CMD time when env vars are injected.
RUN composer install \
        --no-dev \
        --optimize-autoloader \
        --classmap-authoritative \
        --no-interaction \
        --prefer-dist \
        --no-scripts \
    && mkdir -p \
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
# then serve. Seeding (`php artisan db:seed`) is a one-shot — run from the
# Render shell on first deploy if you want demo data.
CMD sh -c "php artisan package:discover --ansi \
 && php artisan migrate --force \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan serve --host=0.0.0.0 --port=${PORT}"
