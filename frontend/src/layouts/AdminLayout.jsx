import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ProtectedLayout from "../components/ProtectedLayout/ProtectedLayout";
import { useAuth } from "../hooks/useAuth";
import { notificationService } from "../services/api";

const typeIcons = {
  new_job: "bi-briefcase-fill text-primary",
  new_application: "bi-file-earmark-check-fill text-success",
  new_contact: "bi-chat-dots-fill text-info",
  new_student: "bi-person-plus-fill text-warning",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.data?.data || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, []);

  // Initial fetch + polling every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark single notification as read + navigate
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await notificationService.markAsRead(notification.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
      }
      setDropdownOpen(false);
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="admin-layout d-flex" style={{ minHeight: "100vh" }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className="admin-content flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
          {/* Top bar */}
          <header className="admin-topbar d-flex align-items-center justify-content-between px-4 py-2">
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-light d-lg-none"
                onClick={() => setCollapsed(!collapsed)}
              >
                <i className="bi bi-list fs-5"></i>
              </button>
              <span className="text-muted small">Welcome back, <strong>{user?.name}</strong></span>
            </div>
            <div className="d-flex align-items-center gap-3">
              {/* Notification Bell + Dropdown */}
              <div className="position-relative" ref={dropdownRef}>
                <button
                  className="btn btn-light btn-sm position-relative"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  id="notificationBell"
                >
                  <i className="bi bi-bell"></i>
                  {unreadCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "0.6rem" }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Panel */}
                {dropdownOpen && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border"
                    style={{ width: 360, maxHeight: 440, zIndex: 1050 }}
                  >
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                      <h6 className="mb-0 fw-bold small">
                        <i className="bi bi-bell-fill text-primary me-1"></i>
                        Notifications
                      </h6>
                      {unreadCount > 0 && (
                        <button
                          className="btn btn-link btn-sm text-primary text-decoration-none p-0"
                          onClick={handleMarkAllAsRead}
                          disabled={loading}
                          style={{ fontSize: "0.75rem" }}
                        >
                          {loading ? "Marking..." : "Mark all as read"}
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="overflow-auto" style={{ maxHeight: 360 }}>
                      {notifications.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <i className="bi bi-bell-slash" style={{ fontSize: "2rem" }}></i>
                          <p className="small mt-2 mb-0">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`d-flex align-items-start gap-2 px-3 py-2 border-bottom notification-item ${
                              !n.is_read ? "bg-primary bg-opacity-10" : ""
                            }`}
                            style={{ cursor: "pointer", transition: "background 0.2s" }}
                            onClick={() => handleNotificationClick(n)}
                            onMouseEnter={(e) => {
                              if (n.is_read) e.currentTarget.style.background = "#f8f9fa";
                            }}
                            onMouseLeave={(e) => {
                              if (n.is_read) e.currentTarget.style.background = "";
                            }}
                          >
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                              style={{
                                width: 32,
                                height: 32,
                                background: !n.is_read
                                  ? "rgba(13,110,253,0.15)"
                                  : "rgba(108,117,125,0.1)",
                              }}
                            >
                              <i
                                className={`bi ${typeIcons[n.type] || "bi-bell text-secondary"}`}
                                style={{ fontSize: "0.85rem" }}
                              ></i>
                            </div>
                            <div className="flex-grow-1 min-w-0">
                              <p
                                className={`mb-0 small ${!n.is_read ? "fw-semibold" : "text-muted"}`}
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {n.title}
                              </p>
                              <p
                                className="mb-0 text-muted"
                                style={{
                                  fontSize: "0.75rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {n.message}
                              </p>
                              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                                {timeAgo(n.created_at)}
                              </small>
                            </div>
                            {!n.is_read && (
                              <span
                                className="bg-primary rounded-circle flex-shrink-0 mt-2"
                                style={{ width: 8, height: 8 }}
                              ></span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, fontSize: 14 }}
                >
                  {user?.name?.[0] || "A"}
                </div>
                <small className="fw-medium d-none d-md-inline">{user?.name || "Admin"}</small>
              </div>
            </div>
          </header>
          <main className="flex-grow-1 p-4 bg-light overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
