FROM alpine:latest

RUN apk update &&\
    apk add python3 py3-virtualenv py3-pip libpq-dev

COPY ./backend /usr/backend

WORKDIR /usr/backend

RUN python3 -m venv venv &&\
    source ./venv/bin/activate &&\
    pip install -r requirements.txt

ARG PG_USERNAME\
    PG_USER_PASSWORD\
    PG_DB_NAME

ENV PG_USERNAME=${PG_USERNAME}\
    PG_USER_PASSWORD=${PG_USER_PASSWORD}\
    PG_DB_NAME=${PG_DB_NAME}

WORKDIR /usr/backend/pong

EXPOSE 8000

RUN chmod 777 script.sh

CMD ./script.sh