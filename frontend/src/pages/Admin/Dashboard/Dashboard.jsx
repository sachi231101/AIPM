import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../../components/StatCard/StatCard";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { adminService } from "../../../services/api";
import { toast } from "react-toastify";

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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats();
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50" style={{ height: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Map backend recent jobs for the UI
  const recentJobsMapped = (stats.recent_jobs || []).map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company?.name || "Unknown Company",
    location: job.location,
    status: statusMap[job.status] || "Pending",
  }));

  // Map backend recent applications for the UI
  const recentAppsMapped = (stats.recent_applications || []).map((app) => ({
    id: app.id,
    studentName: app.student?.user?.name || "Student",
    institute: app.student?.institute?.name || app.student?.other_institute_name || "Unknown Institute",
    jobTitle: app.job?.title || "Unknown Job",
    status: app.status === "pending" ? "Pending" : (app.status === "shortlisted" ? "Shortlisted" : "Rejected"),
  }));

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
          <StatCard title="Total Students" value={stats.total_students.toLocaleString()} icon="bi-people-fill" color="primary" />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Institutes" value={stats.total_institutes} icon="bi-bank2" color="success" />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Total Jobs" value={stats.total_jobs} icon="bi-briefcase-fill" color="danger" />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Published Jobs" value={stats.published_jobs} icon="bi-check-circle-fill" color="success" />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Pending Review" value={stats.pending_jobs} icon="bi-hourglass-split" color="warning" />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Applications" value={stats.total_applications.toLocaleString()} icon="bi-file-earmark-check-fill" color="primary" />
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
                    {recentJobsMapped.length > 0 ? (
                      recentJobsMapped.map((job) => (
                        <tr key={job.id}>
                          <td className="px-4">
                            <p className="fw-medium mb-0 small">{job.title}</p>
                            <small className="text-muted">{job.company}</small>
                          </td>
                          <td className="small text-muted">{job.location}</td>
                          <td>
                            <span className={`badge bg-${statusColors[job.status] || "secondary"} bg-opacity-10 text-${statusColors[job.status] || "secondary"} border border-${statusColors[job.status] || "secondary"} border-opacity-25 small`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-muted small">No jobs registered yet</td>
                      </tr>
                    )}
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
                    {recentAppsMapped.length > 0 ? (
                      recentAppsMapped.map((app) => (
                        <tr key={app.id}>
                          <td className="px-4">
                            <p className="fw-medium mb-0 small">{app.studentName}</p>
                            <small className="text-muted">{app.institute}</small>
                          </td>
                          <td className="small text-muted">{app.jobTitle}</td>
                          <td>
                            <span className={`badge bg-${app.status === "Shortlisted" ? "success" : (app.status === "Rejected" ? "danger" : "warning")} bg-opacity-10 text-${app.status === "Shortlisted" ? "success" : (app.status === "Rejected" ? "danger" : "warning")} small`}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-muted small">No applications submitted yet</td>
                      </tr>
                    )}
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
