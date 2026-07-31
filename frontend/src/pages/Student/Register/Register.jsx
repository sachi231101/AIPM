import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { addStudent } from "../../../utils/studentStorage";
import { authService } from "../../../services/api";
import OtpInput from "../../../components/OtpInput/OtpInput";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Form step: "details" | "otp"
  const [step, setStep] = useState("details");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP step state
  const [regMobile, setRegMobile] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { register, handleSubmit, watch, getValues, formState: { errors, isSubmitting } } = useForm();
  const password = watch("password");

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Step 1 Submit: Send OTP for registration
  const onDetailsSubmit = async (data) => {
    const mobile = data.phone.trim();
    const payload = {
      full_name: data.fullName.trim(),
      mobile: mobile,
      password: data.password,
      password_confirmation: data.confirmPassword,
    };

    setSendingOtp(true);
    try {
      const response = await authService.sendRegisterOtp(payload);
      toast.success(response.data.message || "OTP sent successfully!");
      setRegMobile(mobile);
      setSentTo(response.data.sent_to || mobile);
      setStep("otp");
      setResendTimer(60);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    const data = getValues();
    await onDetailsSubmit(data);
  };

  // Step 2 Submit: Verify OTP and finalize registration
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await authService.verifyRegisterOtp({
        mobile: regMobile,
        otp: otpCode.trim(),
      });

      const registeredUser = response.data.user;
      const token = response.data.token;

      // Save to localStorage compatibility store
      const data = getValues();

      const newStudent = {
        id: registeredUser.id,
        studentIdCardNumber: registeredUser.student_id_card,
        name: registeredUser.name,
        phone: registeredUser.mobile,
        password: data.password,
        status: "Active",
        email: "",
        profileCompletion: 0,
      };

      addStudent(newStudent);

      // Auto login student and navigate to dashboard
      login(registeredUser, "student", token);
      toast.success("Account registered and verified successfully! 🎉 Welcome!");
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
    <div className="min-vh-100 py-5 auth-bg d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="text-center mb-4">
              <Link to="/" className="d-flex flex-column align-items-center gap-2 text-decoration-none">
                <img src="/logo.png" alt="Aadya Institute Logo" style={{ height: "52px", objectFit: "contain" }} />
                <span className="fw-bold fs-4 text-dark text-center">Aadya Institution Placement Cell</span>
              </Link>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-header bg-primary text-white text-center py-4 border-0">
                <h5 className="fw-bold mb-1">Create Student Account</h5>
                <p className="small text-white-75 mb-0">
                  {step === "details" ? "Fill your details & confirm with OTP" : "Enter OTP to complete registration"}
                </p>
              </div>

              <div className="card-body p-4 p-md-5">
                {step === "details" && (
                  <form onSubmit={handleSubmit(onDetailsSubmit)}>
                    {/* Full Name */}
                    <div className="mb-3">
                      <label className="form-label fw-medium small">Full Name <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-person text-muted"></i></span>
                        <input 
                          type="text" 
                          {...register("fullName", { required: "Full name is required" })} 
                          className={`form-control border-start-0 ps-0 ${errors.fullName ? "is-invalid" : ""}`} 
                          placeholder="Enter your full name" 
                        />
                        {errors.fullName && <div className="invalid-feedback">{errors.fullName.message}</div>}
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="mb-3">
                      <label className="form-label fw-medium small">Mobile Number <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-telephone text-muted"></i></span>
                        <input 
                          type="tel" 
                          maxLength={10}
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                          }}
                          {...register("phone", { 
                            required: "Mobile number is required", 
                            pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit mobile number starting with 6-9" } 
                          })} 
                          className={`form-control border-start-0 ps-0 ${errors.phone ? "is-invalid" : ""}`} 
                          placeholder="Enter 10-digit mobile number" 
                        />
                        {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                      </div>
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                      <label className="form-label fw-medium small">Password <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-muted"></i></span>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          {...register("password", { 
                            required: "Password is required", 
                            minLength: { value: 8, message: "Password must be at least 8 characters" } 
                          })} 
                          className={`form-control border-start-0 border-end-0 ps-0 ${errors.password ? "is-invalid" : ""}`} 
                          placeholder="Enter password (min 8 characters)" 
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
                          placeholder="Re-enter your password" 
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

                    <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={isSubmitting || sendingOtp}>
                      {sendingOtp || isSubmitting ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Sending OTP...</>
                      ) : (
                        <><i className="bi bi-send-check me-2"></i>Register & Get OTP</>
                      )}
                    </button>
                  </form>
                )}

                {step === "otp" && (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="alert alert-info py-2 small mb-3">
                      <i className="bi bi-info-circle me-1"></i> OTP sent to mobile number <strong>{sentTo}</strong>
                    </div>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label fw-medium small mb-0">Enter 6-Digit Registration OTP</label>
                        <button
                          type="button"
                          className="btn btn-link p-0 small text-decoration-none"
                          onClick={() => {
                            setStep("details");
                            setOtpCode("");
                          }}
                        >
                          Edit Details
                        </button>
                      </div>
                      <OtpInput value={otpCode} onChange={setOtpCode} length={6} />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mb-3" disabled={verifyingOtp}>
                      {verifyingOtp ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Verifying & Registering...</>
                      ) : (
                        <><i className="bi bi-check-circle me-2"></i>Verify OTP & Complete Registration</>
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
                          onClick={handleResendOtp}
                          disabled={sendingOtp}
                        >
                          Didn't receive OTP? Resend
                        </button>
                      )}
                    </div>
                  </form>
                )}

                <hr className="my-4" />
                <p className="text-center text-muted small mb-0">
                  Already registered? <Link to="/student/login" className="text-primary fw-semibold text-decoration-none">Sign In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
