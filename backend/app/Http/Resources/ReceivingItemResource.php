<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceivingItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'receiving_id' => $this->receiving_id,
            'item_id' => $this->item_id,
            'line' => $this->line,
            'description' => $this->description,
            'quantity_purchased' => $this->quantity_purchased,
            'item_cost_price' => $this->item_cost_price,
            'item_unit_price' => $this->item_unit_price,
            'discount_percent' => $this->discount_percent,
            'location_id' => $this->location_id,
            'item' => new ProductResource($this->whenLoaded('item')),
        ];
    }
}
