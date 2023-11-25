#!/usr/bin/env bash

set -eou pipefail

# This script is used to nuke the database and start from scratch.

tables=$(rg -i 'create table' ./src/drizzle/migrations | sd '.*"(\w+)".*' '$1')

QUERY=""
export PGPASSWORD=postgres

for table in $tables; do
  echo "Dropping table $table"
  QUERY="$QUERY DROP TABLE IF EXISTS $table CASCADE;"
done

psql -U postgres -h 'localhost' -p 5436 -c "$QUERY"

if [ "$1" = "--rm-migrations" ]; then
  echo "Removing existing migrations"
  rm -rf ./src/drizzle/migrations
  psql -U postgres -h 'localhost' -p 5436 -c "DROP TABLE IF EXISTS drizzle.__drizzle_migrations;"
fi

echo "Re-Migrating"
pnpm db:makemigrations
pnpm db:migrate

echo "Creating clerk user"

psql -U postgres -h 'localhost' -p 5436 < ./scripts/create_clerk_user.sql
