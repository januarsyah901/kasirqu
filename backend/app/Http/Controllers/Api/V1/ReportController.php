<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Customer;
use App\Models\Item;
use App\Models\ItemQuantity;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/reports/sales",
     *     summary="Sales report",
     *     @OA\Response(response=200, description="Sales summary")
     * )
     */
    public function sales(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'group_by' => 'nullable|string|in:day,month',
        ]);

        $query = Sale::query()->with(['items', 'payments']);

        if ($request->filled('date_from')) {
            $query->whereDate('sale_time', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('sale_time', '<=', $request->date_to);
        }

        $sales = $query->orderByDesc('sale_time')->get();

        $rows = $sales->map(fn($s) => [
            'sale_id' => $s->sale_id,
            'sale_time' => $s->sale_time,
            'invoice_number' => $s->invoice_number,
            'total' => $s->payments->sum('payment_amount'),
        ]);

        $totals = [
            'total_sales' => $sales->count(),
            'total_paid' => $rows->sum('total'),
        ];

        return new ReportResource((object) [
            'report_type' => 'sales',
            'start_date' => $request->date_from,
            'end_date' => $request->date_to,
            'rows' => $rows,
            'totals' => $totals,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/reports/summary",
     *     summary="Summary report",
     *     @OA\Response(response=200, description="Summary")
     * )
     */
    public function summary(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $salesQ = Sale::query();
        if ($request->filled('date_from')) {
            $salesQ->whereDate('sale_time', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $salesQ->whereDate('sale_time', '<=', $request->date_to);
        }
        $salesCount = $salesQ->count();

        $paymentsQ = SalePayment::query()->selectRaw('SUM(payment_amount) as total');
        if ($request->filled('date_from')) {
            $paymentsQ->whereHas('sale', fn($q) => $q->whereDate('sale_time', '>=', $request->date_from));
        }
        if ($request->filled('date_to')) {
            $paymentsQ->whereHas('sale', fn($q) => $q->whereDate('sale_time', '<=', $request->date_to));
        }
        $totalPaid = $paymentsQ->first()->total ?? 0;

        $data = (object) [
            'report_type' => 'summary',
            'start_date' => $request->date_from,
            'end_date' => $request->date_to,
            'rows' => [
                ['sales_count' => $salesCount, 'total_paid' => $totalPaid],
                ['top_products' => Item::orderByDesc('unit_price')->limit(5)->get(['item_id', 'name', 'unit_price'])],
            ],
            'totals' => [
                'sales_count' => $salesCount,
                'total_paid' => $totalPaid,
            ],
        ];

        return new ReportResource($data);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/reports/customers",
     *     summary="Customers report",
     *     @OA\Response(response=200, description="Customers report")
     * )
     */
    public function customers(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $query = Customer::with(['person'])->where('deleted', false);

        $customers = $query->get()->map(function ($customer) use ($request) {
            $salesQ = $customer->sales();
            if ($request->filled('date_from')) {
                $salesQ->whereDate('sale_time', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $salesQ->whereDate('sale_time', '<=', $request->date_to);
            }
            $saleCount = $salesQ->count();
            $total = $salesQ->get()->sum(fn($s) => $s->payments->sum('payment_amount'));

            return [
                'customer_id' => $customer->person_id,
                'full_name' => $customer->person->full_name ?? '',
                'sales_count' => $saleCount,
                'total' => $total,
            ];
        });

        return new ReportResource((object) [
            'report_type' => 'customers',
            'start_date' => $request->date_from,
            'end_date' => $request->date_to,
            'rows' => $customers,
            'totals' => ['rows' => $customers->count()],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/reports/inventory",
     *     summary="Inventory report (low stock + stock value)",
     *     @OA\Response(response=200, description="Inventory report")
     * )
     */
    public function inventory(Request $request)
    {
        $lowStock = DB::table('item_quantities')
            ->join('items', 'items.item_id', '=', 'item_quantities.item_id')
            ->where('items.deleted', false)
            ->whereColumn('item_quantities.quantity', '<=', 'items.reorder_level')
            ->select(
                'item_quantities.item_id',
                'items.name as item_name',
                'item_quantities.location_id',
                'item_quantities.quantity',
                'items.reorder_level'
            )
            ->orderBy('item_quantities.location_id')
            ->orderBy('item_quantities.item_id')
            ->get();

        $stockValue = DB::table('item_quantities')
            ->join('items', 'items.item_id', '=', 'item_quantities.item_id')
            ->where('items.deleted', false)
            ->select(
                'item_quantities.location_id',
                DB::raw('SUM(item_quantities.quantity * items.unit_price) as stock_value'),
                DB::raw('SUM(item_quantities.quantity) as total_quantity')
            )
            ->groupBy('item_quantities.location_id')
            ->get();

        return new ReportResource((object) [
            'report_type' => 'inventory',
            'start_date' => null,
            'end_date' => null,
            'rows' => [
                'low_stock' => $lowStock,
                'stock_value' => $stockValue,
            ],
            'totals' => [
                'low_stock_count' => $lowStock->count(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/reports/expenses",
     *     summary="Expenses report (totals by category)",
     *     @OA\Response(response=200, description="Expenses report")
     * )
     */
    public function expenses(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $query = Expense::query()->where('deleted', false);

        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $rows = (clone $query)
            ->select('category', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->orderByDesc(DB::raw('SUM(amount)'))
            ->get();

        $total = (clone $query)->sum('amount');

        return new ReportResource((object) [
            'report_type' => 'expenses',
            'start_date' => $request->date_from,
            'end_date' => $request->date_to,
            'rows' => $rows,
            'totals' => [
                'grand_total' => $total,
                'categories' => $rows->count(),
            ],
        ]);
    }
}
