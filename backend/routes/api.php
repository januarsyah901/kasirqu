<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SaleController;
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

        // Customers
        Route::apiResource('customers', CustomerController::class);

        // Sales
        Route::get('sales', [SaleController::class, 'index']);
        Route::post('sales', [SaleController::class, 'store']);
        Route::get('sales/{id}', [SaleController::class, 'show']);

        // Reports
        Route::get('reports/sales', [ReportController::class, 'sales']);
        Route::get('reports/summary', [ReportController::class, 'summary']);
        Route::get('reports/customers', [ReportController::class, 'customers']);
    });
});
