-- Run this on the Neon database after the VPS primary is reachable on POSTGRES_HOST_PORT.
-- Replace the placeholder password values before execution.

CREATE SUBSCRIPTION sfxsai_subscription
CONNECTION 'host=<VPS_PUBLIC_IP> port=5432 dbname=sfxsai user=sfxsai_repl password=<REPLICATION_PASSWORD> sslmode=prefer'
PUBLICATION sfxsai_publication
WITH (copy_data = true, create_slot = true, enabled = true);
