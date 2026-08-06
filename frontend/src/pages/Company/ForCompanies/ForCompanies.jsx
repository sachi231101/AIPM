import { Link } from "react-router-dom";

export default function ForCompanies() {
  return (
    <div className="for-companies-landing">
      {/* ─── HERO SECTION ───────────────────────────────────────────────────── */}
      <section className="bg-dark text-white py-3 py-md-5 position-relative overflow-hidden style-hero-gradient">
        <div className="container py-2 py-md-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark fw-bold px-3 py-1.5 rounded-pill text-uppercase mb-3 tracking-wider">
                <i className="bi bi-buildings-fill me-1.5"></i> Corporate Hiring Partner
              </span>
              <h1 className="display-4 fw-bold text-white mb-3 lh-tight">
                Hire Top Campus Talent From <span className="text-warning">Aadya Institution</span>
              </h1>
              <p className="lead text-white-50 mb-4 lh-base" style={{ fontSize: "1.15rem" }}>
                Streamline your campus recruitment. Access pre-screened engineering, MCA, and management graduates with verified skills, ready to contribute from day one.
              </p>

              {/* Action Buttons for Companies */}
              <div className="d-flex flex-wrap gap-3">
                <Link
                  to="/company/register"
                  className="btn btn-warning btn-lg fw-bold px-4 py-3 rounded-3 shadow-lg d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-person-plus-fill fs-5"></i>
                  <span>Register Company</span>
                </Link>
                <Link
                  to="/company/login"
                  className="btn btn-outline-light btn-lg fw-bold px-4 py-3 rounded-3 d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-box-arrow-in-right fs-5"></i>
                  <span>Company Login</span>
                </Link>
              </div>
            </div>

            <div className="col-lg-5 text-center">
              <div className="card border-0 shadow-lg bg-white text-dark rounded-4 p-4 text-start">
                <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-3">
                    <i className="bi bi-award-fill fs-3"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">Placement Cell Portal</h5>
                    <small className="text-muted">Aadya Institution Placement Office</small>
                  </div>
                </div>

                <div className="vstack gap-3 mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-check-circle-fill text-success fs-5"></i>
                    <span className="small text-secondary fw-medium">Direct Access to 1,200+ Graduating Students</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-check-circle-fill text-success fs-5"></i>
                    <span className="small text-secondary fw-medium">ATS-Formatted Verified Master Resumes</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-check-circle-fill text-success fs-5"></i>
                    <span className="small text-secondary fw-medium">Instant Shortlisting & One-Click Offer Workflow</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-check-circle-fill text-success fs-5"></i>
                    <span className="small text-secondary fw-medium">Zero Placement Fees / No Hidden Charges</span>
                  </div>
                </div>

                <Link to="/company/register" className="btn btn-primary w-100 fw-bold py-2.5 rounded-3">
                  Get Started - Register Employer Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HIGHLIGHT STATS ────────────────────────────────────────────────── */}
      <section className="bg-white py-4 border-bottom">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-6 col-md-3">
              <h2 className="fw-bold text-primary mb-1">1,200+</h2>
              <span className="text-muted small fw-medium">Active Students</span>
            </div>
            <div className="col-6 col-md-3">
              <h2 className="fw-bold text-primary mb-1">150+</h2>
              <span className="text-muted small fw-medium">Hiring Partners</span>
            </div>
            <div className="col-6 col-md-3">
              <h2 className="fw-bold text-primary mb-1">92%</h2>
              <span className="text-muted small fw-medium">Placement Rate</span>
            </div>
            <div className="col-6 col-md-3">
              <h2 className="fw-bold text-primary mb-1">₹14.5 LPA</h2>
              <span className="text-muted small fw-medium">Highest Package</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY HIRE FROM AADYA INSTITUTION ───────────────────────────────── */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-1 rounded-pill text-uppercase mb-2">
              Why Partner With Us
            </span>
            <h2 className="fw-bold text-dark">Why Recruit From Aadya Institution?</h2>
            <p className="text-muted">
              We empower employers with high-caliber talent, seamless tools, and dedicated placement support.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56 }}>
                  <i className="bi bi-laptop fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Industry-Ready Technical Skills</h5>
                <p className="text-secondary small mb-0 lh-base">
                  Students are trained in Full Stack Development, Cloud Computing, Data Analytics, Python, React, and Agile methodologies.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <div className="rounded-3 bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56 }}>
                  <i className="bi bi-file-earmark-check fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Verified Master Resumes</h5>
                <p className="text-secondary small mb-0 lh-base">
                  Access standardized candidate career profiles with pre-verified project links, certificates, CGPA, and contact credentials.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <div className="rounded-3 bg-warning bg-opacity-10 text-warning d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56 }}>
                  <i className="bi bi-speedometer2 fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Dedicated Recruiter Dashboard</h5>
                <p className="text-secondary small mb-0 lh-base">
                  Post job openings, manage candidate applications, view student profiles, and shortlist candidates in just a few clicks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4-STEP HIRING PROCESS ──────────────────────────────────────────── */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill text-uppercase mb-2">
              Hiring Workflow
            </span>
            <h2 className="fw-bold text-dark">How Campus Hiring Works</h2>
            <p className="text-muted">Four simple steps to recruit top talent for your company</p>
          </div>

          <div className="row g-4">
            <div className="col-md-3">
              <div className="p-4 rounded-4 bg-light text-center h-100 position-relative border">
                <span className="badge bg-primary rounded-circle fs-6 mb-3 p-3 font-monospace" style={{ width: 42, height: 42 }}>1</span>
                <h5 className="fw-bold text-dark mb-2">Register Profile</h5>
                <p className="text-muted small mb-0">Create your company account with HR contact details in under 1 minute.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-4 rounded-4 bg-light text-center h-100 position-relative border">
                <span className="badge bg-primary rounded-circle fs-6 mb-3 p-3 font-monospace" style={{ width: 42, height: 42 }}>2</span>
                <h5 className="fw-bold text-dark mb-2">Post Job Drive</h5>
                <p className="text-muted small mb-0">Specify job title, location, required skills, package, and eligible courses.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-4 rounded-4 bg-light text-center h-100 position-relative border">
                <span className="badge bg-primary rounded-circle fs-6 mb-3 p-3 font-monospace" style={{ width: 42, height: 42 }}>3</span>
                <h5 className="fw-bold text-dark mb-2">Review Candidates</h5>
                <p className="text-muted small mb-0">Browse student career profiles, view projects, and download Master Resumes.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-4 rounded-4 bg-light text-center h-100 position-relative border">
                <span className="badge bg-primary rounded-circle fs-6 mb-3 p-3 font-monospace" style={{ width: 42, height: 42 }}>4</span>
                <h5 className="fw-bold text-dark mb-2">Shortlist & Select</h5>
                <p className="text-muted small mb-0">Shortlist selected applicants and conduct interviews directly with our placement cell.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA BANNER ──────────────────────────────────────────────── */}
      <section className="py-5 bg-primary text-white text-center">
        <div className="container py-3">
          <h2 className="fw-bold text-white mb-3">Ready to Hire Campus Talent?</h2>
          <p className="text-white-50 max-w-2xl mx-auto mb-4 lead">
            Join 150+ leading corporate partners hiring from Aadya Institution. Create your account today.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/company/register" className="btn btn-warning btn-lg fw-bold px-4 py-2.5 rounded-3 shadow">
              <i className="bi bi-person-plus-fill me-2"></i>Register Company Account
            </Link>
            <Link to="/company/login" className="btn btn-outline-light btn-lg fw-bold px-4 py-2.5 rounded-3">
              <i className="bi bi-box-arrow-in-right me-2"></i>Company Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
