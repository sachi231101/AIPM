<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Institute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstituteController extends Controller
{
    // GET /api/admin/institutes
    public function index(): JsonResponse
    {
        return response()->json(['data' => Institute::all()]);
    }

    // POST /api/admin/institutes
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'    => 'required|string|max:255|unique:institutes,name',
            'address' => 'nullable|string',
            'phone'   => 'nullable|string|max:20',
            'email'   => 'nullable|email',
        ]);

        $institute = Institute::create($request->only('name', 'address', 'phone', 'email'));

        return response()->json(['message' => 'Institute created.', 'data' => $institute], 201);
    }

    // PUT /api/admin/institutes/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $institute = Institute::findOrFail($id);

        $request->validate([
            'name'      => 'sometimes|string|max:255|unique:institutes,name,' . $id,
            'is_active' => 'sometimes|boolean',
            'address'   => 'nullable|string',
            'phone'     => 'nullable|string|max:20',
            'email'     => 'nullable|email',
        ]);

        $institute->update($request->only('name', 'is_active', 'address', 'phone', 'email'));

        return response()->json(['message' => 'Institute updated.', 'data' => $institute]);
    }

    // DELETE /api/admin/institutes/{id}
    public function destroy(int $id): JsonResponse
    {
        $institute = Institute::findOrFail($id);

        if ($institute->students()->exists()) {
            return response()->json(['message' => 'Cannot delete institute with registered students.'], 422);
        }

        $institute->delete();

        return response()->json(['message' => 'Institute deleted.']);
    }

    // PUT /api/admin/institutes/{id}/toggle
    public function toggleStatus(int $id): JsonResponse
    {
        $institute = Institute::findOrFail($id);
        $institute->update(['is_active' => !$institute->is_active]);

        $status = $institute->is_active ? 'activated' : 'deactivated';

        return response()->json(['message' => "Institute {$status}.", 'data' => $institute]);
    }
}
