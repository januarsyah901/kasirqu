<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GiftcardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'giftcard_id' => $this->giftcard_id,
            'record_time' => $this->record_time,
            'giftcard_number' => $this->giftcard_number,
            'value' => $this->value,
            'deleted' => $this->deleted,
            'person_id' => $this->person_id,
        ];
    }
}
