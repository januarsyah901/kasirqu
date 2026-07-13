<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    protected $primaryKey = 'trans_id';

    protected $table = 'inventory';

    protected $fillable = [
        'trans_items',
        'trans_location',
        'trans_user',
        'trans_comment',
        'trans_date',
        'trans_inventory',
    ];

    protected $casts = [
        'trans_items' => 'integer',
        'trans_location' => 'integer',
        'trans_inventory' => 'integer',
        'trans_date' => 'date',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'trans_items', 'item_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(StockLocation::class, 'trans_location', 'id');
    }
}
