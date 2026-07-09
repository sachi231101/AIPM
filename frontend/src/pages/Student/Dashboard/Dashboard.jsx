import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { jobs, applications, currentStudent } from "../../../utils/mockData";
import { getStudents, calculateCompletion } from "../../../utils/studentStorage";
import { toast } from "react-toastify";
import StatCard from "../../../components/StatCard/StatCard";
import JobCard from "../../../components/JobCard/JobCard";
import PageHeader from "../../../components/PageHeader/PageHeader";

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Fetch latest student details from storage
  const allStudents = getStudents();
  const student = allStudents.find((s) => s.id === user?.id) || { ...currentStudent, ...user };

  // Calculate dynamic completion checklist
  const { percentage, sections } = calculateCompletion(student);
  student.profileCompletion = percentage;

  const availableJobs = jobs.filter(
    (j) => j.status === "Published" && j.eligibleInstitutes.includes(student.instituteId)
  );
  const myApplications = applications.filter((a) => a.studentId === student.id);
  const recentJobs = availableJobs.slice(0, 3);

  const notifications = [
    { id: 1, type: "success", icon: "bi-check-circle-fill", text: "Your application for Software Developer has been received.", time: "2 hours ago" },
    { id: 2, type: "info", icon: "bi-info-circle-fill", text: "New placement drive added by Infosys Limited.", time: "Yesterday" },
    { id: 3, type: "warning", icon: "bi-exclamation-circle-fill", text: `Profile completion is at ${student.profileCompletion}%. Please update your details.`, time: "2 days ago" },
  ];

  const handleApply = (job) => {
    if (student.profileCompletion < 100) {
      toast.error("Please complete your profile and upload your resume before applying.");
      return;
    }
    toast.success(`Applied for ${job.title} at ${job.company}! 🎉`);
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
