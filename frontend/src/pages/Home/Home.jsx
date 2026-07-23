import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { companies as mockCompanies, testimonials, institutes } from "../../utils/mockData";
import JobCard from "../../components/JobCard/JobCard";
import CompanyCard from "../../components/CompanyCard/CompanyCard";
import { jobService, companyService } from "../../services/api";

import { getCompanyLogo, handleLogoError } from "../../utils/logoHelper";

export default function Home() {
  const [latestJobs, setLatestJobs] = useState([]);
  const [realCompanies, setRealCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, compRes] = await Promise.all([
          jobService.getAll().catch(() => ({ data: { data: [] } })),
          companyService.getPublic().catch(() => ({ data: { data: [] } })),
        ]);

        const rawJobs = jobsRes.data?.data || [];
        const rawComps = compRes.data?.data || [];

        const mappedJobs = rawJobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company?.name || "Unknown Company",
          companyLogo: getCompanyLogo(job.company?.logo_path, job.company?.name),
          location: job.location,
          salary: job.salary,
          experience: job.experience,
          skills: job.skills || [],
          status: job.status === "published" ? "Published" : (job.status === "closed" ? "Closed" : "Pending"),
          lastDate: job.last_date,
        }));
        setLatestJobs(mappedJobs.slice(0, 3));

        if (rawComps && rawComps.length > 0) {
          const mappedComps = rawComps.map((c) => ({
            id: c.id,
            name: c.name,
            logo: getCompanyLogo(c.logo_url || c.logo, c.name),
            industry: c.industry || "Technology",
            location: c.location || "India",
            openJobs: c.open_jobs || 0,
          }));
          setRealCompanies(mappedComps);
        } else {
          setRealCompanies(mockCompanies);
        }
      } catch (err) {
        console.error("Failed to load home page data", err);
        setRealCompanies(mockCompanies);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCourseRegister = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("course_name");
    toast.success(`Thank you, ${name}! Your registration has been received. We will contact you within 24 hours. 🎉`);
    e.target.reset();
  };

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero-section position-relative overflow-hidden">
        <div className="hero-bg-overlay"></div>
        <div className="container position-relative py-5" style={{ zIndex: 2 }}>
          <div className="row align-items-center min-vh-75 py-5">
            <div className="col-lg-6">
              <span className="badge bg-warning text-dark fw-semibold px-3 py-2 mb-3 rounded-pill">
                🎓 India's Premier Placement Portal
              </span>
              <h1 className="display-4 fw-bold text-white lh-sm mb-4">
                Launch Your Career With{" "}
                <span className="text-warning">Aadya Institution</span>
              </h1>
              <p className="lead text-white-75 mb-5">
                Aadya Placements connects trained professionals and upskilled learners with leading companies across India. Register today, access placement drives, and launch your career.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/student/register" className="btn btn-warning btn-lg fw-semibold px-4">
                  <i className="bi bi-person-plus-fill me-2"></i>Register as Student
                </Link>
                <Link to="/placement-drives" className="btn btn-outline-light btn-lg px-4">
                  <i className="bi bi-briefcase me-2"></i>Browse Jobs
                </Link>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-flex justify-content-center">
              <div className="hero-card-stack">
                {latestJobs.slice(0, 2).map((job, i) => (
                  <div
                    key={job.id}
                    className="hero-floating-card card shadow-lg border-0"
                    style={{ transform: `rotate(${i === 0 ? "-3deg" : "3deg"}) translateY(${i === 0 ? "0" : "60px"})` }}
                  >
                    <div className="card-body p-3 d-flex align-items-center gap-3">
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        width={44}
                        height={44}
                        className="rounded-2"
                        style={{ objectFit: "cover" }}
                        onError={(e) => handleLogoError(e, job.company)}
                      />
                      <div>
                        <p className="fw-bold mb-0 small">{job.title}</p>
                        <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>{job.company} • {job.location}</p>
                        <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: "0.7rem" }}>{job.salary}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Wave */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#ffffff"/></svg>
        </div>
      </section>

   

      {/* ── LATEST DRIVES ────────────────────────────────────────────────── */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-1">Latest Placement Drives</h2>
              <p className="text-muted mb-0">Fresh opportunities from top companies</p>
            </div>
            <Link to="/placement-drives" className="btn btn-outline-primary btn-sm">
              View All <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
          <div className="row g-4">
            {latestJobs.map((job) => (
              <div key={job.id} className="col-md-4">
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2">How It Works</h2>
            <p className="text-muted">Three simple steps to your dream job</p>
          </div>
          <div className="row g-4 justify-content-center">
            {[
              { step: "01", icon: "bi-person-plus", title: "Register", desc: "Create your student profile with your institute details, skills, and upload your resume." },
              { step: "02", icon: "bi-search", title: "Discover", desc: "Browse placement drives tailored for your institute and apply to matching opportunities." },
              { step: "03", icon: "bi-trophy", title: "Get Placed", desc: "Receive notifications and track your application status in real time." },
            ].map((item, i) => (
              <div key={i} className="col-md-4">
                <div className="card border-0 shadow-sm h-100 p-4 text-center how-card">
                  <div className="how-step-badge mx-auto mb-3">{item.step}</div>
                  <div className="mb-3">
                    <i className={`bi ${item.icon} fs-2 text-primary`}></i>
                  </div>
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────────────────────── */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-warning text-dark fw-semibold px-3 py-2 mb-2 rounded-pill">
              Why Choose Us?
            </span>
            <h2 className="fw-bold mb-2">Your Path to Success Begins Here!</h2>
            <p className="text-muted">Empowering you with high-quality education and placement opportunities</p>
          </div>
          <div className="row g-4 justify-content-center">
            {[
              { icon: "bi-people-fill", title: "Experienced Faculty", desc: "Learn from industry experts who bring practical knowledge and insights to every session." },
              { icon: "bi-journal-text", title: "Comprehensive Curriculum", desc: "Our courses are designed to cover essential concepts with hands-on training for real-world applications." },
              { icon: "bi-calendar2-range-fill", title: "Flexible Learning Modes", desc: "Choose between online and offline classes to learn at your convenience, without compromising quality." },
            ].map((item, i) => (
              <div key={i} className="col-md-4">
                <div className="card border-0 shadow-sm h-100 p-4 text-center">
                  <div className="mb-3">
                    <div className="stat-home-icon mx-auto rounded-circle d-flex align-items-center justify-content-center" style={{ width: 60, height: 60, background: "#fff8e1" }}>
                      <i className={`bi ${item.icon} fs-3 text-warning`}></i>
                    </div>
                  </div>
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── PARTNER INSTITUTES ───────────────────────────────────────────── */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2">Partner Institutes</h2>
            <p className="text-muted">Trusted by leading engineering and management colleges</p>
          </div>
          <div className="row g-3 justify-content-center align-items-center">
            {institutes.filter(i => i.name !== "Other").map((inst) => (
              <div key={inst.id} className="col-6 col-md-4 col-lg-2">
                <div className="card border-0 shadow-sm text-center p-3 institute-badge">
                  <div className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "#e3f0ff" }}>
                    <i className="bi bi-bank2 text-primary"></i>
                  </div>
                  <small className="fw-medium" style={{ fontSize: "0.7rem", lineHeight: 1.3 }}>{inst.name}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP RECRUITERS ───────────────────────────────────────────────── */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2">Top Recruiters</h2>
            <p className="text-muted">Companies that trust Aadya Placements for campus hiring</p>
          </div>
          <div className="row g-4">
            {(realCompanies.length > 0 ? realCompanies : mockCompanies).map((company) => (
              <div key={company.id} className="col-6 col-md-4 col-lg-2-4">
                <CompanyCard company={company} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2">Student Reviews & Feedback</h2>
            <p className="text-muted">Real Google reviews from students trained at Aadya Institution</p>
          </div>
          <div className="row g-4">
            {testimonials.map((t) => (
              <div key={t.id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100 p-4 testimonial-card">
                  <div className="mb-3">
                    {[1,2,3,4,5].map(s => <i key={s} className="bi bi-star-fill text-warning me-1" style={{ fontSize: "0.8rem" }}></i>)}
                  </div>
                  <p className="text-muted mb-4 fst-italic">"{t.quote}"</p>
                  <div className="d-flex align-items-center gap-3 mt-auto">
                    <img src={t.avatar} alt={t.name} className="rounded-circle" width={44} height={44} />
                    <div>
                      <p className="fw-bold mb-0 small">{t.name}</p>
                      <small className="text-primary">{t.role}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGISTER FOR COURSES FORM ────────────────────────────────────── */}
      <section className="py-5 bg-white border-bottom border-top" id="course-register">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-warning text-dark fw-semibold px-3 py-2 mb-3 rounded-pill">
                Register For Courses Now!
              </span>
              <h2 className="fw-bold mb-3">Start Your Career Journey Today</h2>
              <p className="lead text-primary fw-medium mb-3">
                "Learn with passion to live with purpose."
              </p>
              <p className="text-muted mb-4">
                At Aadya Institution, we believe that education is not just about acquiring skills but igniting a passion for lifelong learning. Our mission is to inspire students to embrace learning with purpose, enabling them to thrive in a competitive world and lead fulfilling lives.
              </p>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-envelope text-primary fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Have Questions?</h6>
                  <p className="text-muted mb-0 small">Email us at rakshith@edifyinstitution.com</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border-0 shadow-lg p-4 p-md-5" style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e3f0ff 100%)" }}>
                <h4 className="fw-bold mb-4 text-center">Course Registration</h4>
                <form onSubmit={handleCourseRegister}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Name</label>
                    <input type="text" name="course_name" required className="form-control bg-white" placeholder="Enter your full name" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Phone Number</label>
                    <input type="tel" name="course_phone" required className="form-control bg-white" placeholder="Enter your phone number" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Email</label>
                    <input type="email" name="course_email" required className="form-control bg-white" placeholder="Enter your email address" />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold small">City</label>
                    <input type="text" name="course_city" required className="form-control bg-white" placeholder="Enter your city" />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
                    Register Now
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-5 cta-section text-white text-center">
        <div className="container py-3">
          <h2 className="fw-bold mb-3">Ready to Start Your Placement Journey?</h2>
          <p className="lead text-white-75 mb-4">Join 1,200+ students already registered on Aadya Placements</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/student/register" className="btn btn-warning btn-lg fw-semibold">
              <i className="bi bi-rocket-takeoff me-2"></i>Get Started Free
            </Link>
            <Link to="/contact" className="btn btn-outline-light btn-lg">
              <i className="bi bi-chat-dots me-2"></i>Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── ACADEMY HUNT EDUCATION DIRECTORY SECTION ─────────────────────── */}
      <section className="py-5 border-top" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f0f6ff 100%)" }}>
        <div className="container py-4">
          <div className="text-center max-w-3xl mx-auto mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 rounded-pill mb-3 d-inline-flex align-items-center gap-2">
              <img src="/academyhunt-logo.png" alt="Academy Hunt Icon" style={{ height: "22px", objectFit: "contain" }} />
              <span>India's Premier Education Directory</span>
            </span>
            <h2 className="display-6 fw-bold text-dark mb-3 d-flex align-items-center justify-content-center gap-2 flex-wrap">
              Find Your Perfect Academy with <img src="/academyhunt-full-logo.png" alt="Academy Hunt" style={{ height: "46px", objectFit: "contain" }} />
            </h2>
            <p className="text-muted lead fs-6 mb-0">
              Discover and compare the best coaching centers, academies, and professional courses across India to boost your skills and placement readiness.
            </p>
          </div>

          {/* Directory Card */}
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 bg-white p-4 p-md-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-white p-1 rounded-3 border shadow-sm d-flex align-items-center justify-content-center flex-shrink-0" style={{ height: 48, padding: "4px 12px" }}>
                    <img src="/academyhunt-logo.png" alt="Academy Hunt Logo" style={{ height: "36px", objectFit: "contain" }} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark">Explore Academies & Courses Across India</h5>
                    <small className="text-muted">Compare top coaching centers and specialized training institutes in one place</small>
                  </div>
                </div>

                {/* Categories Bar matching Academy Hunt */}
                <div className="d-flex flex-wrap gap-2 my-3">
                  {[
                    { label: "Technology & Software", icon: "bi-laptop" },
                    { label: "Health", icon: "bi-activity" },
                    { label: "Engineering", icon: "bi-gear-wide-connected" },
                    { label: "Government", icon: "bi-bank" },
                    { label: "Commerce", icon: "bi-graph-up-arrow" },
                    { label: "Skill Development", icon: "bi-award" },
                  ].map((cat, idx) => (
                    <span key={idx} className="badge bg-light text-dark border px-3 py-2 rounded-pill font-weight-normal small">
                      <i className={`bi ${cat.icon} me-1 text-primary`}></i>{cat.label}
                    </span>
                  ))}
                </div>

                <p className="text-muted small mt-3 mb-4">
                  Whether you're looking for tech bootcamps, exam coaching, or skill certification programs, Academy Hunt helps you browse verified academies, check course syllabi, compare fee structures, and claim exclusive discounts.
                </p>

                <div className="d-flex flex-wrap gap-3">
                  <a
                    href="https://academyhunt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-lg fw-semibold px-4"
                  >
                    Explore Academies on Academy Hunt <i className="bi bi-arrow-up-right ms-1"></i>
                  </a>
            
                </div>
              </div>

              {/* Right Highlight Box */}
              <div className="col-lg-4">
                <div className="bg-primary text-white p-4 rounded-4 shadow h-100 d-flex flex-column justify-content-between">
                  <div>
                    <span className="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill mb-3">EXCLUSIVES & OFFERS</span>
                    <h4 className="fw-bold mb-2">Compare & Choose Best Institutes</h4>
                    <p className="small text-white-75 mb-4">
                      Check course syllabi, student ratings, fee structures, and special bootcamp offers to find the right institute for your career goals.
                    </p>
                  </div>
                  <a
                    href="https://academyhunt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-warning text-dark fw-bold w-100 py-2.5 shadow-sm"
                  >
                    <i className="bi bi-globe me-2"></i>Visit Academy Hunt
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
