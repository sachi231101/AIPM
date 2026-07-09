<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StudentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'email'        => "nullable|email|unique:users,email,{$userId}",
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
            'linkedin'      => 'nullable|url|max:500',
            'github'        => 'nullable|url|max:500',
            'portfolio'     => 'nullable|url|max:500',
        ];
    }
}
