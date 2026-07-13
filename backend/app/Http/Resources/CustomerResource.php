<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'person_id' => $this->person_id,
            'company_name' => $this->company_name,
            'account_number' => $this->account_number,
            'taxable' => $this->taxable,
            'discount' => $this->discount,
            'discount_type' => $this->discount_type,
            'points' => $this->points,
            'deleted' => $this->deleted,
            'person' => new PersonResource($this->whenLoaded('person')),
        ];
    }
}
