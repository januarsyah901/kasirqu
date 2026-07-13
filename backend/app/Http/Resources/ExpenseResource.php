<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'expense_id' => $this->expense_id,
            'date' => $this->date,
            'amount' => $this->amount,
            'category' => $this->category,
            'description' => $this->description,
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
