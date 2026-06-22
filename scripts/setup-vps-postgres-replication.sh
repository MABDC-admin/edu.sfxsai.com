#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${POSTGRES_DB:-}" || -z "${POSTGRES_USER:-}" || -z "${REPLICATION_USER:-}" ]]; then
  echo "POSTGRES_DB, POSTGRES_USER, and REPLICATION_USER must be set" >&2
  exit 1
fi

psql "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:${POSTGRES_HOST_PORT:-5432}/${POSTGRES_DB}" <<'SQL'
CREATE PUBLICATION sfxsai_publication FOR ALL TABLES;
SQL

psql "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:${POSTGRES_HOST_PORT:-5432}/${POSTGRES_DB}" <<'SQL'
ALTER PUBLICATION sfxsai_publication OWNER TO CURRENT_USER;
SQL

echo "Publication sfxsai_publication is ready."
