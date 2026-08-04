import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";

export default function CompanyLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
      // Construct company user profile
      const companyUser = {
        id: "company_" + Date.now(),
        name: email.split("@")[0].toUpperCase() + " Corp",
        company_name: email.split("@")[0].toUpperCase() + " Corp",
        email: email,
        role: "company",
      };
      const token = "company_token_" + Date.now();

      login(companyUser, "company", token);
      toast.success("Welcome to Company Recruiter Portal! 🏢");
      navigate("/company/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: 460, width: "100%" }}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: 64, height: 64 }}
            >
              <i className="bi bi-buildings-fill fs-2"></i>
            </div>
            <h4 className="fw-bold text-dark mb-1">Company Recruiter Login</h4>
            <p className="text-muted small">Aadya Institution Placement Portal</p>
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
              <label className="form-label small fw-semibold text-muted">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-lock text-muted"></i></span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
            <Link to="/company/register" className="fw-semibold text-primary text-decoration-none">
              Register Company Account <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
