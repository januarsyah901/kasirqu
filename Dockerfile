FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache sockets

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app/backend

COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-interaction --optimize-autoloader --no-scripts

COPY backend/ ./

RUN useradd -m -s /bin/bash appuser \
    && chown -R appuser:appuser /app/backend \
    && chmod -R 755 /app/backend/storage /app/backend/bootstrap/cache
USER appuser

EXPOSE 9000
