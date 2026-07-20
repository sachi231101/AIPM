<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SubadminController extends Controller
{
    public function index(): JsonResponse
    {
        $subadmins = User::where('role', 'subadmin')
            ->orderBy('id', 'desc')
            ->get();

        $data = $subadmins->map(fn ($user) => [
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'role'        => $user->role,
            'permissions' => is_string($user->permissions) ? json_decode($user->permissions, true) : ($user->permissions ?? []),
        ]);

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email',
            'password'    => 'required|string|min:6',
            'permissions' => 'nullable|array',
        ]);

        $user = User::create([
            'name'        => $request->name,
            'email'       => $request->email,
            'password'    => Hash::make($request->password),
            'role'        => 'subadmin',
            'permissions' => $request->permissions ?? [
                'students'   => false,
                'jobs'       => false,
                'institutes' => false,
                'settings'   => false,
            ],
        ]);

        return response()->json([
            'message' => 'Sub-admin created successfully!',
            'data'    => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'role'        => $user->role,
                'permissions' => $user->permissions,
            ]
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::where('role', 'subadmin')->findOrFail($id);

        $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email,' . $id,
            'password'    => 'nullable|string|min:6',
            'permissions' => 'required|array',
        ]);

        $updates = [
            'name'        => $request->name,
            'email'       => $request->email,
            'permissions' => $request->permissions,
        ];

        if ($request->filled('password')) {
            $updates['password'] = Hash::make($request->password);
        }

        $user->update($updates);

        return response()->json([
            'message' => 'Sub-admin updated successfully!',
            'data'    => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'role'        => $user->role,
                'permissions' => $user->permissions,
            ]
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::where('role', 'subadmin')->findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'Sub-admin deleted successfully.'
        ]);
    }
}
