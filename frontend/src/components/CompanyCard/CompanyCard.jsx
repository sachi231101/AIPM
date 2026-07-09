export default function CompanyCard({ company }) {
  return (
    <div className="card company-card border-0 shadow-sm h-100 text-center">
      <div className="card-body p-4 d-flex flex-column align-items-center gap-3">
        <img
          src={company.logo}
          alt={company.name}
          className="rounded-3"
          width={72}
          height={72}
        />
        <div>
          <h6 className="fw-bold mb-1">{company.name}</h6>
          <span className="badge bg-primary bg-opacity-10 text-primary small">{company.industry}</span>
        </div>
        <div className="d-flex gap-3 small text-muted">
          <span><i className="bi bi-door-open me-1"></i>{company.openings} Openings</span>
        </div>
        {company.website && (
          <a href={company.website} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary w-100">
            <i className="bi bi-globe me-1"></i>Visit Website
          </a>
        )}
      </div>
    </div>
  );
}
