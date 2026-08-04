import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { jobService, studentService, applicationService } from "../../services/api";
import { getCompanyLogo, handleLogoError } from "../../utils/logoHelper";
import ConfirmApplicationModal from "../../components/ConfirmApplicationModal/ConfirmApplicationModal";

const statusMap = {
  published: "Published",
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  closed: "Closed"
};

import { useCachedData } from "../../hooks/useCachedData";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role;
  const [applying, setApplying] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

  const { data: jobRes, loading: loadingJob } = useCachedData(
    `job_details_${id}`,
    () => jobService.getById(id),
    [id]
  );

  const { data: profileRes } = useCachedData(
    role === "student" ? "student_profile" : null,
    studentService.getProfile
  );

  const { data: appsRes } = useCachedData(
    role === "student" ? "student_applications" : null,
    applicationService.getMyApplications
  );

  const backendJob = jobRes?.data || jobRes?.data?.data || null;

  const job = backendJob ? {
    id: backendJob.id,
    title: backendJob.title,
    company: backendJob.company?.name || "Unknown Company",
    companyLogo: getCompanyLogo(backendJob.company?.logo_path, backendJob.company?.name),
    location: backendJob.location,
    employmentType: backendJob.employment_type || backendJob.employmentType || "Full Time",
    salary: backendJob.salary,
    experience: backendJob.experience,
    openings: backendJob.openings,
    postedDate: backendJob.created_at,
    lastDate: backendJob.last_date,
    status: statusMap[backendJob.status] || "Published",
    description: backendJob.description,
    responsibilities: backendJob.responsibilities,
    eligibility: backendJob.eligibility,
    skills: backendJob.skills || [],
  } : null;

  const student = profileRes?.data || null;
  const myApps = appsRes ? (Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data?.data || [])) : [];
  const isApplied = myApps.some((app) => String(app.job?.id) === String(id));
  const loading = loadingJob && !job;

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ height: "400px" }}>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading placement drive details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-exclamation-circle text-muted" style={{ fontSize: "4rem" }}></i>
        <h4 className="mt-3 text-muted">Job not found</h4>
        <Link to="/placement-drives" className="btn btn-primary mt-3">Back to Drives</Link>
      </div>
    );
  }

  const approvalStatus = student?.approval_status || user?.approval_status || "approved";

  const isAlreadyApplied = isApplied || justApplied;

  const handleOpenConfirmModal = () => {
    if (isAlreadyApplied) {
      toast.info("You have already applied for this placement drive.");
      return;
    }

    if (approvalStatus !== "approved") {
      if (approvalStatus === "rejected") {
        toast.error("Your account status is rejected. You cannot apply for placement drives.");
      } else {
        toast.info("Your account is currently on hold. You can apply for jobs once the Placement Team releases the hold on your account.");
      }
      return;
    }

    if (!student) {
      toast.error("Student profile not loaded.");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setApplying(true);
      await applicationService.apply({ job_id: job.id });
      setJustApplied(true);
      setShowConfirmModal(false);
      toast.success(`Successfully applied for ${job.title} at ${job.company}! 🎉`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to submit application.";
      if (err.response?.status === 409) {
        setJustApplied(true);
        setShowConfirmModal(false);
        toast.info(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setApplying(false);
    }
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
                    style={{ objectFit: "cover" }}
                    onError={(e) => handleLogoError(e, job.company)}
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                      <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <h2 className="fw-bold mb-0">{job.title}</h2>
                          {job.employmentType && (
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1.5 small fw-semibold">
                              {job.employmentType}
                            </span>
                          )}
                        </div>
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
                <p className="text-muted mb-0" style={{ whiteSpace: "pre-line" }}>{job.description}</p>
              </div>
            </div>

            {/* Roles & Responsibilities */}
            {job.responsibilities && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3"><i className="bi bi-list-task me-2 text-primary"></i>Roles & Responsibilities</h5>
                  <p className="text-muted mb-0" style={{ whiteSpace: "pre-line" }}>{job.responsibilities}</p>
                </div>
              </div>
            )}

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

            {/* Apply / Status Banner */}
            <div className="card border-0 shadow-sm p-4">
              {!user ? (
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div>
                    <h6 className="fw-bold mb-1">Interested in this role?</h6>
                    <p className="text-muted small mb-0">Login with your mobile number to apply.</p>
                  </div>
                  <Link to="/student/login" className="btn btn-primary">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Login to Apply
                  </Link>
                </div>
              ) : role === "student" ? (
                <div>
                  {isAlreadyApplied ? (
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                      <div>
                        <h6 className="fw-bold text-success mb-1">
                          <i className="bi bi-check-circle-fill me-2"></i>You have applied for this drive!
                        </h6>
                        <p className="text-muted small mb-0">Your application and resume have been submitted.</p>
                      </div>
                      <button className="btn btn-success btn-lg fw-semibold" disabled>
                        <i className="bi bi-check-circle-fill me-2"></i>Applied
                      </button>
                    </div>
                  ) : approvalStatus === "approved" ? (
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                      <div>
                        <h6 className="fw-bold text-success mb-1">
                          <i className="bi bi-check-circle-fill me-2"></i>You are eligible to apply
                        </h6>
                        <p className="text-muted small mb-0">Review your profile details and submit your application.</p>
                      </div>
                      <button className="btn btn-success btn-lg px-4" onClick={handleOpenConfirmModal} disabled={applying}>
                        {applying ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Applying...</>
                        ) : (
                          <><i className="bi bi-send me-2"></i>Apply Now</>
                        )}
                      </button>
                    </div>
                  ) : (approvalStatus === "hold" || approvalStatus === "pending") ? (
                    <div>
                      <div className="alert alert-warning d-flex align-items-center gap-3 mb-3">
                        <i className="bi bi-pause-circle-fill fs-4"></i>
                        <div>
                          <strong>Account On Hold</strong>
                          <div className="small">Your account is currently placed on hold. You can apply for jobs once the Placement Team releases the hold on your account.</div>
                        </div>
                      </div>
                      <button className="btn btn-warning text-dark btn-lg px-4" disabled onClick={handleOpenConfirmModal}>
                        <i className="bi bi-pause-fill me-2"></i>Account On Hold
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="alert alert-danger d-flex align-items-center gap-3 mb-3">
                        <i className="bi bi-x-circle-fill fs-4"></i>
                        <div>
                          <strong>Account Status Rejected</strong>
                          <div className="small">Your account status is rejected. You cannot apply for placement drives.</div>
                        </div>
                      </div>
                      <button className="btn btn-danger btn-lg px-4" disabled onClick={handleOpenConfirmModal}>
                        <i className="bi bi-slash-circle me-2"></i>Application Disabled
                      </button>
                    </div>
                  )}
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
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmApplicationModal
          job={job}
          student={student}
          onConfirm={handleConfirmSubmit}
          onClose={() => setShowConfirmModal(false)}
          submitting={applying}
        />
      )}
    </div>
  );
}
