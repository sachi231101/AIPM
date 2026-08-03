import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";

export default function CompanySettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailOnApplication: true,
    emailOnStatusChange: true,
    weeklyDigest: false,
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please enter current password and new password.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    toast.success("Password updated successfully! 🔒");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out of Company Recruiter Portal.");
    navigate("/company/login");
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      {/* Header Banner */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Company Settings</h3>
        <p className="text-muted small mb-0">Manage security settings, notifications, and account credentials</p>
      </div>

      {/* Account Info Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
        <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center"
              style={{ width: 50, height: 50, fontSize: "1.2rem" }}
            >
              {(user?.company_name || user?.name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <h5 className="fw-bold text-dark mb-1">{user?.company_name || user?.name || "Company Recruiter"}</h5>
              <span className="text-muted small">{user?.email || "hr@company.com"}</span>
            </div>
          </div>

          <Link to="/company/profile" className="btn btn-outline-primary fw-semibold rounded-pill px-4">
            <i className="bi bi-pencil me-1"></i> Edit Profile Info
          </Link>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
        <div className="card-body p-4">
          <h5 className="fw-bold text-primary mb-3"><i className="bi bi-lock me-2"></i>Change Password</h5>

          <form onSubmit={handlePasswordSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="text-end mt-3">
              <button type="submit" className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notifications Settings Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
        <div className="card-body p-4">
          <h5 className="fw-bold text-primary mb-3"><i className="bi bi-bell me-2"></i>Notification Preferences</h5>

          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-center justify-content-between pb-2 border-bottom">
              <div>
                <div className="fw-semibold text-dark">Email Notification on New Applications</div>
                <small className="text-muted">Receive an instant email when a student applies for your jobs</small>
              </div>
              <div className="form-check form-switch fs-5">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={notifications.emailOnApplication}
                  onChange={(e) => setNotifications({ ...notifications, emailOnApplication: e.target.checked })}
                />
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between pb-2 border-bottom">
              <div>
                <div className="fw-semibold text-dark">Status Update Alerts</div>
                <small className="text-muted">Receive confirmation alerts when shortlisting or rejecting candidates</small>
              </div>
              <div className="form-check form-switch fs-5">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={notifications.emailOnStatusChange}
                  onChange={(e) => setNotifications({ ...notifications, emailOnStatusChange: e.target.checked })}
                />
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="fw-semibold text-dark">Weekly Placement Digest</div>
                <small className="text-muted">Receive weekly summary reports of application counts and active drives</small>
              </div>
              <div className="form-check form-switch fs-5">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={notifications.weeklyDigest}
                  onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-5 bg-white">
        <div className="card-body p-4 d-flex align-items-center justify-content-between">
          <div>
            <h6 className="fw-bold text-danger mb-1"><i className="bi bi-box-arrow-right me-2"></i>Log Out of Account</h6>
            <small className="text-muted">Securely end your recruiter session</small>
          </div>
          <button className="btn btn-danger fw-semibold px-4 rounded-3" onClick={handleLogout}>
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}
