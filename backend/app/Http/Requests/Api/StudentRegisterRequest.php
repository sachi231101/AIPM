<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StudentRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id_card'     => 'nullable|string|max:50|unique:students,student_id_card',
            'full_name'           => 'required|string|max:255',
            'mobile'              => 'required|string|max:15|unique:students,mobile',
            'password'            => 'required|string|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'student_id_card.unique'     => 'This student ID is already registered.',
            'mobile.unique'              => 'This mobile number is already registered.',
        ];
    }
}
