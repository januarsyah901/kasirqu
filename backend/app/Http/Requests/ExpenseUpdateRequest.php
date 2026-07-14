<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'sometimes|date',
            'amount' => 'sometimes|numeric|min:0',
            'category' => 'sometimes|string|max:128',
            'description' => 'nullable|string|max:255',
            'employee_id' => 'sometimes|exists:employees,person_id',
            'location_id' => 'sometimes|exists:stock_locations,id',
        ];
    }
}
