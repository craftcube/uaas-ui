FROM docker.registry/nginx:1.14-alpine

COPY index.html /usr/share/nginx/html
COPY dist/build.js /usr/share/nginx/html/dist/build.js
COPY dist/build.js.map /usr/share/nginx/html/dist/build.js.map

EXPOSE 80

RUN rm /etc/nginx/conf.d/*

COPY docker/default.conf /etc/nginx/conf.d/