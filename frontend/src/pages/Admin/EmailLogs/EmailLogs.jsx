import PageHeader from "../../../components/PageHeader/PageHeader";
import { emailService } from "../../../services/api";
import { useCachedData } from "../../../hooks/useCachedData";

const statusColors = { Sent: "success", Failed: "danger", Pending: "warning" };

export default function EmailLogs() {
  const { data: rawLogsResponse, loading } = useCachedData(
    "admin_email_logs",
    emailService.getLogs
  );

  const logs = rawLogsResponse?.data || [];

  if (loading) {
    return (
      <div className="text-center py-5" style={{ height: "400px" }}>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading email logs...
      </div>
    );
  }

  const sentCount = logs.filter(l => l.status === "Sent" || l.status === "sent").length;
  const failedCount = logs.filter(l => l.status === "Failed" || l.status === "failed").length;
  const pendingCount = logs.filter(l => l.status === "Pending" || l.status === "pending").length;

  return (
    <div>
      <PageHeader title="Email Logs" subtitle="Track emails sent to recruiting companies" breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Email Logs" }]} />

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
          <div className="d-flex align-items-center justify-content-between">
            <h6 className="fw-bold mb-0">All Email Records</h6>
            <span className="badge bg-primary px-3 py-2">{logs.length} Records</span>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="py-3">Company</th>
                  <th className="py-3">Job</th>
                  <th className="py-3">Sent To</th>
                  <th className="py-3">Applicants</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log, i) => (
                    <tr key={log.id}>
                      <td className="px-4 text-muted">{i + 1}</td>
                      <td className="fw-medium small">{log.company}</td>
                      <td className="small text-muted">{log.job}</td>
                      <td className="small text-muted">{log.sentTo}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary">{log.applicantsCount} applicants</span>
                      </td>
                      <td className="small text-muted">
                        {new Date(log.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <span className={`badge bg-${statusColors[log.status] || "secondary"} bg-opacity-10 text-${statusColors[log.status] || "secondary"} border border-${statusColors[log.status] || "secondary"} border-opacity-25`}>
                          <i className={`bi bi-${log.status === "Sent" ? "check-circle" : log.status === "Failed" ? "x-circle" : "clock"} me-1`}></i>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted small">No email logs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white border-0 px-4 py-3">
          <small className="text-muted">{sentCount} sent · {failedCount} failed · {pendingCount} pending</small>
        </div>
      </div>
    </div>
  );
}
