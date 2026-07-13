<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'trans_id' => $this->trans_id,
            'trans_items' => $this->trans_items,
            'trans_location' => $this->trans_location,
            'trans_user' => $this->trans_user,
            'trans_comment' => $this->trans_comment,
            'trans_date' => $this->trans_date,
            'trans_inventory' => $this->trans_inventory,
            'item' => new ProductResource($this->whenLoaded('item')),
            'location' => new StockLocationResource($this->whenLoaded('location')),
        ];
    }
}
