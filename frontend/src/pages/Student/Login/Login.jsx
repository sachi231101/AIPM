import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { authService } from "../../../services/api";

export default function StudentLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await authService.studentLogin({
        identifier: data.identifier.trim(),
        password: data.password
      });
      const loggedInUser = response.data.user;
      const token = response.data.token;

      login(loggedInUser, "student", token);
      toast.success(`Welcome back, ${loggedInUser.name}! 🎉`);
      navigate("/student/dashboard");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Invalid Student ID Card Number / Email or Password";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center auth-bg">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="text-center mb-4">
              <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none">
                <img src="/logo.png" alt="Aadya Institute Logo" style={{ height: "48px", objectFit: "contain" }} />
                <span className="fw-bold fs-4 text-dark ms-1">Aadya Placements</span>
              </Link>
            </div>
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-header bg-primary text-white text-center py-4 border-0">
                <h5 className="fw-bold mb-1">Student Login</h5>
                <p className="small text-white-75 mb-0">Access your placement dashboard</p>
              </div>
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-3">
                    <label className="form-label fw-medium small">Student ID / Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-person-badge text-muted"></i></span>
                      <input
                        type="text"
                        {...register("identifier", { required: "ID or Email is required" })}
                        className={`form-control border-start-0 ps-0 ${errors.identifier ? "is-invalid" : ""}`}
                        placeholder="e.g. STU1001 or student@email.com"
                      />
                      {errors.identifier && <div className="invalid-feedback">{errors.identifier.message}</div>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium small">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-muted"></i></span>
                      <input
                        type="password"
                        {...register("password", { required: "Password is required" })}
                        className={`form-control border-start-0 ps-0 ${errors.password ? "is-invalid" : ""}`}
                        placeholder="••••••••"
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id="rememberMe" />
                      <label className="form-check-label small" htmlFor="rememberMe">Remember me</label>
                    </div>
                    <a href="#" className="small text-primary text-decoration-none">Forgot password?</a>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={isSubmitting}>
                    {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</> : <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>}
                  </button>
                </form>

                <hr className="my-4" />
                <p className="text-center text-muted small mb-0">
                  Don't have an account?{" "}
                  <Link to="/student/register" className="text-primary fw-semibold text-decoration-none">Register here</Link>
                </p>
              </div>
            </div>
            <p className="text-center text-muted small mt-3">
              Are you an admin? <Link to="/admin/login" className="text-primary text-decoration-none">Admin Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
