<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashUpResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'cashup_id' => $this->cashup_id,
            'open_amount' => $this->open_amount,
            'close_amount' => $this->close_amount,
            'cash_sales_amount' => $this->cash_sales_amount,
            'open_date' => $this->open_date,
            'close_date' => $this->close_date,
            'employee_id' => $this->employee_id,
            'location_id' => $this->location_id,
            'deleted' => $this->deleted,
            'employee' => $this->whenLoaded('employee') ? [
                'person_id' => $this->employee->person_id,
                'username' => $this->employee->username,
                'full_name' => $this->employee->person->full_name ?? null,
            ] : null,
            'location' => new StockLocationResource($this->whenLoaded('location')),
        ];
    }
}
