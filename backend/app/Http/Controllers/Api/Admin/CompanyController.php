<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function index(): JsonResponse
    {
        $companies = Company::with('jobs')->get();

        $data = $companies->map(function ($company) {
            $logoUrl = $company->logo_path ? Storage::url($company->logo_path) : 'https://placehold.co/100x100?text=' . urlencode($company->name);
            return [
                'id'       => $company->id,
                'logo'     => $logoUrl,
                'name'     => $company->name,
                'website'  => $company->website ?? '',
                'industry' => $company->industry ?? 'Technology',
                'hrName'   => $company->hr_name ?? '',
                'hrEmail'  => $company->hr_email,
                'phone'    => $company->phone ?? '',
                'openings' => $company->jobs->sum('openings'),
                'status'   => 'Active',
            ];
        });

        return response()->json(['data' => $data]);
    }
}
