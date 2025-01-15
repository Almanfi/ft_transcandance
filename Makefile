COMPOSE_FILE = ./docker-compose.yml
ENV_PATH = .env

all:
	docker-compose -f ${COMPOSE_FILE} --env-file ${ENV_PATH} up -d

down :
	docker-compose -f ${COMPOSE_FILE} --env-file ${ENV_PATH} down

clean :
	-docker-compose -f ${COMPOSE_FILE} --env-file ${ENV_PATH} down --rmi all

logs :
	-docker-compose -f ${COMPOSE_FILE} logs

fclean: clean
	docker system prune -af
	-docker volume rm $$(docker volume ls -q)

re : down all

purge: clean all

prune: fclean all

