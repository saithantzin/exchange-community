<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    use ApiResponse;

    /**
     * Get all active categories with item counts and deposit amounts.
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('items')
            ->orderBy('name')
            ->get();

        return $this->successResponse($categories, 'Categories retrieved');
    }

    /**
     * (Admin) Create a new category.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:categories,name',
            'slug' => 'nullable|string|max:100',
            'deposit_amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $slug = $request->filled('slug') ? Str::slug($request->slug) : Str::slug($request->name);
        if (Category::where('slug', $slug)->exists()) {
            $slug .= '-' . rand(100, 999);
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'deposit_amount' => $request->deposit_amount,
            'icon' => $request->icon ?: 'Grid',
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : true,
        ]);

        return $this->successResponse($category, 'Category created successfully', 201);
    }

    /**
     * (Admin) Update an existing category.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $category = Category::find($id);

        if (!$category) {
            return $this->errorResponse('Category not found', 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100|unique:categories,name,' . $id,
            'slug' => 'nullable|string|max:100',
            'deposit_amount' => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $category->update($request->only(['name', 'slug', 'description', 'deposit_amount', 'icon', 'is_active']));

        return $this->successResponse($category, 'Category updated successfully');
    }

    /**
     * (Admin) Delete a category.
     */
    public function destroy($id): JsonResponse
    {
        $category = Category::find($id);

        if (!$category) {
            return $this->errorResponse('Category not found', 404);
        }

        if ($category->items()->count() > 0) {
            return $this->errorResponse('Cannot delete category with associated items. Deactivate it instead.', 400);
        }

        $category->delete();

        return $this->successResponse(null, 'Category deleted successfully');
    }
}
