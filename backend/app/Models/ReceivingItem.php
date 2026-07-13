<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceivingItem extends Model
{
    protected $primaryKey = null;

    public $incrementing = false;

    public $timestamps = true;

    protected $fillable = [
        'receiving_id',
        'item_id',
        'line',
        'description',
        'quantity_purchased',
        'item_cost_price',
        'item_unit_price',
        'discount_percent',
        'location_id',
    ];

    protected $casts = [
        'receiving_id' => 'integer',
        'item_id' => 'integer',
        'line' => 'integer',
        'quantity_purchased' => 'decimal:3',
        'item_cost_price' => 'decimal:2',
        'item_unit_price' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'location_id' => 'integer',
    ];

    public function receiving(): BelongsTo
    {
        return $this->belongsTo(Receiving::class, 'receiving_id', 'receiving_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'item_id');
    }
}
