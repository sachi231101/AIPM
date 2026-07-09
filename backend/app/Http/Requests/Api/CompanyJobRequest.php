<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CompanyJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name'=> 'required|string|max:255',
            'hr_name'     => 'required|string|max:255',
            'hr_email'    => 'required|email|max:255',
            'phone'       => 'nullable|string|max:20',
            'website'     => 'nullable|url',
            'industry'    => 'nullable|string|max:100',
            'logo'        => 'nullable|file|mimes:jpg,jpeg,png,svg,webp|max:2048',

            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'eligibility' => 'nullable|string',
            'skills'      => 'nullable|array',
            'skills.*'    => 'string|max:100',
            'experience'  => 'nullable|string|max:100',
            'salary'      => 'nullable|string|max:100',
            'location'    => 'nullable|string|max:255',
            'openings'    => 'nullable|integer|min:1',
            'last_date'   => 'required|date|after:today',
        ];
    }

    public function messages(): array
    {
        return [
            'last_date.after' => 'Last date must be a future date.',
        ];
    }
}
