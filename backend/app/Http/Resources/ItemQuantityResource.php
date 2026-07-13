<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemQuantityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'item_id' => $this->item_id,
            'location_id' => $this->location_id,
            'quantity' => $this->quantity,
            'location' => new \App\Http\Resources\StockLocationResource($this->whenLoaded('location')),
        ];
    }
}
