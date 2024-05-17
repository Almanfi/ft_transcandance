FROM alpine:latest

RUN apk update &&\
    apk add python3 py3-virtualenv py3-pip libpq-dev

#COPY ./backend /usr/backend

WORKDIR /usr/backend

ARG PG_USERNAME\
    PG_USER_PASSWORD\
    PG_DB_NAME

ENV PG_USERNAME=${PG_USERNAME}\
    PG_USER_PASSWORD=${PG_USER_PASSWORD}\
    PG_DB_NAME=${PG_DB_NAME}

EXPOSE 8000

COPY --chmod=777 ./script.sh /usr/script.sh

CMD /usr/script.sh