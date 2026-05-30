FROM php:8.1-apache

# Inštalácia systémových knižníc pre prácu s obrázkami (potrebné pre Zenphoto)
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install gd mysqli

# Zapnutie Apache mod_rewrite pre "Clean URLs" v galérii
RUN a2enmod rewrite

# Nastavenie pracovného adresára
WORKDIR /var/www/html