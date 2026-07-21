import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { companyService } from "../../../services/api";

export default function SubmitJob() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoError, setLogoError] = useState("");

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setLogoError("Please upload a valid image file (JPG, PNG, WEBP, SVG).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError("File size must be less than 2MB.");
      return;
    }

    setLogoError("");
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError("");
  };

  const onSubmit = async (data) => {
    if (logoError) return;

    try {
      const skillsArray = data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
      
      const formData = new FormData();
      formData.append("company_name", data.companyName.trim());
      formData.append("hr_name", data.hrName.trim());
      formData.append("hr_email", data.hrEmail.trim());
      formData.append("phone", data.phone.trim());
      if (data.website?.trim()) {
        formData.append("website", data.website.trim());
      }
      formData.append("industry", "Technology");
      formData.append("title", data.jobTitle.trim());
      formData.append("description", data.jobDescription.trim());
      formData.append("eligibility", data.eligibility.trim());
      formData.append("experience", data.experience);
      formData.append("salary", data.salary.trim());
      formData.append("location", data.jobLocation.trim());
      formData.append("openings", parseInt(data.openings) || 1);
      formData.append("last_date", data.lastDate);

      skillsArray.forEach((skill) => {
        formData.append("skills[]", skill);
      });

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      await companyService.submitJob(formData);
      toast.success("Job submitted successfully! Our team will review it shortly.");
      reset();
      handleRemoveLogo();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to submit job request. Verify all inputs.";
      toast.error(errMsg);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="inner-page-hero text-white py-5">
        <div className="container py-3">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-3 bg-white bg-opacity-10 p-3">
              <i className="bi bi-buildings-fill fs-3 text-warning"></i>
            </div>
            <div>
              <h1 className="display-6 fw-bold mb-1">Post a Job Drive</h1>
              <p className="text-white-75 mb-0">Reach 1,200+ students from top engineering institutes</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              {/* Benefits Bar */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="row g-3 text-center">
                    {[
                      { icon: "bi-people-fill", text: "1,200+ Students", color: "primary" },
                      { icon: "bi-bank2", text: "12 Partner Institutes", color: "success" },
                      { icon: "bi-clock-fill", text: "24hr Review", color: "warning" },
                      { icon: "bi-envelope-check-fill", text: "Direct Email to HR", color: "info" },
                    ].map((b, i) => (
                      <div key={i} className="col-6 col-md-3">
                        <i className={`bi ${b.icon} text-${b.color} fs-4 d-block mb-1`}></i>
                        <small className="fw-medium">{b.text}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* ── COMPANY INFO ─────────────────────────────────────────── */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-3 bg-primary bg-opacity-10 p-2"><i className="bi bi-building text-primary"></i></div>
                      <h6 className="fw-bold mb-0">Company Information</h6>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">Company Name <span className="text-danger">*</span></label>
                        <input {...register("companyName", { required: "Company name is required" })} className={`form-control ${errors.companyName ? "is-invalid" : ""}`} placeholder="TechNova Solutions" />
                        {errors.companyName && <div className="invalid-feedback">{errors.companyName.message}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">HR Contact Name <span className="text-danger">*</span></label>
                        <input {...register("hrName", { required: "HR name is required" })} className={`form-control ${errors.hrName ? "is-invalid" : ""}`} placeholder="Priya Sharma" />
                        {errors.hrName && <div className="invalid-feedback">{errors.hrName.message}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">HR Email <span className="text-danger">*</span></label>
                        <input type="email" {...register("hrEmail", { required: "HR email is required" })} className={`form-control ${errors.hrEmail ? "is-invalid" : ""}`} placeholder="hr@company.com" />
                        {errors.hrEmail && <div className="invalid-feedback">{errors.hrEmail.message}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">Phone Number <span className="text-danger">*</span></label>
                        <input type="tel" {...register("phone", { required: "Phone is required" })} className={`form-control ${errors.phone ? "is-invalid" : ""}`} placeholder="+91 98765 43210" />
                        {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">Company Website</label>
                        <input {...register("website")} className="form-control" placeholder="https://company.com" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">Company Logo Image</label>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                          className={`form-control ${logoError ? "is-invalid" : ""}`}
                          onChange={handleLogoChange}
                        />
                        <small className="text-muted d-block mt-1">Upload logo image (JPG, PNG, WEBP, SVG - Max 2MB)</small>
                        {logoError && <div className="text-danger small mt-1">{logoError}</div>}
                        {logoPreview && (
                          <div className="mt-2 d-flex align-items-center gap-3 p-2 bg-light border rounded">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              style={{ height: "48px", width: "48px", objectFit: "contain", borderRadius: "6px", backgroundColor: "#fff" }}
                            />
                            <span className="small text-muted text-truncate" style={{ maxWidth: "180px" }}>{logoFile?.name}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger ms-auto"
                              onClick={handleRemoveLogo}
                            >
                              <i className="bi bi-trash me-1"></i>Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── JOB INFO ─────────────────────────────────────────────── */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-3 bg-success bg-opacity-10 p-2"><i className="bi bi-briefcase text-success"></i></div>
                      <h6 className="fw-bold mb-0">Job Information</h6>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">Job Title <span className="text-danger">*</span></label>
                        <input {...register("jobTitle", { required: "Job title is required" })} className={`form-control ${errors.jobTitle ? "is-invalid" : ""}`} placeholder="Software Developer" />
                        {errors.jobTitle && <div className="invalid-feedback">{errors.jobTitle.message}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">Job Location <span className="text-danger">*</span></label>
                        <input {...register("jobLocation", { required: "Location is required" })} className={`form-control ${errors.jobLocation ? "is-invalid" : ""}`} placeholder="Bangalore, Karnataka" />
                        {errors.jobLocation && <div className="invalid-feedback">{errors.jobLocation.message}</div>}
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-medium">Job Description <span className="text-danger">*</span></label>
                        <textarea {...register("jobDescription", { required: "Description is required", minLength: { value: 50, message: "Min 50 characters" } })} className={`form-control ${errors.jobDescription ? "is-invalid" : ""}`} rows={5} placeholder="Describe the role, responsibilities, and expectations..." />
                        {errors.jobDescription && <div className="invalid-feedback">{errors.jobDescription.message}</div>}
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-medium">Eligibility Criteria <span className="text-danger">*</span></label>
                        <input {...register("eligibility", { required: "Eligibility is required" })} className={`form-control ${errors.eligibility ? "is-invalid" : ""}`} placeholder="B.E / B.Tech – CS, IS – 65% and above" />
                        {errors.eligibility && <div className="invalid-feedback">{errors.eligibility.message}</div>}
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-medium">Skills Required</label>
                        <input {...register("skills")} className="form-control" placeholder="React, Node.js, SQL (comma separated)" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium">Experience Required</label>
                        <select {...register("experience")} className="form-select">
                          <option value="Fresher">Fresher (0 years)</option>
                          <option value="0–1 Years">0–1 Years</option>
                          <option value="0–2 Years">0–2 Years</option>
                          <option value="1–3 Years">1–3 Years</option>
                          <option value="2–4 Years">2–4 Years</option>
                          <option value="3–5 Years">3–5 Years</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium">Salary / CTC (LPA) <span className="text-danger">*</span></label>
                        <input {...register("salary", { required: "Salary is required" })} className={`form-control ${errors.salary ? "is-invalid" : ""}`} placeholder="6–8 LPA" />
                        {errors.salary && <div className="invalid-feedback">{errors.salary.message}</div>}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium">Number of Openings <span className="text-danger">*</span></label>
                        <input type="number" min={1} {...register("openings", { required: "Openings required", min: { value: 1, message: "Min 1" } })} className={`form-control ${errors.openings ? "is-invalid" : ""}`} placeholder="10" />
                        {errors.openings && <div className="invalid-feedback">{errors.openings.message}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-medium">Last Date to Apply <span className="text-danger">*</span></label>
                        <input type="date" {...register("lastDate", { required: "Last date is required" })} className={`form-control ${errors.lastDate ? "is-invalid" : ""}`} />
                        {errors.lastDate && <div className="invalid-feedback">{errors.lastDate.message}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start gap-3 mb-4 p-3 rounded-3" style={{ background: "#fff8e1" }}>
                      <i className="bi bi-info-circle-fill text-warning mt-1 flex-shrink-0"></i>
                      <small className="text-muted">
                        After submission, our placement team will review your request within 24 hours. You will receive a confirmation email. The placement drive will be published only after approval.
                      </small>
                    </div>
                    <div className="d-flex gap-3 flex-wrap">
                      <button type="submit" className="btn btn-primary btn-lg px-5 fw-semibold" disabled={isSubmitting}>
                        {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</> : <><i className="bi bi-send-fill me-2"></i>Submit Job Drive</>}
                      </button>
                      <button type="reset" className="btn btn-outline-secondary btn-lg" onClick={() => { reset(); handleRemoveLogo(); }}>
                        <i className="bi bi-arrow-counterclockwise me-2"></i>Reset Form
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
