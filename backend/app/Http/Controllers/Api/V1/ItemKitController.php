<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ItemKitResource;
use App\Models\Item;
use App\Models\ItemKit;
use App\Models\ItemKitItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ItemKitController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);

        $query = ItemKit::query()->with('items.item')->where('deleted', false);

        return ItemKitResource::collection($query->orderByDesc('item_kit_id')->paginate($perPage));
    }

    public function show(int $id)
    {
        $kit = ItemKit::with('items.item')->where('deleted', false)->findOrFail($id);

        return new ItemKitResource($kit);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,item_id',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.cost_price' => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $kit = DB::transaction(function () use ($request) {
            $kit = ItemKit::create([
                'name' => $request->name,
                'description' => $request->description ?? '',
                'total_cost' => 0,
                'total_price' => 0,
                'deleted' => false,
            ]);

            $costTotal = 0;
            $priceTotal = 0;

            foreach ($request->items as $item) {
                $costTotal += (float) $item['quantity'] * (float) $item['cost_price'];
                $priceTotal += (float) $item['quantity'] * (float) $item['unit_price'];

                ItemKitItem::create([
                    'item_kit_id' => $kit->item_kit_id,
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'cost_price' => $item['cost_price'],
                    'unit_price' => $item['unit_price'],
                ]);
            }

            $kit->update([
                'total_cost' => $costTotal,
                'total_price' => $priceTotal,
            ]);

            return $kit;
        });

        return (new ItemKitResource($kit->load('items.item')))
            ->additional(['message' => 'Item kit created'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, int $id)
    {
        $kit = ItemKit::where('deleted', false)->findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:500',
            'items' => 'sometimes|array|min:1',
            'items.*.item_id' => 'required_with:items|exists:items,item_id',
            'items.*.quantity' => 'required_with:items|numeric|min:0.001',
            'items.*.cost_price' => 'required_with:items|numeric|min:0',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
        ]);

        DB::transaction(function () use ($kit, $request, $data) {
            $kit->update([
                'name' => $data['name'] ?? $kit->name,
                'description' => $data['description'] ?? $kit->description,
            ]);

            if ($request->has('items')) {
                ItemKitItem::where('item_kit_id', $kit->item_kit_id)->delete();

                $costTotal = 0;
                $priceTotal = 0;

                foreach ($data['items'] as $item) {
                    $costTotal += (float) $item['quantity'] * (float) $item['cost_price'];
                    $priceTotal += (float) $item['quantity'] * (float) $item['unit_price'];

                    ItemKitItem::create([
                        'item_kit_id' => $kit->item_kit_id,
                        'item_id' => $item['item_id'],
                        'quantity' => $item['quantity'],
                        'cost_price' => $item['cost_price'],
                        'unit_price' => $item['unit_price'],
                    ]);
                }

                $kit->update([
                    'total_cost' => $costTotal,
                    'total_price' => $priceTotal,
                ]);
            }
        });

        return new ItemKitResource($kit->fresh()->load('items.item'));
    }

    public function destroy(int $id)
    {
        $kit = ItemKit::where('deleted', false)->findOrFail($id);
        $kit->update(['deleted' => true]);

        return response()->noContent();
    }
}
