import { useState, useEffect } from "react";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { toast } from "react-toastify";
import { jobService, applicationService } from "../../../services/api";
import { useCachedData, clearCache } from "../../../hooks/useCachedData";

export default function Applications() {
  const [selectedJob, setSelectedJob] = useState("");
  const [search, setSearch] = useState("");

  // Clear application cache on mount so real-time student applications show up
  useEffect(() => {
    clearCache("admin_jobs");
    clearCache("admin_applications");
  }, []);

  // Cache job listings for dropdown
  const { data: rawJobsResponse, loading } = useCachedData(
    "admin_jobs",
    jobService.adminGetAll
  );

  const rawJobs = rawJobsResponse ? (Array.isArray(rawJobsResponse.data) ? rawJobsResponse.data : (rawJobsResponse.data?.data || [])) : [];
  const publishedJobs = rawJobs.filter(j => j.status === "published" || j.status === "approved");

  // Fetch applications (all or by job_id)
  const { data: rawAppsResponse, loading: loadingApps } = useCachedData(
    `admin_applications_${selectedJob || "all"}`,
    () => selectedJob ? applicationService.getByJob(parseInt(selectedJob)) : applicationService.getAllAdmin(),
    [selectedJob]
  );

  const rawApps = rawAppsResponse?.data || [];
  const applicationsList = rawApps.map((app) => {
    let uploadedUrl = app.uploaded_resume_url;
    if (uploadedUrl && !uploadedUrl.startsWith("http")) {
      uploadedUrl = `http://${window.location.hostname}:8000${uploadedUrl.startsWith('/') ? '' : '/'}${uploadedUrl}`;
    }
    let createdUrl = app.created_resume_url;
    if (createdUrl && !createdUrl.startsWith("http")) {
      createdUrl = `http://${window.location.hostname}:8000${createdUrl.startsWith('/') ? '' : '/'}${createdUrl}`;
    }

    return {
      id: app.id,
      studentName: app.student?.name || "Student",
      institute: app.student?.institute || "Unknown Institute",
      course: app.student?.course || "N/A",
      email: app.student?.email || "",
      appliedDate: app.applied_at,
      status: app.status === "shortlisted" ? "Shortlisted" : (app.status === "rejected" ? "Rejected" : "Applied"),
      jobTitle: app.job?.title || "Drive",
      companyName: app.job?.company || "",
      uploadedResumeUrl: uploadedUrl,
      createdResumeUrl: createdUrl,
      hasUploaded: !!uploadedUrl || app.has_uploaded_resume,
      hasCreated: !!createdUrl || app.has_created_resume,
    };
  });

  const filtered = applicationsList.filter(a => {
    return a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.institute.toLowerCase().includes(search.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(search.toLowerCase());
  });

  const handleSendToCompany = async () => {
    if (!selectedJob) { toast.error("Please select a job first."); return; }
    try {
      toast.info("Preparing applications and sending email...");
      const res = await applicationService.sendToCompany(parseInt(selectedJob));
      toast.success(res.data.message || "Applications sent to company successfully! 📧");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send applications email.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5" style={{ height: "400px" }}>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading applications portal...
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Applications" subtitle="View and manage student applications" breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Applications" }]} />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <select className="form-select" value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
                <option value="">All Placement Drives</option>
                {publishedJobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} – {j.company?.name || "Company"}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input className="form-control border-start-0" placeholder="Search students, institute, job..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3 text-end">
              <span className="badge bg-primary px-3 py-2">{filtered.length} Applications</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-0">
          {loadingApps ? (
            <div className="text-center py-5">
              <span className="spinner-border spinner-border-sm me-2"></span>
              Loading student applications...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="py-3">Student</th>
                    <th className="py-3">Job / Drive</th>
                    <th className="py-3">Institute</th>
                    <th className="py-3">Course</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Applied</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-end px-4">Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((app, i) => (
                      <tr key={app.id}>
                        <td className="px-4 text-muted">{i + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: 32, height: 32, fontSize: 12 }}>
                              {app.studentName[0] || "S"}
                            </div>
                            <span className="fw-medium small">{app.studentName}</span>
                          </div>
                        </td>
                        <td>
                          <p className="fw-medium mb-0 small text-primary">{app.jobTitle}</p>
                          {app.companyName && <small className="text-muted">{app.companyName}</small>}
                        </td>
                        <td className="small text-muted">{app.institute}</td>
                        <td className="small">{app.course}</td>
                        <td className="small text-muted">{app.email}</td>
                        <td className="small text-muted">
                          {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString("en-IN") : "N/A"}
                        </td>
                        <td>
                          <span className={`badge bg-${app.status === "Shortlisted" ? "success" : (app.status === "Rejected" ? "danger" : "primary")} bg-opacity-10 text-${app.status === "Shortlisted" ? "success" : (app.status === "Rejected" ? "danger" : "primary")} small`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="text-end px-4">
                          <div className="d-flex gap-1 justify-content-end flex-wrap">
                            {app.hasUploaded && (
                              <a href={app.uploadedResumeUrl} className="btn btn-xs btn-outline-primary py-1 px-2" style={{ fontSize: "0.75rem" }} target="_blank" rel="noreferrer" title="Uploaded PDF Resume">
                                <i className="bi bi-file-earmark-pdf me-1"></i> Uploaded PDF
                              </a>
                            )}
                            {app.hasCreated && (
                              <a href={app.createdResumeUrl} className="btn btn-xs btn-outline-success py-1 px-2" style={{ fontSize: "0.75rem" }} target="_blank" rel="noreferrer" title="App Created Resume">
                                <i className="bi bi-pencil-square me-1"></i> App Resume
                              </a>
                            )}
                            {!app.hasUploaded && !app.hasCreated && (
                              <span className="text-muted small">No Resume</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-muted small">
                        No applications submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Send to Company */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h6 className="fw-bold mb-1"><i className="bi bi-envelope-fill text-primary me-2"></i>Send Applications to Company</h6>
              <p className="text-muted small mb-0">
                {selectedJob
                  ? `Ready to send ${filtered.length} application(s) for the selected job.`
                  : "Select a job above to send applications to the recruiting company."}
              </p>
            </div>
            <button className="btn btn-primary btn-lg px-5 fw-semibold" onClick={handleSendToCompany} disabled={!selectedJob || filtered.length === 0}>
              <i className="bi bi-send-fill me-2"></i>Send Applications to Company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
