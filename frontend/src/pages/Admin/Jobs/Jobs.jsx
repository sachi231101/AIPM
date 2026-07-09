import { useState, useEffect } from "react";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { jobService } from "../../../services/api";

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
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobService.adminGetAll();
      const rawJobs = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.data || []);
      const mapped = rawJobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company?.name || "Unknown Company",
        companyLogo: job.company?.logo_path
          ? `http://localhost:8000/storage/${job.company.logo_path}`
          : "https://placehold.co/100x100?text=" + encodeURIComponent(job.company?.name || "Job"),
        location: job.location,
        salary: job.salary,
        status: statusMap[job.status] || "Pending",
        lastDate: job.last_date,
      }));
      setJobs(mapped);
    } catch (err) {
      console.error("Failed to load jobs", err);
      toast.error("Failed to load placement drives.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filtered = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? j.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id, action) => {
    try {
      if (action === "Approved") {
        await jobService.approve(id);
      } else if (action === "Published") {
        await jobService.publish(id);
      } else if (action === "Rejected") {
        await jobService.reject(id);
      } else if (action === "Closed") {
        await jobService.close(id);
      }
      toast.success(`Job drive status updated to ${action.toLowerCase()}!`);
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update drive status.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5" style={{ height: "400px" }}>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading placement drives...
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Jobs" subtitle="Manage placement job drives" breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Jobs" }]} />

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input className="form-control border-start-0" placeholder="Search jobs or companies..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option>Pending</option><option>Approved</option><option>Published</option><option>Rejected</option><option>Closed</option>
              </select>
            </div>
            <div className="col-md-3 text-end">
              <span className="badge bg-primary px-3 py-2">{filtered.length} Jobs</span>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
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
                          <img src={job.companyLogo} alt={job.company} width={36} height={36} className="rounded-2" style={{ objectFit: "cover" }} />
                          <div>
                            <p className="fw-medium mb-0 small">{job.title}</p>
                            <small className="text-muted">{job.company}</small>
                          </div>
                        </div>
                      </td>
                      <td className="small text-muted">{job.location}</td>
                      <td className="small fw-medium text-success">{job.salary}</td>
                      <td className="small text-danger">{new Date(job.lastDate).toLocaleDateString("en-IN")}</td>
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
                          {job.status === "Approved" && (
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
                    <td colSpan={7} className="text-center py-4 text-muted small">No jobs registered match the filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
