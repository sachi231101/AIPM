export default function About() {
  const team = [
    { name: "Rakshith S", role: "Founder", avatar: "https://ui-avatars.com/api/?name=Rakshith+S&background=0F4C81&color=fff&size=80" },
    { name: "Shreyas", role: "Senior Trainer & Consultant", avatar: "https://ui-avatars.com/api/?name=Shreyas&background=1E88E5&color=fff&size=80" },
    { name: "Priyanka", role: "Trainer & Coordinator", avatar: "https://ui-avatars.com/api/?name=Priyanka&background=2E7D32&color=fff&size=80" },
    { name: "Vignesh", role: "Placement Officer", avatar: "https://ui-avatars.com/api/?name=Vignesh&background=F9A825&color=fff&size=80" },
  ];

  return (
    <>
      {/* Page Header */}
      <section className="inner-page-hero text-white text-center py-5">
        <div className="container py-3">
          <h1 className="display-5 fw-bold">About Aadya Institute</h1>
          <p className="lead text-white-75">Learn with Passion to Live with Purpose.</p>
        </div>
      </section>

      {/* About Institute */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-primary bg-opacity-10 text-primary mb-3">Our Profile</span>
              <h2 className="fw-bold mb-3">Transforming Lives Through Professional Training</h2>
              <p className="text-muted mb-3">
                Founded in 2016 in Bangalore, Aadya Institution is a renowned educational center that has been transforming lives through professional training and skill development. Our institution is committed to delivering high-quality education that bridges the gap between academic learning and industry demands.
              </p>
              <p className="text-muted mb-4">
                With a focus on practical, hands-on training, we offer a diverse range of courses designed to empower beginners and professionals alike. Whether you are looking to kickstart your career or upskill, our tailored programs are designed to help you achieve your career goals.
              </p>
              <div className="row g-3">
                {[
                  { label: "Students Enrolled", value: "9,749+" },
                  { label: "Certified Trainers", value: "30+" },
                  { label: "Career Focused Courses", value: "10+" },
                  { label: "Student Success Ratio", value: "95%" },
                ].map((item, i) => (
                  <div key={i} className="col-6">
                    <div className="card border-0 bg-light p-3 text-center">
                      <h4 className="text-primary fw-bold mb-0">{item.value}</h4>
                      <small className="text-muted">{item.label}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-img-block rounded-4 overflow-hidden shadow-lg" style={{ background: "linear-gradient(135deg, #0F4C81 0%, #1E88E5 100%)", padding: "3rem", minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="text-center text-white">
                  <i className="bi bi-mortarboard-fill fs-1 mb-3 d-block"></i>
                  <h4 className="fw-bold">Aadya Institution</h4>
                  <p className="text-white-75">Bangalore, Karnataka</p>
                  <p className="text-white-50 small mb-3">Estd. 2016</p>
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    <span className="badge bg-white text-primary">Practical Learning</span>
                    <span className="badge bg-white text-primary">Certified Faculty</span>
                    <span className="badge bg-white text-primary">Placement Oriented</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Offerings & Skills */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-success bg-opacity-10 text-success mb-2">Our Programs</span>
            <h2 className="fw-bold">Comprehensive & Career-Focused Courses</h2>
            <p className="text-muted col-lg-7 mx-auto">
              Our training curriculum covers essential concepts and provides hands-on expertise with real-world applications in high-demand domains.
            </p>
          </div>
          <div className="row g-4">
            {[
              { icon: "bi-code-slash", title: "Full Stack Development", desc: "Become a proficient software developer. Learn frontend and backend technologies with mentorship." },
              { icon: "bi-file-earmark-bar-graph", title: "Microsoft Excel", desc: "Master basic to advanced Excel formulas, pivot tables, and data analysis tools used in modern workplaces." },
              { icon: "bi-graph-up", title: "Digital Marketing", desc: "Learn SEO, SEM, social media strategies, and content marketing to drive business and online visibility." },
              { icon: "bi-terminal", title: "Python Programming", desc: "Build a strong coding foundation with Python. Understand variables, logic, databases, and simple automation." },
              { icon: "bi-laptop", title: "SAP Training", desc: "Upskill with industry-standard SAP modules designed to match current enterprise resource planning requirements." },
              { icon: "bi-receipt-cutoff", title: "Tally ERP & Prime", desc: "Master accounting, GST filings, inventory management, and financial reporting with detailed hands-on sessions." },
            ].map((item, i) => (
              <div key={i} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100 p-4">
                  <div className="rounded-circle mb-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "#e3f0ff" }}>
                    <i className={`bi ${item.icon} text-primary fs-5`}></i>
                  </div>
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Founder Message */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100 p-4" style={{ borderLeft: "4px solid #0F4C81" }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "#e3f0ff" }}>
                    <i className="bi bi-bullseye text-primary fs-5"></i>
                  </div>
                  <h4 className="fw-bold mb-0">Our Mission</h4>
                </div>
                <h5 className="text-primary mb-3"><em>"Learn with passion to live with purpose."</em></h5>
                <p className="text-muted">
                  At Aadya Institution, we believe that education is not just about acquiring skills but igniting a passion for lifelong learning. Our mission is to inspire students to embrace learning with purpose, enabling them to thrive in a competitive world and lead fulfilling lives.
                </p>
                <ul className="list-unstyled mt-3">
                  {["Practical, hands-on training sessions", "Bridges the gap between academic and industry needs", "Support for upskilling at every career stage"].map((item, i) => (
                    <li key={i} className="d-flex align-items-start gap-2 mb-2 text-muted small">
                      <i className="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100 p-4" style={{ borderLeft: "4px solid #F9A825" }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "#fff8e1" }}>
                    <i className="bi bi-quote text-warning fs-5"></i>
                  </div>
                  <h4 className="fw-bold mb-0">Founder's Message</h4>
                </div>
                <p className="text-muted fs-5 fst-italic mb-4">
                  "Education is the foundation of transformation. At Aadya Institution, we aim to nurture talent, empower minds, and inspire success."
                </p>
                <div className="d-flex align-items-center gap-3 mt-auto">
                  <div className="rounded-circle bg-warning text-dark fw-bold d-flex align-items-center justify-content-center" style={{ width: 50, height: 50, fontSize: "1.2rem" }}>
                    R
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">Rakshith</h6>
                    <small className="text-muted">Founder, Aadya Institution</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2">Meet Our Team</h2>
            <p className="text-muted">A dedicated group of experienced professionals passionate about empowering learners and driving their success</p>
          </div>
          <div className="row g-4 justify-content-center">
            {team.map((member, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="card border-0 shadow-sm text-center p-4 h-100">
                  <img src={member.avatar} alt={member.name} className="rounded-circle mx-auto mb-3" width={72} height={72} />
                  <h6 className="fw-bold mb-1">{member.name}</h6>
                  <small className="text-primary">{member.role}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
