#!/bin/bash

source .env

mkdir -p ./proxy/ssl/certs
mkdir -p ./proxy/ssl/private

openssl req -x509 -newkey rsa:2048 -sha256 -days 365 -nodes \
  -keyout ./proxy/ssl/private/${DOMAIN}.key \
  -out    ./proxy/ssl/certs/${DOMAIN}.crt \
  -subj "/CN=${DOMAIN}"
