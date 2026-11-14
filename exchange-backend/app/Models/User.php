<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'phone',
        'profile_image',
        'state_region_id',
        'township_id',
        'role',
        'account_status',
        'suspension_reason',
        'bio',
        'rating',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'completed_swaps_count',
        'completed_swaps',
        'completedSwaps',
        'reviews_count',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'rating' => 'decimal:2',
        ];
    }

    public function getCompletedSwapsCountAttribute(): int
    {
        return ExchangeRequest::where(function ($q) {
            $q->where('requester_id', $this->id)
              ->orWhere('owner_id', $this->id);
        })->where('status', 'Completed')->count();
    }

    public function getCompletedSwapsAttribute(): int
    {
        return $this->getCompletedSwapsCountAttribute();
    }

    public function getReviewsCountAttribute(): int
    {
        return $this->relationLoaded('reviewsReceived')
            ? $this->reviewsReceived->count()
            : $this->reviewsReceived()->count();
    }

    public function getRatingAttribute($value): float
    {
        $count = $this->reviews_count;
        if ($count === 0) {
            return 0.0;
        }

        $avg = $this->relationLoaded('reviewsReceived')
            ? $this->reviewsReceived->avg('rating')
            : $this->reviewsReceived()->avg('rating');

        return $avg !== null ? round((float) $avg, 1) : 0.0;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function stateRegion(): BelongsTo
    {
        return $this->belongsTo(StateRegion::class, 'state_region_id');
    }

    public function township(): BelongsTo
    {
        return $this->belongsTo(Township::class, 'township_id');
    }

    public function communicationContacts(): HasMany
    {
        return $this->hasMany(CommunicationContact::class, 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'user_id');
    }

    public function requesterExchanges(): HasMany
    {
        return $this->hasMany(ExchangeRequest::class, 'requester_id');
    }

    public function ownerExchanges(): HasMany
    {
        return $this->hasMany(ExchangeRequest::class, 'owner_id');
    }

    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewed_user_id');
    }
}
