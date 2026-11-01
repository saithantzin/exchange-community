<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StateRegion extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type'];

    public function townships(): HasMany
    {
        return $this->hasMany(Township::class, 'state_region_id');
    }
}
