<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    protected $primaryKey = 'item_id';

    protected $fillable = [
        'name',
        'category',
        'supplier_id',
        'item_number',
        'description',
        'cost_price',
        'unit_price',
        'reorder_level',
        'receiving_quantity',
        'pic_id',
        'allow_alt_description',
        'is_serialized',
        'deleted',
        'custom1',
        'custom2',
        'custom3',
        'custom4',
        'custom5',
        'custom6',
        'custom7',
        'custom8',
        'custom9',
        'custom10',
        'stock_type',
        'item_type',
        'tax_category_id',
        'pic_filename',
        'qty_per_pack',
        'pack_name',
        'low_sell_item_id',
        'hsn_code',
    ];

    protected $casts = [
        'allow_alt_description' => 'boolean',
        'is_serialized' => 'boolean',
        'deleted' => 'boolean',
        'cost_price' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'reorder_level' => 'decimal:3',
        'receiving_quantity' => 'decimal:3',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'person_id');
    }

    public function taxCategory(): BelongsTo
    {
        return $this->belongsTo(TaxCategory::class, 'tax_category_id', 'id');
    }

    public function itemQuantities(): HasMany
    {
        return $this->hasMany(ItemQuantity::class, 'item_id', 'item_id');
    }

    public function itemTaxes(): HasMany
    {
        return $this->hasMany(ItemTax::class, 'item_id', 'item_id');
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class, 'item_id', 'item_id');
    }
}
