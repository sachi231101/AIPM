import { useState } from "react";
import { applications, jobs } from "../../../utils/mockData";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { toast } from "react-toastify";

export default function Applications() {
  const [selectedJob, setSelectedJob] = useState("");
  const [search, setSearch] = useState("");

  const publishedJobs = jobs.filter(j => j.status === "Published");

  const filtered = applications.filter(a => {
    const matchJob = selectedJob ? a.jobId === parseInt(selectedJob) : true;
    const matchSearch = a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.institute.toLowerCase().includes(search.toLowerCase());
    return matchJob && matchSearch;
  });

  const handleSendToCompany = () => {
    if (!selectedJob) { toast.error("Please select a job first."); return; }
    toast.success(`Applications sent to company via email! 📧`);
  };

  return (
    <div>
      <PageHeader title="Applications" subtitle="View and manage student applications" breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Applications" }]} />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <select className="form-select" value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
                <option value="">All Jobs</option>
                {publishedJobs.map(j => <option key={j.id} value={j.id}>{j.title} – {j.company}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input className="form-control border-start-0" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
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
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="py-3">Student</th>
                  <th className="py-3">Institute</th>
                  <th className="py-3">Course</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Applied</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-end px-4">Resume</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, i) => (
                  <tr key={app.id}>
                    <td className="px-4 text-muted">{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: 32, height: 32, fontSize: 12 }}>
                          {app.studentName[0]}
                        </div>
                        <span className="fw-medium small">{app.studentName}</span>
                      </div>
                    </td>
                    <td className="small text-muted">{app.institute}</td>
                    <td className="small">{app.course}</td>
                    <td className="small text-muted">{app.email}</td>
                    <td className="small text-muted">{new Date(app.appliedDate).toLocaleDateString("en-IN")}</td>
                    <td>
                      <span className={`badge bg-${app.status === "Shortlisted" ? "success" : "secondary"} bg-opacity-10 text-${app.status === "Shortlisted" ? "success" : "secondary"} small`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="text-end px-4">
                      <div className="d-flex gap-1 justify-content-end">
                        <a href={app.resumeUrl} className="btn btn-xs btn-outline-primary py-1 px-2" style={{ fontSize: "0.75rem" }} target="_blank">
                          <i className="bi bi-eye"></i>
                        </a>
                        <a href={app.resumeUrl} download className="btn btn-xs btn-outline-success py-1 px-2" style={{ fontSize: "0.75rem" }}>
                          <i className="bi bi-download"></i>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <button className="btn btn-primary btn-lg px-5 fw-semibold" onClick={handleSendToCompany}>
              <i className="bi bi-send-fill me-2"></i>Send Applications to Company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
