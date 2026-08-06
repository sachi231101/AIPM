import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { toast } from "react-toastify";
import { jobService } from "../../../services/api";
import { getCompanyLogo } from "../../../utils/logoHelper";

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

export default function AdminJobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jobRes = await jobService.getById(id);
        const backendJob = jobRes.data.data;

        // Map backend job to UI structure
        const mappedJob = {
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
          status: statusMap[backendJob.status] || "Pending",
          description: backendJob.description,
          responsibilities: backendJob.responsibilities || "",
          eligibility: backendJob.eligibility,
          skills: backendJob.skills || [],
        };

        setJob(mappedJob);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      if (newStatus === "published") {
        await jobService.publish(id, {});
        toast.success("Job drive published successfully! 🎉");
      } else {
        await jobService.updateStatus(id, { status: newStatus });
        toast.success(`Job drive status updated to ${newStatus}.`);
      }
      setJob((prev) => ({ ...prev, status: statusMap[newStatus] || newStatus }));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update drive status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5" style={{ height: "400px" }}>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading placement drive details...
      </div>
    );
  }

  if (!job) return (
    <div className="text-center py-5">
      <p className="text-muted">Job not found</p>
      <Link to="/admin/jobs" className="btn btn-primary">Back to Jobs</Link>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={job.title}
        subtitle={job.company}
        breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Jobs", to: "/admin/jobs" }, { label: job.title }]}
      />

      <div className="row g-4">
        {/* Main Info */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-start gap-4 mb-4">
                <img src={job.companyLogo} alt={job.company} width={72} height={72} className="rounded-3" style={{ objectFit: "cover" }} />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <h4 className="fw-bold mb-0">{job.title}</h4>
                        {job.employmentType && (
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 small fw-semibold">
                            {job.employmentType}
                          </span>
                        )}
                      </div>
                      <p className="text-primary fw-semibold mb-0">{job.company}</p>
                    </div>
                    <span className={`badge bg-${statusColors[job.status] || "secondary"} px-3 py-2`}>{job.status}</span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="row g-3 mb-4">
                {[
                  { icon: "bi-geo-alt", label: "Location", value: job.location, color: "primary" },
                  { icon: "bi-currency-rupee", label: "Salary", value: job.salary, color: "success" },
                  { icon: "bi-briefcase", label: "Experience", value: job.experience, color: "info" },
                  { icon: "bi-people", label: "Openings", value: `${job.openings} Positions`, color: "warning" },
                  { icon: "bi-calendar-event", label: "Posted", value: new Date(job.postedDate).toLocaleDateString("en-IN"), color: "secondary" },
                  { icon: "bi-calendar-x", label: "Last Date", value: new Date(job.lastDate).toLocaleDateString("en-IN"), color: "danger" },
                ].map((item, i) => (
                  <div key={i} className="col-6 col-md-4">
                    <div className="p-3 rounded-3 bg-light">
                      <small className="text-muted d-block mb-1"><i className={`bi ${item.icon} me-1 text-${item.color}`}></i>{item.label}</small>
                      <span className="fw-semibold small">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <h6 className="fw-bold mb-2">Description</h6>
              <p className="text-muted mb-4" style={{ whiteSpace: "pre-line" }}>{job.description}</p>

              {job.responsibilities && (
                <>
                  <h6 className="fw-bold mb-2">Roles & Responsibilities</h6>
                  <p className="text-muted mb-4" style={{ whiteSpace: "pre-line" }}>{job.responsibilities}</p>
                </>
              )}

              <h6 className="fw-bold mb-2">Eligibility Criteria</h6>
              <p className="text-muted mb-4">{job.eligibility}</p>

              <h6 className="fw-bold mb-2">Skills Required</h6>
              <div className="d-flex flex-wrap gap-2">
                {job.skills.map((s, i) => (
                  <span key={i} className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status Actions Sidebar */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: "80px" }}>
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h6 className="fw-bold mb-0"><i className="bi bi-gear me-2 text-primary"></i>Drive Settings</h6>
              <small className="text-muted">Manage drive publication status</small>
            </div>
            <div className="card-body px-4 pb-4 pt-3">
              <div className="d-flex flex-column gap-2 mb-3">
                <button
                  className="btn btn-success w-100 fw-semibold py-2"
                  onClick={() => handleStatusChange("published")}
                  disabled={updating || job.status === "Published"}
                >
                  <i className="bi bi-check-circle me-2"></i>Publish Job Drive
                </button>
                <button
                  className="btn btn-outline-secondary w-100 fw-semibold py-2"
                  onClick={() => handleStatusChange("closed")}
                  disabled={updating || job.status === "Closed"}
                >
                  <i className="bi bi-lock me-2"></i>Close Job Drive
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
