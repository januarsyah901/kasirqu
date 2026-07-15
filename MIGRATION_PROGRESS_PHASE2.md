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
| B7 | Service layer (SaleService/TaxService) | **done (this run)** | Extracted sale calc/tax/receipt logic into `backend/app/Services/SaleService.php` + `TaxService.php`; SaleController@store now uses SaleService (DB transaction, item_quantities decrement, applied-tax record). Fixed latent `SaleItem::taxes()` missing `HasMany` import. Added 11 unit tests (TaxService + SaleService). `php artisan test` → 49 passed |
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

## B7 detail (2026-07-15)
- New `backend/app/Services/TaxService.php`: `effectiveTaxRate()`, `appliedTax()`
  (highest-rate wins across tax category + item taxes, OSPOS-style),
  `lineAmount()` (post-discount), `lineTaxAmount()` (rounded to 2dp).
- New `backend/app/Services/SaleService.php`: `calculateTotals()` (per-line +
  sale-wide subtotal/tax/total), `createSale()` (DB transaction: sale row,
  sale_items with real item cost price + recorded applied tax in
  `sales_items_taxes`, sale_payments, and `item_quantities` decrement per
  location — oversell allowed, negative stock row created), `buildReceipt()`
  (itemized lines, subtotal, tax, total, paid, change).
- Refactored `SaleController@store` to delegate to `SaleService::createSale()`.
- Fixed latent bug: `SaleItem::taxes()` declared return type `HasMany` without
  importing `Illuminate\Database\Eloquent\Relations\HasMany` (resolved to
  `App\Models\HasMany`). Also avoided eager-loading the relation's `$this`-based
  constraints (which break eager load) — `buildReceipt` queries applied tax by
  sale_id+item_id+line directly.
- Added `tests/Unit/TaxServiceTest.php` (5) + `tests/Unit/SaleServiceTest.php` (6).
- Verified: `php artisan test` → 49 passed (was 38); `php artisan route:list` OK.

## Status — all Phase 2 batches complete
B1–B9 all **done**. Of the 5 migration gaps:
- **features**: resolved (CRUD + sale txn + auth + services)
- **DB**: resolved (B1 migrations + seeder)
- **frontend-API**: resolved (B6 wiring)
- **tests**: resolved (B8 + B7 unit tests, 49 backend passing)
- **deployment**: resolved (B9 docker-compose/nginx/DEPLOY.md)

