<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalePayment extends Model
{
    public $timestamps = true;
    protected $primaryKey = ['sale_id', 'payment_type'];
    public $incrementing = false;

    protected $fillable = [
        'sale_id',
        'payment_type',
        'payment_amount',
    ];

    protected $table = 'sales_payments';

    protected $casts = [
        'payment_amount' => 'decimal:2',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sale_id', 'sale_id');
    }
}
