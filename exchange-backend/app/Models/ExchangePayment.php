<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExchangePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'exchange_id',
        'payer_id',
        'category_id',
        'deposit_amount',
        'payment_method',
        'reference_number',
        'payment_proof',
        'payment_status',
        'rejection_reason',
        'verified_at',
    ];

    protected $casts = [
        'deposit_amount' => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    public function exchange(): BelongsTo
    {
        return $this->belongsTo(ExchangeRequest::class, 'exchange_id');
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payer_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
