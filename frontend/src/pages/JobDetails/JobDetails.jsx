import { useParams, Link } from "react-router-dom";
import { jobs, currentStudent } from "../../utils/mockData";
import { getStudents } from "../../utils/studentStorage";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

export default function JobDetails() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const job = jobs.find((j) => j.id === parseInt(id));

  if (!job) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-exclamation-circle text-muted" style={{ fontSize: "4rem" }}></i>
        <h4 className="mt-3 text-muted">Job not found</h4>
        <Link to="/placement-drives" className="btn btn-primary mt-3">Back to Drives</Link>
      </div>
    );
  }

  const studentInstituteId = role === "student" ? (user?.instituteId || currentStudent.instituteId) : null;
  const isEligible = role === "student" ? job.eligibleInstitutes.includes(studentInstituteId) : false;

  const handleApply = () => {
    const allStudents = getStudents();
    const current = allStudents.find((s) => s.id === user?.id) || { ...currentStudent, ...user };
    if (current.profileCompletion < 100) {
      toast.error("Please complete your profile and upload your resume before applying.");
      return;
    }
    toast.success(`Successfully applied for ${job.title} at ${job.company}!`);
  };

  const statusColors = { Published: "success", Approved: "primary", Pending: "warning", Rejected: "danger" };

  return (
    <div className="py-5 bg-light">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/placement-drives">Placement Drives</Link></li>
            <li className="breadcrumb-item active">{job.title}</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* Main Content */}
          <div className="col-lg-8">
            {/* Header Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-start gap-4">
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="rounded-3 flex-shrink-0"
                    width={80}
                    height={80}
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                      <div>
                        <h2 className="fw-bold mb-1">{job.title}</h2>
                        <p className="text-primary fw-semibold mb-0">{job.company}</p>
                      </div>
                      <span className={`badge bg-${statusColors[job.status] || "secondary"} px-3 py-2`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="d-flex flex-wrap gap-3 mt-3 text-muted small">
                      <span><i className="bi bi-geo-alt-fill text-primary me-1"></i>{job.location}</span>
                      <span><i className="bi bi-briefcase-fill text-info me-1"></i>{job.experience}</span>
                      <span><i className="bi bi-people-fill text-success me-1"></i>{job.openings} Openings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3"><i className="bi bi-file-text me-2 text-primary"></i>Job Description</h5>
                <p className="text-muted">{job.description}</p>
              </div>
            </div>

            {/* Eligibility */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3"><i className="bi bi-check-circle me-2 text-success"></i>Eligibility Criteria</h5>
                <p className="text-muted mb-0">{job.eligibility}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3"><i className="bi bi-tools me-2 text-warning"></i>Skills Required</h5>
                <div className="d-flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 border border-primary border-opacity-25">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply / Eligibility Message */}
            <div className={`card border-0 shadow-sm p-4 ${isEligible ? "border-start border-success border-4" : role === "student" ? "border-start border-danger border-4" : ""}`}>
              {!user ? (
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div>
                    <h6 className="fw-bold mb-1">Interested in this role?</h6>
                    <p className="text-muted small mb-0">Login to apply for this position.</p>
                  </div>
                  <Link to="/student/login" className="btn btn-primary">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Login to Apply
                  </Link>
                </div>
              ) : role === "student" && isEligible ? (
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div>
                    <h6 className="fw-bold text-success mb-1"><i className="bi bi-check-circle-fill me-2"></i>You are eligible for this drive!</h6>
                    <p className="text-muted small mb-0">Your institute is part of this placement drive.</p>
                  </div>
                  <button className="btn btn-success btn-lg" onClick={handleApply}>
                    <i className="bi bi-send me-2"></i>Apply Now
                  </button>
                </div>
              ) : role === "student" ? (
                <div className="d-flex align-items-start gap-3">
                  <i className="bi bi-exclamation-triangle-fill text-danger fs-4 mt-1"></i>
                  <div>
                    <h6 className="fw-bold text-danger mb-1">Not Available for Your Institute</h6>
                    <p className="text-muted small mb-0">This placement drive is not available for students from your institute. Please check other available drives.</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: "80px" }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>Job Overview</h6>
                {[
                  { icon: "bi-currency-rupee", color: "success", label: "Salary / CTC", value: job.salary },
                  { icon: "bi-briefcase", color: "primary", label: "Experience", value: job.experience },
                  { icon: "bi-geo-alt", color: "danger", label: "Location", value: job.location },
                  { icon: "bi-people", color: "info", label: "Openings", value: `${job.openings} Positions` },
                  { icon: "bi-calendar-event", color: "warning", label: "Posted On", value: new Date(job.postedDate).toLocaleDateString("en-IN") },
                  { icon: "bi-calendar-x", color: "danger", label: "Last Date", value: new Date(job.lastDate).toLocaleDateString("en-IN") },
                ].map((item, i) => (
                  <div key={i} className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                    <div className={`rounded-3 d-flex align-items-center justify-content-center flex-shrink-0`}
                      style={{ width: 38, height: 38, background: `var(--bs-${item.color}-bg-subtle, #f0f0f0)` }}>
                      <i className={`bi ${item.icon} text-${item.color}`}></i>
                    </div>
                    <div>
                      <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>{item.label}</p>
                      <p className="fw-semibold mb-0 small">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card border-0 shadow-sm mt-3">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">Share This Drive</h6>
                <div className="d-flex gap-2">
                  {["bi-linkedin", "bi-whatsapp", "bi-telegram", "bi-link-45deg"].map((icon, i) => (
                    <button key={i} className="btn btn-light btn-sm flex-grow-1">
                      <i className={`bi ${icon}`}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
