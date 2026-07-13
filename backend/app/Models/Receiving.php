<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Receiving extends Model
{
    protected $primaryKey = 'receiving_id';

    protected $fillable = [
        'supplier_id',
        'employee_id',
        'receiving_time',
        'comment',
        'payment_type',
        'amount_tendered',
        'amount_owed',
        'reference',
        'location_id',
        'deleted',
    ];

    protected $casts = [
        'supplier_id' => 'integer',
        'employee_id' => 'integer',
        'location_id' => 'integer',
        'receiving_time' => 'datetime',
        'amount_tendered' => 'decimal:2',
        'amount_owed' => 'decimal:2',
        'deleted' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ReceivingItem::class, 'receiving_id', 'receiving_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'person_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'person_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(StockLocation::class, 'location_id', 'id');
    }
}
