<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    protected $primaryKey = 'expense_id';

    protected $fillable = [
        'date',
        'amount',
        'category',
        'description',
        'employee_id',
        'location_id',
        'deleted',
    ];

    protected $casts = [
        'employee_id' => 'integer',
        'location_id' => 'integer',
        'date' => 'date',
        'amount' => 'decimal:2',
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
