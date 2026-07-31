<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Msg91Service
{
    protected string $authKey;
    protected string $senderId;
    protected string $templateId;
    protected string $otpUrl  = 'https://control.msg91.com/api/v5/otp';
    protected string $flowUrl = 'https://control.msg91.com/api/v5/flow/';

    public function __construct()
    {
        $this->authKey    = (string) config('services.msg91.auth_key', env('MSG91_AUTH_KEY', ''));
        $this->senderId   = (string) config('services.msg91.sender_id', env('MSG91_SENDER_ID', 'EDIFI'));
        $this->templateId = (string) config('services.msg91.template_id', env('MSG91_TEMPLATE_ID', '6a688e2ee6d6938468046ae2'));
    }

    /**
     * Send OTP SMS via MSG91 API.
     * Primary: Dedicated OTP API (best for OTP delivery)
     * Fallback: Flow API
     *
     * @param string $mobile
     * @param string $otp
     * @return bool
     */
    public function sendOtpSms(string $mobile, string $otp): bool
    {
        if (empty($this->authKey)) {
            Log::error("MSG91 Error: MSG91_AUTH_KEY is empty in .env file! Please set MSG91_AUTH_KEY in backend/.env.");
            return false;
        }

        $formattedMobile = $this->formatMobileNumber($mobile);

        Log::info("MSG91: Sending OTP to {$formattedMobile} using Dedicated OTP API (primary)...");

        // Attempt 1: Try Dedicated OTP API (specifically designed for OTP delivery)
        $sent = $this->sendViaOtpApi($formattedMobile, $otp);

        if ($sent) {
            return true;
        }

        // Attempt 2: Fallback to Flow API
        Log::info("MSG91: OTP API did not return success, trying Flow API endpoint...");
        return $this->sendViaFlowApi($formattedMobile, $otp);
    }

    /**
     * Send via MSG91 Dedicated OTP API V5 (Primary method for OTP).
     * This API is specifically designed for OTP delivery and has better
     * delivery rates on Indian telecom networks.
     */
    protected function sendViaOtpApi(string $formattedMobile, string $otp): bool
    {
        $payload = [
            'template_id' => $this->templateId,
            'mobile'      => $formattedMobile,
            'sender'      => $this->senderId,
            'otp'         => $otp,
            'otp_expiry'  => 10,     // OTP validity in minutes
            'otp_length'  => 6,      // 6-digit OTP
        ];

        Log::info("MSG91 OTP API Request: " . json_encode([
            'url'         => $this->otpUrl,
            'template_id' => $this->templateId,
            'mobile'      => $formattedMobile,
            'sender'      => $this->senderId,
            'otp_length'  => 6,
        ]));

        try {
            $response = Http::withHeaders([
                'authkey'      => $this->authKey,
                'Content-Type' => 'application/json',
                'Accept'       => 'application/json',
            ])->timeout(15)->post($this->otpUrl, $payload);

            $body = $response->json();

            Log::info("MSG91 OTP API Response: HTTP {$response->status()} | Body: " . $response->body());

            if ($response->successful() && isset($body['type']) && $body['type'] === 'success') {
                Log::info("MSG91 OTP API: SMS sent successfully to {$formattedMobile}. Request ID: " . ($body['request_id'] ?? 'N/A'));
                return true;
            }

            Log::error("MSG91 OTP API failed for {$formattedMobile}. HTTP {$response->status()}: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("MSG91 OTP API Exception for {$formattedMobile}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send via MSG91 Flow API V5 (Fallback method).
     */
    protected function sendViaFlowApi(string $formattedMobile, string $otp): bool
    {
        $payload = [
            'template_id' => $this->templateId,
            'sender'      => $this->senderId,
            'short_url'   => '0',
            'recipients'  => [
                [
                    'mobiles' => $formattedMobile,
                    'OTP'     => $otp,
                    'otp'     => $otp,
                ]
            ]
        ];

        try {
            $response = Http::withHeaders([
                'authkey'      => $this->authKey,
                'Content-Type' => 'application/json',
                'Accept'       => 'application/json',
            ])->timeout(15)->post($this->flowUrl, $payload);

            $body = $response->json();

            if ($response->successful() && isset($body['type']) && $body['type'] === 'success') {
                Log::info("MSG91 Flow API: SMS sent successfully to {$formattedMobile}. Response: " . $response->body());
                return true;
            }

            Log::error("MSG91 Flow API failed for {$formattedMobile}. HTTP {$response->status()}: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("MSG91 Flow API Exception for {$formattedMobile}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Format mobile number to standard MSG91 recipient format (country code prefix).
     */
    protected function formatMobileNumber(string $mobile): string
    {
        // Strip out non-digit characters
        $digits = preg_replace('/\D/', '', $mobile);

        // Prepend 91 for 10-digit Indian numbers if not already present
        if (strlen($digits) === 10) {
            return '91' . $digits;
        }

        return $digits;
    }
}
