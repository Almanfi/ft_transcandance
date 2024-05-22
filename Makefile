COMPOSE_FILE = ./containers/docker-compose.yml
ENV_PATH = .env
# DATA_ROOT = ~/data

all:
	docker-compose -f ${COMPOSE_FILE} --env-file ${ENV_PATH} up -d

down :
	docker-compose -f ${COMPOSE_FILE} down

clean :
	-docker-compose -f ${COMPOSE_FILE} down --rmi all

fclean: clean
	docker system prune -af
	-docker volume rm $$(docker volume ls -q)

re : down all

purge: clean all

prune: fclean all

