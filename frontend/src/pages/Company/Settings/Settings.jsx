import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { companyService } from "../../../services/api";
import CompanyForgotPasswordModal from "../../../components/Company/CompanyForgotPasswordModal";

export default function CompanySettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please enter current password and new password.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      setSubmittingPassword(true);
      const res = await companyService.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      toast.success(res.data?.message || "Password updated successfully! 🔒 Please login with your new password.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      logout();
      navigate("/company/login");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to update password. Please check your current password.";
      toast.error(msg);
    } finally {
      setSubmittingPassword(false);
    }
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
                <div className="d-flex align-items-center justify-content-between">
                  <label className="form-label small fw-semibold text-muted mb-1">Current Password</label>
                  <button
                    type="button"
                    className="btn btn-link p-0 small text-decoration-none text-primary fw-medium border-0 bg-transparent mb-1"
                    style={{ fontSize: "0.78rem" }}
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot current password?
                  </button>
                </div>
                <div className="input-group">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="form-control"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <i className={`bi ${showCurrentPassword ? "bi-eye-slash text-muted" : "bi-eye text-muted"}`}></i>
                  </button>
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted">New Password</label>
                <div className="input-group">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-control"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <i className={`bi ${showNewPassword ? "bi-eye-slash text-muted" : "bi-eye text-muted"}`}></i>
                  </button>
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted">Confirm New Password</label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`bi ${showConfirmPassword ? "bi-eye-slash text-muted" : "bi-eye text-muted"}`}></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-end mt-3">
              <button
                type="submit"
                className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm"
                disabled={submittingPassword}
              >
                {submittingPassword ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Updating...</>
                ) : (
                  <><i className="bi bi-key-fill me-1"></i> Update Password</>
                )}
              </button>
            </div>
          </form>
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <CompanyForgotPasswordModal
          initialEmail={user?.email || ""}
          onClose={() => setShowForgotModal(false)}
          onSuccess={() => {
            setShowForgotModal(false);
            logout();
            navigate("/company/login");
          }}
        />
      )}
    </div>
  );
}
