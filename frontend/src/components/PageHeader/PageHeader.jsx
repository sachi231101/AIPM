import { Link } from "react-router-dom";

export default function PageHeader({ title, subtitle, breadcrumbs = [] }) {
  return (
    <div className="page-header-bar py-2 py-md-3 px-3 px-md-4 mb-3 mb-md-4">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2">
        <div>
          <h4 className="mb-1 fw-bold text-primary">{title}</h4>
          {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
        </div>
        {breadcrumbs.length > 0 && (
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 small">
              {breadcrumbs.map((crumb, i) => (
                <li
                  key={i}
                  className={`breadcrumb-item ${i === breadcrumbs.length - 1 ? "active" : ""}`}
                >
                  {crumb.to && i < breadcrumbs.length - 1 ? (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  ) : (
                    crumb.label
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </div>
  );
}
