import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { companyService } from "../../../services/api";
import OtpInput from "../../../components/OtpInput/OtpInput";

export default function CompanyRegister() {
  const [step, setStep] = useState(1); // 1: Details form, 2: OTP Verification
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "Technology & Software",
    hrName: "",
    hrEmail: "",
    hrMobile: "",
    website: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Timer effect for Resend OTP button
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Step 1: Submit registration details & send Email OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.hrName || !formData.hrEmail || !formData.password || !formData.website) {
      toast.error("Please fill in all required registration fields (including Company Website).");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      const res = await companyService.registerSendOtp({
        company_name: formData.companyName,
        hr_name: formData.hrName,
        hr_email: formData.hrEmail,
        password: formData.password,
        industry: formData.industry,
        phone: formData.hrMobile ? `+91 ${formData.hrMobile}` : null,
        website: formData.website,
      });

      toast.success(res.data?.message || "Verification code sent to your HR email!");
      setStep(2);
      setResendTimer(30);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send verification OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & complete registration
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      const res = await companyService.registerVerifyOtp({
        email: formData.hrEmail,
        otp: otp,
      });

      const { user, token } = res.data.data;
      login(user, "company", token);
      toast.success("Registration & Email verification successful! Welcome to the portal. 🏢");
      navigate("/company/profile");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "OTP verification failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      setLoading(true);
      const res = await companyService.registerResendOtp({
        email: formData.hrEmail,
      });
      toast.success(res.data?.message || "New verification code sent to your email!");
      setResendTimer(30);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: 560, width: "100%" }}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3 ${
                step === 2 ? "bg-success bg-opacity-10 text-success" : "bg-primary bg-opacity-10 text-primary"
              }`}
              style={{ width: 64, height: 64 }}
            >
              <i className={`bi ${step === 2 ? "bi-shield-check" : "bi-person-plus-fill"} fs-2`}></i>
            </div>
            <h4 className="fw-bold text-dark mb-1">
              {step === 1 ? "Company Registration" : "2-Step Email Verification"}
            </h4>
            <p className="text-muted small mb-0">
              {step === 1
                ? "Register your company to hire top talent from Aadya & Edify Institution"
                : `We sent a 6-digit verification code to ${formData.hrEmail}`}
            </p>
          </div>

          {step === 1 ? (
            /* STEP 1: Registration Form */
            <form onSubmit={handleSendOtp}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Company Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Acme Tech Solutions"
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Industry Sector</label>
                  <select
                    className="form-select"
                    value={formData.industry}
                    onChange={(e) => handleChange("industry", e.target.value)}
                  >
                    <option value="Technology & Software">Technology & Software</option>
                    <option value="Finance & Banking">Finance & Banking</option>
                    <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Manufacturing & Core">Manufacturing & Core</option>
                    <option value="Consulting & Services">Consulting & Services</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">HR / Contact Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Priya Sharma"
                    value={formData.hrName}
                    onChange={(e) => handleChange("hrName", e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">HR Email Address <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="priya@acme.com"
                    value={formData.hrEmail}
                    onChange={(e) => handleChange("hrEmail", e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">HR Mobile Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light fw-bold text-muted">+91</span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="98765 43210"
                      maxLength={10}
                      value={formData.hrMobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        handleChange("hrMobile", val);
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Company Website <span className="text-danger">*</span></label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://acme.com"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted">Password <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash text-muted" : "bi-eye text-muted"}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 fw-bold shadow-sm mb-3"
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Sending OTP...</>
                ) : (
                  <><i className="bi bi-envelope-paper-fill me-2"></i>Send Verification OTP</>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: 2-Step OTP Verification Form */
            <form onSubmit={handleVerifyOtp}>
              <div className="text-center mb-4">
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill small mb-3">
                  <i className="bi bi-envelope-at me-1"></i> Check inbox: <strong>{formData.hrEmail}</strong>
                </span>

                <OtpInput
                  value={otp}
                  onChange={(val) => setOtp(val)}
                  length={6}
                  autoFocus={true}
                />

                <div className="d-flex align-items-center justify-content-between mt-3 px-2">
                  <button
                    type="button"
                    className="btn btn-link p-0 small text-decoration-none text-muted"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                    }}
                  >
                    <i className="bi bi-pencil me-1"></i>Change Email / Details
                  </button>

                  {resendTimer > 0 ? (
                    <span className="small text-muted">
                      Resend code in <strong>{resendTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-link p-0 small text-decoration-none fw-semibold text-primary"
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>Resend OTP Code
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success btn-lg w-100 fw-bold shadow-sm mb-3"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Verifying...</>
                ) : (
                  <><i className="bi bi-check-circle-fill me-2"></i>Verify OTP & Complete Registration</>
                )}
              </button>
            </form>
          )}

          <div className="text-center mt-3 pt-3 border-top">
            <p className="small text-muted mb-1">Already registered your company?</p>
            <Link to="/company/login" className="fw-semibold text-primary text-decoration-none d-block mb-2">
              Login to Recruiter Portal <i className="bi bi-arrow-right ms-1"></i>
            </Link>
            <Link to="/" className="text-muted small text-decoration-none">
              <i className="bi bi-arrow-left me-1"></i>Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
