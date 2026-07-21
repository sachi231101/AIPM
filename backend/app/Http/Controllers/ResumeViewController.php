<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentResume;
use Illuminate\Http\Request;

class ResumeViewController extends Controller
{
    /**
     * Render the student's app-created resume as a clean HTML/printable page.
     */
    public function show(int $studentId, Request $request)
    {
        $student = Student::with(['user', 'institute'])->findOrFail($studentId);

        $query = StudentResume::where('student_id', $studentId);

        if ($request->filled('key')) {
            $query->where('resume_key', $request->key);
        } else {
            $query->orderByDesc('is_default')->orderByDesc('updated_at');
        }

        $resume = $query->first();

        if (!$resume) {
            abort(404, 'No app-created resume found for this student.');
        }

        $content = $resume->content ?? [];

        return view('resume-template', [
            'student' => $student,
            'resume'  => $resume,
            'content' => $content,
        ]);
    }
}
