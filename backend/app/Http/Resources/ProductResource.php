<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'item_id' => $this->item_id,
            'name' => $this->name,
            'category' => $this->category,
            'item_number' => $this->item_number,
            'description' => $this->description,
            'cost_price' => $this->cost_price,
            'unit_price' => $this->unit_price,
            'reorder_level' => $this->reorder_level,
            'is_serialized' => $this->is_serialized,
            'stock_type' => $this->stock_type,
            'item_type' => $this->item_type,
            'tax_category_id' => $this->tax_category_id,
            'supplier_id' => $this->supplier_id,
            'deleted' => $this->deleted,
            'quantities' => ItemQuantityResource::collection($this->whenLoaded('itemQuantities')),
        ];
    }
}
