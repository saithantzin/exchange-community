<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ExchangeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'exchange_code',
        'requester_id',
        'owner_id',
        'offered_item_id',
        'requested_item_id',
        'exchange_type',
        'status',
        'meetup_location',
        'notes',
        'completed_at',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function offeredItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'offered_item_id');
    }

    public function requestedItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'requested_item_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(ExchangePayment::class, 'exchange_id');
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'exchange_id');
    }

    public function confirmations(): HasMany
    {
        return $this->hasMany(ReceiptConfirmation::class, 'exchange_id');
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class, 'exchange_id');
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class, 'exchange_id');
    }
}
