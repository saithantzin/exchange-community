<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class SmartMatchController extends Controller
{
    use ApiResponse;

    /**
     * Get rule-based smart matches computed dynamically from real database listings.
     */
    public function index(Request $request): JsonResponse
    {
        // Resolve authenticated user from Sanctum token if present
        $user = $request->user('sanctum');
        if (!$user) {
            $bearer = $request->bearerToken();
            if ($bearer) {
                $tokenModel = PersonalAccessToken::findToken($bearer);
                if ($tokenModel && $tokenModel->tokenable) {
                    $user = $tokenModel->tokenable;
                }
            }
        }

        // 1. Items listed by current authenticated member
        $userItems = $user
            ? Item::with(['category', 'township.stateRegion', 'images', 'user'])
                ->where('user_id', $user->id)
                ->where('availability_status', 'Available')
                ->get()
            : collect();

        // If authenticated user has NO listings, return empty matches directly
        if ($user && $userItems->isEmpty()) {
            return response()->json([
                'success' => true,
                'message' => 'No active listings found. Please list an item to receive smart matches.',
                'data' => [],
                'user_has_items' => false,
                'total_user_items' => 0
            ]);
        }

        // 2. Candidate items from other members
        $otherItemsQuery = Item::with(['category', 'township.stateRegion', 'images', 'user'])
            ->where('availability_status', 'Available');

        if ($user) {
            $otherItemsQuery->where('user_id', '!=', $user->id);
        }

        $otherItems = $otherItemsQuery->latest()->get();

        $matches = [];

        // Pair current user's items with community items
        if ($userItems->isNotEmpty() && $otherItems->isNotEmpty()) {
            foreach ($userItems as $myItm) {
                foreach ($otherItems as $partnerItm) {
                    $matchType = '';
                    $matchReason = '';
                    $isIntercity = false;
                    $shippingNote = '';

                    $score = $this->calculateMatchScore(
                        $myItm,
                        $partnerItm,
                        $matchType,
                        $matchReason,
                        $isIntercity,
                        $shippingNote
                    );

                    $matches[] = $this->formatMatch(
                        $myItm,
                        $partnerItm,
                        $score,
                        $matchType,
                        $matchReason,
                        $isIntercity,
                        $shippingNote
                    );
                }
            }
        } elseif (!$user && empty($matches)) {
            // Only for guest visitors, calculate pairs across active community items as a preview
            $allAvailable = Item::with(['category', 'township.stateRegion', 'images', 'user'])
                ->where('availability_status', 'Available')
                ->latest()
                ->get();

            $count = $allAvailable->count();
            for ($i = 0; $i < $count; $i++) {
                for ($j = $i + 1; $j < $count; $j++) {
                    $itemA = $allAvailable[$i];
                    $itemB = $allAvailable[$j];
                    if ($itemA->user_id === $itemB->user_id) continue;

                    $matchType = '';
                    $matchReason = '';
                    $isIntercity = false;
                    $shippingNote = '';

                    $score = $this->calculateMatchScore(
                        $itemA,
                        $itemB,
                        $matchType,
                        $matchReason,
                        $isIntercity,
                        $shippingNote
                    );

                    $matches[] = $this->formatMatch(
                        $itemA,
                        $itemB,
                        $score,
                        $matchType,
                        $matchReason,
                        $isIntercity,
                        $shippingNote
                    );
                }
            }
        }

        // Filter by minimum score threshold (default >= 75% high rating matches)
        $minScore = (int) $request->input('min_score', 75);
        $matches = array_values(array_filter($matches, fn($m) => $m['matchScore'] >= $minScore));

        // Sort by matchScore descending (highest match first)
        usort($matches, fn($a, $b) => $b['matchScore'] <=> $a['matchScore']);

        // Limit to top 30 matches
        $matches = array_slice($matches, 0, 30);

        return $this->successResponse($matches, 'Smart matches calculated from database');
    }

    /**
     * Compute circular compatibility score and generate explanation rationale.
     */
    private function calculateMatchScore(
        Item $a,
        Item $b,
        string &$matchType,
        string &$matchReason,
        bool &$isIntercity,
        string &$shippingNote
    ): int {
        $score = 55; // baseline interest score
        $reasons = [];

        $aLooking = strtolower($a->looking_for ?? '');
        $bLooking = strtolower($b->looking_for ?? '');
        $aTitle = strtolower($a->title ?? '');
        $bTitle = strtolower($b->title ?? '');
        $aCat = strtolower($a->category?->name ?? '');
        $bCat = strtolower($b->category?->name ?? '');

        // 1. Wishlist text cross-matching
        $aWantsB = false;
        $bWantsA = false;

        if (!empty($aLooking)) {
            $words = array_filter(explode(' ', preg_replace('/[^\w\s]/', '', $aLooking)), fn($w) => strlen($w) > 2);
            foreach ($words as $word) {
                if (str_contains($bTitle, $word) || str_contains($bCat, $word)) {
                    $aWantsB = true;
                    break;
                }
            }
        }

        if (!empty($bLooking)) {
            $words = array_filter(explode(' ', preg_replace('/[^\w\s]/', '', $bLooking)), fn($w) => strlen($w) > 2);
            foreach ($words as $word) {
                if (str_contains($aTitle, $word) || str_contains($aCat, $word)) {
                    $bWantsA = true;
                    break;
                }
            }
        }

        $mutualWishlist = false;
        if ($aWantsB && $bWantsA) {
            $score += 30;
            $mutualWishlist = true;
            $reasons[] = 'Mutual wishlist match: both members explicitly seek what the other has offered';
        } elseif ($aWantsB) {
            $score += 18;
            $reasons[] = "Listing directly corresponds to desired exchange request ('{$a->looking_for}')";
        } elseif ($bWantsA) {
            $score += 18;
            $reasons[] = "Your item aligns with partner's declared wishlist ('{$b->looking_for}')";
        }

        // 2. Category alignment
        if ($a->category_id === $b->category_id) {
            $score += 15;
            $reasons[] = "Direct category alignment ({$a->category?->name})";
        }

        // 3. Condition tier similarity
        if (strtolower($a->condition) === strtolower($b->condition)) {
            $score += 10;
            $reasons[] = "Matching item condition tier ({$a->condition})";
        }

        // 4. Geographic & Handover proximity
        $aRegion = $a->township?->stateRegion?->name ?: 'Mandalay Region';
        $bRegion = $b->township?->stateRegion?->name ?: 'Yangon Region';

        $isLocal = (strtolower(trim($aRegion)) === strtolower(trim($bRegion)));
        if ($isLocal) {
            $score += 15;
            $isIntercity = false;
            $shippingNote = "Same region ({$aRegion}): Safe in-person meetup supported without shipping fee";
            $reasons[] = "Both items located in {$aRegion} for easy face-to-face inspection";
        } else {
            $score += 5;
            $isIntercity = true;
            $shippingNote = "Intercity route ({$aRegion} ⇄ {$bRegion}): Express courier with dual-confirmation escrow";
            $reasons[] = "Intercity swap opportunity between {$aRegion} and {$bRegion}";
        }

        // Clamp final score between 65 and 99
        $score = min(99, max(65, $score));

        if ($score >= 90) {
            $matchType = $isLocal ? "Perfect Match (Local {$aRegion})" : "High Compatibility ({$aRegion} ⇄ {$bRegion})";
        } elseif ($score >= 80) {
            $matchType = $mutualWishlist ? 'Mutual Wishlist Match' : 'Category Alignment Match';
        } else {
            $matchType = 'Recommended Exchange Opportunity';
        }

        $matchReason = implode(' • ', $reasons) . '.';

        return $score;
    }

    /**
     * Standardize match pair structure for frontend.
     */
    private function formatMatch(
        Item $a,
        Item $b,
        int $score,
        string $matchType,
        string $matchReason,
        bool $isIntercity,
        string $shippingNote
    ): array {
        $aPrimary = $a->images->firstWhere('is_primary', true) ?: $a->images->first();
        $bPrimary = $b->images->firstWhere('is_primary', true) ?: $b->images->first();

        $aImage = $aPrimary?->image_url ?: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80';
        $bImage = $bPrimary?->image_url ?: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80';

        $aCity = $a->township
            ? "{$a->township->name}, {$a->township->stateRegion?->name}"
            : 'Mandalay';

        $bCity = $b->township
            ? "{$b->township->name}, {$b->township->stateRegion?->name}"
            : 'Yangon';

        return [
            'id' => "match-{$a->id}-{$b->id}",
            'matchScore' => $score,
            'matchType' => $matchType,
            'memberItem' => [
                'id' => $a->id,
                'title' => $a->title,
                'category' => $a->category?->name ?: 'General',
                'city' => $aCity,
                'condition' => $a->condition,
                'image' => $aImage,
            ],
            'offeredItem' => [
                'id' => $b->id,
                'title' => $b->title,
                'category' => $b->category?->name ?: 'General',
                'city' => $bCity,
                'condition' => $b->condition,
                'ownerId' => $b->user_id,
                'ownerName' => $b->user?->name ?: 'Community Member',
                'ownerRating' => (float)($b->user?->rating ?: 5.0),
                'ownerAvatar' => $b->user?->profile_image ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
                'image' => $bImage,
            ],
            'matchReason' => $matchReason,
            'intercity' => $isIntercity,
            'shippingNote' => $shippingNote,
        ];
    }
}
