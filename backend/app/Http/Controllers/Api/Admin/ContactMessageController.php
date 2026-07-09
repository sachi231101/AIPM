<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;

class ContactMessageController extends Controller
{
    public function index(): JsonResponse
    {
        $messages = ContactMessage::latest()->get();

        return response()->json([
            'data' => $messages,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'message' => 'Message deleted successfully.',
        ]);
    }
}
