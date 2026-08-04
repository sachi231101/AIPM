<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    public function index(): JsonResponse
    {
        $companies = Company::with('jobs')->latest()->get();

        $data = $companies->map(function ($company) {
            $logoUrl = $company->logo_path
                ? (str_starts_with($company->logo_path, 'data:') ? $company->logo_path : url('/storage/' . $company->logo_path))
                : 'https://ui-avatars.com/api/?name=' . urlencode($company->name) . '&background=0F4C81&color=fff&size=128';
            return [
                'id'       => $company->id,
                'logo'     => $logoUrl,
                'name'     => $company->name,
                'website'  => $company->website ?? '',
                'industry' => $company->industry ?? 'Technology & Software',
                'hrName'   => $company->hr_name ?? '',
                'hrEmail'  => $company->hr_email,
                'phone'    => $company->phone ?? '',
                'openings' => $company->jobs ? $company->jobs->sum('openings') : 0,
                'status'   => ucfirst($company->status ?? 'Active'),
                'created_at' => $company->created_at ? $company->created_at->format('Y-m-d') : null,
            ];
        });

        return response()->json(['data' => $data]);
    }
}
