import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { companyService } from "../../services/api";

export default function PostJobModal({ initialData, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    location: "Bengaluru, Karnataka",
    employmentType: "Full Time",
    experience: "0-2 Years (Freshers Allowed)",
    salary: "₹6,00,000 - ₹9,50,000 / annum",
    vacancies: 5,
    deadline: "2026-08-30",
    skills: "React, Node.js, JavaScript, MySQL, HTML, CSS",
    eligibleCourses: "B.Tech, BCA, MCA, M.Tech",
    description: "We are seeking motivated Software Engineers to join our dynamic product development team.",
    responsibilities: "• Develop high quality frontend & backend features\n• Collaborate with product managers & designers\n• Write clean, scalable, maintainable code\n• Participate in code reviews and agile sprints",
    status: "published",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        location: initialData.location || "Bengaluru",
        employmentType: initialData.employmentType || "Full Time",
        experience: initialData.experience || "0-2 Years",
        salary: initialData.salary || "",
        vacancies: initialData.vacancies || 1,
        deadline: initialData.deadline || "",
        skills: Array.isArray(initialData.skills) ? initialData.skills.join(", ") : (initialData.skills || ""),
        eligibleCourses: Array.isArray(initialData.eligibleCourses) ? initialData.eligibleCourses.join(", ") : (initialData.eligibleCourses || "B.Tech, BCA, MCA"),
        description: initialData.description || "",
        responsibilities: initialData.responsibilities || "",
        status: initialData.status || "published",
      });
    }
  }, [initialData]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (targetStatus) => {
    if (!formData.title.trim()) {
      toast.error("Please enter a Job Title.");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Please enter Job Location.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      location: formData.location.trim(),
      employmentType: formData.employmentType,
      experience: formData.experience,
      salary: formData.salary.trim() || "Not Disclosed",
      vacancies: parseInt(formData.vacancies) || 1,
      last_date: formData.deadline,
      skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
      eligibleCourses: formData.eligibleCourses.split(",").map((c) => c.trim()).filter(Boolean),
      description: formData.description,
      status: targetStatus,
    };

    try {
      setLoading(true);
      let res;
      if (initialData?.id && !String(initialData.id).startsWith("job_")) {
        res = await companyService.updateJob(initialData.id, payload);
      } else {
        res = await companyService.createJob(payload);
      }

      const savedJob = res.data?.data || payload;
      onSave(savedJob);
      toast.success(targetStatus === "draft" ? "Job draft saved successfully!" : "Job submitted to Admin for approval! 🚀");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" style={{ zIndex: 1065 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0 rounded-4">
          <div className="modal-header bg-primary text-white py-3 px-4">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-briefcase-fill"></i>
              {initialData ? "Edit Job Posting" : "Post New Job Opportunity"}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light">
            <div className="alert alert-info py-2 px-3 mb-3 small d-flex align-items-center gap-2 rounded-3 border-0 bg-info bg-opacity-10 text-dark">
              <i className="bi bi-info-circle-fill text-info fs-5"></i>
              <span>
                <strong>Admin Approval Required:</strong> All job details will be saved and submitted to Placement Cell Admin for review before being published to candidates.
              </span>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="row g-3">
                {/* Job Title */}
                <div className="col-md-8">
                  <label className="form-label small fw-semibold text-dark">Job Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Associate Software Engineer"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>

                {/* Employment Type */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-dark">Employment Type</label>
                  <select
                    className="form-select"
                    value={formData.employmentType}
                    onChange={(e) => handleChange("employmentType", e.target.value)}
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* Location */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Job Location <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bengaluru, Karnataka (Hybrid)"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    required
                  />
                </div>

                {/* Experience */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Experience Required</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 0-1 Years / Freshers"
                    value={formData.experience}
                    onChange={(e) => handleChange("experience", e.target.value)}
                  />
                </div>

                {/* Salary */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-dark">Salary Package (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. ₹6.5 LPA - ₹9 LPA"
                    value={formData.salary}
                    onChange={(e) => handleChange("salary", e.target.value)}
                  />
                </div>

                {/* Number of Vacancies */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-dark">Number of Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.vacancies}
                    onChange={(e) => handleChange("vacancies", e.target.value)}
                  />
                </div>

                {/* Application Deadline */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-dark">Application Deadline</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                  />
                </div>

                {/* Required Skills */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Required Skills (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="React, Node.js, SQL, JavaScript"
                    value={formData.skills}
                    onChange={(e) => handleChange("skills", e.target.value)}
                  />
                </div>

                {/* Eligible Courses */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Eligible Courses / Streams</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="B.Tech, BCA, MCA, M.Tech, MBA"
                    value={formData.eligibleCourses}
                    onChange={(e) => handleChange("eligibleCourses", e.target.value)}
                  />
                </div>

                {/* Job Description */}
                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">Job Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Brief overview of the opportunity..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  ></textarea>
                </div>

                {/* Roles & Responsibilities */}
                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark">Roles & Responsibilities</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="List key bullet points of what the candidate will do..."
                    value={formData.responsibilities}
                    onChange={(e) => handleChange("responsibilities", e.target.value)}
                  ></textarea>
                </div>
              </div>
            </form>
          </div>

          <div className="modal-footer bg-white py-3 px-4 d-flex justify-content-between">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary fw-semibold"
                onClick={() => handleSave("draft")}
                disabled={loading}
              >
                <i className="bi bi-bookmark me-1"></i> Save Draft
              </button>
              <button
                type="button"
                className="btn btn-primary fw-bold px-4"
                onClick={() => handleSave("pending")}
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                ) : (
                  <><i className="bi bi-shield-check me-1"></i> Save & Submit for Approval</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
