import { Link } from "react-router-dom";
import { handleLogoError } from "../../utils/logoHelper";

const statusColors = {
  Published: "success",
  Approved: "primary",
  Pending: "warning",
  Rejected: "danger",
  Closed: "secondary",
};

export default function JobCard({ job, showApply = false, onApply, applyDisabled, applyLoading }) {
  const isApplied = job.isApplied || job.applied;
  const badge = statusColors[job.status] || "secondary";

  return (
    <div className={`card job-card h-100 shadow-sm border-0 ${isApplied ? "border-start border-4 border-success" : ""}`}>
      <div className="card-body d-flex flex-column gap-3 p-4">
        {/* Header */}
        <div className="d-flex align-items-start gap-3">
          <img
            src={job.companyLogo}
            alt={job.company}
            className="rounded-3"
            width={56}
            height={56}
            style={{ objectFit: "cover" }}
            onError={(e) => handleLogoError(e, job.company)}
          />
          <div className="flex-grow-1 min-width-0">
            <h6 className="fw-bold mb-1 text-truncate">{job.title}</h6>
            <div className="d-flex align-items-center gap-1.5 flex-wrap">
              <span className="text-muted small">{job.company}</span>
              {job.employmentType && (
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: "0.68rem" }}>
                  {job.employmentType}
                </span>
              )}
            </div>
          </div>
          {isApplied ? (
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small fw-semibold">
              <i className="bi bi-check-circle-fill me-1"></i>Applied
            </span>
          ) : (
            <span className={`badge bg-${badge} bg-opacity-10 text-${badge} border border-${badge} border-opacity-25 small`}>
              {job.status}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="d-flex flex-wrap gap-2 small text-muted">
          <span><i className="bi bi-geo-alt me-1 text-primary"></i>{job.location}</span>
          <span><i className="bi bi-currency-rupee me-1 text-success"></i>{job.salary}</span>
          <span><i className="bi bi-briefcase me-1 text-info"></i>{job.experience}</span>
        </div>

        {/* Skills */}
        <div className="d-flex flex-wrap gap-1">
          {job.skills?.slice(0, 3).map((skill, i) => (
            <span key={i} className="badge bg-light text-dark border small">{skill}</span>
          ))}
          {job.skills?.length > 3 && (
            <span className="badge bg-light text-muted border small">+{job.skills.length - 3} more</span>
          )}
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
          <small className="text-danger">
            <i className="bi bi-calendar-x me-1"></i>
            Last date: {job.lastDate ? new Date(job.lastDate).toLocaleDateString("en-IN") : "N/A"}
          </small>
          <div className="d-flex gap-2">
            <Link to={`/job/${job.id}`} className="btn btn-sm btn-outline-primary">
              View Details
            </Link>
            {showApply && (
              isApplied ? (
                <button className="btn btn-sm btn-success fw-semibold" disabled>
                  <i className="bi bi-check-lg me-1"></i>Applied
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => onApply?.(job)}
                  disabled={applyDisabled || applyLoading}
                >
                  {applyLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Applying...
                    </>
                  ) : (
                    "Apply"
                  )}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

