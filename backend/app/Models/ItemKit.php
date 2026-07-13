<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItemKit extends Model
{
    protected $primaryKey = 'item_kit_id';

    protected $fillable = [
        'name',
        'description',
        'total_cost',
        'total_price',
        'deleted',
    ];

    protected $casts = [
        'total_cost' => 'decimal:2',
        'total_price' => 'decimal:2',
        'deleted' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ItemKitItem::class, 'item_kit_id', 'item_kit_id');
    }
}
