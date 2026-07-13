<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    protected $primaryKey = 'sale_id';

    protected $fillable = [
        'sale_time',
        'customer_id',
        'employee_id',
        'comment',
        'quote_number',
        'sale_status',
        'invoice_number',
        'dinner_table_id',
        'work_order_number',
        'sale_type',
    ];

    protected $casts = [
        'sale_time' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'person_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'person_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class, 'sale_id', 'sale_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SalePayment::class, 'sale_id', 'sale_id');
    }
}
