import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const menuItems = [
  { to: "/admin/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
  { to: "/admin/students", icon: "bi-people-fill", label: "Students" },
  { to: "/admin/companies", icon: "bi-buildings-fill", label: "Companies" },
  { to: "/admin/jobs", icon: "bi-briefcase-fill", label: "Jobs" },
  { to: "/admin/applications", icon: "bi-file-earmark-check-fill", label: "Applications" },
  { to: "/admin/email-logs", icon: "bi-envelope-check-fill", label: "Email Sent" },
  { to: "/admin/messages", icon: "bi-chat-dots-fill", label: "Messages" },
  { to: "/admin/settings", icon: "bi-gear-fill", label: "Settings" },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onCloseMobile?.();
    logout();
    navigate("/admin/login");
  };

  const handleNavClick = () => {
    onCloseMobile?.();
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (role === "admin") return true;
    if (role === "subadmin" && user) {
      const perms = user.permissions || {};
      if (item.to === "/admin/dashboard") return true;
      if (item.to === "/admin/institutes") return !!perms.institutes;
      if (item.to === "/admin/students") return !!perms.students;
      if (
        item.to === "/admin/companies" ||
        item.to === "/admin/jobs" ||
        item.to === "/admin/applications" ||
        item.to === "/admin/email-logs"
      ) {
        return !!perms.jobs;
      }
      if (item.to === "/admin/settings") return !!perms.settings;
      if (item.to === "/admin/messages" || item.to === "/admin/contact-messages") return true;
    }
    return false;
  });

  return (
    <>
      {/* Translucent Backdrop on Mobile */}
      {mobileOpen && (
        <div className="sidebar-backdrop d-lg-none" onClick={onCloseMobile}></div>
      )}

      <aside className={`apms-sidebar d-flex flex-column ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand d-flex align-items-center justify-content-between px-3 py-3">
          {(!collapsed || mobileOpen) && (
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-mortarboard-fill text-warning fs-5"></i>
              <span className="fw-bold text-white small">Aadya Placement Cell</span>
            </div>
          )}

          {/* Desktop Toggle Button */}
          <button className="btn btn-sm btn-link text-white p-0 ms-auto d-none d-lg-block" onClick={onToggle} aria-label="Toggle sidebar">
            <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"} fs-5`}></i>
          </button>

          {/* Mobile Close Button */}
          <button className="btn btn-sm btn-link text-white p-0 ms-auto d-lg-none" onClick={onCloseMobile} aria-label="Close sidebar">
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <hr className="border-secondary my-0" />

        {/* Nav Items */}
        <nav className="flex-grow-1 py-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `sidebar-link d-flex align-items-center gap-3 px-3 py-2 text-decoration-none ${isActive ? "active" : ""}`
              }
              title={collapsed && !mobileOpen ? item.label : ""}
            >
              <i className={`bi ${item.icon} sidebar-icon`}></i>
              {(!collapsed || mobileOpen) && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <hr className="border-secondary my-0" />

        {/* Back to Home & Logout Actions */}
        <div className="px-3 py-3 d-flex flex-column gap-2">
          <Link
            to="/"
            onClick={handleNavClick}
            className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
            title={collapsed && !mobileOpen ? "Go to Main Website" : ""}
          >
            <i className="bi bi-house-door"></i>
            {(!collapsed || mobileOpen) && "Back to Home"}
          </Link>
          <button
            className="btn btn-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            {(!collapsed || mobileOpen) && "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
