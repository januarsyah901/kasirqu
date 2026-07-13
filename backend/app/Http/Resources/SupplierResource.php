<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'person_id' => $this->person_id,
            'account_number' => $this->account_number,
            'deleted' => $this->deleted,
            'name' => $this->person->full_name ?? null,
            'email' => $this->person->email ?? null,
            'phone_number' => $this->person->phone_number ?? null,
        ];
    }
}
