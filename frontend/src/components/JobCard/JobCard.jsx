import { Link } from "react-router-dom";

const statusColors = {
  Published: "success",
  Approved: "primary",
  Pending: "warning",
  Rejected: "danger",
  Closed: "secondary",
};

export default function JobCard({ job, showApply = false, onApply }) {
  const badge = statusColors[job.status] || "secondary";

  return (
    <div className="card job-card h-100 shadow-sm border-0">
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
          />
          <div className="flex-grow-1 min-width-0">
            <h6 className="fw-bold mb-1 text-truncate">{job.title}</h6>
            <p className="text-muted small mb-0">{job.company}</p>
          </div>
          <span className={`badge bg-${badge} bg-opacity-10 text-${badge} border border-${badge} border-opacity-25 small`}>
            {job.status}
          </span>
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
            Last date: {new Date(job.lastDate).toLocaleDateString("en-IN")}
          </small>
          <div className="d-flex gap-2">
            <Link to={`/job/${job.id}`} className="btn btn-sm btn-outline-primary">
              View Details
            </Link>
            {showApply && (
              <button className="btn btn-sm btn-primary" onClick={() => onApply?.(job)}>
                Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
