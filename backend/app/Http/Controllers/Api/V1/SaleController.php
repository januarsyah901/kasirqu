<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\Customer;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SaleController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/sales",
     *     summary="List sales",
     *     @OA\Response(response=200, description="Sales list")
     * )
     */
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

        return SaleResource::collection($query->orderByDesc('sale_time')->paginate($perPage));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/sales/{id}",
     *     summary="Get sale",
     *     @OA\Response(response=200, description="Sale detail")
     * )
     */
    public function show(int $id)
    {
        $sale = Sale::with(['customer.person', 'employee', 'items', 'payments'])->findOrFail($id);
        return new SaleResource($sale);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/sales",
     *     summary="Create sale",
     *     @OA\Response(response=201, description="Created")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'nullable|exists:customers,person_id',
            'employee_id' => 'required|exists:employees,person_id',
            'comment' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:32|unique:sales,invoice_number',
            'sale_type' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,item_id',
            'items.*.quantity_purchased' => 'required|numeric|min:0.001',
            'items.*.item_unit_price' => 'required|numeric|min:0',
            'items.*.discount_percent' => 'nullable|numeric|min:0|max:100',
            'items.*.item_location' => 'required|exists:stock_locations,id',
            'items.*.description' => 'nullable|string|max:30',
            'payments' => 'nullable|array',
            'payments.*.payment_type' => 'required|string|max:40',
            'payments.*.payment_amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sale = \DB::transaction(function () use ($request) {
            $sale = Sale::create([
                'customer_id' => $request->customer_id,
                'employee_id' => $request->employee_id,
                'comment' => $request->comment ?? '',
                'invoice_number' => $request->invoice_number,
                'sale_type' => $request->sale_type ?? 'SALE',
            ]);

            foreach ($request->items as $line => $item) {
                SaleItem::create([
                    'sale_id' => $sale->sale_id,
                    'item_id' => $item['item_id'],
                    'line' => $line + 1,
                    'description' => $item['description'] ?? '',
                    'quantity_purchased' => $item['quantity_purchased'],
                    'item_unit_price' => $item['item_unit_price'],
                    'item_cost_price' => 0,
                    'discount_percent' => $item['discount_percent'] ?? 0,
                    'item_location' => $item['item_location'],
                ]);
            }

            if ($request->has('payments')) {
                foreach ($request->payments as $payment) {
                    SalePayment::create([
                        'sale_id' => $sale->sale_id,
                        'payment_type' => $payment['payment_type'],
                        'payment_amount' => $payment['payment_amount'],
                    ]);
                }
            }

            return $sale;
        });

        return (new SaleResource($sale->load(['items', 'payments', 'customer.person', 'employee.person'])))
            ->additional(['message' => 'Sale created'])
            ->response()
            ->setStatusCode(201);
    }
}
