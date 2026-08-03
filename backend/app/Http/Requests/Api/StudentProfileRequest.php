<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;
        $email  = $this->input('email');

        return [
            // Only enforce uniqueness when an actual non-empty email is submitted.
            // NULL / empty emails are shared by many OTP-registered students, so
            // running unique:users,email on NULL would always produce false conflicts.
            'email' => array_filter([
                'nullable',
                'email',
                filled($email)
                    ? Rule::unique('users', 'email')->ignore($userId)
                    : null,
            ]),
            'dob'          => 'nullable|date|before:today',
            'gender'       => 'nullable|in:Male,Female,Other',
            'address'      => 'nullable|string|max:500',
            'course'       => 'nullable|string|max:255',
            'branch'       => 'nullable|string|max:255',
            'batch'        => 'nullable|string|max:10',
            'passing_year' => 'nullable|digits:4|integer|min:2000|max:2035',
            'cgpa'         => 'nullable|numeric|min:0|max:10',
            'skills'        => 'nullable|array',
            'skills.*'      => 'string|max:100',
            'soft_skills'   => 'nullable|array',
            'soft_skills.*' => 'string|max:100',
            'linkedin'      => ['nullable', 'string', 'max:500', 'regex:/^(https?:\/\/|www\.)\S+/i'],
            'github'        => ['nullable', 'string', 'max:500', 'regex:/^(https?:\/\/|www\.)\S+/i'],
            'portfolio'     => ['nullable', 'string', 'max:500', 'regex:/^(https?:\/\/|www\.)\S+/i'],
            'profile_photo' => 'nullable|string',
        ];
    }
}
