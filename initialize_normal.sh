#!/bin/bash

sudo apt install -y zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
sudo apt install -y nginx
sudo apt install haproxy

sudo add-apt-repository -y ppa:ondrej/php

# Update package list
sudo apt-get update

# Install PHP 8.3 and common extensions
sudo apt-get install -y \
    php8.3 \
    php8.3-cli \
    php8.3-common \
    php8.3-curl \
    php8.3-json \
    php8.3-opcache \
    php8.3-readline \
    php8.3-mysql \
    php8.3-pgsql \
    php8.3-sqlite3 \
    php8.3-xml \
    php8.3-mbstring \
    php8.3-gd \
    php8.3-zip \
    php8.3-bcmath \
    php8.3-imagick \
    php8.3-redis

# Clean up
sudo apt-get clean
