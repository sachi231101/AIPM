<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'hr_name',
        'hr_email',
        'phone',
        'website',
        'logo_path',
        'industry',
        'password',
        'office_address',
        'city',
        'state',
        'about_company',
        'status',
    ];

    public function jobs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PlacementJob::class);
    }
}
