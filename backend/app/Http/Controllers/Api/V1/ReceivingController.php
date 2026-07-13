<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReceivingResource;
use App\Models\Employee;
use App\Models\Inventory;
use App\Models\Item;
use App\Models\ItemQuantity;
use App\Models\Receiving;
use App\Models\ReceivingItem;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ReceivingController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);
        $supplierId = $request->query('supplier_id');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $query = Receiving::query()
            ->with(['items.item', 'supplier.person', 'employee.person', 'location'])
            ->where('deleted', false);

        if ($supplierId) {
            $query->where('supplier_id', $supplierId);
        }
        if ($dateFrom) {
            $query->whereDate('receiving_time', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('receiving_time', '<=', $dateTo);
        }

        return ReceivingResource::collection($query->orderByDesc('receiving_time')->paginate($perPage));
    }

    public function show(int $id)
    {
        $receiving = Receiving::with(['items.item', 'supplier.person', 'employee.person', 'location'])
            ->where('deleted', false)
            ->findOrFail($id);

        return new ReceivingResource($receiving);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'nullable|exists:suppliers,person_id',
            'employee_id' => 'required|exists:employees,person_id',
            'receiving_time' => 'nullable|date',
            'comment' => 'nullable|string|max:255',
            'payment_type' => 'nullable|string|max:40',
            'amount_tendered' => 'nullable|numeric|min:0',
            'amount_owed' => 'nullable|numeric|min:0',
            'reference' => 'nullable|string|max:64',
            'location_id' => 'required|exists:stock_locations,id',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,item_id',
            'items.*.quantity_purchased' => 'required|numeric|min:0.001',
            'items.*.item_cost_price' => 'required|numeric|min:0',
            'items.*.item_unit_price' => 'nullable|numeric|min:0',
            'items.*.discount_percent' => 'nullable|numeric|min:0|max:100',
            'items.*.description' => 'nullable|string|max:30',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $receiving = DB::transaction(function () use ($request) {
            $reference = $request->reference ?? ('PO-' . time());
            $receiving = Receiving::create([
                'supplier_id' => $request->supplier_id,
                'employee_id' => $request->employee_id,
                'receiving_time' => $request->receiving_time ?? now(),
                'comment' => $request->comment ?? '',
                'payment_type' => $request->payment_type ?? 'Cash',
                'amount_tendered' => $request->amount_tendered ?? 0,
                'amount_owed' => $request->amount_owed ?? 0,
                'reference' => $reference,
                'location_id' => $request->location_id,
                'deleted' => false,
            ]);

            $employee = Employee::find($request->employee_id);

            foreach ($request->items as $line => $item) {
                ReceivingItem::create([
                    'receiving_id' => $receiving->receiving_id,
                    'item_id' => $item['item_id'],
                    'line' => $line + 1,
                    'description' => $item['description'] ?? '',
                    'quantity_purchased' => $item['quantity_purchased'],
                    'item_cost_price' => $item['item_cost_price'],
                    'item_unit_price' => $item['item_unit_price'] ?? 0,
                    'discount_percent' => $item['discount_percent'] ?? 0,
                    'location_id' => $request->location_id,
                ]);

                $this->adjustQuantity(
                    $item['item_id'],
                    $request->location_id,
                    $item['quantity_purchased']
                );

                Inventory::create([
                    'trans_items' => $item['item_id'],
                    'trans_location' => $request->location_id,
                    'trans_user' => $employee?->username ?? (string) $request->employee_id,
                    'trans_comment' => 'Receiving #' . $reference,
                    'trans_date' => $request->receiving_time ?? now()->toDateString(),
                    'trans_inventory' => $item['quantity_purchased'],
                ]);
            }

            return $receiving;
        });

        return (new ReceivingResource($receiving->load(['items.item', 'supplier.person', 'employee.person', 'location'])))
            ->additional(['message' => 'Receiving created'])
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(int $id)
    {
        $receiving = Receiving::where('deleted', false)->findOrFail($id);
        $receiving->update(['deleted' => true]);

        return response()->noContent();
    }

    protected function adjustQuantity(int $itemId, int $locationId, float $delta): void
    {
        $iq = ItemQuantity::where('item_id', $itemId)
            ->where('location_id', $locationId)
            ->first();

        if ($iq) {
            $iq->quantity = (float) $iq->quantity + $delta;
            $iq->save();
        } else {
            ItemQuantity::create([
                'item_id' => $itemId,
                'location_id' => $locationId,
                'quantity' => $delta,
            ]);
        }
    }
}
