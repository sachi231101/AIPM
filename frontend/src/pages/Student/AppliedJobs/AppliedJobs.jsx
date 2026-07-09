import { applications, currentStudent } from "../../../utils/mockData";
import PageHeader from "../../../components/PageHeader/PageHeader";
import EmptyState from "../../../components/EmptyState/EmptyState";
import { useAuth } from "../../../hooks/useAuth";
import { Link } from "react-router-dom";

export default function AppliedJobs() {
  const { user } = useAuth();
  const student = { ...currentStudent, ...user };
  const myApplications = applications.filter((a) => a.studentId === student.id);

  const statusColors = { "Shortlisted": "success", "Under Review": "primary", "Pending": "warning", "Rejected": "danger" };

  return (
    <div className="container-lg">
      <PageHeader
        title="Applied Jobs"
        subtitle="Track the status of your job applications"
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Applied Jobs" }]}
      />

      {myApplications.length === 0 ? (
        <EmptyState
          icon="bi-file-earmark-x"
          title="No Applications Yet"
          description="You haven't applied to any jobs. Browse available drives and start applying!"
          action={<Link to="/student/jobs" className="btn btn-primary"><i className="bi bi-briefcase me-2"></i>Browse Jobs</Link>}
        />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="py-3">Company</th>
                    <th className="py-3">Job Title</th>
                    <th className="py-3">Applied Date</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myApplications.map((app, i) => (
                    <tr key={app.id}>
                      <td className="px-4 text-muted">{i + 1}</td>
                      <td>
                        <div className="fw-medium">{app.company}</div>
                      </td>
                      <td>
                        <div className="fw-medium">{app.jobTitle}</div>
                      </td>
                      <td className="text-muted small">
                        {new Date(app.appliedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <span className={`badge bg-${statusColors[app.status] || "secondary"} bg-opacity-10 text-${statusColors[app.status] || "secondary"} border border-${statusColors[app.status] || "secondary"} border-opacity-25`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/job/${app.jobId}`} className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-eye me-1"></i>View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-footer bg-white border-0 px-4 py-3">
            <small className="text-muted">Showing {myApplications.length} of {myApplications.length} applications</small>
          </div>
        </div>
      )}
    </div>
  );
}
