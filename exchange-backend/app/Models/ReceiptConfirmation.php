<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceiptConfirmation extends Model
{
    use HasFactory;

    protected $fillable = [
        'exchange_id',
        'user_id',
        'condition_notes',
        'evidence',
        'confirmed_at',
    ];

    protected $casts = [
        'confirmed_at' => 'datetime',
    ];

    public function exchange(): BelongsTo
    {
        return $this->belongsTo(ExchangeRequest::class, 'exchange_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
