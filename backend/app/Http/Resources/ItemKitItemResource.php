<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemKitItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'item_kit_id' => $this->item_kit_id,
            'item_id' => $this->item_id,
            'quantity' => $this->quantity,
            'cost_price' => $this->cost_price,
            'unit_price' => $this->unit_price,
            'item' => new ProductResource($this->whenLoaded('item')),
        ];
    }
}
