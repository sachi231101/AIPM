<?php

namespace App\Services;

use App\Models\Otp;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class OtpService
{
    protected Msg91Service $msg91Service;

    public function __construct(Msg91Service $msg91Service)
    {
        $this->msg91Service = $msg91Service;
    }

    /**
     * Generate & send a 6-digit OTP to the mobile number.
     *
     * @param string $mobile
     * @return array
     * @throws \Exception
     */
    public function sendOtp(string $mobile): array
    {
        $mobile = trim($mobile);

        // 1. Rate Limit: Check if OTP was sent in the last 30 seconds
        $recentOtp = Otp::where('mobile', $mobile)
            ->where('created_at', '>=', now()->subSeconds(30))
            ->first();

        if ($recentOtp) {
            $secondsLeft = 30 - now()->diffInSeconds($recentOtp->created_at);
            throw new \Exception("Please wait {$secondsLeft} seconds before requesting a new OTP.", 429);
        }

        // 2. Rate Limit: Maximum 5 OTP requests per hour
        $hourlyCount = Otp::where('mobile', $mobile)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($hourlyCount >= 5) {
            throw new \Exception("Maximum OTP requests limit (5 per hour) reached. Please try again later.", 429);
        }

        // 3. Invalidate previous unverified OTP records for this mobile number
        Otp::where('mobile', $mobile)
            ->where('verified', false)
            ->delete();

        // 4. Generate secure random 6-digit OTP
        $rawOtp = sprintf('%06d', random_int(100000, 999999));

        // 5. Store OTP in database (hashed)
        Otp::create([
            'mobile'     => $mobile,
            'otp'        => Hash::make($rawOtp),
            'expires_at' => now()->addMinutes(10),
            'attempts'   => 0,
            'verified'   => false,
        ]);

        // 6. Send OTP via MSG91
        $sent = $this->msg91Service->sendOtpSms($mobile, $rawOtp);

        if (!$sent) {
            Log::warning("MSG91 failed to send OTP to {$mobile}, but OTP record was saved.");
        }

        return [
            'success' => true,
            'message' => "OTP sent successfully to mobile number {$mobile}.",
            'sent_to' => $mobile,
        ];
    }

    /**
     * Resend a new OTP enforcing rate limit & invalidating previous OTP.
     *
     * @param string $mobile
     * @return array
     * @throws \Exception
     */
    public function resendOtp(string $mobile): array
    {
        return $this->sendOtp($mobile);
    }

    /**
     * Verify only the OTP code (hash check, expiry, attempts).
     * Does NOT look up or create any student account.
     * Used by the registration flow where the student doesn't exist yet.
     *
     * @throws \Exception
     */
    public function verifyOtpCode(string $mobile, string $inputOtp): void
    {
        $mobile   = trim($mobile);
        $inputOtp = trim($inputOtp);

        // Clean up expired OTPs for clean state
        Otp::where('expires_at', '<', now())->delete();

        // Find latest unverified OTP record for this mobile
        $otpRecord = Otp::where('mobile', $mobile)
            ->where('verified', false)
            ->latest()
            ->first();

        if (!$otpRecord) {
            throw new \Exception("Invalid or expired OTP. Please request a new OTP.", 422);
        }

        // Check expiration
        if ($otpRecord->isExpired()) {
            $otpRecord->delete();
            throw new \Exception("OTP has expired. Please request a new OTP.", 422);
        }

        // Check verification attempts limit (Max 5 attempts per OTP)
        if ($otpRecord->attempts >= 5) {
            $otpRecord->delete();
            throw new \Exception("Too many invalid attempts. This OTP has been invalidated. Please request a new OTP.", 422);
        }

        // Verify OTP code match
        if (!Hash::check($inputOtp, $otpRecord->otp)) {
            $otpRecord->increment('attempts');
            $remainingAttempts = 5 - $otpRecord->attempts;

            if ($remainingAttempts <= 0) {
                $otpRecord->delete();
                throw new \Exception("Invalid OTP code. Maximum attempts reached. Please request a new OTP.", 422);
            }

            throw new \Exception("Invalid OTP code. You have {$remainingAttempts} attempt(s) remaining.", 422);
        }

        // OTP is VALID — mark verified & delete
        $otpRecord->update(['verified' => true]);
        Otp::where('mobile', $mobile)->delete();
    }

    /**
     * Verify OTP code and authenticate an existing (registered) student.
     *
     * @param string $mobile
     * @param string $inputOtp
     * @return array
     * @throws \Exception
     */
    public function verifyOtp(string $mobile, string $inputOtp): array
    {
        // Reuse the shared OTP-check logic
        $this->verifyOtpCode($mobile, $inputOtp);
        // Authenticate the registered student
        $student = Student::where('mobile', $mobile)->first();

        // Unregistered mobile — the guard in sendOtp should have caught this,
        // but we enforce it here too so verifyOtp cannot be called directly to
        // create phantom accounts.
        if (!$student) {
            throw new \Exception('This mobile number is not registered. Please register first.', 404);
        }

        $user = $student->user;

        // Ensure user account exists (edge case: student record without a user)
        if (!$user) {
            throw new \Exception('Account error. Please contact support.', 500);
        }

        $token = $user->createToken('student-token')->plainTextToken;

        return [
            'success' => true,
            'message' => 'OTP verified successfully.',
            'token'   => $token,
            'user'    => [
                'id'                 => $user->id,
                'student_id'         => $student->id,
                'student_id_card'    => $student->student_id_card,
                'name'               => $user->name,
                'email'              => $user->email,
                'mobile'             => $student->mobile,
                'profile_completion' => $student->profile_completion ?? 0,
                'approval_status'    => $student->approval_status ?? 'approved',
                'role'               => $user->role,
            ]
        ];
    }
}
