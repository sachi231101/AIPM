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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

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

        $studentIdCard = $request->student_id_card ?? ('STU' . mt_rand(10000, 99999));
        while (Student::where('student_id_card', $studentIdCard)->exists()) {
            $studentIdCard = 'STU' . mt_rand(10000, 99999);
        }

        // 2. Create user account
        $user = User::create([
            'name'     => $request->full_name,
            'email'    => null,   // filled in profile later
            'password' => Hash::make($request->password),
            'role'     => 'student',
        ]);

        // 3. Create student record
        $student = Student::create([
            'user_id'              => $user->id,
            'institute_id'         => $instituteId,
            'other_institute_name' => $otherInstituteName,
            'student_id_card'      => $studentIdCard,
            'mobile'               => $request->mobile,
            'profile_completion'   => 0,
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

    // ───────── POST /api/student/register/send-otp ─────────

    public function registerSendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'mobile'    => 'required|string|max:15|unique:students,mobile',
            'password'  => 'required|string|min:8|confirmed',
        ], [
            'mobile.unique' => 'This mobile number is already registered. Please sign in.',
        ]);

        $mobile = trim($request->mobile);
        $otp = (string) mt_rand(100000, 999999);

        // Store pending registration data in Cache for 10 minutes (600 seconds)
        Cache::put('reg_otp_student_' . $mobile, [
            'full_name' => trim($request->full_name),
            'mobile'    => $mobile,
            'password'  => $request->password,
            'otp'       => $otp,
        ], 600);

        $maskedMobile = strlen($mobile) >= 10 ? substr($mobile, 0, 2) . '******' . substr($mobile, -2) : $mobile;

        $responseData = [
            'message' => "OTP sent successfully to mobile number {$maskedMobile}.",
            'sent_to' => $maskedMobile,
            'mobile'  => $mobile,
        ];

        if (config('app.env') !== 'production' || config('app.debug')) {
            $responseData['otp_debug'] = $otp;
        }

        return response()->json($responseData);
    }

    // ───────── POST /api/student/register/verify-otp ─────────

    public function registerVerifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'mobile' => 'required|string',
            'otp'    => 'required|string|size:6',
        ]);

        $mobile = trim($request->mobile);
        $regData = Cache::get('reg_otp_student_' . $mobile);

        if (!$regData || $regData['otp'] !== trim($request->otp)) {
            return response()->json(['message' => 'Invalid or expired OTP. Please check and try again.'], 422);
        }

        // OTP verified -> create user & student
        $user = User::create([
            'name'     => $regData['full_name'],
            'email'    => null,
            'password' => Hash::make($regData['password']),
            'role'     => 'student',
        ]);

        $studentIdCard = 'STU' . mt_rand(10000, 99999);
        while (Student::where('student_id_card', $studentIdCard)->exists()) {
            $studentIdCard = 'STU' . mt_rand(10000, 99999);
        }

        $student = Student::create([
            'user_id'            => $user->id,
            'institute_id'       => null,
            'student_id_card'    => $studentIdCard,
            'mobile'             => $mobile,
            'profile_completion' => 0,
        ]);

        // Create notification
        Notification::create([
            'type'    => 'new_student',
            'title'   => 'New Student Registration',
            'message' => $regData['full_name'] . ' registered as a new student.',
            'link'    => '/admin/students',
        ]);

        // Clear cache
        Cache::forget('reg_otp_student_' . $mobile);

        $token = $user->createToken('student-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration verified and completed successfully.',
            'token'   => $token,
            'user'    => $this->formatStudent($user, $student),
        ], 201);
    }

    // ───────── POST /api/student/login ─────────

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'identifier' => 'required|string',   // mobile OR student_id_card OR email
            'password'   => 'required|string',
        ]);

        $identifier = trim($request->identifier);

        // Try mobile, student_id_card, or email
        $student = Student::where('mobile', $identifier)->orWhere('student_id_card', $identifier)->first();
        $user    = $student?->user ?? User::where('email', $identifier)->where('role', 'student')->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid Phone Number / Credentials.'], 401);
        }

        $student = $student ?? $user->student;
        $token   = $user->createToken('student-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => $this->formatStudent($user, $student),
        ]);
    }

    // ───────── POST /api/student/send-otp ─────────

    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'mobile' => 'required|string',
            'name'   => 'nullable|string',
        ]);

        $mobile = trim($request->mobile);
        $student = Student::where('mobile', $mobile)->first();

        $otp = (string) mt_rand(100000, 999999);

        if ($student && $student->user) {
            $user = $student->user;
            if ($request->name && trim($request->name)) {
                $user->update(['name' => trim($request->name)]);
            }
            Cache::put('otp_student_' . $user->id, $otp, 600);
            Cache::put('otp_mobile_' . $mobile, [
                'user_id' => $user->id,
                'otp'     => $otp,
                'is_new'  => false,
            ], 600);
        } else {
            Cache::put('otp_mobile_' . $mobile, [
                'name'   => trim($request->name) ?: 'Student',
                'mobile' => $mobile,
                'otp'    => $otp,
                'is_new' => true,
            ], 600);
        }

        $maskedMobile = strlen($mobile) >= 10 ? substr($mobile, 0, 2) . '******' . substr($mobile, -2) : $mobile;

        $responseData = [
            'message' => "OTP sent successfully to mobile number {$maskedMobile}.",
            'sent_to' => $maskedMobile,
            'mobile'  => $mobile,
        ];

        if (config('app.env') !== 'production' || config('app.debug')) {
            $responseData['otp_debug'] = $otp;
        }

        return response()->json($responseData);
    }

    // ───────── POST /api/student/verify-otp ─────────

    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'mobile' => 'required|string',
            'otp'    => 'required|string|size:6',
        ]);

        $mobile = trim($request->mobile);
        $cachedData = Cache::get('otp_mobile_' . $mobile);
        $student = Student::where('mobile', $mobile)->first();

        // Check fallback cache key
        $cachedOtp = is_array($cachedData) ? ($cachedData['otp'] ?? null) : null;
        if (!$cachedOtp && $student && $student->user) {
            $cachedOtp = Cache::get('otp_student_' . $student->user->id);
        }

        if (!$cachedOtp || $cachedOtp !== trim($request->otp)) {
            return response()->json(['message' => 'Invalid or expired OTP. Please check and try again.'], 422);
        }

        // OTP is valid! Create student if new
        if (!$student) {
            $name = (is_array($cachedData) && !empty($cachedData['name'])) ? $cachedData['name'] : 'Student';
            
            $user = User::create([
                'name'     => $name,
                'email'    => null,
                'password' => Hash::make(\Illuminate\Support\Str::random(16)),
                'role'     => 'student',
            ]);

            $studentIdCard = 'STU' . mt_rand(10000, 99999);
            while (Student::where('student_id_card', $studentIdCard)->exists()) {
                $studentIdCard = 'STU' . mt_rand(10000, 99999);
            }

            $student = Student::create([
                'user_id'            => $user->id,
                'student_id_card'    => $studentIdCard,
                'mobile'             => $mobile,
                'approval_status'    => 'approved',
                'profile_completion' => 0,
            ]);

            Notification::create([
                'type'    => 'new_student',
                'title'   => 'New Student Registration',
                'message' => $name . ' registered via Mobile OTP (' . $mobile . ')',
                'link'    => '/admin/students',
            ]);
        } else {
            $user = $student->user;
        }

        // Clear cache
        Cache::forget('otp_mobile_' . $mobile);
        if ($user) {
            Cache::forget('otp_student_' . $user->id);
        }

        $token = $user->createToken('student-token')->plainTextToken;

        return response()->json([
            'message' => 'OTP verification successful.',
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

    // ───────── POST /api/student/forgot-password ─────────

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'student_id_card' => 'required|string',
            'mobile'          => 'required|string',
            'password'        => 'required|string|min:8|confirmed',
        ]);

        $student = \App\Models\Student::where('student_id_card', $request->student_id_card)
            ->where('mobile', $request->mobile)
            ->first();

        if (!$student) {
            return response()->json([
                'message' => 'The provided Student ID Card Number and Mobile Number do not match our records.'
            ], 422);
        }

        $user = $student->user;
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Password reset successful. You can now login with your new password.'
        ]);
    }

    // ───────── Helper ─────────

    private function formatStudent(User $user, ?Student $student): array
    {
        return [
            'id'                 => $user->id,
            'student_id'         => $student?->id,
            'student_id_card'    => $student?->student_id_card,
            'name'               => $user->name,
            'email'              => $user->email,
            'mobile'             => $student?->mobile,
            'profile_completion' => $student?->profile_completion ?? 0,
            'approval_status'    => $student?->approval_status ?? 'approved',
            'role'               => $user->role,
        ];
    }
}
