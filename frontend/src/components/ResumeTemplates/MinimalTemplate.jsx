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
      {experience && experience.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase tracking-wider text-muted mb-3">Experience</h6>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="d-flex justify-content-between">
                <strong>{exp.designation} <span className="text-muted">at {exp.company}</span></strong>
                <span className="text-muted small">{exp.startDate} — {exp.endDate}</span>
              </div>
              <p className="text-secondary mb-0 mt-1">{exp.responsibilities}</p>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase tracking-wider text-muted mb-3">Projects</h6>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <div className="d-flex justify-content-between">
                <strong>{proj.name}</strong>
                <span className="text-muted small">{proj.duration}</span>
              </div>
              <p className="text-secondary mb-0">{proj.description}</p>
              {proj.technologies && <p className="text-muted small mb-0">Stack: {proj.technologies}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase tracking-wider text-muted mb-3">Education</h6>
          {education.map((edu) => (
            <div key={edu.id} className="d-flex justify-content-between mb-2">
              <div>
                <strong>{edu.degree} in {edu.specialization}</strong>
                <div className="text-muted small">{edu.college}</div>
              </div>
              <div className="text-end text-muted small">
                {edu.startYear} – {edu.endYear}
                {edu.cgpa && <div>CGPA: {edu.cgpa}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

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
