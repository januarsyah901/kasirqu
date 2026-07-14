<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'category' => 'required|string|max:128',
            'description' => 'nullable|string|max:255',
            'employee_id' => 'required|exists:employees,person_id',
            'location_id' => 'required|exists:stock_locations,id',
        ];
    }
}
