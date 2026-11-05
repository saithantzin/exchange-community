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
                    ->orWhere('looking_for', 'like', "%{$q}%")
                    ->orWhereHas('category', fn($c) => $c->where('name', 'like', "%{$q}%"));
            });
        }

        // Category filter (supports numeric ID, slug, or name)
        $cat = $request->category_id ?? $request->category ?? $request->cat;
        if ($cat && $cat !== 'all') {
            if (is_numeric($cat)) {
                $query->where('category_id', $cat);
            } else {
                $query->whereHas('category', function ($c) use ($cat) {
                    $c->where('slug', $cat)
                      ->orWhere('name', 'like', "%{$cat}%");
                });
            }
        }

        // Condition filter
        $cond = $request->condition ?? $request->cond;
        if ($cond && $cond !== 'all') {
            $query->where('condition', $cond);
        }

        // State / Region ID filter
        if ($request->filled('state_region_id') && $request->state_region_id !== 'all') {
            $query->whereHas('township', function ($t) use ($request) {
                $t->where('state_region_id', $request->state_region_id);
            });
        }

        // City / Region keyword or code filter (e.g. 'YGN', 'MDY', 'Yangon', 'Mandalay')
        $city = $request->city ?? $request->city_code;
        if ($city && $city !== 'all') {
            $query->where(function ($sub) use ($city) {
                if (strtoupper($city) === 'MDY' || str_contains(strtolower($city), 'mandalay')) {
                    $sub->whereHas('township.stateRegion', fn($r) => $r->where('name', 'like', '%Mandalay%'))
                        ->orWhereHas('township', fn($t) => $t->where('name', 'like', '%Mandalay%'));
                } elseif (strtoupper($city) === 'YGN' || str_contains(strtolower($city), 'yangon')) {
                    $sub->whereHas('township.stateRegion', fn($r) => $r->where('name', 'like', '%Yangon%'))
                        ->orWhereHas('township', fn($t) => $t->where('name', 'like', '%Yangon%'));
                } elseif (strtoupper($city) === 'NPT' || str_contains(strtolower($city), 'naypyitaw') || str_contains(strtolower($city), 'nay pyi taw')) {
                    $sub->whereHas('township.stateRegion', fn($r) => $r->where('name', 'like', '%Naypyitaw%'))
                        ->orWhereHas('township', fn($t) => $t->where('name', 'like', '%Zabuthiri%'));
                } else {
                    $sub->whereHas('township', function ($t) use ($city) {
                        $t->where('name', 'like', "%{$city}%")
                          ->orWhereHas('stateRegion', fn($r) => $r->where('name', 'like', "%{$city}%"));
                    });
                }
            });
        }

        // Sorting
        $sort = $request->get('sort', $request->get('sort_by', 'newest'));
        if ($sort === 'popular') {
            $query->orderBy('views', 'desc');
        } elseif ($sort === 'title-asc') {
            $query->orderBy('title', 'asc');
        } elseif ($sort === 'title-desc') {
            $query->orderBy('title', 'desc');
        } else {
            $query->latest();
        }

        $perPage = (int) $request->get('per_page', 12);
        if ($perPage <= 0) $perPage = 12;

        $items = $query->paginate($perPage);

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
            'user.township.stateRegion',
            'user.communicationContacts',
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
            'category_id' => 'required',
            'description' => 'required|string',
            'condition' => 'required|string',
            'defects' => 'nullable|string',
            'looking_for' => 'nullable|string|max:255',
            'township_id' => 'nullable',
            'images' => 'required|array|min:1',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $user = $request->user();

        // Dynamically resolve category ID
        $categoryId = $request->category_id;
        if (!is_numeric($categoryId) || !\App\Models\Category::where('id', $categoryId)->exists()) {
            $cat = \App\Models\Category::where('name', 'like', "%{$categoryId}%")
                ->orWhere('slug', \Illuminate\Support\Str::slug($categoryId))
                ->first();
            $categoryId = $cat ? $cat->id : (\App\Models\Category::first()->id ?? 1);
        }

        // Dynamically resolve township ID
        $townshipId = $request->township_id ?: ($user->township_id ?? null);
        if ($townshipId && (!is_numeric($townshipId) || !\App\Models\Township::where('id', $townshipId)->exists())) {
            $townshipId = \App\Models\Township::first()->id ?? null;
        }

        try {
            DB::beginTransaction();

            $item = Item::create([
                'user_id' => $user->id,
                'category_id' => $categoryId,
                'township_id' => $townshipId,
                'title' => $request->title,
                'description' => $request->description,
                'condition' => $request->condition,
                'defects' => $request->defects,
                'looking_for' => $request->looking_for,
                'availability_status' => 'Available',
            ]);

            foreach ($request->images as $index => $imageUrl) {
                // If Base64 image data URI, save as actual file in storage
                if (is_string($imageUrl) && preg_match('/^data:image\/(\w+);base64,/', $imageUrl, $type)) {
                    $data = substr($imageUrl, strpos($imageUrl, ',') + 1);
                    $ext = strtolower($type[1]);
                    $data = base64_decode($data);
                    $filename = 'items/' . \Illuminate\Support\Str::random(40) . '.' . $ext;
                    \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $data);
                    $imageUrl = asset('storage/' . $filename);
                }

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
            'category_id' => 'sometimes|required',
            'township_id' => 'nullable',
            'description' => 'sometimes|required|string',
            'condition' => 'sometimes|required|string',
            'defects' => 'nullable|string',
            'looking_for' => 'nullable|string|max:255',
            'availability_status' => 'sometimes|string',
            'images' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $updateData = $request->only([
            'title', 'description', 'condition', 'defects', 'looking_for', 'availability_status'
        ]);

        if ($request->has('category_id')) {
            $catId = $request->category_id;
            if (!is_numeric($catId) || !\App\Models\Category::where('id', $catId)->exists()) {
                $cat = \App\Models\Category::where('name', 'like', "%{$catId}%")
                    ->orWhere('slug', \Illuminate\Support\Str::slug($catId))
                    ->first();
                $catId = $cat ? $cat->id : $item->category_id;
            }
            $updateData['category_id'] = $catId;
        }

        if ($request->has('township_id') && $request->township_id) {
            $tId = $request->township_id;
            if (is_numeric($tId) && \App\Models\Township::where('id', $tId)->exists()) {
                $updateData['township_id'] = $tId;
            }
        }

        $item->update($updateData);

        if ($request->has('images') && is_array($request->images) && count($request->images) > 0) {
            $item->images()->delete();
            foreach ($request->images as $index => $imageUrl) {
                if (is_string($imageUrl) && preg_match('/^data:image\/(\w+);base64,/', $imageUrl, $type)) {
                    $data = substr($imageUrl, strpos($imageUrl, ',') + 1);
                    $ext = strtolower($type[1]);
                    $data = base64_decode($data);
                    $filename = 'items/' . \Illuminate\Support\Str::random(40) . '.' . $ext;
                    \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $data);
                    $imageUrl = asset('storage/' . $filename);
                }

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
     * Upload item image file(s) - Supports both single and multiple uploads.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        // Support multiple images upload (e.g. files[] or images[])
        $files = $request->file('images') ?: $request->file('files');
        if ($files && is_array($files)) {
            $validator = Validator::make($request->all(), [
                'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
                'files.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
            ]);

            if ($validator->fails()) {
                return $this->errorResponse('Validation failed', 422, $validator->errors());
            }

            $urls = [];
            foreach ($files as $file) {
                $path = $file->store('items', 'public');
                $urls[] = asset('storage/' . $path);
            }

            return $this->successResponse([
                'urls' => $urls,
                'url' => $urls[0] ?? null,
            ], 'Images uploaded successfully', 201);
        }

        // Support single image upload
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        try {
            $path = $request->file('image')->store('items', 'public');
            $url = asset('storage/' . $path);

            return $this->successResponse([
                'path' => $path,
                'url' => $url,
                'urls' => [$url],
            ], 'Image uploaded successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to upload image: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get authenticated User's active items.
     */
    public function myItems(Request $request): JsonResponse
    {
        $items = Item::with(['category', 'township.stateRegion', 'images', 'user'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return $this->successResponse($items, 'My items retrieved');
    }
}
