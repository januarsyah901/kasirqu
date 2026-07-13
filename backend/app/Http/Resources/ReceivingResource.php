<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceivingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $employee = $this->whenLoaded('employee');

        return [
            'receiving_id' => $this->receiving_id,
            'supplier_id' => $this->supplier_id,
            'employee_id' => $this->employee_id,
            'receiving_time' => $this->receiving_time,
            'comment' => $this->comment,
            'payment_type' => $this->payment_type,
            'amount_tendered' => $this->amount_tendered,
            'amount_owed' => $this->amount_owed,
            'reference' => $this->reference,
            'location_id' => $this->location_id,
            'deleted' => $this->deleted,
            'items' => ReceivingItemResource::collection($this->whenLoaded('items')),
            'supplier' => new SupplierResource($this->whenLoaded('supplier')),
            'employee' => $employee ? [
                'person_id' => $employee->person_id,
                'username' => $employee->username,
                'full_name' => $employee->person->full_name ?? null,
            ] : null,
            'location' => new StockLocationResource($this->whenLoaded('location')),
        ];
    }
}
