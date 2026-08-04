import { useState } from "react";
import { toast } from "react-toastify";
import { companyService } from "../../services/api";

export default function CompanyForgotPasswordModal({ initialEmail = "", onClose, onSuccess }) {
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered HR Email Address.");
      return;
    }
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await companyService.forgotPassword({
        email: email.trim(),
        new_password: newPassword,
      });

      toast.success(res.data?.message || "Password reset successfully! 🔑");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reset password. Please check registered email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" style={{ zIndex: 1065 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-4">
          <div className="modal-header bg-primary text-white py-3 px-4">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-key-fill"></i> Reset Forgotten Password
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 bg-light">
              <div className="alert alert-info py-2 px-3 mb-3 small d-flex align-items-center gap-2 rounded-3 border-0 bg-info bg-opacity-10 text-dark">
                <i className="bi bi-info-circle-fill text-info fs-5"></i>
                <span>Enter your registered HR email address and set your new password below.</span>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Registered HR Email Address <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><i className="bi bi-envelope text-muted"></i></span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="hr@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">New Password <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><i className="bi bi-lock text-muted"></i></span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold text-dark">Confirm New Password <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><i className="bi bi-shield-lock text-muted"></i></span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer bg-white py-3 px-4 d-flex justify-content-between">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Resetting...</>
                ) : (
                  <><i className="bi bi-check-circle-fill me-1"></i> Reset Password</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
