import { useState, useEffect } from "react";
import PostJobModal from "../../../components/Company/PostJobModal";
import { companyService } from "../../../services/api";
import { clearCache } from "../../../hooks/useCachedData";
import { toast } from "react-toastify";

export default function CompanyJobs() {
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);

  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem("apms_company_jobs");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    companyService.getJobs()
      .then((res) => {
        if (res.data?.data) {
          setJobs(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem("apms_company_jobs", JSON.stringify(jobs));
  }, [jobs]);

  const handleSaveJob = (jobObj) => {
    clearCache("public_jobs");
    clearCache("admin_jobs");
    companyService.getJobs()
      .then((res) => {
        if (res.data?.data) setJobs(res.data.data);
      })
      .catch(() => {
        if (editingJob) {
          setJobs((prev) => prev.map((j) => (j.id === jobObj.id ? jobObj : j)));
        } else {
          setJobs((prev) => [jobObj, ...prev]);
        }
      });
  };

  const handleCloseJob = async (jobId) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: "closed" } : j))
    );
    try {
      if (typeof jobId === "number" || !String(jobId).startsWith("job_")) {
        await companyService.updateJob(jobId, { status: "closed" });
      }
      clearCache("public_jobs");
      clearCache("admin_jobs");
      clearCache(`job_details_${jobId}`);
      toast.info("Job listing closed.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      try {
        if (typeof jobId === "number" || !String(jobId).startsWith("job_")) {
          await companyService.deleteJob(jobId);
        }
        clearCache("public_jobs");
        clearCache("admin_jobs");
        clearCache(`job_details_${jobId}`);
        toast.success("Job posting deleted.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const profileLogo = (() => {
    try {
      const saved = localStorage.getItem("apms_company_profile");
      return saved ? JSON.parse(saved).logo : null;
    } catch (e) {
      return null;
    }
  })();

  return (
    <div>
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Job Postings</h3>
          <p className="text-muted small mb-0">Create, publish, edit, and manage all your campus job openings</p>
        </div>
        <button
          className="btn btn-primary fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2"
          onClick={() => {
            setEditingJob(null);
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg fs-6"></i>
          <span>Post New Job</span>
        </button>
      </div>

      {/* Jobs Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-body p-0 overflow-x-auto">
          <table className="table align-middle table-hover mb-0">
            <thead className="table-light text-muted small">
              <tr>
                <th className="ps-4">Job Title</th>
                <th>Location</th>
                <th>Employment Type</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Posted Date</th>
                <th className="pe-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const logoSrc = job.company_logo || job.company?.logo_path || profileLogo;

                return (
                  <tr key={job.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-3 bg-light border d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0 shadow-sm"
                          style={{ width: 44, height: 44 }}
                        >
                          {logoSrc ? (
                            <img
                              src={logoSrc}
                              alt="Company Logo"
                              className="w-100 h-100 object-fit-contain p-1"
                              onError={(e) => {
                                e.target.style.display = "none";
                                if (e.target.nextSibling) e.target.nextSibling.style.display = "block";
                              }}
                            />
                          ) : null}
                          <i
                            className="bi bi-buildings-fill text-primary fs-5"
                            style={{ display: logoSrc ? "none" : "block" }}
                          ></i>
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{job.title}</div>
                          <div className="text-muted small">Experience: {job.experience}</div>
                        </div>
                      </div>
                    </td>
                  <td className="small text-secondary fw-medium">{job.location}</td>
                  <td>
                    <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2.5 py-1">
                      {job.employmentType}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border font-monospace px-2.5 py-1">
                      <i className="bi bi-people-fill text-primary me-1"></i>
                      {job.applicationsCount} Applications
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge rounded-pill px-3 py-1 ${
                        job.status === "published" || job.status === "approved"
                          ? "bg-success"
                          : job.status === "draft"
                          ? "bg-warning text-dark"
                          : "bg-warning bg-opacity-25 text-dark border border-warning"
                      }`}
                    >
                      {job.status === "published" || job.status === "approved"
                        ? "ACTIVE"
                        : job.status === "pending"
                        ? "PENDING APPROVAL"
                        : (job.status ? job.status.toUpperCase() : "PENDING")}
                    </span>
                  </td>
                  <td className="small text-muted">{job.postedDate}</td>
                  <td className="pe-4 text-end">
                    <div className="d-flex justify-content-end gap-1">
                      {/* View */}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        title="View Details"
                        onClick={() => setViewingJob(job)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        title="Edit Job"
                        onClick={() => {
                          setEditingJob(job);
                          setShowModal(true);
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>

                      {/* Close Job */}
                      {job.status !== "closed" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-warning"
                          title="Close Job"
                          onClick={() => handleCloseJob(job.id)}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Delete Job"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

              {jobs.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No jobs posted yet. Click <strong>+ Post New Job</strong> to create your first posting.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post / Edit Job Modal */}
      {showModal && (
        <PostJobModal
          initialData={editingJob}
          onClose={() => setShowModal(false)}
          onSave={handleSaveJob}
        />
      )}

      {/* View Job Details Modal */}
      {viewingJob && (
        <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" style={{ zIndex: 1065 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header bg-primary text-white py-3 px-4">
                <h5 className="modal-title fw-bold">{viewingJob.title}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setViewingJob(null)}></button>
              </div>
              <div className="modal-body p-4 bg-light">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Location</span>
                    <strong className="text-dark">{viewingJob.location}</strong>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Employment Type</span>
                    <strong className="text-dark">{viewingJob.employmentType}</strong>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Salary Package</span>
                    <strong className="text-dark">{viewingJob.salary || "Not Disclosed"}</strong>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Vacancies</span>
                    <strong className="text-dark">{viewingJob.vacancies} Positions</strong>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-muted small d-block mb-1">Required Skills</span>
                  <div className="d-flex flex-wrap gap-1">
                    {(viewingJob.skills || []).map((sk, i) => (
                      <span key={i} className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2.5 py-1">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {viewingJob.description && (
                  <div className="mb-3">
                    <span className="text-muted small d-block mb-1">Description</span>
                    <p className="text-secondary small mb-0">{viewingJob.description}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer py-2 bg-white">
                <button className="btn btn-secondary btn-sm" onClick={() => setViewingJob(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
