FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY lesson1/ /usr/share/nginx/html/lesson1/
COPY lesson2/ /usr/share/nginx/html/lesson2/
COPY lesson3/ /usr/share/nginx/html/lesson3/
COPY lesson4/ /usr/share/nginx/html/lesson4/
COPY shared/ /usr/share/nginx/html/shared/
