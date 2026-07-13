<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Customer extends Model
{
    protected $primaryKey = 'person_id';

    public $incrementing = false;

    protected $fillable = [
        'person_id',
        'company_name',
        'account_number',
        'taxable',
        'tax_id',
        'sales_tax_code_id',
        'deleted',
        'discount',
        'discount_type',
        'package_id',
        'points',
        'date',
        'employee_id',
        'consent',
    ];

    protected $casts = [
        'taxable' => 'boolean',
        'deleted' => 'boolean',
        'consent' => 'boolean',
        'discount' => 'decimal:2',
        'points' => 'integer',
    ];

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'person_id', 'person_id');
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'customer_id', 'person_id');
    }
}
