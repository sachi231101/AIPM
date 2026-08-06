import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../../services/api";

export default function ForgotPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  
  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      const response = await authService.studentForgotPassword({
        student_id_card: data.student_id_card.trim(),
        mobile: data.mobile.trim(),
        password: data.password,
        password_confirmation: data.confirmPassword
      });

      toast.success(response.data.message || "Password reset successful! 🎉");
      navigate("/student/login");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Verification failed. Please check your details.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-vh-100 py-5 auth-bg d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="text-center mb-4">
              <Link to="/" className="d-flex flex-column align-items-center gap-2 text-decoration-none">
                <div className="d-flex align-items-center gap-3">
                  <img src="/aadya-logo.png" alt="Aadya Institute Logo" style={{ height: "44px", objectFit: "contain" }} />
                  <span className="text-muted opacity-50 fw-light fs-4">|</span>
                  <img src="/edify-logo.png" alt="Edify Institute Logo" style={{ height: "44px", objectFit: "contain" }} />
                </div>
                <span className="fw-bold fs-5 text-dark mt-1">Aadya & Edify Placements</span>
              </Link>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-header bg-primary text-white text-center py-4 border-0">
                <h5 className="fw-bold mb-1">Reset Password</h5>
                <p className="small text-white-75 mb-0">Verify your Student ID and mobile number to reset your password</p>
              </div>
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit(onSubmit)}>
                  
                  {/* Student ID Card Number */}
                  <div className="mb-3">
                    <label className="form-label fw-medium small">Student ID Card Number <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-card-text text-muted"></i></span>
                      <input 
                        type="text" 
                        {...register("student_id_card", { required: "Student ID Card Number is required" })} 
                        className={`form-control border-start-0 ps-0 ${errors.student_id_card ? "is-invalid" : ""}`} 
                        placeholder="Enter Student ID Card number" 
                      />
                      {errors.student_id_card && <div className="invalid-feedback">{errors.student_id_card.message}</div>}
                    </div>
                  </div>

                  {/* Registered Mobile Number */}
                  <div className="mb-3">
                    <label className="form-label fw-medium small">Registered Mobile Number <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-telephone text-muted"></i></span>
                      <input 
                        type="tel" 
                        maxLength={10}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                        }}
                        {...register("mobile", { 
                          required: "Mobile number is required", 
                          pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit mobile number starting with 6-9" } 
                        })} 
                        className={`form-control border-start-0 ps-0 ${errors.mobile ? "is-invalid" : ""}`} 
                        placeholder="Enter 10-digit mobile number" 
                      />
                      {errors.mobile && <div className="invalid-feedback">{errors.mobile.message}</div>}
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="mb-3">
                    <label className="form-label fw-medium small">New Password <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-muted"></i></span>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        {...register("password", { 
                          required: "Password is required", 
                          minLength: { value: 8, message: "Password must be at least 8 characters" } 
                        })} 
                        className={`form-control border-start-0 border-end-0 ps-0 ${errors.password ? "is-invalid" : ""}`} 
                        placeholder="Enter new password (min 8 characters)" 
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

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="form-label fw-medium small">Confirm Password <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock-fill text-muted"></i></span>
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        {...register("confirmPassword", { 
                          required: "Please confirm your password", 
                          validate: (v) => v === password || "Passwords do not match" 
                        })} 
                        className={`form-control border-start-0 border-end-0 ps-0 ${errors.confirmPassword ? "is-invalid" : ""}`} 
                        placeholder="Re-enter new password" 
                      />
                      <span 
                        className="input-group-text bg-white border-start-0" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ cursor: "pointer" }}
                      >
                        <i className={`bi ${showConfirmPassword ? "bi-eye-slash text-muted" : "bi-eye text-muted"}`}></i>
                      </span>
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={isSubmitting}>
                    {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Resetting Password...</> : <><i className="bi bi-shield-lock-fill me-2"></i>Reset Password</>}
                  </button>
                </form>

                <hr className="my-4" />
                <p className="text-center text-muted small mb-0">
                  Remember your password? <Link to="/student/login" className="text-primary fw-semibold text-decoration-none">Sign In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
