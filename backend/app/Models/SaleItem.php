<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItem extends Model
{
    public $timestamps = true;
    protected $primaryKey = ['sale_id', 'item_id', 'line'];
    public $incrementing = false;

    protected $fillable = [
        'sale_id',
        'item_id',
        'line',
        'description',
        'serialnumber',
        'quantity_purchased',
        'item_cost_price',
        'item_unit_price',
        'discount_percent',
        'item_location',
    ];

    protected $table = 'sales_items';

    protected $casts = [
        'quantity_purchased' => 'decimal:3',
        'item_cost_price' => 'decimal:2',
        'item_unit_price' => 'decimal:2',
        'discount_percent' => 'decimal:2',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sale_id', 'sale_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'item_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(StockLocation::class, 'item_location', 'id');
    }

    public function taxes(): HasMany
    {
        return $this->hasMany(SaleItemTax::class, 'sale_id', 'sale_id')
            ->where('item_id', $this->item_id)
            ->where('line', $this->line);
    }
}
