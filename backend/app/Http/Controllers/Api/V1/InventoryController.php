<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\InventoryResource;
use App\Models\Inventory;
use App\Models\ItemQuantity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);
        $itemId = $request->query('item_id');
        $locationId = $request->query('location_id');

        $query = Inventory::query()
            ->with(['item', 'location'])
            ->orderByDesc('trans_date');

        if ($itemId) {
            $query->where('trans_items', $itemId);
        }
        if ($locationId) {
            $query->where('trans_location', $locationId);
        }

        return InventoryResource::collection($query->paginate($perPage));
    }

    public function show(int $id)
    {
        $trans = Inventory::with(['item', 'location'])->findOrFail($id);

        return new InventoryResource($trans);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'trans_items' => 'required|exists:items,item_id',
            'trans_location' => 'required|exists:stock_locations,id',
            'trans_inventory' => 'required|integer',
            'trans_comment' => 'nullable|string|max:255',
            'trans_date' => 'nullable|date',
            'trans_user' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $trans = DB::transaction(function () use ($request) {
            $trans = Inventory::create([
                'trans_items' => $request->trans_items,
                'trans_location' => $request->trans_location,
                'trans_inventory' => $request->trans_inventory,
                'trans_comment' => $request->trans_comment ?? '',
                'trans_date' => $request->trans_date ?? now()->toDateString(),
                'trans_user' => $request->trans_user ?? null,
            ]);

            $this->adjustQuantity(
                $request->trans_items,
                $request->trans_location,
                (float) $request->trans_inventory
            );

            return $trans;
        });

        return (new InventoryResource($trans->load(['item', 'location'])))
            ->additional(['message' => 'Inventory transaction created'])
            ->response()
            ->setStatusCode(201);
    }

    public function transfer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_location' => 'required|exists:stock_locations,id',
            'to_location' => 'required|exists:stock_locations,id|different:from_location',
            'item_id' => 'required|exists:items,item_id',
            'quantity' => 'required|numeric|min:0.001',
            'trans_user' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::transaction(function () use ($request) {
            $fromQty = ItemQuantity::where('item_id', $request->item_id)
                ->where('location_id', $request->from_location)
                ->firstOrFail();

            $available = (float) $fromQty->quantity;
            if ($available < (float) $request->quantity) {
                abort(422, 'Insufficient quantity at source location');
            }

            $fromQty->quantity = $available - (float) $request->quantity;
            $fromQty->save();

            $toQty = ItemQuantity::where('item_id', $request->item_id)
                ->where('location_id', $request->to_location)
                ->first();

            if ($toQty) {
                $toQty->quantity = (float) $toQty->quantity + (float) $request->quantity;
                $toQty->save();
            } else {
                ItemQuantity::create([
                    'item_id' => $request->item_id,
                    'location_id' => $request->to_location,
                    'quantity' => $request->quantity,
                ]);
            }

            $user = $request->trans_user ?? null;
            $comment = 'Transfer from #' . $request->from_location . ' to #' . $request->to_location;

            Inventory::create([
                'trans_items' => $request->item_id,
                'trans_location' => $request->from_location,
                'trans_inventory' => -(float) $request->quantity,
                'trans_comment' => $comment,
                'trans_date' => now()->toDateString(),
                'trans_user' => $user,
            ]);

            Inventory::create([
                'trans_items' => $request->item_id,
                'trans_location' => $request->to_location,
                'trans_inventory' => (float) $request->quantity,
                'trans_comment' => $comment,
                'trans_date' => now()->toDateString(),
                'trans_user' => $user,
            ]);
        });

        return response()->json(['message' => 'Transfer completed'], 200);
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
