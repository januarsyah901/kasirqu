<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Person extends Model
{
    protected $primaryKey = 'person_id';

    public $timestamps = true;

    protected $fillable = [
        'first_name',
        'last_name',
        'gender',
        'phone_number',
        'email',
        'address_1',
        'address_2',
        'city',
        'state',
        'zip',
        'country',
        'comments',
    ];

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class, 'person_id', 'person_id');
    }

    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class, 'person_id', 'person_id');
    }

    public function supplier(): HasOne
    {
        return $this->hasOne(Supplier::class, 'person_id', 'person_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }
}
