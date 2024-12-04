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
	@docker system prune -a -f
	@docker volume prune -f
	@docker image prune -f
	@docker network prune -f
	@dangling_volumes=$$(docker volume ls -q --filter dangling=true); \
    if [ $$? -eq 0 ]; then \
        for volume in $$dangling_volumes; do \
            docker volume rm $$volume; \
        done; \
    fi

re : down all

purge: clean all

prune: fclean all

