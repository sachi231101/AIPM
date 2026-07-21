import { useState } from "react";
import ResumePreview from "../ResumePreview/ResumePreview";
import ModernTemplate from "../ResumeTemplates/ModernTemplate";
import ProfessionalTemplate from "../ResumeTemplates/ProfessionalTemplate";
import MinimalTemplate from "../ResumeTemplates/MinimalTemplate";
import ExecutiveTemplate from "../ResumeTemplates/ExecutiveTemplate";
import StudentTemplate from "../ResumeTemplates/StudentTemplate";

// Realistic fallback data so template cards always display a complete real resume document
const FALLBACK_SAMPLE_RESUME = {
  personal: {
    fullName: "Alex Sharma",
    professionalTitle: "Full Stack Software Engineer",
    email: "alex.sharma@example.com",
    phone: "+91 98765 43210",
    location: "Bangalore, Karnataka",
    linkedin: "linkedin.com/in/alexsharma",
    github: "github.com/alexsharma",
    portfolio: "alexsharma.dev",
    showPhoto: false,
    showLinkedin: true,
    showGithub: true,
    showPortfolio: true,
  },
  summary: "Motivated Software Developer with expertise in building scalable web applications, RESTful APIs, and responsive user interfaces.",
  education: [
    {
      id: "e1",
      degree: "B.Tech in Computer Science & Engineering",
      specialization: "Software Development",
      college: "Aadya Institute of Technology & Science",
      endYear: "2026",
      cgpa: "8.9 / 10.0",
      currentlyStudying: true,
    }
  ],
  experience: [
    {
      id: "ex1",
      jobTitle: "Software Developer Intern",
      company: "Aadya Tech Solutions",
      startDate: "2025-06",
      endDate: "Present",
      currentlyWorking: true,
      description: "Developed placement management modules using React and Laravel, boosting application workflow speed by 40%.",
    }
  ],
  projects: [
    {
      id: "p1",
      title: "AI Resume Builder & Placement Portal",
      techStack: "React.js, Node.js, MySQL, Bootstrap",
      description: "Built an intelligent ATS resume generator and job portal supporting real-time template switching.",
    }
  ],
  skills: {
    technical: ["React.js", "Node.js", "Python", "JavaScript", "SQL", "Git", "REST APIs", "Bootstrap"],
    softSkills: ["Problem Solving", "Team Leadership", "Agile Workflow"],
  },
  certifications: [
    { id: "c1", name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "2025" }
  ],
  languages: [
    { id: "l1", language: "English", proficiency: "Professional" },
    { id: "l2", language: "Hindi", proficiency: "Native" }
  ],
  settings: {
    template: "modern",
    accentColor: "#0F4C81",
    paperSize: "a4",
  }
};

// Merges student's actual active resume with fallback sample data so empty fields are complete
function getDisplayResume(userResume, templateId) {
  const base = userResume || {};
  const personal = { ...FALLBACK_SAMPLE_RESUME.personal, ...(base.personal || {}) };
  // Ensure personal fields are non-empty
  if (!personal.fullName) personal.fullName = FALLBACK_SAMPLE_RESUME.personal.fullName;
  if (!personal.professionalTitle) personal.professionalTitle = FALLBACK_SAMPLE_RESUME.personal.professionalTitle;
  if (!personal.email) personal.email = FALLBACK_SAMPLE_RESUME.personal.email;
  if (!personal.phone) personal.phone = FALLBACK_SAMPLE_RESUME.personal.phone;

  const summary = base.summary || FALLBACK_SAMPLE_RESUME.summary;
  const education = (base.education && base.education.length > 0) ? base.education : FALLBACK_SAMPLE_RESUME.education;
  const experience = (base.experience && base.experience.length > 0) ? base.experience : FALLBACK_SAMPLE_RESUME.experience;
  const projects = (base.projects && base.projects.length > 0) ? base.projects : FALLBACK_SAMPLE_RESUME.projects;

  const userSkills = base.skills || {};
  const hasSkills = Object.values(userSkills).some((arr) => Array.isArray(arr) && arr.length > 0);
  const skills = hasSkills ? userSkills : FALLBACK_SAMPLE_RESUME.skills;

  return {
    ...base,
    personal,
    summary,
    education,
    experience,
    projects,
    skills,
    certifications: (base.certifications && base.certifications.length > 0) ? base.certifications : FALLBACK_SAMPLE_RESUME.certifications,
    languages: (base.languages && base.languages.length > 0) ? base.languages : FALLBACK_SAMPLE_RESUME.languages,
    settings: {
      ...(base.settings || {}),
      template: templateId,
      accentColor: base.settings?.accentColor || TEMPLATE_DEFINITIONS.find((t) => t.id === templateId)?.accentColor || "#0F4C81",
    },
  };
}

// Renders the ACTUAL REAL RESUME component inside a scaled thumbnail frame
export function RealResumeThumbnail({ templateId, resumeData }) {
  const displayResume = getDisplayResume(resumeData, templateId);

  const renderActualTemplate = () => {
    switch (templateId) {
      case "professional":
        return <ProfessionalTemplate resume={displayResume} />;
      case "minimal":
        return <MinimalTemplate resume={resumeData ? getDisplayResume(resumeData, "minimal") : displayResume} />;
      case "executive":
        return <ExecutiveTemplate resume={displayResume} />;
      case "student":
        return <StudentTemplate resume={displayResume} />;
      case "modern":
      default:
        return <ModernTemplate resume={displayResume} />;
    }
  };

  return (
    <div
      className="border rounded bg-secondary bg-opacity-10 overflow-hidden position-relative shadow-inner"
      style={{ height: 270, width: "100%" }}
    >
      <div
        style={{
          width: "794px",
          transform: "scale(0.34)",
          transformOrigin: "top left",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {renderActualTemplate()}
      </div>
    </div>
  );
}

export const TEMPLATE_DEFINITIONS = [
  {
    id: "modern",
    name: "Modern Two-Column",
    tagline: "Sleek sidebar layout with header banner & skill badges",
    category: "Popular for Tech & Design",
    badgeColor: "primary",
    accentColor: "#0F4C81",
    description: "Best for Software Engineers, Data Scientists, and Digital Roles. Highlights technical skills in a prominent sidebar.",
  },
  {
    id: "professional",
    name: "Classic Professional",
    tagline: "Traditional single-column layout with clean dividers",
    category: "Corporate & Banking",
    badgeColor: "success",
    accentColor: "#1B5E20",
    description: "Ideal for Finance, Management, Banking, and Corporate roles. Clean, standard, and universally ATS compliant.",
  },
  {
    id: "minimal",
    name: "Minimalist Clean",
    tagline: "Elegant whitespace, subtle typography & high readability",
    category: "Startups & Creative",
    badgeColor: "dark",
    accentColor: "#37474F",
    description: "Perfect for Product Managers, Designers, and Content Creators. Focuses on clarity and typography.",
  },
  {
    id: "executive",
    name: "Executive Leader",
    tagline: "Bold header banner, gold/navy highlights & summary focus",
    category: "Senior Roles & Management",
    badgeColor: "warning",
    accentColor: "#C62828",
    description: "Designed for Leadership, Team Leads, and Senior Executives. Emphasizes key achievements and summary.",
  },
  {
    id: "student",
    name: "Student & Fresher",
    tagline: "Academic highlight, project showcase & skill badges",
    category: "Freshers & Campus Placements",
    badgeColor: "info",
    accentColor: "#00838F",
    description: "Optimized for college graduates and freshers. Puts education, academic projects, and certifications upfront.",
  },
];

export default function TemplateGalleryModal({ currentTemplate, resumeData, onSelectTemplate, onClose }) {
  const [selectedTpl, setSelectedTpl] = useState(currentTemplate || "modern");
  const [previewingTpl, setPreviewingTpl] = useState(null);

  const activeDef = TEMPLATE_DEFINITIONS.find((t) => t.id === selectedTpl) || TEMPLATE_DEFINITIONS[0];

  const handleApply = () => {
    onSelectTemplate(selectedTpl);
    onClose();
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0, 0, 0, 0.75)", zIndex: 1055 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-dark text-white border-0 py-3 px-4">
            <div>
              <h5 className="modal-title fw-bold mb-0">
                <i className="bi bi-palette2 me-2 text-warning"></i>
                Choose Resume Template & Visual Style
              </h5>
              <small className="text-white-50">Select a real template design — cards render the actual live resume document</small>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4 bg-light">
            <div className="row g-4">
              {TEMPLATE_DEFINITIONS.map((tpl) => {
                const isSelected = selectedTpl === tpl.id;
                return (
                  <div key={tpl.id} className="col-md-6 col-lg-4">
                    <div
                      className={`card border-2 h-100 shadow-sm rounded-3 overflow-hidden cursor-pointer position-relative ${
                        isSelected ? "border-primary ring-2 ring-primary" : "border-light-subtle"
                      }`}
                      style={{
                        cursor: "pointer",
                        transition: "transform 0.2s, border-color 0.2s",
                        transform: isSelected ? "scale(1.02)" : "scale(1)",
                      }}
                      onClick={() => setSelectedTpl(tpl.id)}
                    >
                      {/* Active Indicator Badge */}
                      {isSelected && (
                        <div
                          className="position-absolute top-0 end-0 bg-primary text-white px-2 py-1 rounded-bottom-start shadow-sm fw-bold small"
                          style={{ zIndex: 5, fontSize: "0.75rem" }}
                        >
                          <i className="bi bi-check-circle-fill me-1"></i> Active Selected
                        </div>
                      )}

                      {/* ACTUAL REAL RESUME DOCUMENT THUMBNAIL */}
                      <div className="bg-white p-2 border-bottom">
                        <RealResumeThumbnail templateId={tpl.id} resumeData={resumeData} />
                      </div>

                      {/* Card Info */}
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <h6 className="fw-bold mb-0 text-dark">{tpl.name}</h6>
                          <span className={`badge bg-${tpl.badgeColor} bg-opacity-10 text-${tpl.badgeColor} px-2 py-1`} style={{ fontSize: "0.7rem" }}>
                            {tpl.category}
                          </span>
                        </div>
                        <small className="text-muted d-block mb-2" style={{ fontSize: "0.75rem" }}>
                          {tpl.tagline}
                        </small>
                        <p className="text-secondary small mb-3" style={{ fontSize: "0.78rem", minHeight: 38 }}>
                          {tpl.description}
                        </p>

                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className={`btn btn-sm flex-grow-1 ${isSelected ? "btn-primary fw-bold" : "btn-outline-primary"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTpl(tpl.id);
                              onSelectTemplate(tpl.id);
                              onClose();
                            }}
                          >
                            {isSelected ? (
                              <><i className="bi bi-check2-circle me-1"></i>Selected</>
                            ) : (
                              "Use This Template"
                            )}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewingTpl(tpl.id);
                            }}
                            title="Preview full size with your actual resume data"
                          >
                            <i className="bi bi-eye me-1"></i> Full Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-white border-0 py-3 px-4 d-flex justify-content-between">
            <div>
              <span className="text-muted small">Selected Template: </span>
              <strong className="text-primary">{activeDef.name}</strong>
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm px-4 fw-semibold" onClick={handleApply}>
                <i className="bi bi-check-lg me-1"></i> Apply Selected Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full screen Live Preview Modal if preview button clicked */}
      {previewingTpl && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.85)", zIndex: 1060 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white border-0">
                <h6 className="modal-title fw-bold mb-0">
                  Full Preview: {TEMPLATE_DEFINITIONS.find((t) => t.id === previewingTpl)?.name}
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewingTpl(null)}></button>
              </div>
              <div className="modal-body p-4 bg-secondary bg-opacity-10 overflow-auto" style={{ maxHeight: "75vh" }}>
                <ResumePreview resume={getDisplayResume(resumeData, previewingTpl)} />
              </div>
              <div className="modal-footer bg-white border-0">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreviewingTpl(null)}>
                  Close Preview
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm px-4 fw-bold"
                  onClick={() => {
                    setSelectedTpl(previewingTpl);
                    onSelectTemplate(previewingTpl);
                    setPreviewingTpl(null);
                    onClose();
                  }}
                >
                  Apply This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
