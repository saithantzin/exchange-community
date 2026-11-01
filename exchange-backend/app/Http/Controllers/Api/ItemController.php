<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\ItemImage;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ItemController extends Controller
{
    use ApiResponse;

    /**
     * Browse / Search Items dynamically with multi-parameter filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Item::with([
            'category',
            'township.stateRegion',
            'images',
            'user:id,name,username,phone,rating,profile_image'
        ])->where('availability_status', '!=', 'Deactivated');

        // Search query
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('looking_for', 'like', "%{$q}%");
            });
        }

        // Category filter
        if ($request->filled('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        // Condition filter
        if ($request->filled('condition') && $request->condition !== 'all') {
            $query->where('condition', $request->condition);
        }

        // City / Region filter
        if ($request->filled('state_region_id') && $request->state_region_id !== 'all') {
            $query->whereHas('township', function ($t) use ($request) {
                $t->where('state_region_id', $request->state_region_id);
            });
        }

        // Sorting
        $sort = $request->get('sort', 'newest');
        if ($sort === 'popular') {
            $query->orderBy('views', 'desc');
        } else {
            $query->latest();
        }

        $items = $query->paginate($request->get('per_page', 12));

        return $this->successResponse($items, 'Items retrieved');
    }

    /**
     * Get single Item details.
     */
    public function show($id): JsonResponse
    {
        $item = Item::with([
            'category',
            'township.stateRegion',
            'images',
            'user:id,name,username,phone,rating,bio,profile_image,created_at'
        ])->find($id);

        if (!$item) {
            return $this->errorResponse('Item not found', 404);
        }

        // Increment view count
        $item->increment('views');

        return $this->successResponse($item, 'Item details retrieved');
    }

    /**
     * Authenticated User posts a new Item.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            'condition' => 'required|string|in:Brand New,Like New,Lightly Used,Well Used',
            'looking_for' => 'nullable|string|max:255',
            'township_id' => 'nullable|exists:townships,id',
            'images' => 'required|array|min:1',
            'images.*' => 'required|string', // URL string
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $user = $request->user();

        try {
            DB::beginTransaction();

            $item = Item::create([
                'user_id' => $user->id,
                'category_id' => $request->category_id,
                'township_id' => $request->township_id ?: $user->township_id,
                'title' => $request->title,
                'description' => $request->description,
                'condition' => $request->condition,
                'looking_for' => $request->looking_for,
                'availability_status' => 'Available',
            ]);

            foreach ($request->images as $index => $imageUrl) {
                ItemImage::create([
                    'item_id' => $item->id,
                    'image_url' => $imageUrl,
                    'is_primary' => $index === 0,
                ]);
            }

            DB::commit();

            $item->load(['category', 'township.stateRegion', 'images', 'user']);

            return $this->successResponse($item, 'Item posted successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to create item: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Authenticated User updates their Item.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $item = Item::find($id);

        if (!$item) {
            return $this->errorResponse('Item not found', 404);
        }

        if ($item->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return $this->errorResponse('Unauthorized to modify this item', 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'description' => 'sometimes|required|string',
            'condition' => 'sometimes|required|string|in:Brand New,Like New,Lightly Used,Well Used',
            'looking_for' => 'nullable|string|max:255',
            'availability_status' => 'sometimes|string|in:Available,Pending,Exchanged,Deactivated',
            'images' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $item->update($request->only([
            'title', 'category_id', 'description', 'condition', 'looking_for', 'availability_status'
        ]));

        if ($request->has('images') && is_array($request->images)) {
            $item->images()->delete();
            foreach ($request->images as $index => $imageUrl) {
                ItemImage::create([
                    'item_id' => $item->id,
                    'image_url' => $imageUrl,
                    'is_primary' => $index === 0,
                ]);
            }
        }

        $item->load(['category', 'township.stateRegion', 'images', 'user']);

        return $this->successResponse($item, 'Item updated successfully');
    }

    /**
     * Authenticated User deletes their Item.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $item = Item::find($id);

        if (!$item) {
            return $this->errorResponse('Item not found', 404);
        }

        if ($item->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return $this->errorResponse('Unauthorized to delete this item', 403);
        }

        $item->delete();

        return $this->successResponse(null, 'Item removed successfully');
    }

    /**
     * Get authenticated User's active items.
     */
    public function myItems(Request $request): JsonResponse
    {
        $items = Item::with(['category', 'township.stateRegion', 'images'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return $this->successResponse($items, 'My items retrieved');
    }
}
