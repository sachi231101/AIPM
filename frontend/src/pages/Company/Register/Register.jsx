import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { companyService } from "../../../services/api";

export default function CompanyRegister() {
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "Technology & Software",
    hrName: "",
    hrEmail: "",
    hrMobile: "",
    website: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.hrName || !formData.hrEmail || !formData.password) {
      toast.error("Please fill in all required registration fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await companyService.register({
        company_name: formData.companyName,
        hr_name: formData.hrName,
        hr_email: formData.hrEmail,
        password: formData.password,
        industry: formData.industry,
        phone: formData.hrMobile,
        website: formData.website,
      });

      const { user, token } = res.data.data;
      login(user, "company", token);
      toast.success("Company registration successful! Please complete your profile to post jobs.");
      navigate("/company/profile");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Registration failed. Please check your inputs.");
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
              className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: 64, height: 64 }}
            >
              <i className="bi bi-person-plus-fill fs-2"></i>
            </div>
            <h4 className="fw-bold text-dark mb-1">Company Registration</h4>
            <p className="text-muted small">Register your company to hire top talent from Aadya Institution</p>
          </div>

          <form onSubmit={handleSubmit}>
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
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={formData.hrMobile}
                  onChange={(e) => handleChange("hrMobile", e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Company Website</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://acme.com"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-muted">Password <span className="text-danger">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
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
                <><span className="spinner-border spinner-border-sm me-2"></span>Registering...</>
              ) : (
                <><i className="bi bi-check-circle me-2"></i>Complete Registration</>
              )}
            </button>
          </form>

          <div className="text-center mt-3 pt-3 border-top">
            <p className="small text-muted mb-1">Already registered your company?</p>
            <Link to="/company/login" className="fw-semibold text-primary text-decoration-none">
              Login to Recruiter Portal <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
