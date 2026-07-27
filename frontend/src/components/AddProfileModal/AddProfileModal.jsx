import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";

const PRESET_ROLES = [
  { name: "Java Full Stack Developer", title: "Java Full Stack Engineer", role: "Software Engineer", icon: "bi-cup-hot-fill" },
  { name: "MERN Stack Developer", title: "Full Stack MERN Engineer", role: "Web Developer", icon: "bi-code-slash" },
  { name: "AI & ML Engineer", title: "AI/ML Engineer", role: "AI Engineer", icon: "bi-cpu-fill" },
  { name: "Data Analyst", title: "Data Analyst & BI Specialist", role: "Data Analyst", icon: "bi-bar-chart-line-fill" },
  { name: "Python Developer", title: "Backend Python Engineer", role: "Backend Developer", icon: "bi-terminal-fill" },
  { name: "Cyber Security Specialist", title: "Cyber Security Analyst", role: "Security Engineer", icon: "bi-shield-lock-fill" },
  { name: "Custom Career Profile", title: "", role: "", icon: "bi-sliders" },
];

export default function AddProfileModal({ onClose }) {
  const { createProfile } = useProfile();
  const [selectedPreset, setSelectedPreset] = useState(PRESET_ROLES[0].name);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    profile_name: PRESET_ROLES[0].name,
    professional_title: PRESET_ROLES[0].title,
    target_role: PRESET_ROLES[0].role,
    summary: "",
  });

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.name);
    if (preset.name === "Custom Career Profile") {
      setFormData({
        profile_name: "",
        professional_title: "",
        target_role: "",
        summary: "",
      });
    } else {
      setFormData({
        profile_name: preset.name,
        professional_title: preset.title,
        target_role: preset.role,
        summary: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.profile_name.trim()) return;

    try {
      setSubmitting(true);
      await createProfile(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.6)", zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <div className="modal-header border-0 bg-primary text-white py-3 px-4">
            <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-folder-plus"></i> Add Other Professional Profile
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <p className="text-muted small mb-3">
                Create a new career profile under your account. Each profile maintains an independent resume, skills, experience, and project highlights.
              </p>

              {/* Preset Selection Pills */}
              <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: "0.05em" }}>
                Select Career Track Preset
              </label>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {PRESET_ROLES.map((preset) => {
                  const isSelected = selectedPreset === preset.name;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 border transition-all ${
                        isSelected
                          ? "btn-primary shadow-sm"
                          : "btn-outline-secondary bg-light text-dark"
                      }`}
                      onClick={() => handleSelectPreset(preset)}
                    >
                      <i className={`bi ${preset.icon}`}></i>
                      <span className="fw-medium">{preset.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form Fields */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Profile Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Java Developer, AI Engineer"
                    value={formData.profile_name}
                    onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-medium">Professional Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Senior Java Full Stack Developer"
                    value={formData.professional_title}
                    onChange={(e) => setFormData({ ...formData, professional_title: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-medium">Target Job Role</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Backend Engineer, Data Scientist"
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-medium">Short Description (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Focused on Spring Boot, Microservices & AWS"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-0 py-3 px-4">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary fw-semibold px-4" disabled={submitting}>
                {submitting ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</>
                ) : (
                  <><i className="bi bi-check-lg me-1"></i>Create Profile & Switch</>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
