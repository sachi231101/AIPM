import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    closeNavbar(e);
    logout();
    navigate("/");
  };

  const closeNavbar = (e) => {
    if (e?.target?.closest('.dropdown-toggle')) return;

    const navbarCollapse = document.getElementById("navbarMain");
    if (navbarCollapse && navbarCollapse.classList.contains("show")) {
      const bsCollapse = window.bootstrap?.Collapse?.getInstance(navbarCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      } else if (window.bootstrap?.Collapse) {
        new window.bootstrap.Collapse(navbarCollapse).hide();
      } else {
        navbarCollapse.classList.remove("show");
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light apms-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/" onClick={closeNavbar}>
          <img src="/aadya-logo.png" alt="Aadya Institute Logo" style={{ height: "38px", objectFit: "contain" }} />
          <span className="text-muted opacity-50 fw-light fs-5 mx-1">|</span>
          <img src="/edify-logo.png" alt="Edify Institute Logo" style={{ height: "38px", objectFit: "contain" }} />
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain" onClick={closeNavbar}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-lg-2">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/placement-drives">Placement Drives</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">About</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">Contact</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/for-companies">For Companies</NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0 pb-2 pb-lg-0">
            {user && role === "student" ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle"></i>
                  {user.name?.split(" ")[0]}
                </button>
                <ul className="dropdown-menu dropdown-menu-start dropdown-menu-lg-end shadow">
                  <li><Link className="dropdown-item" to="/student/dashboard"><i className="bi bi-speedometer2 me-2"></i>Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/student/profile"><i className="bi bi-person me-2"></i>My Profile</Link></li>
                  <li><Link className="dropdown-item" to="/student/resume-builder"><i className="bi bi-file-earmark-person me-2 text-primary"></i>Resume Builder</Link></li>
                  <li><Link className="dropdown-item" to="/placement-drives"><i className="bi bi-briefcase me-2"></i>Jobs</Link></li>
                  <li><Link className="dropdown-item" to="/student/applied"><i className="bi bi-check2-circle me-2"></i>Applied Jobs</Link></li>
                  <li><a className="dropdown-item text-success fw-medium" href="https://chat.whatsapp.com/JzQLdJvoZjz243LaztjHwS" target="_blank" rel="noopener noreferrer"><i className="bi bi-whatsapp me-2"></i>Join WhatsApp Group</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                </ul>
              </div>
            ) : user && role === "company" ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary btn-sm dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-buildings-fill"></i>
                  {user.company_name || user.name?.split(" ")[0]}
                </button>
                <ul className="dropdown-menu dropdown-menu-start dropdown-menu-lg-end shadow">
                  <li><Link className="dropdown-item" to="/company/dashboard"><i className="bi bi-speedometer2 me-2"></i>Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/company/profile"><i className="bi bi-buildings me-2"></i>Company Profile</Link></li>
                  <li><Link className="dropdown-item" to="/company/jobs"><i className="bi bi-briefcase me-2"></i>Jobs</Link></li>
                  <li><Link className="dropdown-item" to="/company/applications"><i className="bi bi-file-earmark-check me-2"></i>Applications</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                </ul>
              </div>
            ) : user && role === "admin" ? (
              <div className="dropdown">
                <button
                  className="btn btn-warning btn-sm dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-shield-exclamation me-1"></i>Admin
                </button>
                <ul className="dropdown-menu dropdown-menu-start dropdown-menu-lg-end shadow">
                  <li><Link className="dropdown-item" to="/admin/dashboard"><i className="bi bi-speedometer2 me-2"></i>Dashboard</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/student/login" className="btn btn-outline-primary btn-sm px-3 py-1-5">
                  <i className="bi bi-person me-1"></i>Student Login
                </Link>
                <Link to="/admin/login" className="btn btn-warning btn-sm px-3 py-1-5 text-dark fw-medium">
                  <i className="bi bi-shield-exclamation me-1"></i>Admin
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
