FROM alpine:latest

RUN apk update &&\
    apk add python3 py3-virtualenv py3-pip libpq-dev

WORKDIR /usr/backend

ARG PG_USERNAME\
    PG_USER_PASSWORD\
    PG_DB_NAME \
    JWT_SECRET \
    JWT_PUBLIC

ENV PG_USERNAME=${PG_USERNAME} \
    PG_USER_PASSWORD=${PG_USER_PASSWORD} \
    PG_DB_NAME=${PG_DB_NAME} \
    JWT_SECRET=${JWT_SECRET} \
    JWT_PUBLIC=${JWT_PUBLIC}

EXPOSE 8000

COPY --chmod=777 ./script.sh /usr/script.sh

WORKDIR /usr

CMD /usr/script.sh