<?php

namespace App\Http\Requests\Api\Student;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mobile' => ['required', 'string', 'regex:/^[6-9][0-9]{9}$/'],
            'otp'    => ['required', 'string', 'digits:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'mobile.required' => 'Mobile number is required.',
            'mobile.regex'    => 'Please enter a valid 10-digit mobile number.',
            'otp.required'    => 'OTP is required.',
            'otp.digits'      => 'OTP must be a 6-digit number.',
        ];
    }
}
