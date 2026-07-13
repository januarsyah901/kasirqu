<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalePaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'sale_id' => $this->sale_id,
            'payment_type' => $this->payment_type,
            'payment_amount' => $this->payment_amount,
        ];
    }
}
