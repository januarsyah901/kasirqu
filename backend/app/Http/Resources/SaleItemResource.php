<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'sale_id' => $this->sale_id,
            'item_id' => $this->item_id,
            'line' => $this->line,
            'description' => $this->description,
            'serialnumber' => $this->serialnumber,
            'quantity_purchased' => $this->quantity_purchased,
            'item_unit_price' => $this->item_unit_price,
            'item_cost_price' => $this->item_cost_price,
            'discount_percent' => $this->discount_percent,
            'item_location' => $this->item_location,
            'item' => new ProductResource($this->whenLoaded('item')),
        ];
    }
}
