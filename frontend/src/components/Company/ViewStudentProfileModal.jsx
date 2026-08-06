import { useState } from "react";
import { toast } from "react-toastify";
import ResumePreview from "../ResumePreview/ResumePreview";

export default function ViewStudentProfileModal({ application, onClose, onStatusChange }) {
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'resume'
  const student = application?.student || {};
  const resume = application?.resume || application?.careerProfile || {};
  const personal = resume.personal || {};

  const formatExternalUrl = (url) => {
    if (!url || typeof url !== "string") return "#";
    let trimmed = url.trim();
    if (!trimmed || trimmed === "N/A" || trimmed === "null") return "#";
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }
    return trimmed;
  };

  const isValidUrl = (url) => url && typeof url === "string" && url.trim() !== "" && url.trim().toLowerCase() !== "n/a" && url.trim().toLowerCase() !== "null";

  const rawGithub = personal.github || student.github;
  const rawLinkedin = personal.linkedin || student.linkedin;
  const rawPortfolio = personal.portfolio || student.portfolio;

  const githubUrl = isValidUrl(rawGithub) ? rawGithub : null;
  const linkedinUrl = isValidUrl(rawLinkedin) ? rawLinkedin : null;
  const portfolioUrl = isValidUrl(rawPortfolio) ? rawPortfolio : null;

  const handleAction = (status) => {
    if (onStatusChange) {
      onStatusChange(application.id, status);
    }
    toast.success(`Candidate ${student.name || personal.fullName} marked as ${status.toUpperCase()}! 🎉`);
  };

  const handleDownload = () => {
    if (application?.resume_path) {
      window.open(application.resume_path, "_blank");
      toast.success("Opening candidate PDF resume...");
    } else {
      setActiveTab("resume");
      toast.info("Showing live dynamic resume preview.");
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" style={{ zIndex: 1065 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0 rounded-4" style={{ maxHeight: "92vh" }}>
          {/* Header */}
          <div className="modal-header bg-primary text-white py-3 px-4">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-white text-primary fw-bold d-flex align-items-center justify-content-center overflow-hidden border border-2 border-white"
                style={{ width: 44, height: 44, fontSize: "1.1rem" }}
              >
                {personal.photo ? (
                  <img src={personal.photo} alt="Student" className="w-100 h-100 object-fit-cover" />
                ) : (
                  (student.name || personal.fullName || "S").charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">{student.name || personal.fullName || "Student Candidate"}</h5>
                <small className="text-white-50">{personal.professionalTitle || student.target_role || "Candidate Profile"}</small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {/* Tab Switcher */}
              <div className="d-flex align-items-center bg-black bg-opacity-25 p-1 rounded-pill me-3 border border-white border-opacity-25">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold border-0 ${
                    activeTab === "profile"
                      ? "bg-white text-primary shadow-sm"
                      : "bg-transparent text-white"
                  }`}
                  style={{ color: activeTab === "profile" ? "#0d6efd" : "#ffffff" }}
                  onClick={() => setActiveTab("profile")}
                >
                  <i className="bi bi-person-badge me-1"></i> Career Profile
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold border-0 ${
                    activeTab === "resume"
                      ? "bg-white text-primary shadow-sm"
                      : "bg-transparent text-white"
                  }`}
                  style={{ color: activeTab === "resume" ? "#0d6efd" : "#ffffff" }}
                  onClick={() => setActiveTab("resume")}
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i> Live Resume
                </button>
              </div>

              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body p-4 bg-light overflow-y-auto">
            {activeTab === "profile" ? (
              <div className="row g-4">
                {/* Left Card: Basic Info & Contacts */}
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm rounded-3 mb-3">
                    <div className="card-body text-center p-4">
                      <div
                        className="rounded-circle mx-auto mb-3 border border-3 border-primary shadow-sm overflow-hidden"
                        style={{ width: 90, height: 90 }}
                      >
                        {personal.photo ? (
                          <img src={personal.photo} alt="Candidate" className="w-100 h-100 object-fit-cover" />
                        ) : (
                          <div className="w-100 h-100 bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center display-6">
                            {(student.name || personal.fullName || "S").charAt(0)}
                          </div>
                        )}
                      </div>
                      <h5 className="fw-bold text-dark mb-1">{student.name || personal.fullName}</h5>
                      <p className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-1 rounded-pill mb-3">
                        {personal.professionalTitle || "Candidate"}
                      </p>

                      <div className="text-start border-top pt-3 small">
                        <div className="mb-2">
                          <i className="bi bi-envelope-fill text-muted me-2"></i>
                          <span>{personal.email || student.email || "N/A"}</span>
                        </div>
                        <div className="mb-2">
                          <i className="bi bi-telephone-fill text-muted me-2"></i>
                          <span>{personal.phone || student.mobile || "N/A"}</span>
                        </div>
                        <div className="mb-2">
                          <i className="bi bi-geo-alt-fill text-muted me-2"></i>
                          <span>{personal.location || "Bengaluru, India"}</span>
                        </div>
                        {githubUrl && (
                          <div className="mb-2">
                            <i className="bi bi-github text-dark me-2"></i>
                            <a
                              href={formatExternalUrl(githubUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none text-primary fw-semibold"
                            >
                              GitHub Profile <i className="bi bi-box-arrow-up-right ms-1 small"></i>
                            </a>
                          </div>
                        )}
                        {linkedinUrl && (
                          <div className="mb-2">
                            <i className="bi bi-linkedin text-primary me-2"></i>
                            <a
                              href={formatExternalUrl(linkedinUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none text-primary fw-semibold"
                            >
                              LinkedIn Profile <i className="bi bi-box-arrow-up-right ms-1 small"></i>
                            </a>
                          </div>
                        )}
                        {portfolioUrl && (
                          <div className="mb-2">
                            <i className="bi bi-globe text-success me-2"></i>
                            <a
                              href={formatExternalUrl(portfolioUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none text-primary fw-semibold"
                            >
                              Portfolio Website <i className="bi bi-box-arrow-up-right ms-1 small"></i>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Area: Profile Details */}
                <div className="col-md-8">
                  {/* Summary */}
                  {resume.summary && (
                    <div className="card border-0 shadow-sm rounded-3 mb-3">
                      <div className="card-body p-3.5">
                        <h6 className="fw-bold text-primary mb-2"><i className="bi bi-card-text me-2"></i>Professional Summary</h6>
                        <p className="text-secondary small mb-0 lh-base">{resume.summary}</p>
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {resume.skills && (
                    <div className="card border-0 shadow-sm rounded-3 mb-3">
                      <div className="card-body p-3.5">
                        <h6 className="fw-bold text-primary mb-2"><i className="bi bi-tools me-2"></i>Skills & Competencies</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {Object.entries(resume.skills).map(([cat, items]) =>
                            Array.isArray(items) && items.length > 0 ? (
                              items.map((sk, idx) => (
                                <span key={cat + idx} className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2.5 py-1 fw-semibold small">
                                  {sk}
                                </span>
                              ))
                            ) : null
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resume.projects && resume.projects.length > 0 && (
                    <div className="card border-0 shadow-sm rounded-3 mb-3">
                      <div className="card-body p-3.5">
                        <h6 className="fw-bold text-primary mb-2"><i className="bi bi-folder-check me-2"></i>Key Projects</h6>
                        {resume.projects.map((p, idx) => (
                          <div key={idx} className="border-bottom pb-2 mb-2 last-border-0">
                            <div className="fw-bold text-dark small">{p.name || p.title}</div>
                            {p.description && <div className="text-muted small">{p.description}</div>}
                            {p.technologies && <div className="text-secondary small mt-1"><strong>Tech:</strong> {p.technologies}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resume.education && resume.education.length > 0 && (
                    <div className="card border-0 shadow-sm rounded-3 mb-3">
                      <div className="card-body p-3.5">
                        <h6 className="fw-bold text-primary mb-2"><i className="bi bi-mortarboard me-2"></i>Education</h6>
                        {resume.education.map((e, idx) => (
                          <div key={idx} className="d-flex justify-content-between small mb-1.5">
                            <div>
                              <strong className="text-dark">{e.degree} in {e.specialization}</strong>
                              <div className="text-muted">{e.college || e.university}</div>
                            </div>
                            <div className="text-end">
                              <span className="badge bg-light text-dark border">{e.startYear} - {e.endYear}</span>
                              {e.cgpa && <div className="text-muted mt-1">CGPA: {e.cgpa}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {resume.certifications && resume.certifications.length > 0 && (
                    <div className="card border-0 shadow-sm rounded-3 mb-3">
                      <div className="card-body p-3.5">
                        <h6 className="fw-bold text-primary mb-2"><i className="bi bi-patch-check me-2"></i>Certifications</h6>
                        {resume.certifications.map((c, idx) => (
                          <div key={idx} className="d-flex justify-content-between align-items-center small mb-1.5 border-bottom pb-1">
                            <div>
                              <strong className="text-dark">{c.name}</strong>
                              <div className="text-muted">{c.organization} ({c.issueDate})</div>
                            </div>
                            {c.credentialUrl && (
                              <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="btn btn-xs btn-outline-success">
                                <i className="bi bi-eye me-1"></i>View Document
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Live Resume View Tab */
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-3">
                  <ResumePreview resume={resume} onClose={() => {}} />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-white py-3 px-4 d-flex justify-content-between">
            <button type="button" className="btn btn-outline-primary fw-semibold" onClick={handleDownload}>
              <i className="bi bi-download me-1"></i> Download Resume
            </button>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-danger fw-semibold px-3"
                onClick={() => handleAction("rejected")}
              >
                <i className="bi bi-x-circle me-1"></i> Reject
              </button>
              <button
                type="button"
                className="btn btn-success fw-bold px-4"
                onClick={() => handleAction("shortlisted")}
              >
                <i className="bi bi-check-circle-fill me-1"></i> Shortlist Candidate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
