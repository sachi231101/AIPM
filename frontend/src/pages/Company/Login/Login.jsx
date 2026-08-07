import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { companyService } from "../../../services/api";
import CompanyForgotPasswordModal from "../../../components/Company/CompanyForgotPasswordModal";

export default function CompanyLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email address and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await companyService.login({ email, password });
      const { user, token } = res.data.data;

      login(user, "company", token);
      toast.success("Welcome to Company Recruiter Portal! 🏢");
      navigate("/company/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: 460, width: "100%" }}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <Link to="/" className="text-decoration-none">
              <div className="d-inline-flex align-items-center gap-3 mb-3">
                <img src="/aadya-logo.png" alt="Aadya Institute Logo" style={{ height: "44px", objectFit: "contain" }} />
                <span className="text-muted opacity-50 fs-4">|</span>
                <img src="/edify-logo.png" alt="Edify Institute Logo" style={{ height: "44px", objectFit: "contain" }} />
              </div>
              <h4 className="fw-bold text-dark mb-1">Company Recruiter Login</h4>
              <p className="text-muted small mb-0">Aadya & Edify Institution Placement Portal</p>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Work / HR Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-envelope text-muted"></i></span>
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

            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between">
                <label className="form-label small fw-semibold text-muted mb-1">Password</label>
                <button
                  type="button"
                  className="btn btn-link p-0 small text-decoration-none text-primary fw-medium border-0 bg-transparent mb-1"
                  style={{ fontSize: "0.8rem" }}
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-lock text-muted"></i></span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash text-muted" : "bi-eye text-muted"}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 fw-bold shadow-sm mb-3"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Logging in...</>
              ) : (
                <><i className="bi bi-box-arrow-in-right me-2"></i>Login to Dashboard</>
              )}
            </button>
          </form>

          <div className="text-center mt-3 pt-3 border-top">
            <p className="small text-muted mb-1">New company looking to hire students?</p>
            <Link to="/company/register" className="fw-semibold text-primary text-decoration-none d-block mb-2">
              Register Company Account <i className="bi bi-arrow-right ms-1"></i>
            </Link>
            <Link to="/" className="text-muted small text-decoration-none">
              <i className="bi bi-arrow-left me-1"></i>Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <CompanyForgotPasswordModal
          initialEmail={email}
          onClose={() => setShowForgotModal(false)}
          onSuccess={() => setShowForgotModal(false)}
        />
      )}
    </div>
  );
}
