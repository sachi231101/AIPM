import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { authService } from "../../../services/api";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await authService.adminLogin({
        email: data.email.trim(),
        password: data.password
      });
      const loggedInAdmin = response.data.user;
      const token = response.data.token;

      login(loggedInAdmin, loggedInAdmin.role, token);
      toast.success(loggedInAdmin.role === "admin" ? "Welcome, Admin! 🛡️" : "Welcome, Sub-admin! 🛡️");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Invalid Admin Email or Password.";
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: "linear-gradient(135deg, #0F4C81 0%, #1E3A5F 100%)" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-4">
            <div className="text-center mb-4">
              <div className="rounded-circle bg-white bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 72, height: 72 }}>
                <i className="bi bi-shield-lock-fill text-warning fs-2"></i>
              </div>
              <h4 className="text-white fw-bold">Admin Portal</h4>
              <p className="text-white-50 small">Secure access for Aadya Institution Placement Cell administrators</p>
            </div>

            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4 p-md-5">
                <h6 className="fw-bold mb-4 text-center">Sign In to Admin Panel</h6>

                <div className="alert alert-info border-0 small p-2 mb-4" role="alert">
                  <i className="bi bi-info-circle me-1"></i>
                  Demo: <strong>admin@aadyaplacements.com</strong> / <strong>Admin@1234</strong>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-3">
                    <label className="form-label small fw-medium">Admin Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-shield text-muted"></i></span>
                      <input
                        type="email"
                        {...register("email", { required: "Email is required" })}
                        className={`form-control border-start-0 ${errors.email ? "is-invalid" : ""}`}
                        placeholder="admin@aadyaplacements.com"
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-medium">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-muted"></i></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password", { required: "Password is required" })}
                        className={`form-control border-start-0 border-end-0 ${errors.password ? "is-invalid" : ""}`}
                        placeholder="••••••••"
                      />
                      <span 
                        className="input-group-text bg-white border-start-0" 
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: "pointer" }}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash text-muted" : "bi-eye text-muted"}`}></i>
                      </span>
                      {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-warning w-100 py-2 fw-bold" disabled={isSubmitting}>
                    {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Authenticating...</> : <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>}
                  </button>
                </form>

                <hr className="my-4" />
                <p className="text-center mb-0">
                  <Link to="/" className="text-muted small text-decoration-none"><i className="bi bi-arrow-left me-1"></i>Back to Home</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
