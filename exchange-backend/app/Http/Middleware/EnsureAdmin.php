<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user('sanctum');

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!($user instanceof User) || !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Administrator access required.',
            ], 403);
        }
        $request->setUserResolver(fn() => $user);
        auth()->setUser($user);

        return $next($request);
    }
}
