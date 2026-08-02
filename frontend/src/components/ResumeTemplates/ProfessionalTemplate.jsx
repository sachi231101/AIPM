export default function ProfessionalTemplate({ resume }) {
  if (!resume) return null;
  const { personal, summary, education, experience, projects, skills, certifications, achievements, languages, settings } = resume;
  const accent = settings?.accentColor || "#0F4C81";

  const allSkillsList = Object.values(skills || {}).flat();

  return (
    <div className="resume-document p-4 p-md-5 bg-white text-dark shadow-sm rounded-3 font-serif" style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
      {/* Header Banner */}
      <div className="text-center pb-4 mb-4 border-bottom border-2" style={{ borderColor: accent }}>
        {personal?.showPhoto && personal?.photo && (
          <div className="mb-3">
            <img
              src={personal.photo}
              alt={personal.fullName}
              className="rounded-circle object-fit-cover shadow-sm"
              style={{ width: 85, height: 85, border: `2px solid ${accent}` }}
            />
          </div>
        )}
        <h1 className="fw-bold mb-1 tracking-tight" style={{ color: accent, fontSize: "2rem" }}>
          {personal?.fullName}
        </h1>
        <div className="fw-medium text-dark fs-6 mb-2">{personal?.professionalTitle}</div>
        <div className="d-flex flex-wrap justify-content-center gap-3 small text-muted">
          {personal?.email && <span><i className="bi bi-envelope me-1"></i>{personal.email}</span>}
          {personal?.phone && <span><i className="bi bi-telephone me-1"></i>{personal.phone}</span>}
          {personal?.location && <span><i className="bi bi-geo-alt me-1"></i>{personal.location}</span>}
          {personal?.showLinkedin && personal?.linkedin && <span><i className="bi bi-linkedin me-1"></i>LinkedIn</span>}
          {personal?.showGithub && personal?.github && <span><i className="bi bi-github me-1"></i>GitHub</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
            Executive Summary
          </h6>
          <p className="text-secondary mb-0">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
            Professional Experience
          </h6>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="d-flex justify-content-between align-items-baseline">
                <span className="fw-bold text-dark">{exp.designation} — <span className="fst-italic">{exp.company}</span></span>
                <span className="small text-muted fw-semibold">{exp.startDate} to {exp.currentCompany ? "Present" : exp.endDate}</span>
              </div>
              <div className="small text-muted mb-1">{exp.location} | {exp.employmentType}</div>
              {exp.responsibilities && <p className="text-secondary small mb-1">{exp.responsibilities}</p>}
              {exp.technologies && <p className="small text-muted mb-0"><strong>Skills Utilized:</strong> {exp.technologies}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
            Technical Projects
          </h6>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <div className="d-flex justify-content-between">
                <span className="fw-bold text-dark">{proj.name} ({proj.role})</span>
                <span className="small text-muted">{proj.duration}</span>
              </div>
              <p className="text-secondary small mb-1">{proj.description}</p>
              {proj.responsibilities && <p className="text-secondary small mb-1">Key Deliverables: {proj.responsibilities}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education & Skills Grid */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
            Education
          </h6>
          {education?.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="fw-bold text-dark">{edu.degree} in {edu.specialization}</div>
              <div className="small text-muted">{edu.college} ({edu.startYear} – {edu.endYear})</div>
              {edu.cgpa && <div className="small text-muted">CGPA: {edu.cgpa}</div>}
            </div>
          ))}
        </div>

        <div className="col-md-6">
          <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
            Technical Core Competencies
          </h6>
          <p className="small text-secondary">{allSkillsList.join(" • ")}</p>
        </div>
      </div>

      {/* Certifications & Languages */}
      <div className="row g-4">
        {certifications && certifications.length > 0 && (
          <div className="col-md-6">
            <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
              Certifications
            </h6>
            {certifications.map((c) => (
              <div key={c.id} className="small mb-1">
                <strong>{c.name}</strong> — {c.organization} ({c.issueDate})
              </div>
            ))}
          </div>
        )}

        {languages && languages.length > 0 && (
          <div className="col-md-6">
            <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
              Languages
            </h6>
            <p className="small text-secondary">{languages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
