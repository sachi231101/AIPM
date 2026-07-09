<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    // ───────── GET /api/admin/notifications ─────────

    public function index(): JsonResponse
    {
        $notifications = Notification::latest()->paginate(20);
        $unreadCount   = Notification::unread()->count();

        return response()->json([
            'data'         => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    // ───────── PUT /api/admin/notifications/{id}/read ─────────

    public function markAsRead(int $id): JsonResponse
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json([
            'message'      => 'Notification marked as read.',
            'unread_count' => Notification::unread()->count(),
        ]);
    }

    // ───────── PUT /api/admin/notifications/read-all ─────────

    public function markAllAsRead(): JsonResponse
    {
        Notification::unread()->update(['is_read' => true]);

        return response()->json([
            'message'      => 'All notifications marked as read.',
            'unread_count' => 0,
        ]);
    }
}
