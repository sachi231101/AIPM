<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ApplicantsExport implements FromCollection, WithHeadings, WithStyles
{
    public function __construct(private Collection $applications) {}

    public function collection(): Collection
    {
        return $this->applications->map(function ($app) {
            $hasUploaded = filled($app->resume_path);
            $hasCreated  = \App\Models\StudentResume::where('student_id', $app->student_id)->exists();

            $createdUrl = $hasCreated
                ? url('created-resume/' . $app->student_id . ($app->resume_key ? '?key=' . $app->resume_key : ''))
                : 'N/A';

            return [
                $app->student->user->name,
                $app->student->institute?->name ?? $app->student->other_institute_name ?? 'N/A',
                $app->student->course ?? '-',
                $app->student->mobile,
                $app->student->user->email ?? '-',
                $hasUploaded ? url('storage/' . $app->resume_path) : 'N/A',
                $createdUrl,
                $app->applied_at?->format('d M Y'),
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Student Name',
            'Institute',
            'Course',
            'Phone',
            'Email',
            'Uploaded Resume Link',
            'App Created Resume Link',
            'Applied Date',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
