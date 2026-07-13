<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    protected $primaryKey = 'person_id';

    public $incrementing = false;

    protected $fillable = [
        'person_id',
        'username',
        'password',
        'hash_version',
        'deleted',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'deleted' => 'boolean',
    ];

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'person_id', 'person_id');
    }
}
