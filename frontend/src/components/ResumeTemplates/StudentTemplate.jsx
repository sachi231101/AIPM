import { normalizePhotoUrl } from "../../utils/resumeStorage";

export default function StudentTemplate({ resume }) {
  if (!resume) return null;
  const { personal, summary, education, experience, projects, skills, certifications, achievements, languages, settings } = resume;
  const accent = settings?.accentColor || "#0F4C81";
  const fontFamily = settings?.fontFamily || "Inter";
  const fontStyle = settings?.fontStyle || "normal";
  const fontSizeMap = { small: "0.82rem", medium: "0.92rem", large: "1.05rem", xlarge: "1.18rem" };
  const lineSpacingMap = { compact: "1.2", normal: "1.5", spacious: "1.8" };
  const fontSize = fontSizeMap[settings?.fontSize] || "0.92rem";
  const lineHeight = lineSpacingMap[settings?.lineSpacing] || "1.5";

  const allSkillItems = Object.entries(skills || {}).map(([cat, list]) => ({
    category: cat.replace(/([A-Z])/g, " $1").trim(),
    items: Array.isArray(list) ? list : [],
  })).filter((s) => s.items.length > 0);

  return (
    <div className="resume-document p-4 p-md-5 bg-white text-dark shadow-sm rounded-3" style={{ fontFamily, fontStyle, fontSize, lineHeight }}>
      {/* Header */}
      <div className="text-center pb-3 mb-4 border-bottom border-2" style={{ borderColor: accent }}>
        {(personal?.showPhoto !== false && personal?.photo) && (
          <div className="mb-3">
            <img
              src={normalizePhotoUrl(personal.photo)}
              alt={personal.fullName}
              className="rounded-circle object-fit-cover shadow-sm"
              style={{ width: 80, height: 80, border: `2px solid ${accent}` }}
            />
          </div>
        )}
        <h2 className="fw-bold text-uppercase mb-1" style={{ color: accent, fontSize: "1.8em" }}>
          {personal?.fullName}
        </h2>
        <div className="fw-medium text-secondary mb-2">{personal?.professionalTitle}</div>
        <div className="d-flex flex-wrap justify-content-center gap-3 small text-muted">
          <span><i className="bi bi-envelope me-1"></i>{personal?.email}</span>
          <span><i className="bi bi-telephone me-1"></i>{personal?.phone}</span>
          <span><i className="bi bi-geo-alt me-1"></i>{personal?.location}</span>
        </div>
        <div className="d-flex flex-wrap justify-content-center gap-3 small text-primary mt-1">
          {personal?.showLinkedin && personal?.linkedin && <span><i className="bi bi-linkedin me-1"></i>{personal.linkedin}</span>}
          {personal?.showGithub && personal?.github && <span><i className="bi bi-github me-1"></i>{personal.github}</span>}
          {personal?.showLeetcode && personal?.leetcode && <span><i className="bi bi-code-slash me-1"></i>{personal.leetcode}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
            Career Objective / Summary
          </h6>
          <p className="text-secondary mb-0">{summary}</p>
        </div>
      )}

      {/* Education First for Freshers */}
      {(() => {
        const validEdu = (education || []).filter((edu) => edu && (edu.degree?.trim() || edu.college?.trim() || edu.university?.trim() || edu.specialization?.trim()));
        if (validEdu.length === 0) return null;
        return (
          <div className="mb-4">
            <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
              Education & Academic Credentials
            </h6>
            {validEdu.map((edu) => (
              <div key={edu.id} className="mb-2 d-flex justify-content-between">
                <div>
                  <span className="fw-bold text-dark">{edu.degree || "Degree"}{edu.specialization ? ` — ${edu.specialization}` : ""}</span>
                  <div className="small text-muted">{edu.college}{edu.university ? ` (${edu.university})` : ""}</div>
                </div>
                <div className="text-end small">
                  <span className="fw-semibold">{edu.startYear && `${edu.startYear} – `}{edu.endYear}</span>
                  {edu.cgpa && <div className="text-muted">CGPA: <strong>{edu.cgpa}</strong></div>}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Skills */}
      {allSkillItems.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
            Technical & Professional Skills
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

      {/* Academic & Personal Projects */}
      {(() => {
        const validProj = (projects || []).filter((proj) => proj && (proj.name?.trim() || proj.title?.trim() || proj.description?.trim()));
        if (validProj.length === 0) return null;
        return (
          <div className="mb-4">
            <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
              Key Projects & Applications
            </h6>
            {validProj.map((proj) => (
              <div key={proj.id} className="mb-3">
                <div className="d-flex justify-content-between align-items-baseline">
                  <span className="fw-bold text-dark">{proj.name || proj.title} {proj.role ? <span className="fw-normal text-muted">({proj.role})</span> : ""}</span>
                  <span className="small text-muted">{proj.duration}</span>
                </div>
                <p className="text-secondary small mb-1">{proj.description}</p>
                {proj.responsibilities && <p className="text-secondary small mb-1"><strong>Key Highlights:</strong> {proj.responsibilities}</p>}
                {proj.technologies && <div className="small text-muted"><strong>Stack:</strong> {proj.technologies}</div>}
              </div>
            ))}
          </div>
        );
      })()}

      {/* Experience / Internships */}
      {(() => {
        const validExp = (experience || []).filter((exp) => exp && (exp.designation?.trim() || exp.company?.trim() || exp.responsibilities?.trim()));
        if (validExp.length === 0) return null;
        return (
          <div className="mb-4">
            <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
              Internship & Practical Experience
            </h6>
            {validExp.map((exp) => (
              <div key={exp.id} className="mb-2">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold text-dark">{exp.designation || "Role"} {exp.company ? <span className="fw-normal text-muted">({exp.company})</span> : ""}</span>
                  <span className="small text-muted">{exp.startDate} – {exp.endDate}</span>
                </div>
                <p className="text-secondary small mb-0">{exp.responsibilities}</p>
              </div>
            ))}
          </div>
        );
      })()}
 

      {/* Achievements & Certifications */}
      <div className="row g-3">
        {achievements && achievements.length > 0 && (
          <div className="col-md-6">
            <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
              Achievements & Competitions
            </h6>
            {achievements.map((a) => (
              <div key={a.id} className="small mb-2">
                <strong className="text-dark">{a.title}</strong>
                <div className="text-muted">{a.issuer} ({a.date})</div>
              </div>
            ))}
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div className="col-md-6">
            <h6 className="fw-bold text-uppercase border-bottom pb-1 mb-2 tracking-wider" style={{ color: accent, borderColor: "#cbd5e1" }}>
              Certifications
            </h6>
            {certifications.map((c) => (
              <div key={c.id} className="small mb-2">
                <strong className="text-dark">{c.name}</strong>
                <div className="text-muted">{c.organization} ({c.issueDate})</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
