import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light apms-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <img src="/logo.png" alt="Aadya Institute Logo" style={{ height: "40px", objectFit: "contain" }} />
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

        <div className="collapse navbar-collapse" id="navbarMain">
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
              <NavLink className="nav-link" to="/company/submit-job">For Companies</NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
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
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li><Link className="dropdown-item" to="/student/dashboard"><i className="bi bi-speedometer2 me-2"></i>Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/student/profile"><i className="bi bi-person me-2"></i>My Profile</Link></li>
                  <li><Link className="dropdown-item" to="/student/jobs"><i className="bi bi-briefcase me-2"></i>Jobs</Link></li>
                  <li><Link className="dropdown-item" to="/student/applied"><i className="bi bi-check2-circle me-2"></i>Applied Jobs</Link></li>
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
                <ul className="dropdown-menu dropdown-menu-end shadow">
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
