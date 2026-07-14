# Migration Progress — Phase 2 (Functional Migration)

Branch: `tech-migration-plan` (fast-forwarded to `main` after each batch so the
cron's delivery branch stays consistent with the completed stack).

Batches are derived from the Phase 2 spec. Reality check on the repo:
the full Laravel/React migration was already functionally complete on `main`
(Day 5). The genuinely missing structural pieces were the **Form Request**
classes (B3) and the **Service layer** (B7). This run closed B3.

| Batch | Scope | Status | Notes |
|-------|-------|--------|-------|
| B1 | DB schema (migrations for all OSPOS tables) | done | 22 migrations on `main`; `php artisan migrate` verified |
| B2 | Eloquent models + relationships | done | All models present with `$fillable`/`$casts`/relations |
| B3 | API Resources + Form Requests | **done (this run)** | Resources existed; Form Requests were MISSING. Added 11 Form Request classes and wired them into Product/Customer/Expense/Sale controllers. `php artisan test` → 38 passed |
| B4 | Controllers + routes (CRUD, sale txn) | done | `api/v1` routes registered; SaleController wraps sale in DB transaction |
| B5 | Sanctum auth (login/me/logout) | done | `auth:sanctum` protects `api/v1` except login |
| B6 | Frontend API wiring | done | axios client + Dashboard/Reports/POS wired to API |
| B7 | Service layer (SaleService/TaxService) | **pending** | `backend/app/Services/` is empty; business logic still inline in controllers |
| B8 | Tests (Pest/feature) | done | 38 backend tests passing; frontend Vitest 28 passing |
| B9 | Deploy verify | done | `docker-compose.yml`, nginx, DEPLOY.md present |

## B3 detail (2026-07-14)
- New: `backend/app/Http/Requests/` — ProductStore/Update, CustomerStore/Update,
  ExpenseStore/Update, SaleStore, SupplierStore/Update, TaxCategoryStore/Update.
- Wired into controllers (replaced inline `Validator::make`/`$request->validate`
  with type-hinted Form Requests). CustomerUpdateRequest uses `route('id')` to
  keep the `unique:customers,account_number` ignore-on-update rule.
- Supplier/TaxCategory requests are provided for spec completeness; those
  write endpoints are read-only/absent on `main`, so not yet wired.
- Verified: `php artisan route:list` OK, `php artisan test` → 38 passed.

## Next batch
**B7** — Extract sale-calculation / tax / receipt logic into
`backend/app/Services` (SaleService, TaxService) and refactor SaleController to
use them so the logic is unit-testable.
