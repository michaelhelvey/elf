#!/usr/bin/env bash

set -eou pipefail

export PGPASSWORD=postgres
psql -U postgres -h 'localhost' -p 5436 < ./scripts/create_clerk_user.sql
