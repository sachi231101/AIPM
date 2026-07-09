<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlacementJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    // ───────── GET /api/jobs ─────────

    public function index(Request $request): JsonResponse
    {
        $studentInstituteId = null;

        if ($request->user()) {
            $studentInstituteId = $request->user()->student?->institute_id;
        }

        $query = PlacementJob::with('company', 'institutes')
            ->published()
            ->when($studentInstituteId, fn ($q) =>
                $q->whereHas('institutes', fn ($qi) =>
                    $qi->where('institutes.id', $studentInstituteId)
                )
            );

        $jobs = $query->orderByDesc('created_at')->paginate(15);

        return response()->json([
            'data'       => $jobs->items(),
            'pagination' => [
                'total'        => $jobs->total(),
                'per_page'     => $jobs->perPage(),
                'current_page' => $jobs->currentPage(),
                'last_page'    => $jobs->lastPage(),
            ],
        ]);
    }

    // ───────── GET /api/jobs/{id} ─────────

    public function show(int $id): JsonResponse
    {
        $job = PlacementJob::with('company', 'institutes')->findOrFail($id);

        return response()->json(['data' => $job]);
    }
}
