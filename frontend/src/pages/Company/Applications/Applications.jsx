import { useState, useEffect } from "react";
import ViewStudentProfileModal from "../../../components/Company/ViewStudentProfileModal";
import { companyService } from "../../../services/api";
import { toast } from "react-toastify";

export default function CompanyApplications() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingApp, setViewingApp] = useState(null);

  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem("apms_company_applications");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    companyService.getApplications()
      .then((res) => {
        if (res.data?.data) {
          setApplications(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem("apms_company_applications", JSON.stringify(applications));
  }, [applications]);

  const handleStatusChange = async (appId, newStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    try {
      if (typeof appId === "number" || !String(appId).startsWith("app_")) {
        await companyService.updateApplicationStatus(appId, newStatus);
      }
      toast.success(`Application marked as ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadResume = (app) => {
    if (app.resume_path) {
      window.open(app.resume_path, "_blank");
      toast.success(`Opening ${app.student?.name || "Candidate"}'s PDF Resume...`);
    } else {
      toast.info(`Opening ${app.student?.name || "Candidate"}'s live Career Profile...`);
      setViewingApp(app);
    }
  };

  const filteredApps = filterStatus === "all"
    ? applications
    : applications.filter((a) => a.status === filterStatus);

  return (
    <div>
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Student Applications</h3>
          <p className="text-muted small mb-0">Review student career profiles, download resumes, shortlist or reject candidates</p>
        </div>

        {/* Filter Pills */}
        <div className="d-flex gap-2 bg-white p-1.5 rounded-pill shadow-sm border overflow-x-auto">
          {["all", "pending", "shortlisted", "rejected"].map((st) => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 text-capitalize fw-semibold ${
                filterStatus === st ? "btn-primary" : "btn-light text-muted"
              }`}
              onClick={() => setFilterStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-body p-0 overflow-x-auto">
          <table className="table align-middle table-hover mb-0">
            <thead className="table-light text-muted small">
              <tr>
                <th className="ps-4">Student Name</th>
                <th>Career Profile Used</th>
                <th>Resume</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th className="pe-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  {/* Student Name */}
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-2.5">
                      <div
                        className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 36, height: 36, fontSize: "0.9rem" }}
                      >
                        {(app.student.name || "S").charAt(0)}
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{app.student.name}</div>
                        <div className="text-muted small">{app.student.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Career Profile Used */}
                  <td>
                    <div className="fw-semibold text-dark small">{app.careerProfile?.personal?.professionalTitle || app.student.target_role || "Master Profile"}</div>
                    <span className="text-muted small">For: {app.jobTitle}</span>
                  </td>

                  {/* Resume PDF Badge */}
                  <td>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-danger rounded-pill px-2.5 py-1 fw-semibold"
                      onClick={() => handleDownloadResume(app)}
                      title="Download Candidate Resume PDF"
                    >
                      <i className="bi bi-file-earmark-pdf-fill me-1"></i>
                      Resume PDF
                    </button>
                  </td>

                  {/* Applied Date */}
                  <td className="small text-muted">{app.appliedDate}</td>

                  {/* Status */}
                  <td>
                    <span
                      className={`badge rounded-pill px-3 py-1 ${
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

                  {/* Actions */}
                  <td className="pe-4 text-end">
                    <div className="d-flex justify-content-end gap-2">
                      {/* View Profile */}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary fw-semibold"
                        onClick={() => setViewingApp(app)}
                      >
                        <i className="bi bi-person-badge me-1"></i> View Profile
                      </button>

                      {/* Shortlist */}
                      {app.status !== "shortlisted" && app.status !== "hired" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-success fw-semibold"
                          title="Shortlist Student"
                          onClick={() => handleStatusChange(app.id, "shortlisted")}
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                      )}

                      {/* Reject */}
                      {app.status !== "rejected" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger fw-semibold"
                          title="Reject Application"
                          onClick={() => handleStatusChange(app.id, "rejected")}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No applications match the selected filter status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
