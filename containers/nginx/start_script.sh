#!/bin/ash

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./clashers.key -out ./clashers.crt -subj "/C=ma/ST=Rhamna/L=Benguerir/O=1337/CN=localhost"

sleep 5

nginx -g 'daemon off;'