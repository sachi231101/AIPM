<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = DB::table('settings')->get()->pluck('value', 'key');

        return response()->json([
            'data' => [
                'instituteName'              => $settings->get('institute_name', 'Aadya Institute'),
                'email'                      => $settings->get('contact_email', 'aadyainstitute2016@gmail.com'),
                'phone'                      => $settings->get('contact_phone', '+91 99641 94324'),
                'address'                    => $settings->get('address', '183, 2nd Floor, 1st Main Road, Ramamurthy Nagar, Bengaluru – 560016'),
                'website'                    => $settings->get('website', 'https://aadyainstitute.com'),
                'maxResumeSize'              => $settings->get('max_resume_size', '5'),
                'applicationDeadlineBuffer'  => $settings->get('application_deadline_buffer', '2'),
                'emailNotifications'         => filter_var($settings->get('email_notifications', '1'), FILTER_VALIDATE_BOOLEAN),
                'autoApproveCompanies'       => filter_var($settings->get('auto_approve_companies', '0'), FILTER_VALIDATE_BOOLEAN),
                'instituteLogo'              => $settings->get('institute_logo') ? \Illuminate\Support\Facades\Storage::url($settings->get('institute_logo')) : '/logo.png',
            ]
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $keys = [
            'institute_name'              => $request->instituteName,
            'contact_email'               => $request->email,
            'contact_phone'               => $request->phone,
            'address'                     => $request->address,
            'website'                     => $request->website,
            'max_resume_size'             => $request->maxResumeSize,
            'application_deadline_buffer' => $request->applicationDeadlineBuffer,
            'email_notifications'         => $request->emailNotifications ? '1' : '0',
            'auto_approve_companies'       => $request->autoApproveCompanies ? '1' : '0',
        ];

        foreach ($keys as $key => $value) {
            if ($value !== null) {
                DB::table('settings')->updateOrInsert(
                    ['key' => $key],
                    ['value' => $value, 'updated_at' => now(), 'created_at' => now()]
                );
            }
        }

        return response()->json(['message' => 'Settings saved successfully!']);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:png,jpg,jpeg,svg|max:2048',
        ]);

        $oldLogo = DB::table('settings')->where('key', 'institute_logo')->value('value');
        if ($oldLogo) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldLogo);
        }

        $path = $request->file('logo')->store('settings', 'public');

        DB::table('settings')->updateOrInsert(
            ['key' => 'institute_logo'],
            ['value' => $path, 'updated_at' => now(), 'created_at' => now()]
        );

        return response()->json([
            'message' => 'Logo uploaded successfully!',
            'logo_url' => \Illuminate\Support\Facades\Storage::url($path),
        ]);
    }
}
