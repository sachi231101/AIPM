import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { companyService } from "../../../services/api";

export default function CompanyProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("apms_company_profile");
    if (saved) return JSON.parse(saved);
    return {
      companyName: user?.company_name || user?.name || "",
      industry: "Technology & Software",
      website: "",
      hrName: user?.hr_name || "",
      hrEmail: user?.email || "",
      hrMobile: "",
      officeAddress: "",
      city: "",
      state: "",
      aboutCompany: "",
      logo: "",
    };
  });

  const getFullLogoUrl = (url) => {
    if (!url) return "";
    if (typeof url === "string" && url.includes("/storage/")) {
      return `/storage/${url.split("/storage/")[1]}`;
    }
    if (url.startsWith("data:") || url.startsWith("http") || url.startsWith("/")) return url;
    return `/storage/${url.replace(/^\//, "")}`;
  };

  useEffect(() => {
    companyService.getProfile()
      .then((res) => {
        if (res.data?.data) {
          const c = res.data.data;
          const logoVal = c.logo_url || c.logo_path || "";
          setProfile((prev) => ({
            ...prev,
            companyName: c.name || prev.companyName,
            industry: c.industry || prev.industry,
            website: c.website || prev.website,
            hrName: c.hr_name || prev.hrName,
            hrEmail: c.hr_email || prev.hrEmail,
            hrMobile: c.phone || prev.hrMobile,
            officeAddress: c.office_address || prev.officeAddress,
            city: c.city || prev.city,
            state: c.state || prev.state,
            aboutCompany: c.about_company || prev.aboutCompany,
            logo: logoVal || prev.logo,
          }));
          if (logoVal) setLogoPreview(logoVal);
        }
      })
      .catch(() => {});
  }, []);

  const [logoPreview, setLogoPreview] = useState(profile.logo || "");

  const handleChange = (field, val) => {
    setProfile((prev) => ({ ...prev, [field]: val }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo file must be smaller than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setProfile((prev) => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Calculate profile completion percentage
  const fieldsToTrack = [
    "companyName", "industry", "website", "hrName", "hrEmail",
    "hrMobile", "officeAddress", "city", "state", "aboutCompany"
  ];
  const completedFields = fieldsToTrack.filter((f) => profile[f] && profile[f].toString().trim() !== "");
  const completionPercentage = Math.round((completedFields.length / fieldsToTrack.length) * 100);

  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile.companyName || !profile.hrName || !profile.hrEmail) {
      toast.error("Please fill in required fields (Company Name, HR Name, HR Email).");
      return;
    }

    try {
      setSaving(true);
      const res = await companyService.updateProfile(profile);
      if (res.data?.data) {
        const c = res.data.data;
        setProfile((prev) => ({
          ...prev,
          companyName: c.name || prev.companyName,
          industry: c.industry || prev.industry,
          website: c.website || prev.website,
          hrName: c.hr_name || prev.hrName,
          hrEmail: c.hr_email || prev.hrEmail,
          hrMobile: c.phone || prev.hrMobile,
          officeAddress: c.office_address || prev.officeAddress,
          city: c.city || prev.city,
          state: c.state || prev.state,
          aboutCompany: c.about_company || prev.aboutCompany,
        }));
      }

      localStorage.setItem("apms_company_profile", JSON.stringify(profile));
      if (updateUser) {
        updateUser({ ...user, company_name: profile.companyName, name: profile.companyName });
      }
      toast.success("Company profile saved successfully! 🏢");
      navigate("/company/jobs", { state: { openPostModal: true } });
    } catch (err) {
      console.error(err);
      localStorage.setItem("apms_company_profile", JSON.stringify(profile));
      if (updateUser) {
        updateUser({ ...user, company_name: profile.companyName, name: profile.companyName });
      }
      toast.success("Company profile saved successfully! 🏢");
      navigate("/company/jobs", { state: { openPostModal: true } });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Company Profile</h3>
          <p className="text-muted small mb-0">Manage your company information, HR details, and branding</p>
        </div>
        <button
          type="button"
          className="btn btn-primary fw-bold px-4 py-2 rounded-3 shadow-sm w-100 w-md-auto"
          onClick={handleSave}
        >
          <i className="bi bi-check-circle me-2"></i>Save Profile
        </button>
      </div>

      {/* Completion Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
          <span className="fw-bold text-dark small">Profile Completion Status</span>
          <span className="badge bg-primary rounded-pill px-3 py-1 fw-bold">{completionPercentage}% Completed</span>
        </div>
        <div className="progress rounded-pill style-progress" style={{ height: 10 }}>
          <div
            className="progress-bar bg-primary rounded-pill transition-all"
            role="progressbar"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <small className="text-muted mt-2 d-block">
          Complete your profile details to build trust with candidates and increase job application rates.
        </small>
      </div>

      <form onSubmit={handleSave}>
        {/* Company Branding & Logo */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
          <div className="card-body p-3 p-md-4">
            <h5 className="fw-bold text-primary mb-3"><i className="bi bi-image me-2"></i>Company Branding</h5>

            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 gap-sm-4">
              <div
                className="rounded-4 bg-light border border-2 border-primary border-opacity-25 d-flex align-items-center justify-content-center overflow-hidden shadow-sm flex-shrink-0"
                style={{ width: 100, height: 100 }}
              >
                {logoPreview ? (
                  <img
                    src={getFullLogoUrl(logoPreview)}
                    alt="Company Logo"
                    className="w-100 h-100 object-fit-contain p-2"
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) e.target.nextSibling.style.display = "block";
                    }}
                  />
                ) : null}
                <div
                  className="text-center p-2"
                  style={{ display: logoPreview ? "none" : "block" }}
                >
                  <i className="bi bi-buildings-fill text-primary display-6 d-block mb-1"></i>
                  <span className="small text-muted fw-semibold">Logo</span>
                </div>
              </div>

              <div>
                <label htmlFor="companyLogoInput" className="btn btn-outline-primary btn-sm fw-semibold mb-2 cursor-pointer">
                  <i className="bi bi-upload me-1"></i> Upload Company Logo
                </label>
                <input
                  id="companyLogoInput"
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleLogoUpload}
                />
                <p className="text-muted small mb-0">Recommended resolution: 400x400px. PNG, JPG max 5MB.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company General Info */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
          <div className="card-body p-3 p-md-4">
            <h5 className="fw-bold text-primary mb-3"><i className="bi bi-buildings me-2"></i>General Information</h5>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Company Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Industry Sector</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  placeholder="e.g. Technology & Software"
                />
              </div>

              <div className="col-md-12">
                <label className="form-label small fw-semibold text-muted">Company Website</label>
                <input
                  type="url"
                  className="form-control"
                  value={profile.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://company.com"
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-muted">About Company</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={profile.aboutCompany}
                  onChange={(e) => handleChange("aboutCompany", e.target.value)}
                  placeholder="Provide a detailed overview of your company, mission, values, and work culture..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* HR Contact Info */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
          <div className="card-body p-3 p-md-4">
            <h5 className="fw-bold text-primary mb-3"><i className="bi bi-person-badge me-2"></i>HR & Contact Representative</h5>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted">HR Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.hrName}
                  onChange={(e) => handleChange("hrName", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted">HR Email Address <span className="text-danger">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  value={profile.hrEmail}
                  onChange={(e) => handleChange("hrEmail", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted">HR Mobile Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={profile.hrMobile}
                  onChange={(e) => handleChange("hrMobile", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Location */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
          <div className="card-body p-3 p-md-4">
            <h5 className="fw-bold text-primary mb-3"><i className="bi bi-geo-alt me-2"></i>Office Location & Address</h5>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-semibold text-muted">Office Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.officeAddress}
                  onChange={(e) => handleChange("officeAddress", e.target.value)}
                  placeholder="e.g. Building 4B, Tech Park"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">City</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="e.g. Bengaluru"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="e.g. Karnataka"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-end mb-5">
          <button type="submit" className="btn btn-primary btn-lg fw-bold px-5 rounded-3 shadow-sm w-100 w-md-auto">
            <i className="bi bi-check-circle me-2"></i>Save Company Profile
          </button>
        </div>
      </form>
    </div>
  );
}
