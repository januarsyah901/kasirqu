<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaleStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'nullable|exists:customers,person_id',
            'employee_id' => 'required|exists:employees,person_id',
            'comment' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:32|unique:sales,invoice_number',
            'sale_type' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,item_id',
            'items.*.quantity_purchased' => 'required|numeric|min:0.001',
            'items.*.item_unit_price' => 'required|numeric|min:0',
            'items.*.discount_percent' => 'nullable|numeric|min:0|max:100',
            'items.*.item_location' => 'required|exists:stock_locations,id',
            'items.*.description' => 'nullable|string|max:30',
            'payments' => 'nullable|array',
            'payments.*.payment_type' => 'required|string|max:40',
            'payments.*.payment_amount' => 'required|numeric|min:0',
        ];
    }
}
