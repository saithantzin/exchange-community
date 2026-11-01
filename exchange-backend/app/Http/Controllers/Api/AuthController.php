<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunicationContact;
use App\Models\StateRegion;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Register a new member account.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username|regex:/^[a-zA-Z0-9_]+$/',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:25',
            'state_region_id' => 'nullable|exists:state_regions,id',
            'township_id' => 'nullable|exists:townships,id',
            'address' => 'nullable|string|max:500',
            'communication_contacts' => 'nullable|array',
            'communication_contacts.*.platform' => 'required_with:communication_contacts|string',
            'communication_contacts.*.contact_value' => 'required_with:communication_contacts|string',
            'communication_contacts.*.is_preferred' => 'nullable|boolean',
        ], [
            'username.regex' => 'Username must only contain letters, numbers, and underscores.',
            'username.unique' => 'This username is already taken.',
            'email.unique' => 'This email address is already registered.',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'state_region_id' => $request->state_region_id,
                'township_id' => $request->township_id,
                'address' => $request->address,
                'role' => 'user',
                'account_status' => 'Active',
            ]);

            // Save communication contacts (Telegram, Viber, Facebook Messenger, etc.)
            if ($request->has('communication_contacts') && is_array($request->communication_contacts)) {
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

            // Generate Sanctum access token
            $token = $user->createToken('auth_token')->plainTextToken;

            $user->load(['stateRegion', 'township', 'communicationContacts']);

            return $this->successResponse([
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ], 'Registration successful', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Registration failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Member / User Login.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string', // username or email
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Please enter your login credential and password', 422, $validator->errors());
        }

        $login = $request->input('login');

        // Allow login by email or username
        $user = User::where('email', $login)
            ->orWhere('username', $login)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->errorResponse('Invalid credentials provided.', 401);
        }

        // Check if account has been suspended by Admin
        if ($user->account_status === 'Suspended') {
            return $this->errorResponse(
                'Your account has been suspended: ' . ($user->suspension_reason ?: 'Contact support for details.'),
                403
            );
        }

        // Create Sanctum Token
        $token = $user->createToken('auth_token')->plainTextToken;

        $user->load(['stateRegion', 'township', 'communicationContacts']);

        return $this->successResponse([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Login successful');
    }

    /**
     * Admin Portal Login.
     */
    public function adminLogin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $login = $request->input('login');

        $user = User::where('email', $login)
            ->orWhere('username', $login)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->errorResponse('Invalid credentials.', 401);
        }

        if ($user->role !== 'admin') {
            return $this->errorResponse('Access restricted. Administrative privileges required.', 403);
        }

        $token = $user->createToken('admin_token', ['admin'])->plainTextToken;

        return $this->successResponse([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Admin authentication successful');
    }

    /**
     * Get Authenticated User Profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['stateRegion', 'township', 'communicationContacts']);

        return $this->successResponse($user, 'Profile retrieved');
    }

    /**
     * Logout / Revoke Token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Successfully logged out');
    }

    /**
     * Get Myanmar States, Regions & Townships (Public helper for registration & search).
     */
    public function getLocations(): JsonResponse
    {
        $regions = StateRegion::with('townships')->get();

        return $this->successResponse($regions, 'Locations retrieved');
    }
}
