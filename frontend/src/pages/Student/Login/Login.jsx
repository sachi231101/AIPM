import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { authService } from "../../../services/api";

export default function StudentLogin() {
  const [loginMode, setLoginMode] = useState("password"); // "password" | "otp"
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Password Form
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  // OTP Form State
  const [otpStep, setOtpStep] = useState("send"); // "send" | "verify"
  const [otpMobile, setOtpMobile] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [debugOtp, setDebugOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle Password Login (Phone Number / ID / Email + Password)
  const onPasswordSubmit = async (data) => {
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
      const errorMessage = err.response?.data?.message || "Invalid Phone Number / Password combination.";
      toast.error(errorMessage);
    }
  };

  // Handle Requesting OTP for Login (Mobile Number only)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpMobile.trim()) {
      toast.error("Please enter your Mobile Number");
      return;
    }

    setSendingOtp(true);
    try {
      const response = await authService.sendStudentOtp({
        mobile: otpMobile.trim()
      });
      toast.success(response.data.message || "OTP sent successfully!");
      setSentTo(response.data.sent_to || otpMobile);
      if (response.data.otp_debug) {
        setDebugOtp(response.data.otp_debug);
      }
      setOtpStep("verify");
      setResendTimer(60);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to send OTP. Please check your mobile number.";
      toast.error(errorMessage);
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle Verifying OTP for Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await authService.verifyStudentOtp({
        mobile: otpMobile.trim(),
        otp: otpCode.trim()
      });
      const loggedInUser = response.data.user;
      const token = response.data.token;

      login(loggedInUser, "student", token);
      toast.success(`Welcome back, ${loggedInUser.name}! 🎉`);
      navigate("/student/dashboard");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Invalid or expired OTP code.";
      toast.error(errorMessage);
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center auth-bg">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="text-center mb-4">
              <Link to="/" className="d-flex flex-column align-items-center gap-2 text-decoration-none">
                <img src="/logo.png" alt="Aadya Institute Logo" style={{ height: "52px", objectFit: "contain" }} />
                <span className="fw-bold fs-4 text-dark text-center">Aadya Institution Placement Cell</span>
              </Link>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-header bg-primary text-white text-center py-4 border-0">
                <h5 className="fw-bold mb-1">Student Portal Login</h5>
                <p className="small text-white-75 mb-0">Access your placement dashboard</p>
              </div>

              <div className="card-body p-4 p-md-5">
                {/* Login Method Tabs */}
                <div className="nav nav-pills nav-justified mb-4 bg-light p-1 rounded-3">
                  <button
                    type="button"
                    className={`nav-link py-2 small fw-semibold border-0 ${loginMode === "password" ? "active bg-primary text-white" : "text-muted"}`}
                    onClick={() => setLoginMode("password")}
                  >
                    <i className="bi bi-key me-2"></i>Password Login
                  </button>
                  <button
                    type="button"
                    className={`nav-link py-2 small fw-semibold border-0 ${loginMode === "otp" ? "active bg-primary text-white" : "text-muted"}`}
                    onClick={() => setLoginMode("otp")}
                  >
                    <i className="bi bi-phone me-2"></i>OTP Login
                  </button>
                </div>

                {/* MODE 1: PHONE NUMBER & PASSWORD LOGIN */}
                {loginMode === "password" && (
                  <form onSubmit={handleSubmit(onPasswordSubmit)}>
                    <div className="mb-3">
                      <label className="form-label fw-medium small">Phone Number / Student ID</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-telephone text-muted"></i>
                        </span>
                        <input
                          type="text"
                          {...register("identifier", { required: "Phone number or ID is required" })}
                          className={`form-control border-start-0 ps-0 ${errors.identifier ? "is-invalid" : ""}`}
                          placeholder="e.g. 9876543210 or STU1001"
                        />
                        {errors.identifier && <div className="invalid-feedback">{errors.identifier.message}</div>}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-medium small">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-lock text-muted"></i>
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          {...register("password", { required: "Password is required" })}
                          className={`form-control border-start-0 border-end-0 ps-0 ${errors.password ? "is-invalid" : ""}`}
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

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="rememberMe" />
                        <label className="form-check-label small" htmlFor="rememberMe">Remember me</label>
                      </div>
                      <Link to="/student/forgot-password" className="small text-primary text-decoration-none">Forgot password?</Link>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
                      ) : (
                        <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
                      )}
                    </button>
                  </form>
                )}

                {/* MODE 2: PHONE NUMBER & OTP LOGIN */}
                {loginMode === "otp" && (
                  <>
                    {otpStep === "send" && (
                      <form onSubmit={handleSendOtp}>
                        <div className="mb-4">
                          <label className="form-label fw-medium small">Registered Phone Number</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <i className="bi bi-telephone text-muted"></i>
                            </span>
                            <input
                              type="tel"
                              value={otpMobile}
                              onChange={(e) => setOtpMobile(e.target.value.replace(/\D/g, ""))}
                              className="form-control border-start-0 ps-0"
                              placeholder="e.g. 9876543210"
                              maxLength={15}
                              required
                              autoFocus
                            />
                          </div>
                          <div className="form-text small text-muted mt-1">
                            An OTP will be sent to your registered phone number to sign in.
                          </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={sendingOtp}>
                          {sendingOtp ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Sending OTP...</>
                          ) : (
                            <><i className="bi bi-send me-2"></i>Get OTP</>
                          )}
                        </button>
                      </form>
                    )}

                    {otpStep === "verify" && (
                      <form onSubmit={handleVerifyOtp}>
                        <div className="alert alert-info py-2 small mb-3">
                          <i className="bi bi-info-circle me-1"></i> OTP sent to <strong>{sentTo}</strong>
                          {debugOtp && (
                            <div className="mt-1 fw-bold text-dark">
                              Demo OTP: <span className="badge bg-primary fs-6 ms-1">{debugOtp}</span>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label fw-medium small mb-0">Enter 6-Digit OTP</label>
                            <button
                              type="button"
                              className="btn btn-link p-0 small text-decoration-none"
                              onClick={() => {
                                setOtpStep("send");
                                setOtpCode("");
                              }}
                            >
                              Change Number
                            </button>
                          </div>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <i className="bi bi-shield-check text-muted"></i>
                            </span>
                            <input
                              type="text"
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                              className="form-control border-start-0 ps-0 text-center fw-bold"
                              placeholder="123456"
                              style={{ letterSpacing: "4px", fontSize: "1.2rem" }}
                              required
                              autoFocus
                            />
                          </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mb-3" disabled={verifyingOtp}>
                          {verifyingOtp ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Verifying...</>
                          ) : (
                            <><i className="bi bi-check-circle me-2"></i>Verify & Login</>
                          )}
                        </button>

                        <div className="text-center">
                          {resendTimer > 0 ? (
                            <span className="small text-muted">
                              Resend OTP in <strong>{resendTimer}s</strong>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-link btn-sm text-decoration-none fw-medium"
                              onClick={handleSendOtp}
                              disabled={sendingOtp}
                            >
                              Didn't receive OTP? Resend
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </>
                )}

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
