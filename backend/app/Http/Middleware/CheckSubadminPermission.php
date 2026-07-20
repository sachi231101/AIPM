<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubadminPermission
{
    /**
     * Handle an incoming request.
     *
     * Checks if a subadmin has the designated permission key enabled.
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Super-admin (role = admin) bypasses all permission checks
        if ($user->role === 'admin') {
            return $next($request);
        }

        // Subadmin checks
        if ($user->role === 'subadmin') {
            $perms = $user->permissions;
            if (is_string($perms)) {
                $perms = json_decode($perms, true);
            }
            $perms = $perms ?? [];

            if (isset($perms[$permission]) && $perms[$permission] === true) {
                return $next($request);
            }

            return response()->json([
                'message' => 'Forbidden: You do not have permission to perform this action.'
            ], 403);
        }

        return response()->json(['message' => 'Unauthorized role.'], 403);
    }
}
