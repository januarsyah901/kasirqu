<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemQuantity extends Model
{
    public $timestamps = true;
    protected $primaryKey = ['item_id', 'location_id'];
    public $incrementing = false;

    protected $fillable = ['item_id', 'location_id', 'quantity'];

    protected $casts = [
        'quantity' => 'decimal:3',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'item_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(StockLocation::class, 'location_id', 'id');
    }
}
