<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemKitItem extends Model
{
    public $timestamps = true;

    protected $primaryKey = null;

    public $incrementing = false;

    protected $fillable = [
        'item_kit_id',
        'item_id',
        'quantity',
        'cost_price',
        'unit_price',
    ];

    protected $casts = [
        'item_kit_id' => 'integer',
        'item_id' => 'integer',
        'quantity' => 'decimal:3',
        'cost_price' => 'decimal:2',
        'unit_price' => 'decimal:2',
    ];

    public function kit(): BelongsTo
    {
        return $this->belongsTo(ItemKit::class, 'item_kit_id', 'item_kit_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'item_id');
    }
}
