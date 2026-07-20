<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    // ───────── POST /api/admin/login ─────────

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)
            ->whereIn('role', ['admin', 'subadmin'])
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid admin credentials.'], 401);
        }

        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'message' => 'Admin login successful.',
            'token'   => $token,
            'user'    => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'role'        => $user->role,
                'permissions' => is_string($user->permissions) ? json_decode($user->permissions, true) : $user->permissions,
            ],
        ]);
    }

    // ───────── POST /api/admin/logout ─────────

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Admin logged out successfully.']);
    }

    // ───────── GET /api/admin/me ─────────
    // Returns the current user's fresh data (used for real-time permission syncing)

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->fresh(); // reload from DB

        return response()->json([
            'user' => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'role'        => $user->role,
                'permissions' => $user->permissions,
            ],
        ]);
    }
}
