# Deployment

KasirQu ships as a multi-container stack (Laravel PHP-FPM + Nginx + MySQL 8 + Redis 7)
defined in `docker-compose.yml`. The Nginx vHost is `nginx/default.conf` (publishes the
API on container port `80` → host `8080`).

## Local (Docker Compose)

```bash
docker compose up -d --build
# API:        http://localhost:8080/api/v1
# Migrate + seed:
docker compose exec php-fpm php artisan migrate --seed
# Tests:
docker compose exec php-fpm php artisan test
# Frontend (Vite dev server):
cd frontend && npm install && npm run dev
```

The frontend expects `VITE_API_URL` (see `frontend/.env.example`). Default
`http://localhost:8080/api/v1` matches the Nginx port above.

## CapRover

`captain-definition.json` (schemaVersion 2, `composeFilePath`) lets CapRover deploy the
whole stack from this repo:

1. In CapRover dashboard → **Apps** → create app `kasirqu`.
2. **Deployment** → *Method 2: Deploy from Github/Bitbucket/Gitlab* → connect repo
   `januarsyah901/kasirqu`, branch `main`, and point CapRover at `captain-definition.json`.
3. Set env vars on the `php-fpm` service (CapRover → app → **App Configs** →
   *Environment Variables* applied to the service): `DB_HOST`, `DB_DATABASE`,
   `DB_USERNAME`, `DB_PASSWORD`, `REDIS_HOST` — matching your CapRover MySQL/Redis one-click
   apps (recommended) instead of the bundled `mysql`/`redis` services for production.
4. Deploy. CapRover builds the `Dockerfile` and brings up the compose services.

> Note: the bundled `mysql`/`redis` services in `docker-compose.yml` are convenient for
> local dev. For production on CapRover, prefer CapRover's one-click MySQL/Redis apps and
> point `DB_HOST`/`REDIS_HOST` at them, then remove (or ignore) the bundled services.
