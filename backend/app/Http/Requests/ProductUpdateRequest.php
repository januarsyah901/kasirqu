<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'category' => 'nullable|string|max:255',
            'item_number' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
            'cost_price' => 'sometimes|numeric|min:0',
            'unit_price' => 'sometimes|numeric|min:0',
            'reorder_level' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,person_id',
            'tax_category_id' => 'nullable|exists:tax_categories,id',
            'is_serialized' => 'boolean',
            'stock_type' => 'nullable|string|max:50',
            'item_type' => 'nullable|string|max:50',
        ];
    }
}
