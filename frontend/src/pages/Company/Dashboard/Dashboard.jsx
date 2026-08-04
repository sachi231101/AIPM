import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PostJobModal from "../../../components/Company/PostJobModal";
import ViewStudentProfileModal from "../../../components/Company/ViewStudentProfileModal";
import { companyService } from "../../../services/api";
import { toast } from "react-toastify";

export default function CompanyDashboard() {
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [viewingApp, setViewingApp] = useState(null);

  // Initialize company state with clean production data & API fetch
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem("apms_company_jobs");
    return saved ? JSON.parse(saved) : [];
  });

  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem("apms_company_applications");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Fetch live backend jobs for this company
    companyService.getJobs()
      .then((res) => {
        if (res.data?.data) {
          setJobs(res.data.data);
        }
      })
      .catch(() => {});

    // Fetch live backend applications for this company
    companyService.getApplications()
      .then((res) => {
        if (res.data?.data) {
          setApplications(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem("apms_company_jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem("apms_company_applications", JSON.stringify(applications));
  }, [applications]);

  // Statistics calculation
  const activeJobsCount = jobs.filter((j) => j.status === "published" || j.status === "approved" || j.status === "pending").length;
  const totalAppsCount = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === "shortlisted").length;
  const selectedCount = applications.filter((a) => a.status === "hired" || a.status === "selected").length;

  const handleSaveJob = (newJob) => {
    setJobs((prev) => [newJob, ...prev.filter((j) => j.id !== newJob.id)]);
  };

  const handleStatusChange = async (appId, newStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    try {
      await companyService.updateApplicationStatus(appId, newStatus);
      toast.success(`Application status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Company Dashboard</h3>
          <p className="text-muted small mb-0">Overview of your job postings and student hiring applications</p>
        </div>
        <button
          className="btn btn-primary fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2"
          onClick={() => setShowPostJobModal(true)}
        >
          <i className="bi bi-plus-lg fs-6"></i>
          <span>Post New Job</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        {/* Active Jobs */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block mb-1">Active Jobs</span>
                <h2 className="fw-bold text-primary mb-0">{activeJobsCount}</h2>
              </div>
              <div
                className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                style={{ width: 52, height: 52 }}
              >
                <i className="bi bi-briefcase-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Total Applications */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block mb-1">Total Applications</span>
                <h2 className="fw-bold text-info mb-0">{totalAppsCount}</h2>
              </div>
              <div
                className="rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center"
                style={{ width: 52, height: 52 }}
              >
                <i className="bi bi-file-earmark-person-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Shortlisted Students */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block mb-1">Shortlisted Students</span>
                <h2 className="fw-bold text-warning mb-0">{shortlistedCount}</h2>
              </div>
              <div
                className="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center"
                style={{ width: 52, height: 52 }}
              >
                <i className="bi bi-star-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Students */}
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block mb-1">Selected Students</span>
                <h2 className="fw-bold text-success mb-0">{selectedCount}</h2>
              </div>
              <div
                className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center"
                style={{ width: 52, height: 52 }}
              >
                <i className="bi bi-check-circle-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Recent Student Applications */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between border-0">
              <h5 className="fw-bold text-dark mb-0">Recent Applications</h5>
              <Link to="/company/applications" className="small text-primary text-decoration-none fw-semibold">
                View All <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
            <div className="card-body p-0 overflow-x-auto">
              <table className="table align-middle table-hover mb-0">
                <thead className="table-light text-muted small border-top">
                  <tr>
                    <th className="ps-4">Student</th>
                    <th>Applied For</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="pe-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{app.student.name}</div>
                        <div className="text-muted small">{app.student.course}</div>
                      </td>
                      <td className="small text-secondary fw-medium">{app.jobTitle}</td>
                      <td className="small text-muted">{app.appliedDate}</td>
                      <td>
                        <span
                          className={`badge rounded-pill px-2.5 py-1 ${
                            app.status === "shortlisted"
                              ? "bg-warning text-dark"
                              : app.status === "hired" || app.status === "selected"
                              ? "bg-success"
                              : app.status === "rejected"
                              ? "bg-danger"
                              : "bg-secondary"
                          }`}
                        >
                          {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <button
                          className="btn btn-sm btn-outline-primary fw-semibold"
                          onClick={() => setViewingApp(app)}
                        >
                          <i className="bi bi-eye me-1"></i> View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted small">
                        No applications received yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Jobs Posted */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between border-0">
              <h5 className="fw-bold text-dark mb-0">Recent Job Postings</h5>
              <Link to="/company/jobs" className="small text-primary text-decoration-none fw-semibold">
                Manage Jobs <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
            <div className="card-body p-0 overflow-x-auto">
              <table className="table align-middle table-hover mb-0">
                <thead className="table-light text-muted small border-top">
                  <tr>
                    <th className="ps-4">Job Title</th>
                    <th>Applicants</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.slice(0, 5).map((job) => (
                    <tr key={job.id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{job.title}</div>
                        <div className="text-muted small">{job.location}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border font-monospace">
                          {job.applicationsCount} Candidates
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill px-2.5 py-1 ${
                            job.status === "published" ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {job.status === "published" ? "ACTIVE" : "DRAFT"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Post Job Modal */}
      {showPostJobModal && (
        <PostJobModal
          onClose={() => setShowPostJobModal(false)}
          onSave={handleSaveJob}
        />
      )}

      {/* View Student Profile Modal */}
      {viewingApp && (
        <ViewStudentProfileModal
          application={viewingApp}
          onClose={() => setViewingApp(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
