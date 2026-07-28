<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|max:255',
            'phone'      => 'nullable|string|max:20',
            'queryType'  => 'required|string|max:255',
            'subject'    => 'required|string|max:255',
            'message'    => 'required|string|min:5',
        ]);

        $message = ContactMessage::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'phone'      => $request->phone,
            'query_type' => $request->queryType,
            'subject'    => $request->subject,
            'message'    => $request->message,
        ]);

        // Create admin notification
        Notification::create([
            'type'    => 'new_contact',
            'title'   => 'New Contact Message',
            'message' => 'New message from ' . $request->name . ': ' . $request->subject,
            'link'    => '/admin/messages',
        ]);

        return response()->json([
            'message' => "Your message has been sent! We'll get back to you within 24 hours.",
            'data'    => $message,
        ], 201);
    }
}
