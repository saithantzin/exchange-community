<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'exchange_id',
        'user_id',
        'refund_amount',
        'payment_provider',
        'account_number',
        'account_name',
        'refund_transaction_ref',
        'refund_status',
        'refund_date',
    ];

    protected $casts = [
        'refund_amount' => 'decimal:2',
        'refund_date' => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(ExchangePayment::class, 'payment_id');
    }

    public function exchange(): BelongsTo
    {
        return $this->belongsTo(ExchangeRequest::class, 'exchange_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
