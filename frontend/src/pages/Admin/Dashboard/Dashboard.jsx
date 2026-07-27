import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../../components/StatCard/StatCard";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { adminService } from "../../../services/api";
import { useCachedData, clearCache } from "../../../hooks/useCachedData";
import Chart from "chart.js/auto";

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
  useEffect(() => {
    clearCache("admin_dashboard");
  }, []);

  const { data: statsResponse, loading } = useCachedData(
    "admin_dashboard",
    adminService.getDashboardStats
  );

  const stats = statsResponse?.data;

  const trendsChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const trendsChartInst = useRef(null);
  const statusChartInst = useRef(null);

  useEffect(() => {
    if (loading || !stats) return;

    // 1. Placement Trends Chart
    if (trendsChartRef.current && stats.placement_trends) {
      if (trendsChartInst.current) {
        trendsChartInst.current.destroy();
      }

      const labels = stats.placement_trends.map(t => t.month);
      const applicationsData = stats.placement_trends.map(t => t.applications);
      const offersData = stats.placement_trends.map(t => t.offers);
      const placementsData = stats.placement_trends.map(t => t.placements);

      const ctx = trendsChartRef.current.getContext("2d");
      trendsChartInst.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Applications",
              data: applicationsData,
              backgroundColor: "rgba(13, 110, 253, 0.75)",
              borderColor: "rgb(13, 110, 253)",
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: "Offers",
              data: offersData,
              backgroundColor: "rgba(25, 135, 84, 0.75)",
              borderColor: "rgb(25, 135, 84)",
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: "Placements",
              data: placementsData,
              backgroundColor: "rgba(220, 53, 69, 0.75)",
              borderColor: "rgb(220, 53, 69)",
              borderWidth: 1,
              borderRadius: 4,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                boxWidth: 12,
                font: {
                  family: "'Inter', sans-serif",
                  size: 11
                }
              }
            },
            tooltip: {
              padding: 10,
              bodyFont: { family: "'Inter', sans-serif" },
              titleFont: { family: "'Inter', sans-serif", weight: "bold" }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: "'Inter', sans-serif", size: 11 } }
            },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0, 0, 0, 0.05)" },
              ticks: { font: { family: "'Inter', sans-serif", size: 11 }, precision: 0 }
            }
          }
        }
      });
    }

    return () => {
      if (trendsChartInst.current) {
        trendsChartInst.current.destroy();
        trendsChartInst.current = null;
      }
    };
  }, [stats, loading]);

  useEffect(() => {
    if (loading || !stats) return;

    // 2. Jobs by Status Chart
    if (statusChartRef.current && stats.jobs_by_status) {
      if (statusChartInst.current) {
        statusChartInst.current.destroy();
      }

      const rawData = stats.jobs_by_status;
      const labels = ["Published", "Approved", "Pending", "Rejected", "Closed"];
      const dataValues = [
        rawData.published || 0,
        rawData.approved || 0,
        rawData.pending || 0,
        rawData.rejected || 0,
        rawData.closed || 0
      ];

      const ctx = statusChartRef.current.getContext("2d");
      statusChartInst.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              data: dataValues,
              backgroundColor: [
                "rgba(25, 135, 84, 0.8)",
                "rgba(13, 110, 253, 0.8)",
                "rgba(255, 193, 7, 0.8)",
                "rgba(220, 53, 69, 0.8)",
                "rgba(108, 117, 125, 0.8)"
              ],
              borderColor: [
                "#198754",
                "#0d6efd",
                "#ffc107",
                "#dc3545",
                "#6c757d"
              ],
              borderWidth: 1,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                boxWidth: 12,
                font: {
                  family: "'Inter', sans-serif",
                  size: 11
                }
              }
            },
            tooltip: {
              padding: 10,
              bodyFont: { family: "'Inter', sans-serif" },
              titleFont: { family: "'Inter', sans-serif", weight: "bold" }
            }
          },
          cutout: "70%"
        }
      });
    }

    return () => {
      if (statusChartInst.current) {
        statusChartInst.current.destroy();
        statusChartInst.current = null;
      }
    };
  }, [stats, loading]);

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
    studentMobile: app.student?.mobile || "N/A",
    jobTitle: app.job?.title || "Unknown Job",
    status: app.status === "shortlisted" ? "Shortlisted" : (app.status === "rejected" ? "Rejected" : "Applied"),
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
          <StatCard title="Pending Review" value={stats.pending_students || 0} icon="bi-clock-history" color="warning" />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Approved Students" value={stats.approved_students || 0} icon="bi-patch-check-fill" color="success" />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Published Jobs" value={stats.published_jobs} icon="bi-check-circle-fill" color="success" />
        </div>
        <div className="col-6 col-md-4 col-lg-2-4">
          <StatCard title="Total Applications" value={stats.total_applications.toLocaleString()} icon="bi-file-earmark-check-fill" color="primary" />
        </div>
      </div>

      {/* Dynamic Charts */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h6 className="fw-bold mb-0">Placement Trends (Monthly)</h6>
            </div>
            <div className="card-body p-4" style={{ minHeight: 280, height: 280 }}>
              <canvas ref={trendsChartRef}></canvas>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h6 className="fw-bold mb-0">Jobs by Status</h6>
            </div>
            <div className="card-body p-4" style={{ minHeight: 280, height: 280 }}>
              <canvas ref={statusChartRef}></canvas>
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
                            <small className="text-muted">{app.studentMobile}</small>
                          </td>
                          <td className="small text-muted">{app.jobTitle}</td>
                          <td>
                            <span className={`badge bg-${app.status === "Shortlisted" ? "success" : (app.status === "Rejected" ? "danger" : "primary")} bg-opacity-10 text-${app.status === "Shortlisted" ? "success" : (app.status === "Rejected" ? "danger" : "primary")} small`}>
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
