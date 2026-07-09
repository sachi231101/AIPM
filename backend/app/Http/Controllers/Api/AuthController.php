<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StudentRegisterRequest;
use App\Models\Institute;
use App\Models\Notification;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // ───────── POST /api/student/register ─────────

    public function register(StudentRegisterRequest $request): JsonResponse
    {
        // 1. Resolve institute
        $instituteId        = null;
        $otherInstituteName = null;

        if ($request->institute_id === 'other' || $request->institute_id === null) {
            $otherInstituteName = $request->other_institute_name;
        } else {
            $instituteId = (int) $request->institute_id;
        }

        // 2. Create user account (email is optional at registration)
        $user = User::create([
            'name'     => $request->full_name,
            'email'    => null,   // filled in profile later
            'password' => Hash::make($request->password),
            'role'     => 'student',
        ]);

        // 3. Create student record
        $student = Student::create([
            'user_id'             => $user->id,
            'institute_id'        => $instituteId,
            'other_institute_name'=> $otherInstituteName,
            'student_id_card'     => $request->student_id_card,
            'mobile'              => $request->mobile,
            'profile_completion'  => 0,
        ]);

        // Create admin notification
        $instituteName = $instituteId
            ? (Institute::find($instituteId)?->name ?? 'Unknown Institute')
            : ($otherInstituteName ?? 'Other Institute');

        Notification::create([
            'type'    => 'new_student',
            'title'   => 'New Student Registration',
            'message' => $request->full_name . ' registered from ' . $instituteName,
            'link'    => '/admin/students',
        ]);

        $token = $user->createToken('student-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'token'   => $token,
            'user'    => $this->formatStudent($user, $student),
        ], 201);
    }

    // ───────── POST /api/student/login ─────────

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'identifier' => 'required|string',   // student_id_card OR email
            'password'   => 'required|string',
        ]);

        $identifier = $request->identifier;

        // Try student_id_card first, then email
        $student = Student::where('student_id_card', $identifier)->first();
        $user    = $student?->user ?? User::where('email', $identifier)->where('role', 'student')->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $student = $student ?? $user->student;
        $token   = $user->createToken('student-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => $this->formatStudent($user, $student),
        ]);
    }

    // ───────── POST /api/student/logout ─────────

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    // ───────── PUT /api/student/change-password ─────────

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Password changed successfully.']);
    }

    // ───────── Helper ─────────

    private function formatStudent(User $user, ?Student $student): array
    {
        return [
            'id'                  => $user->id,
            'student_id'          => $student?->id,
            'student_id_card'     => $student?->student_id_card,
            'name'                => $user->name,
            'email'               => $user->email,
            'mobile'              => $student?->mobile,
            'institute_id'        => $student?->institute_id,
            'institute'           => $student?->institute?->name ?? $student?->other_institute_name,
            'profile_completion'  => $student?->profile_completion ?? 0,
            'role'                => $user->role,
        ];
    }
}
