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

WORKDIR /app

# Copy the whole project so post-install scripts (package:discover) can resolve.
COPY . .

# Install production deps + optimized autoloader.
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist \
    && chmod -R 775 storage bootstrap/cache

# Render injects PORT. Default to 8000 for local docker run.
ENV PORT=8000
EXPOSE 8000

# On boot: run pending migrations (idempotent) + cache config/routes, then serve.
# Seeding (php artisan db:seed) is a one-shot — run it manually from the Render
# shell on first deploy if you want demo data.
CMD sh -c "php artisan migrate --force \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan serve --host=0.0.0.0 --port=${PORT}"
