import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="apms-footer text-white mt-auto">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img src="/logo.png" alt="Aadya Institute Logo" style={{ height: "40px", objectFit: "contain" }} />
              <h5 className="mb-0 fw-bold ms-1">Aadya Placements</h5>
            </div>
            <p className="text-white-50 small">
              Aadya Institution — Transforming lives through professional training and skill development since 2016.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-white-50 hover-white fs-5"><i className="bi bi-linkedin"></i></a>
              <a href="#" className="text-white-50 hover-white fs-5"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="text-white-50 hover-white fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white-50 hover-white fs-5"><i className="bi bi-instagram"></i></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-4">
            <h6 className="fw-semibold text-warning mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/placement-drives" className="footer-link">Placement Drives</Link></li>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
            </ul>
          </div>

          {/* Students */}
          <div className="col-lg-2 col-md-4">
            <h6 className="fw-semibold text-warning mb-3">Students</h6>
            <ul className="list-unstyled">
              <li><Link to="/student/login" className="footer-link">Login</Link></li>
              <li><Link to="/student/register" className="footer-link">Register</Link></li>
              <li><Link to="/student/dashboard" className="footer-link">Dashboard</Link></li>
              <li><Link to="/student/jobs" className="footer-link">Browse Jobs</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-4 col-md-4">
            <h6 className="fw-semibold text-warning mb-3">Contact Us</h6>
            <ul className="list-unstyled text-white-50 small">
              <li className="mb-2"><i className="bi bi-geo-alt-fill me-2 text-warning"></i><strong>Branch 1 – RM Nagar:</strong> 183, 2nd Floor, 1st Main Road, Opp, Old Police Station, Ramamurthy Nagar, Bengaluru - 560016</li>
              <li className="mb-2"><i className="bi bi-telephone-fill me-2 text-warning"></i>+91 99641 94324</li>
              <li className="mb-2"><i className="bi bi-geo-alt-fill me-2 text-warning"></i><strong>Branch 2 – Malleshwaram:</strong> 235, Sampige Rd, Malleshwaram 15 & 16th cross, Bengaluru - 560003</li>
              <li className="mb-2"><i className="bi bi-telephone-fill me-2 text-warning"></i>+91 96202 22392</li>
              <li className="mb-2"><i className="bi bi-envelope-fill me-2 text-warning"></i>aadyainstitute2016@gmail.com</li>
              <li className="mb-2"><i className="bi bi-clock-fill me-2 text-warning"></i>Mon–Sat: 8:00 AM – 9:00 PM <br/><span className="ms-4">Sun: 10:00 AM – 2:00 PM</span></li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary mt-4" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-white-50 small">
          <p className="mb-1 mb-md-0">© 2026 Aadya Placements. All rights reserved.</p>
          <p className="mb-0">Built with <i className="bi bi-heart-fill text-danger"></i> for students</p>
        </div>
      </div>
    </footer>
  );
}
