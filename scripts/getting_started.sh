#!/usr/bin/env bash

set -eoux pipefail

# check if nvm is installed, if so, use it to install node
if [ -x "$(command -v nvm)" ]; then
  echo "Looks like you're using NVM...setting up the version of Node.js this project uses..."
  nvm install
  nvm use
fi

# install project dependencies:
pnpm install

# set up environment variables:
if [ ! -f .env ]; then
  echo "Looks like you don't have a .env file...creating one now..."
  cp .env.example .env

  echo "if you want to use Clerk, please copy and paste your Clerk .env variables here:"
  ${VISUAL:-${EDITOR:-nvim}} .env
fi

# first check if the "db" container in docker compose is running at all with docker compose ps:
if ! docker compose ps | grep db | grep Up > /dev/null; then
  database_url=$(cat ./.env | grep DATABASE_URL)
  db_port=$(echo $database_url | sed 's/.*:\([0-9]*\)\/.*/\1/')

  # try to figure out if the thing running at port is another docker container
  # (the very likely case):
  if docker ps -a | grep $db_port; then
    echo "It looks like another docker container is already running at port $db_port.  (See above)."
    echo "Please stop that container and run this script again."
    exit
  fi

  # if some other process is already running at db_port, then fail with a generic error:
  if lsof -Pi :$db_port -sTCP:LISTEN -t >/dev/null ; then
    echo "Looks like you already have something running on port $db_port.  Please stop that process and then run this script again."
    exit
  fi

  echo "Starting local docker container from docker-compose.yml"
  docker compose up -d db

  # wait until docker compose exec db pg_isready is successful  before trying to
  # migrate the database:
  until docker compose exec db pg_isready; do
    echo "Waiting for postgres docker container to start..."
    sleep 1
  done
else
  echo "Local postgres docker container already running, skipping docker-compose up"
fi

# run the database migrations:
pnpm db:migrate

echo "You're all set! Run 'pnpm dev' to start the development server."
