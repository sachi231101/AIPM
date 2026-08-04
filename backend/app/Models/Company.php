<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Company extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'companies';

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

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function jobs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PlacementJob::class);
    }
}
