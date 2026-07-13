<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Giftcard extends Model
{
    protected $primaryKey = 'giftcard_id';

    protected $fillable = [
        'giftcard_number',
        'value',
        'deleted',
        'person_id',
        'record_time',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'deleted' => 'boolean',
        'record_time' => 'datetime',
    ];
}
