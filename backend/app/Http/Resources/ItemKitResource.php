<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemKitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'item_kit_id' => $this->item_kit_id,
            'name' => $this->name,
            'description' => $this->description,
            'total_cost' => $this->total_cost,
            'total_price' => $this->total_price,
            'deleted' => $this->deleted,
            'items' => ItemKitItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
