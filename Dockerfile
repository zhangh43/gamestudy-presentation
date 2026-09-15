FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY lesson1/ /usr/share/nginx/html/lesson1/
COPY lesson2/ /usr/share/nginx/html/lesson2/
