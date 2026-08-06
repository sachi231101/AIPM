import { normalizePhotoUrl } from "../../utils/resumeStorage";

export default function ExecutiveTemplate({ resume }) {
  if (!resume) return null;
  const { personal, summary, education, experience, projects, skills, certifications, achievements, languages, settings } = resume;
  const accent = settings?.accentColor || "#0F4C81";
  const fontFamily = settings?.fontFamily || "Inter";
  const fontStyle = settings?.fontStyle || "normal";
  const fontSizeMap = { small: "0.82rem", medium: "0.92rem", large: "1.05rem", xlarge: "1.18rem" };
  const lineSpacingMap = { compact: "1.2", normal: "1.5", spacious: "1.8" };
  const fontSize = fontSizeMap[settings?.fontSize] || "0.92rem";
  const lineHeight = lineSpacingMap[settings?.lineSpacing] || "1.5";

  const allSkillsList = Object.values(skills || {}).flat();

  return (
    <div className="resume-document bg-white text-dark shadow-sm rounded-3 overflow-hidden d-flex" style={{ fontFamily, fontStyle, fontSize, lineHeight }}>
      {/* Left Sidebar */}
      <div className="p-4 text-white d-flex flex-column gap-4" style={{ width: "32%", backgroundColor: accent, minHeight: "100%" }}>
        {/* Photo */}
        {(personal?.showPhoto !== false && personal?.photo) && (
          <div className="text-center">
            <img src={normalizePhotoUrl(personal.photo)} alt={personal.fullName} className="rounded-circle border border-3 border-white object-fit-cover shadow" style={{ width: 110, height: 110 }} />
          </div>
        )}

        {/* Contact */}
        <div>
          <h6 className="fw-bold text-uppercase border-bottom border-light pb-1 mb-3 text-warning">Contact Info</h6>
          <div className="d-flex flex-column gap-2 small text-white-75">
            <div><i className="bi bi-envelope me-2 text-warning"></i>{personal?.email}</div>
            <div><i className="bi bi-telephone me-2 text-warning"></i>{personal?.phone}</div>
            <div><i className="bi bi-geo-alt me-2 text-warning"></i>{personal?.location}</div>
            {personal?.showLinkedin && personal?.linkedin && <div><i className="bi bi-linkedin me-2 text-warning"></i>LinkedIn Profile</div>}
            {personal?.showGithub && personal?.github && <div><i className="bi bi-github me-2 text-warning"></i>GitHub Repository</div>}
          </div>
        </div>

        {/* Skills */}
        {allSkillsList.length > 0 && (
          <div>
            <h6 className="fw-bold text-uppercase border-bottom border-light pb-1 mb-3 text-warning">Core Skills</h6>
            <div className="d-flex flex-wrap gap-1">
              {allSkillsList.map((s, idx) => (
                <span key={idx} className="badge bg-white text-dark fw-semibold px-2 py-1 shadow-sm">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div>
            <h6 className="fw-bold text-uppercase border-bottom border-light pb-1 mb-3 text-warning">Languages</h6>
            <div className="small text-white-75">
              {languages.map((l) => (
                <div key={l.id} className="d-flex justify-content-between mb-1">
                  <span>{l.language}</span>
                  <span className="text-warning small">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Main Content */}
      <div className="p-4 p-md-5 flex-grow-1">
        {/* Name Header */}
        <div className="border-bottom pb-3 mb-4">
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: "1.85em" }}>{personal?.fullName}</h2>
          <h6 className="fw-semibold" style={{ color: accent }}>{personal?.professionalTitle}</h6>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-4">
            <h6 className="fw-bold text-uppercase mb-2" style={{ color: accent }}>Profile Summary</h6>
            <p className="text-secondary mb-0">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {(() => {
          const validExp = (experience || []).filter((exp) => exp && (exp.designation?.trim() || exp.company?.trim() || exp.responsibilities?.trim()));
          if (validExp.length === 0) return null;
          return (
            <div className="mb-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ color: accent }}>Experience</h6>
              {validExp.map((exp) => (
                <div key={exp.id} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <strong className="text-dark">{exp.designation || "Role"}</strong>
                    <span className="text-muted small">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <div className="small text-muted mb-1">{exp.company} {exp.location ? `| ${exp.location}` : ""}</div>
                  <p className="text-secondary small mb-0">{exp.responsibilities}</p>
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
              <h6 className="fw-bold text-uppercase mb-3" style={{ color: accent }}>Projects</h6>
              {validProj.map((proj) => (
                <div key={proj.id} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <strong className="text-dark">{proj.name || proj.title}</strong>
                    <span className="text-muted small">{proj.duration}</span>
                  </div>
                  <p className="text-secondary small mb-0">{proj.description}</p>
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
              <h6 className="fw-bold text-uppercase mb-3" style={{ color: accent }}>Education</h6>
              {validEdu.map((edu) => (
                <div key={edu.id} className="mb-2 d-flex justify-content-between">
                  <div>
                    <strong className="text-dark">
                      {edu.degree || "Degree"}{edu.specialization ? ` in ${edu.specialization}` : ""}
                    </strong>
                    <div className="small text-muted">{edu.college || edu.university}</div>
                  </div>
                  <div className="text-end small text-muted">
                    {edu.startYear && `${edu.startYear} – `}{edu.endYear}
                    {edu.cgpa && <div>CGPA: {edu.cgpa}</div>}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
