<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItemTax extends Model
{
    public $timestamps = true;
    protected $primaryKey = ['sale_id', 'item_id', 'line', 'name', 'percent'];
    public $incrementing = false;

    protected $fillable = ['sale_id', 'item_id', 'line', 'name', 'percent'];

    protected $table = 'sales_items_taxes';

    protected $casts = [
        'percent' => 'decimal:3',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sale_id', 'sale_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'item_id');
    }
}
