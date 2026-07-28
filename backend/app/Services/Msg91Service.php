<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Msg91Service
{
    protected string $authKey;
    protected string $senderId;
    protected string $templateId;
    protected string $flowUrl = 'https://control.msg91.com/api/v5/flow/';

    public function __construct()
    {
        $this->authKey    = (string) config('services.msg91.auth_key', env('MSG91_AUTH_KEY', ''));
        $this->senderId   = (string) config('services.msg91.sender_id', env('MSG91_SENDER_ID', 'EDIFI'));
        $this->templateId = (string) config('services.msg91.template_id', env('MSG91_TEMPLATE_ID', '100000000387960'));
    }

    /**
     * Send OTP SMS via MSG91 DLT Flow API.
     *
     * @param string $mobile
     * @param string $otp
     * @return bool
     */
    public function sendOtpSms(string $mobile, string $otp): bool
    {
        $formattedMobile = $this->formatMobileNumber($mobile);

        $payload = [
            'template_id' => $this->templateId,
            'sender'      => $this->senderId,
            'short_url'   => '0',
            'recipients'  => [
                [
                    'mobiles' => $formattedMobile,
                    'OTP'     => $otp,
                ]
            ]
        ];

        try {
            $response = Http::withHeaders([
                'authkey'      => $this->authKey,
                'Content-Type' => 'application/json',
            ])->timeout(10)->post($this->flowUrl, $payload);

            if ($response->successful()) {
                Log::info("MSG91 OTP SMS sent successfully to {$formattedMobile}. Response: " . $response->body());
                return true;
            }

            Log::error("MSG91 OTP SMS failed for {$formattedMobile}. Status: {$response->status()}, Response: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("MSG91 Service Exception for {$formattedMobile}: " . $e->getMessage());
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
