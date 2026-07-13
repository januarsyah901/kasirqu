<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'sale_id' => $this->sale_id,
            'sale_time' => $this->sale_time,
            'customer_id' => $this->customer_id,
            'employee_id' => $this->employee_id,
            'comment' => $this->comment,
            'invoice_number' => $this->invoice_number,
            'sale_type' => $this->sale_type,
            'sale_status' => $this->sale_status,
            'items' => SaleItemResource::collection($this->whenLoaded('items')),
            'payments' => SalePaymentResource::collection($this->whenLoaded('payments')),
            'customer' => new CustomerResource($this->whenLoaded('customer')),
        ];
    }
}
