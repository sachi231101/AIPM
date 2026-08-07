import { useState } from "react";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { jobService } from "../../../services/api";
import { useCachedData, clearCache } from "../../../hooks/useCachedData";
import { getCompanyLogo, handleLogoError } from "../../../utils/logoHelper";

const statusColors = { 
  Published: "success", 
  Approved: "primary", 
  Pending: "warning", 
  Rejected: "danger", 
  Closed: "secondary" 
};

const statusMap = {
  published: "Published",
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  closed: "Closed"
};

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    title: "",
    location: "",
    salary: "",
    experience: "",
    openings: "1",
    last_date: "",
    skills: "",
    description: "",
    eligibility: "",
    status: "published"
  });

  const { data: rawJobsResponse, loading, refresh: refetch, setData } = useCachedData(
    "admin_jobs",
    jobService.adminGetAll
  );

  const rawJobs = rawJobsResponse ? (Array.isArray(rawJobsResponse.data) ? rawJobsResponse.data : (rawJobsResponse.data?.data || [])) : [];
  const jobs = rawJobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company?.name || "Unknown Company",
    companyLogo: getCompanyLogo(job.company?.logo_path, job.company?.name),
    location: job.location,
    salary: job.salary,
    status: statusMap[job.status] || "Pending",
    lastDate: job.last_date,
  }));

  const filtered = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? j.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id, action) => {
    const newStatusLower = action.toLowerCase();

    // Optimistic UI update
    if (rawJobsResponse) {
      const isArray = Array.isArray(rawJobsResponse.data);
      const currentList = isArray ? rawJobsResponse.data : (rawJobsResponse.data?.data || []);
      const updatedList = currentList.map((job) =>
        job.id === id ? { ...job, status: newStatusLower } : job
      );
      const updatedResponse = isArray
        ? { ...rawJobsResponse, data: updatedList }
        : { ...rawJobsResponse, data: { ...rawJobsResponse.data, data: updatedList } };
      setData(updatedResponse);
    }

    try {
      if (action === "Approved") {
        await jobService.approve(id);
      } else if (action === "Published") {
        await jobService.publish(id, {});
      } else if (action === "Rejected") {
        await jobService.reject(id);
      } else if (action === "Closed") {
        await jobService.close(id);
      }
      clearCache("public_jobs");
      clearCache(`job_details_${id}`);
      toast.success(`Job drive status updated to ${newStatusLower}!`);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update drive status.");
      refetch();
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await jobService.create(formData);
      toast.success("Job drive created successfully! 🎉");
      setShowCreateModal(false);
      setFormData({
        company_name: "",
        title: "",
        location: "",
        salary: "",
        experience: "",
        openings: "1",
        last_date: "",
        skills: "",
        description: "",
        eligibility: "",
        status: "published"
      });
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create job drive.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="text-center py-5" style={{ height: "400px" }}>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading placement drives...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Jobs & Drives"
        subtitle="Manage and post placement job drives"
        breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Jobs" }]}
        action={
          <button
            className="btn btn-primary fw-semibold d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-lg"></i> Create Job Drive
          </button>
        }
      />

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input
                  className="form-control border-start-0"
                  placeholder="Search jobs or companies..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-4">
              <select className="form-select w-100" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option>Published</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Closed</option>
              </select>
            </div>
            <div className="col-12 col-md-3 text-start text-md-end">
              <span className="badge bg-primary px-3 py-2">{filtered.length} Drives</span>
            </div>
          </div>
        </div>
        <div className="card-body p-0 mt-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="py-3">Job / Company</th>
                  <th className="py-3">Location</th>
                  <th className="py-3">Salary</th>
                  <th className="py-3">Last Date</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((job, i) => (
                    <tr key={job.id}>
                      <td className="px-4 text-muted">{i + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={job.companyLogo}
                            alt={job.company}
                            width={36}
                            height={36}
                            className="rounded-2"
                            style={{ objectFit: "cover" }}
                            onError={(e) => handleLogoError(e, job.company)}
                          />
                          <div>
                            <p className="fw-medium mb-0 small text-dark">{job.title}</p>
                            <small className="text-muted">{job.company}</small>
                          </div>
                        </div>
                      </td>
                      <td className="small text-muted">{job.location}</td>
                      <td className="small fw-medium text-success">{job.salary}</td>
                      <td className="small text-danger">{job.lastDate ? new Date(job.lastDate).toLocaleDateString("en-IN") : "N/A"}</td>
                      <td>
                        <span className={`badge bg-${statusColors[job.status] || "secondary"} bg-opacity-10 text-${statusColors[job.status] || "secondary"} border border-${statusColors[job.status] || "secondary"} border-opacity-25`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <div className="d-flex gap-1 justify-content-end flex-wrap">
                          <Link to={`/admin/jobs/${job.id}`} className="btn btn-xs btn-outline-primary py-1 px-2" style={{ fontSize: "0.75rem" }}>
                            <i className="bi bi-eye"></i> View Details
                          </Link>
                          {job.status === "Pending" && (
                            <button className="btn btn-xs btn-success py-1 px-2" style={{ fontSize: "0.75rem" }} onClick={() => updateStatus(job.id, "Approved")}>
                              <i className="bi bi-check-lg"></i> Approve
                            </button>
                          )}
                          {(job.status === "Approved" || job.status === "Pending") && (
                            <button className="btn btn-xs btn-primary py-1 px-2" style={{ fontSize: "0.75rem" }} onClick={() => updateStatus(job.id, "Published")}>
                              <i className="bi bi-send"></i> Publish
                            </button>
                          )}
                          {job.status === "Pending" && (
                            <button className="btn btn-xs btn-outline-danger py-1 px-2" style={{ fontSize: "0.75rem" }} onClick={() => updateStatus(job.id, "Rejected")}>
                              <i className="bi bi-x-lg"></i> Reject
                            </button>
                          )}
                          {job.status === "Published" && (
                            <button className="btn btn-xs btn-outline-secondary py-1 px-2" style={{ fontSize: "0.75rem" }} onClick={() => updateStatus(job.id, "Closed")}>
                              <i className="bi bi-lock"></i> Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted small">No jobs registered match the filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── CREATE JOB MODAL ── */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 bg-primary text-white py-3">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-briefcase-fill"></i> Create New Job Drive
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateJob}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Job Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Software Engineer, Financial Analyst"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Company Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Google, Tata Consultancy Services"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Job Location <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Bangalore, Hyderabad, Remote"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Salary / CTC Package</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. ₹6.5 LPA - ₹8.0 LPA (Optional)"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-medium">Experience Required <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Freshers / 0-2 Years"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-medium">Openings Count</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={formData.openings}
                        onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-medium">Application Last Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        required
                        className="form-control"
                        value={formData.last_date}
                        onChange={(e) => setFormData({ ...formData, last_date: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium">Required Technical Skills (Comma separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. React, Node.js, Python, SQL"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium">Job Description <span className="text-danger">*</span></label>
                      <textarea
                        required
                        rows={3}
                        className="form-control"
                        placeholder="Describe key responsibilities and role summary..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium">Eligibility Criteria <span className="text-danger">*</span></label>
                      <textarea
                        required
                        rows={2}
                        className="form-control"
                        placeholder="e.g. B.Tech / BE (CSE, IT, ECE) with minimum 60% or 6.5 CGPA throughout academics."
                        value={formData.eligibility}
                        onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 py-2.5">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fw-semibold px-4"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Creating Job...</>
                    ) : (
                      <><i className="bi bi-check-lg me-1"></i>Publish Job Drive</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
