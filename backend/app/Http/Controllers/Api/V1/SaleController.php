<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SaleResource;
use App\Http\Requests\SaleStoreRequest;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function __construct(private SaleService $saleService)
    {
    }

    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $query = Sale::query()
            ->with(['customer.person', 'employee', 'items', 'payments']);

        if ($dateFrom) {
            $query->whereDate('sale_time', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('sale_time', '<=', $dateTo);
        }
        if ($request->query('suspended') === '1') {
            $query->where('suspended', true);
        }

        return SaleResource::collection($query->orderByDesc('sale_time')->paginate($perPage));
    }

    public function suspend(Request $request, int $id)
    {
        $sale = Sale::findOrFail($id);
        $sale->update(['suspended' => true]);

        return new SaleResource($sale->fresh());
    }

    public function resume(Request $request, int $id)
    {
        $sale = Sale::findOrFail($id);
        $sale->update(['suspended' => false]);

        return new SaleResource($sale->fresh());
    }

    public function show(int $id)
    {
        $sale = Sale::with(['customer.person', 'employee', 'items', 'payments'])->findOrFail($id);

        return new SaleResource($sale);
    }

    public function store(SaleStoreRequest $request)
    {
        $sale = $this->saleService->createSale($request->validated());

        return (new SaleResource($sale))
            ->additional(['message' => 'Sale created'])
            ->response()
            ->setStatusCode(201);
    }
}
