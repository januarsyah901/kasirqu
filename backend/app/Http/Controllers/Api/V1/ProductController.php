<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/products",
     *     summary="List products",
     *     @OA\Response(response=200, description="Products list")
     * )
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);
        $search = $request->query('search');

        $query = Item::query()->where('deleted', false);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('item_number', 'like', "%$search%")
                  ->orWhere('category', 'like', "%$search%");
            });
        }

        return ProductResource::collection($query->paginate($perPage));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/products",
     *     summary="Create product",
     *     @OA\Response(response=201, description="Created")
     * )
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'item_number' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
            'cost_price' => 'required|numeric|min:0',
            'unit_price' => 'required|numeric|min:0',
            'reorder_level' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,person_id',
            'tax_category_id' => 'nullable|exists:tax_categories,id',
            'is_serialized' => 'boolean',
            'stock_type' => 'nullable|string|max:50',
            'item_type' => 'nullable|string|max:50',
        ]);

        $data['is_serialized'] = $data['is_serialized'] ?? false;
        $item = Item::create($data);

        return (new ProductResource($item))
            ->additional(['message' => 'Product created'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/products/{id}",
     *     summary="Get product",
     *     @OA\Response(response=200, description="Product detail")
     * )
     */
    public function show(int $id)
    {
        $item = Item::where('item_id', $id)->where('deleted', false)->firstOrFail();
        $item->loadMissing(['itemQuantities.location', 'itemTaxes', 'supplier', 'taxCategory']);

        return new ProductResource($item);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/products/{id}",
     *     summary="Update product",
     *     @OA\Response(response=200, description="Updated")
     * )
     */
    public function update(Request $request, int $id)
    {
        $item = Item::where('item_id', $id)->where('deleted', false)->firstOrFail();

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'nullable|string|max:255',
            'item_number' => 'nullable|string|max:255',
            'unit_price' => 'sometimes|numeric|min:0',
            'cost_price' => 'sometimes|numeric|min:0',
            'reorder_level' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,person_id',
            'tax_category_id' => 'nullable|exists:tax_categories,id',
            'is_serialized' => 'boolean',
        ]);

        $item->update($data);

        return new ProductResource($item->fresh());
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/products/{id}",
     *     summary="Soft delete product",
     *     @OA\Response(response=204, description="No content")
     * )
     */
    public function destroy(int $id)
    {
        $item = Item::where('item_id', $id)->where('deleted', false)->firstOrFail();
        $item->update(['deleted' => true]);

        return response()->noContent();
    }

    /**
     * @OA\Post(
     *     path="/api/v1/products/{id}/image",
     *     summary="Upload a product image",
     *     @OA\Response(response=200, description="Image uploaded")
     * )
     */
    public function uploadImage(Request $request, int $id)
    {
        $item = Item::where('item_id', $id)->where('deleted', false)->firstOrFail();

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $path = $request->file('image')->store('products', 'public');
        $item->update(['pic_filename' => basename($path)]);

        return new ProductResource($item->fresh());
    }
}
