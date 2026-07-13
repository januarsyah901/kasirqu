<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockLocation extends Model
{
    protected $fillable = [
        'name',
        'address',
        'deleted',
    ];

    protected $casts = [
        'deleted' => 'boolean',
    ];
}
