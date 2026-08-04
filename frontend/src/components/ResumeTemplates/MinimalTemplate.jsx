import { normalizePhotoUrl } from "../../utils/resumeStorage";

export default function MinimalTemplate({ resume }) {
  if (!resume) return null;
  const { personal, summary, education, experience, projects, skills, certifications, achievements, languages, settings } = resume;
  const accent = settings?.accentColor || "#1e293b";

  const allSkillsList = Object.values(skills || {}).flat();

  return (
    <div className="resume-document p-4 p-md-5 bg-white text-dark shadow-sm rounded-3 font-sans" style={{ fontSize: "0.875rem", lineHeight: "1.6" }}>
      {/* Name and Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="fw-bold tracking-tight mb-0" style={{ color: accent, fontSize: "2.25rem" }}>
            {personal?.fullName}
          </h1>
          <p className="fs-6 text-muted mb-2">{personal?.professionalTitle}</p>
          <div className="d-flex flex-wrap gap-3 small text-muted">
            <span>{personal?.email}</span> • <span>{personal?.phone}</span> • <span>{personal?.location}</span>
            {personal?.showLinkedin && personal?.linkedin && <span> • {personal.linkedin}</span>}
            {personal?.showGithub && personal?.github && <span> • {personal.github}</span>}
          </div>
        </div>
        {(personal?.showPhoto !== false && personal?.photo) && (
          <img
            src={normalizePhotoUrl(personal.photo)}
            alt={personal.fullName}
            className="rounded-circle object-fit-cover shadow-sm ms-3"
            style={{ width: 75, height: 75, border: `2px solid ${accent}` }}
          />
        )}
      </div>

      <hr className="my-4" />

      {/* Summary */}
      {summary && (
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase tracking-wider text-muted mb-2">About</h6>
          <p className="text-secondary">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {(() => {
        const validExp = (experience || []).filter((exp) => exp && (exp.designation?.trim() || exp.company?.trim() || exp.responsibilities?.trim()));
        if (validExp.length === 0) return null;
        return (
          <div className="mb-4">
            <h6 className="fw-bold text-uppercase tracking-wider text-muted mb-3">Experience</h6>
            {validExp.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="d-flex justify-content-between">
                  <strong>{exp.designation || "Role"} {exp.company ? <span className="text-muted">at {exp.company}</span> : ""}</strong>
                  <span className="text-muted small">{exp.startDate} — {exp.endDate}</span>
                </div>
                <p className="text-secondary mb-0 mt-1">{exp.responsibilities}</p>
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
            <h6 className="fw-bold text-uppercase tracking-wider text-muted mb-3">Projects</h6>
            {validProj.map((proj) => (
              <div key={proj.id} className="mb-3">
                <div className="d-flex justify-content-between">
                  <strong>{proj.name || proj.title}</strong>
                  <span className="text-muted small">{proj.duration}</span>
                </div>
                <p className="text-secondary mb-0">{proj.description}</p>
                {proj.technologies && <p className="text-muted small mb-0">Stack: {proj.technologies}</p>}
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
            <h6 className="fw-bold text-uppercase tracking-wider text-muted mb-3">Education</h6>
            {validEdu.map((edu) => (
              <div key={edu.id} className="d-flex justify-content-between mb-2">
                <div>
                  <strong>{edu.degree || "Degree"}{edu.specialization ? ` in ${edu.specialization}` : ""}</strong>
                  <div className="text-muted small">{edu.college || edu.university}</div>
                </div>
                <div className="text-end text-muted small">
                  {edu.startYear && `${edu.startYear} – `}{edu.endYear}
                  {edu.cgpa && <div>CGPA: {edu.cgpa}</div>}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
 

      {/* Skills */}
      {allSkillsList.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase tracking-wider text-muted mb-2">Skills</h6>
          <p className="text-secondary mb-0">{allSkillsList.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
