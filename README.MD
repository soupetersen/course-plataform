# Subir ambiente dev
docker-compose --profile development up -d

# Ver status
docker-compose ps

# Ver logs
docker-compose logs api-dev

# Parar ambiente
docker-compose --profile development down