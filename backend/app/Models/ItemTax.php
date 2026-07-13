<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemTax extends Model
{
    public $timestamps = true;
    protected $primaryKey = ['item_id', 'name', 'percent'];
    public $incrementing = false;

    protected $fillable = ['item_id', 'name', 'percent'];

    protected $casts = [
        'percent' => 'decimal:3',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'item_id');
    }
}
