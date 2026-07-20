<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ResumeUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxMb = \Illuminate\Support\Facades\DB::table('settings')->where('key', 'max_resume_size')->value('value') ?? '5';
        $maxKb = ((int) $maxMb) * 1024;

        return [
            'resume' => 'required|file|mimes:pdf|max:' . $maxKb,
        ];
    }

    public function messages(): array
    {
        $maxMb = \Illuminate\Support\Facades\DB::table('settings')->where('key', 'max_resume_size')->value('value') ?? '5';

        return [
            'resume.mimes' => 'Only PDF files are accepted.',
            'resume.max'   => "Resume must not exceed {$maxMb}MB.",
        ];
    }
}
