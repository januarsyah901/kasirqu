<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CashUpController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\GiftcardController;
use App\Http\Controllers\Api\V1\InventoryController;
use App\Http\Controllers\Api\V1\ItemKitController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ReceivingController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SaleController;
use App\Http\Controllers\Api\V1\SupplierController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - KasirQu v1
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {
    // Auth
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Products
        Route::apiResource('products', ProductController::class);
        Route::post('products/{id}/image', [ProductController::class, 'uploadImage']);

        // Customers
        Route::apiResource('customers', CustomerController::class);

        // Sales
        Route::get('sales', [SaleController::class, 'index']);
        Route::post('sales', [SaleController::class, 'store']);
        Route::get('sales/{id}', [SaleController::class, 'show']);
        Route::post('sales/{id}/suspend', [SaleController::class, 'suspend']);
        Route::post('sales/{id}/resume', [SaleController::class, 'resume']);

        // Receivings
        Route::apiResource('receivings', ReceivingController::class);

        // Expenses
        Route::apiResource('expenses', ExpenseController::class);

        // Cash Up
        Route::apiResource('cash_up', CashUpController::class);

        // Inventory
        Route::apiResource('inventory', InventoryController::class);
        Route::post('inventory/transfer', [InventoryController::class, 'transfer']);

        // Giftcards
        Route::get('giftcards/check', [GiftcardController::class, 'check']);
        Route::apiResource('giftcards', GiftcardController::class);

        // Item Kits
        Route::apiResource('item_kits', ItemKitController::class);

        // Suppliers (read-only)
        Route::apiResource('suppliers', SupplierController::class)->only(['index', 'show']);

        // Categories (read-only)
        Route::apiResource('categories', CategoryController::class)->only(['index']);

        // Locations (read-only)
        Route::apiResource('locations', LocationController::class)->only(['index']);

        // Reports
        Route::get('reports/sales', [ReportController::class, 'sales']);
        Route::get('reports/summary', [ReportController::class, 'summary']);
        Route::get('reports/customers', [ReportController::class, 'customers']);
        Route::get('reports/inventory', [ReportController::class, 'inventory']);
        Route::get('reports/expenses', [ReportController::class, 'expenses']);
    });
});
