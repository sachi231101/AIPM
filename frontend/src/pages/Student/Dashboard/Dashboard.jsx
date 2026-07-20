import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import StatCard from "../../../components/StatCard/StatCard";
import JobCard from "../../../components/JobCard/JobCard";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { studentService, jobService, applicationService } from "../../../services/api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, jobsRes, appsRes] = await Promise.all([
          studentService.getProfile(),
          jobService.getAll(),
          applicationService.getMyApplications(),
        ]);

        const profile = profileRes.data.data;
        setStudent(profile);

        // Fetch and map jobs
        const rawJobs = jobsRes.data.data || [];
        const mappedJobs = rawJobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company?.name || "Unknown Company",
          companyLogo: job.company?.logo_path
            ? `http://localhost:8000/storage/${job.company.logo_path}`
            : "https://placehold.co/100x100?text=" + encodeURIComponent(job.company?.name || "Job"),
          location: job.location,
          salary: job.salary,
          experience: job.experience,
          skills: job.skills || [],
          status: job.status === "published" ? "Published" : (job.status === "closed" ? "Closed" : "Pending"),
          lastDate: job.last_date,
          eligibleInstitutes: job.institutes?.map((i) => i.id) || [],
          instituteId: job.institutes?.map((i) => i.id) || [],
        }));
        setAvailableJobs(mappedJobs);

        // Fetch and map applications
        const rawApps = appsRes.data.data || [];
        const mappedApps = rawApps.map((app) => ({
          id: app.id,
          jobTitle: app.job?.title || "Unknown Job",
          company: app.job?.company || "Unknown Company",
          status: app.status,
          appliedAt: app.applied_at,
        }));
        setMyApplications(mappedApps);
      } catch (err) {
        console.error("Error loading dashboard data", err);
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !student) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50" style={{ height: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Calculate dynamic completion checklist
  const sections = {
    personal: !!(student.email && student.dob && student.gender && student.address),
    academic: !!(student.course && student.branch && student.batch),
    resume: !!(student.resume_url || student.resumeUrl),
    skills: !!(student.skills && student.skills.length > 0)
  };

  const completedCount = Object.values(sections).filter(Boolean).length;
  const profileCompletion = completedCount * 25;
  student.profileCompletion = profileCompletion;

  const recentJobs = availableJobs.slice(0, 3);

  const notifications = [
    { id: 1, type: "success", icon: "bi-check-circle-fill", text: "Welcome to Aadya placement drives dashboard.", time: "Just now" },
    { id: 2, type: "info", icon: "bi-info-circle-fill", text: "New placement drives are open.", time: "Today" },
    { id: 3, type: "warning", icon: "bi-exclamation-circle-fill", text: `Profile completion is at ${student.profileCompletion}%. Please update your details.`, time: "Just now" },
  ];

  const handleApply = async (job) => {
    if (student.profileCompletion < 100) {
      toast.error("Please complete your profile and upload your resume before applying.");
      return;
    }
    try {
      await applicationService.apply({ job_id: job.id });
      toast.success(`Applied for ${job.title} at ${job.company}! 🎉`);
      
      // Refresh applications list
      const appsRes = await applicationService.getMyApplications();
      const rawApps = appsRes.data.data || [];
      const mappedApps = rawApps.map((app) => ({
        id: app.id,
        jobTitle: app.job?.title || "Unknown Job",
        company: app.job?.company || "Unknown Company",
        status: app.status,
        appliedAt: app.applied_at,
      }));
      setMyApplications(mappedApps);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit application.");
    }
  };

  return (
    <div className="container-lg">
      <PageHeader
        title={`Welcome back, ${student.name?.split(" ")[0]} 👋`}
        subtitle="Here's what's happening with your placement journey"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Dashboard" }]}
      />

      {/* Warning Banner at the top if profile is incomplete */}
      {student.profileCompletion < 100 && (
        <div className="alert alert-warning border-0 shadow-sm mb-4 d-flex align-items-center gap-3">
          <i className="bi bi-exclamation-triangle-fill fs-4 text-warning"></i>
          <div>
            <p className="fw-semibold mb-0" style={{ fontSize: "0.95rem" }}>Incomplete Profile</p>
            <small className="text-muted">Complete your profile and upload your resume to apply for placement drives.</small>
          </div>
          <Link to="/student/profile" className="btn btn-warning btn-sm ms-auto fw-semibold">Complete Profile</Link>
        </div>
      )}

      {/* Welcome Card for new/incomplete students */}
      {student.profileCompletion < 100 && (
        <div className="card border-0 shadow-sm mb-4" style={{ background: "linear-gradient(135deg, #0F4C81 0%, #1E88E5 100%)", color: "white" }}>
          <div className="card-body p-4 p-md-5">
            <h3 className="fw-bold mb-2">Welcome to Aadya Placement Portal!</h3>
            <p className="lead text-white-75 mb-4">Please complete your profile before applying for placement drives.</p>
            <Link to="/student/profile" className="btn btn-warning btn-lg fw-semibold">
              <i className="bi bi-person-check-fill me-2"></i>Complete Profile
            </Link>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="row g-4 mb-4">
        <div className="col-6 col-md-3">
          <StatCard title="Available Jobs" value={availableJobs.length} icon="bi-briefcase-fill" color="primary" trend={12} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard title="Applied Jobs" value={myApplications.length} icon="bi-file-earmark-check-fill" color="success" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard title="Profile Score" value={`${student.profileCompletion}%`} icon="bi-person-check-fill" color="warning" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard title="CGPA / Percentage" value={student.cgpa || "N/A"} icon="bi-bar-chart-fill" color="danger" />
        </div>
      </div>

      {/* AI Resume Builder Banner */}
      <div className="card border-0 shadow-sm mb-4" style={{ background: "linear-gradient(135deg, #0F4C81 0%, #1565C0 100%)", color: "white" }}>
        <div className="card-body p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div className="badge bg-warning text-dark fw-bold mb-2">NEW FEATURE</div>
            <h4 className="fw-bold mb-1">Build Your ATS-Friendly Professional Resume</h4>
            <p className="text-white-75 mb-0 small">Automatically import your profile data, customize section contents, score ATS compatibility, and download PDF resumes.</p>
          </div>
          <Link to="/student/resume-builder" className="btn btn-warning btn-lg fw-bold text-nowrap">
            <i className="bi bi-file-earmark-person me-2"></i> Launch Resume Builder
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Left: Checklist + Recent Jobs */}
        <div className="col-lg-8">
          
          {/* Profile Completion Checklist Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-3">
                  {student.profilePhoto ? (
                    <img 
                      src={student.profilePhoto} 
                      alt={student.name} 
                      className="rounded-circle border border-primary border-2 p-1" 
                      style={{ width: 48, height: 48, objectFit: "cover" }} 
                    />
                  ) : (
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 48, height: 48, fontSize: 18 }}>
                      {student.name?.[0]}
                    </div>
                  )}
                  <div>
                    <h6 className="fw-bold mb-0">{student.name}</h6>
                    <small className="text-muted">{student.course || "No Course Selected"} • {student.institute}</small>
                  </div>
                </div>
                <Link to="/student/profile" className="btn btn-outline-primary btn-sm">Edit Profile</Link>
              </div>

              <h6 className="fw-bold mb-3 small text-muted text-uppercase" style={{ letterSpacing: "0.05em" }}>Profile Checklist</h6>
              <div className="row g-2 mb-4">
                {[
                  { label: "Personal Information", completed: sections.personal },
                  { label: "Academic Information", completed: sections.academic },
                  { label: "Resume Upload", completed: sections.resume },
                  { label: "Skills & Expertise", completed: sections.skills }
                ].map((item, i) => (
                  <div key={i} className="col-md-6">
                    <div className="d-flex align-items-center gap-2 p-2 rounded bg-light border border-light">
                      <i className={`bi ${item.completed ? "bi-check-circle-fill text-success" : "bi-x-circle-fill text-danger"} fs-5`}></i>
                      <span className="small text-muted">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="fw-semibold">Overall Progress</small>
                <small className="text-primary fw-bold">{student.profileCompletion}%</small>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                  style={{ width: `${student.profileCompletion}%`, borderRadius: 4 }}
                ></div>
              </div>
              {student.profileCompletion < 100 && (
                <small className="text-muted d-block mt-2">
                  <i className="bi bi-lightbulb-fill text-warning me-1"></i>
                  Complete your profile and upload your resume to apply for placement drives.
                </small>
              )}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="fw-bold mb-0">Available Drives for You</h6>
            <Link to="/student/jobs" className="small text-primary text-decoration-none">View all <i className="bi bi-arrow-right"></i></Link>
          </div>
          <div className="row g-3">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job.id} className="col-md-6">
                  <JobCard job={job} showApply onApply={handleApply} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-4 bg-white rounded-3 shadow-sm text-muted">
                No placement drives match your institute's eligibility.
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications + Applied */}
        <div className="col-lg-4">
          {/* Notifications */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h6 className="fw-bold mb-0"><i className="bi bi-bell-fill text-primary me-2"></i>Notifications</h6>
            </div>
            <div className="card-body p-3">
              {notifications.map((n) => (
                <div key={n.id} className={`d-flex gap-3 p-3 rounded-3 mb-2`} style={{ background: "#f8f9ff" }}>
                  <i className={`bi ${n.icon} text-${n.type} mt-1 flex-shrink-0`}></i>
                  <div>
                    <p className="small mb-0">{n.text}</p>
                    <small className="text-muted">{n.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="fw-bold mb-0"><i className="bi bi-list-check text-success me-2"></i>My Applications</h6>
                <Link to="/student/applied" className="small text-primary text-decoration-none">View all</Link>
              </div>
            </div>
            <div className="card-body p-3">
              {myApplications.length === 0 ? (
                <p className="text-muted small text-center py-3">No applications yet</p>
              ) : (
                myApplications.slice(0, 3).map((app) => (
                  <div key={app.id} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                    <div>
                      <p className="small fw-medium mb-0">{app.jobTitle}</p>
                      <small className="text-muted">{app.company}</small>
                    </div>
                    <span className={`badge bg-${app.status === "Shortlisted" ? "success" : "secondary"} bg-opacity-10 text-${app.status === "Shortlisted" ? "success" : "secondary"} small`}>
                      {app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
