import { normalizePhotoUrl } from "../../utils/resumeStorage";

export default function ModernTemplate({ resume }) {
  if (!resume) return null;
  const { personal, summary, education, experience, projects, skills, certifications, achievements, languages, settings } = resume;
  const accent = settings?.accentColor || "#0F4C81";

  const allSkillItems = Object.entries(skills || {}).map(([cat, list]) => ({
    category: cat.replace(/([A-Z])/g, " $1").trim(),
    items: Array.isArray(list) ? list : [],
  })).filter((s) => s.items.length > 0);

  return (
    <div className="resume-document p-4 p-md-5 bg-white text-dark shadow-sm rounded-3 font-sans" style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between border-bottom pb-4 mb-4" style={{ borderColor: accent }}>
        <div className="d-flex align-items-center gap-3">
          {(personal?.showPhoto !== false && personal?.photo) && (
            <img src={normalizePhotoUrl(personal.photo)} alt={personal.fullName} className="rounded-circle object-fit-cover shadow-sm" style={{ width: 72, height: 72, border: `2px solid ${accent}` }} />
          )}
          <div>
            <h2 className="fw-bold mb-1 text-uppercase tracking-wide" style={{ color: accent, fontSize: "1.75rem" }}>
              {personal?.fullName || "Full Name"}
            </h2>
            <p className="fw-semibold text-secondary mb-1 fs-6">{personal?.professionalTitle}</p>
            <p className="text-muted small mb-0">{personal?.location}</p>
          </div>
        </div>

        {/* Contact info */}
        <div className="text-end small text-muted">
          <div><i className="bi bi-envelope-fill me-1" style={{ color: accent }}></i>{personal?.email}</div>
          <div><i className="bi bi-telephone-fill me-1" style={{ color: accent }}></i>{personal?.phone}</div>
          {personal?.showLinkedin && personal?.linkedin && (
            <div><i className="bi bi-linkedin me-1" style={{ color: accent }}></i>{personal.linkedin.replace(/^https?:\/\//, "")}</div>
          )}
          {personal?.showGithub && personal?.github && (
            <div><i className="bi bi-github me-1" style={{ color: accent }}></i>{personal.github.replace(/^https?:\/\//, "")}</div>
          )}
          {personal?.showPortfolio && personal?.portfolio && (
            <div><i className="bi bi-globe me-1" style={{ color: accent }}></i>{personal.portfolio.replace(/^https?:\/\//, "")}</div>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#e2e8f0" }}>
            Professional Summary
          </h6>
          <p className="text-secondary mb-0">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {(() => {
        const validExp = (experience || []).filter((exp) => exp && (exp.designation?.trim() || exp.company?.trim() || exp.responsibilities?.trim()));
        if (validExp.length === 0) return null;
        return (
          <div className="mb-4">
            <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#e2e8f0" }}>
              Experience & Internships
            </h6>
            {validExp.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="d-flex justify-content-between align-items-baseline">
                  <span className="fw-bold text-dark fs-6">{exp.designation || "Role"} {exp.company ? <span className="fw-normal text-muted">| {exp.company}</span> : ""}</span>
                  <span className="small text-muted fw-medium">{exp.startDate} – {exp.currentCompany ? "Present" : exp.endDate}</span>
                </div>
                {exp.location && <p className="small text-muted mb-1"><i className="bi bi-geo-alt me-1"></i>{exp.location} ({exp.employmentType || "Full-time"})</p>}
                {exp.responsibilities && <p className="text-secondary small mb-1">{exp.responsibilities}</p>}
                {exp.technologies && <p className="small text-muted mb-0"><strong>Tech:</strong> {exp.technologies}</p>}
              </div>
            ))}
          </div>
        );
      })()}

      {/* Projects */}
      {(() => {
        const validProj = (projects || []).filter((proj) => proj && (proj.name?.trim() || proj.title?.trim() || proj.description?.trim()));
        if (validProj.length === 0) return null;
        return (
          <div className="mb-4">
            <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#e2e8f0" }}>
              Key Projects
            </h6>
            {validProj.map((proj) => (
              <div key={proj.id} className="mb-3">
                <div className="d-flex justify-content-between align-items-baseline">
                  <span className="fw-bold text-dark fs-6">{proj.name || proj.title} {proj.role ? <span className="fw-normal text-muted">({proj.role})</span> : ""}</span>
                  <span className="small text-muted">{proj.duration}</span>
                </div>
                {proj.description && <p className="text-secondary small mb-1">{proj.description}</p>}
                {proj.responsibilities && <p className="text-secondary small mb-1"><strong>Contributions:</strong> {proj.responsibilities}</p>}
                <div className="d-flex gap-3 small text-muted">
                  {proj.technologies && <span><strong>Tech:</strong> {proj.technologies}</span>}
                  {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noreferrer" className="text-decoration-none" style={{ color: accent }}>GitHub Link</a>}
                  {proj.liveDemo && <a href={proj.liveDemo} target="_blank" rel="noreferrer" className="text-decoration-none" style={{ color: accent }}>Live Demo</a>}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Education */}
      {(() => {
        const validEdu = (education || []).filter((edu) => edu && (edu.degree?.trim() || edu.college?.trim() || edu.university?.trim() || edu.specialization?.trim()));
        if (validEdu.length === 0) return null;
        return (
          <div className="mb-4">
            <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#e2e8f0" }}>
              Education
            </h6>
            {validEdu.map((edu) => (
              <div key={edu.id} className="mb-2 d-flex justify-content-between align-items-baseline">
                <div>
                  <span className="fw-bold text-dark">{edu.degree || "Degree"}{edu.specialization ? ` in ${edu.specialization}` : ""}</span>
                  <div className="small text-muted">{edu.college}{edu.university ? ` (${edu.university})` : ""}</div>
                </div>
                <div className="text-end small text-muted">
                  <span>{edu.startYear && `${edu.startYear} – `}{edu.endYear}</span>
                  {edu.cgpa && <div>CGPA: <strong>{edu.cgpa}</strong></div>}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
 

      {/* Skills */}
      {allSkillItems.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#e2e8f0" }}>
            Skills & Competencies
          </h6>
          <div className="row g-2">
            {allSkillItems.map((sk, idx) => (
              <div key={idx} className="col-md-6 small">
                <strong className="text-dark capitalize">{sk.category}: </strong>
                <span className="text-secondary">{sk.items.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Achievements */}
      <div className="row g-3">
        {certifications && certifications.length > 0 && (
          <div className="col-md-6">
            <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#e2e8f0" }}>
              Certifications
            </h6>
            {certifications.map((c) => (
              <div key={c.id} className="small mb-2">
                <div className="fw-bold text-dark">{c.name}</div>
                <div className="text-muted">{c.organization} ({c.issueDate})</div>
              </div>
            ))}
          </div>
        )}

        {achievements && achievements.length > 0 && (
          <div className="col-md-6">
            <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#e2e8f0" }}>
              Achievements & Honors
            </h6>
            {achievements.map((a) => (
              <div key={a.id} className="small mb-2">
                <div className="fw-bold text-dark">{a.title}</div>
                <div className="text-muted">{a.issuer} – {a.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="mt-3 pt-2 border-top small text-muted d-flex gap-3">
          <strong>Languages:</strong>
          {languages.map((l) => `${l.language} (${l.proficiency})`).join(" • ")}
        </div>
      )}
    </div>
  );
}
