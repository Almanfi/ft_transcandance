FROM alpine:3.20

RUN apk update \
    && apk add postgresql \
    && mkdir /run/postgresql \
    && chown postgres:postgres /run/postgresql \
    && mkdir /var/lib/postgresql/data \
    && mkdir /var/lib/postgresql/log \
    && chmod -R 700 /var/lib/postgresql \
    && chown -R postgres:postgres /var/lib/postgresql 

USER postgres

RUN initdb -D /var/lib/postgresql/data \
    && echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf \
    && echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf

ARG PG_ROOT_PASSWORD
ARG PG_USERNAME
ARG PG_USER_PASSWORD
ARG PG_DB_NAME

RUN pg_ctl start -D /var/lib/postgresql/data -l /var/lib/postgresql/log/postgres.log &&\
    psql -c "CREATE ROLE $PG_USERNAME WITH SUPERUSER LOGIN PASSWORD '$PG_USER_PASSWORD';" &&\
    psql -c "CREATE DATABASE $PG_DB_NAME OWNER $PG_USERNAME;" &&\
    psql -c "ALTER ROLE postgres WITH PASSWORD '$PG_ROOT_PASSWORD';"

EXPOSE 5432

CMD postgres -D /var/lib/postgresql/data
