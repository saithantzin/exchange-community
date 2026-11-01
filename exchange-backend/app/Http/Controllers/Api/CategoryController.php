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
            'deposit_amount' => 'required|numeric|min:0',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'deposit_amount' => $request->deposit_amount,
            'icon' => $request->icon ?: 'Grid',
            'is_active' => $request->has('is_active') ? $request->is_active : true,
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
            'deposit_amount' => 'sometimes|required|numeric|min:0',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $category->update($request->only(['name', 'deposit_amount', 'icon', 'is_active']));

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
