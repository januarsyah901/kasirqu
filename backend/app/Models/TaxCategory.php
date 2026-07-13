<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaxCategory extends Model
{
    protected $fillable = [
        'name',
        'tax_rate',
        'deleted',
    ];

    protected $casts = [
        'tax_rate' => 'decimal:3',
        'deleted' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(Item::class, 'tax_category_id', 'id');
    }
}
