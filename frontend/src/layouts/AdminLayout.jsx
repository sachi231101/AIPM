import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ProtectedLayout from "../components/ProtectedLayout/ProtectedLayout";
import { useAuth } from "../hooks/useAuth";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

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
              <button className="btn btn-light btn-sm position-relative">
                <i className="bi bi-bell"></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem" }}>3</span>
              </button>
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
