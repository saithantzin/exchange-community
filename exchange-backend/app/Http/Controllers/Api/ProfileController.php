<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunicationContact;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    use ApiResponse;

    /**
     * Get authenticated user profile with location and contacts.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['stateRegion', 'township', 'communicationContacts']);

        return $this->successResponse($user, 'Profile retrieved');
    }

    /**
     * Update user profile details.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:25',
            'state_region_id' => 'nullable|exists:state_regions,id',
            'township_id' => 'nullable|exists:townships,id',
            'address' => 'nullable|string|max:500',
            'bio' => 'nullable|string|max:1000',
            'profile_image' => 'nullable|string',
            'communication_contacts' => 'nullable|array',
            'communication_contacts.*.platform' => 'required_with:communication_contacts|string',
            'communication_contacts.*.contact_value' => 'required_with:communication_contacts|string',
            'communication_contacts.*.is_preferred' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        try {
            DB::beginTransaction();

            $user->update($request->only([
                'name', 'phone', 'state_region_id', 'township_id', 'address', 'bio', 'profile_image'
            ]));

            // If communication contacts submitted, sync them
            if ($request->has('communication_contacts') && is_array($request->communication_contacts)) {
                $user->communicationContacts()->delete();
                foreach ($request->communication_contacts as $contact) {
                    if (!empty($contact['contact_value'])) {
                        CommunicationContact::create([
                            'user_id' => $user->id,
                            'platform' => $contact['platform'],
                            'contact_value' => $contact['contact_value'],
                            'is_preferred' => !empty($contact['is_preferred']),
                        ]);
                    }
                }
            }

            DB::commit();

            $user->load(['stateRegion', 'township', 'communicationContacts']);

            return $this->successResponse($user, 'Profile updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to update profile: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Change user password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Current password does not match.', 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return $this->successResponse(null, 'Password updated successfully');
    }
}
