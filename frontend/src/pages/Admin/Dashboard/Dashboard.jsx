import { Link } from "react-router-dom";
import { dashboardStats, jobs, applications } from "../../../utils/mockData";
import StatCard from "../../../components/StatCard/StatCard";
import PageHeader from "../../../components/PageHeader/PageHeader";

const statusColors = { Published: "success", Approved: "primary", Pending: "warning", Rejected: "danger", Closed: "secondary" };

export default function AdminDashboard() {
  const recentJobs = jobs.slice(0, 5);
  const recentApps = applications.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of the placement portal"
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      {/* Stat Cards */}
      <div className="row g-4 mb-4">
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Total Students" value={dashboardStats.totalStudents.toLocaleString()} icon="bi-people-fill" color="primary" trend={8} />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Institutes" value={dashboardStats.totalInstitutes} icon="bi-bank2" color="success" />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Companies" value={dashboardStats.totalCompanies} icon="bi-buildings-fill" color="warning" trend={5} />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Total Jobs" value={dashboardStats.totalJobs} icon="bi-briefcase-fill" color="danger" />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Applications" value={dashboardStats.totalApplications.toLocaleString()} icon="bi-file-earmark-check-fill" color="primary" trend={15} />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Placed Students" value={dashboardStats.placedStudents.toLocaleString()} icon="bi-trophy-fill" color="success" />
        </div>
      </div>

      {/* Chart Placeholders */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h6 className="fw-bold mb-0">Placement Trends (Monthly)</h6>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center p-4" style={{ minHeight: 200 }}>
              <div className="text-center text-muted">
                <i className="bi bi-bar-chart-fill text-primary" style={{ fontSize: "3rem" }}></i>
                <p className="mt-3 mb-0">Chart will render here (Recharts / Chart.js)</p>
                <small>Monthly applications, offers, and placements</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h6 className="fw-bold mb-0">Jobs by Status</h6>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: 200 }}>
              <div className="text-center text-muted">
                <i className="bi bi-pie-chart-fill text-warning" style={{ fontSize: "3rem" }}></i>
                <p className="mt-3 mb-0">Pie chart placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs + Applications */}
      <div className="row g-4">
        {/* Recent Jobs */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Recent Jobs</h6>
              <Link to="/admin/jobs" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">Job / Company</th>
                      <th className="py-3">Location</th>
                      <th className="py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map((job) => (
                      <tr key={job.id}>
                        <td className="px-4">
                          <p className="fw-medium mb-0 small">{job.title}</p>
                          <small className="text-muted">{job.company}</small>
                        </td>
                        <td className="small text-muted">{job.location}</td>
                        <td>
                          <span className={`badge bg-${statusColors[job.status]} bg-opacity-10 text-${statusColors[job.status]} border border-${statusColors[job.status]} border-opacity-25 small`}>
                            {job.status}
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

        {/* Recent Applications */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Recent Applications</h6>
              <Link to="/admin/applications" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="py-3">Job</th>
                      <th className="py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApps.map((app) => (
                      <tr key={app.id}>
                        <td className="px-4">
                          <p className="fw-medium mb-0 small">{app.studentName}</p>
                          <small className="text-muted">{app.institute}</small>
                        </td>
                        <td className="small text-muted">{app.jobTitle}</td>
                        <td>
                          <span className={`badge bg-${app.status === "Shortlisted" ? "success" : "secondary"} bg-opacity-10 text-${app.status === "Shortlisted" ? "success" : "secondary"} small`}>
                            {app.status}
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
      </div>
    </div>
  );
}
