<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashUp extends Model
{
    protected $primaryKey = 'cashup_id';

    protected $fillable = [
        'open_amount',
        'close_amount',
        'cash_sales_amount',
        'open_date',
        'close_date',
        'employee_id',
        'location_id',
        'deleted',
    ];

    protected $casts = [
        'employee_id' => 'integer',
        'location_id' => 'integer',
        'open_amount' => 'decimal:2',
        'close_amount' => 'decimal:2',
        'cash_sales_amount' => 'decimal:2',
        'open_date' => 'date',
        'close_date' => 'date',
        'deleted' => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'person_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(StockLocation::class, 'location_id', 'id');
    }
}
