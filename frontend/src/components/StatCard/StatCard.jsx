export default function StatCard({ title, value, icon, color = "primary", trend }) {
  return (
    <div className="card stat-card border-0 shadow-sm h-100">
      <div className="card-body p-4">
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <p className="text-muted small fw-medium mb-1">{title}</p>
            <h3 className="fw-bold mb-0" style={{ color: `var(--apms-${color})` }}>{value}</h3>
            {trend && (
              <small className={`text-${trend > 0 ? "success" : "danger"} fw-medium`}>
                <i className={`bi bi-arrow-${trend > 0 ? "up" : "down"}-short`}></i>
                {Math.abs(trend)}% this month
              </small>
            )}
          </div>
          <div
            className={`stat-icon rounded-3 p-3`}
            style={{ background: `var(--apms-${color}-light)` }}
          >
            <i className={`bi ${icon} fs-5`} style={{ color: `var(--apms-${color})` }}></i>
          </div>
        </div>
      </div>
    </div>
  );
}
