FROM nginx:stable-alpine-slim

RUN mkdir -p /etc/nginx/templates

COPY nginx.conf /etc/nginx/nginx.conf 
COPY templates/* /etc/nginx/templates/

EXPOSE 80 443
