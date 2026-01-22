FROM php:8.5-fpm-bookworm

WORKDIR /var/www

# 1. Install system dependencies and PHP extensions (as ROOT)
# libpq-dev is required for PostgreSQL support
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN groupadd -g 1000 www
RUN useradd -u 1000 -ms /bin/bash -g www www

COPY --chown=www:www . /var/www

# 2. Switch to the non-root user AFTER installations
USER www

# 3. Expose the port you are actually using in the CMD
EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]