<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Supplier extends Model
{
    protected $primaryKey = 'person_id';

    public $incrementing = false;

    protected $fillable = [
        'person_id',
        'account_number',
        'deleted',
    ];

    protected $casts = [
        'deleted' => 'boolean',
    ];

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'person_id', 'person_id');
    }

    public function items()
    {
        return $this->hasMany(Item::class, 'supplier_id', 'person_id');
    }
}
