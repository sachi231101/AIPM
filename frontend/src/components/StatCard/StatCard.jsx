export default function StatCard({ title, value, icon, color = "primary", trend }) {
  const isLongValue = typeof value === "string" && value.length > 5;

  return (
    <div className="card stat-card border-0 shadow-sm h-100 overflow-hidden">
      <div className="card-body p-3 p-sm-4">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <div className="min-width-0 flex-grow-1">
            <p className="text-muted small fw-medium mb-1 text-truncate" title={title}>{title}</p>
            <h3
              className="fw-bold mb-0 text-truncate"
              style={{
                color: `var(--apms-${color})`,
                fontSize: isLongValue ? "clamp(0.85rem, 3.2vw, 1.2rem)" : undefined,
              }}
              title={typeof value === "string" ? value : undefined}
            >
              {value}
            </h3>
            {trend && (
              <small className={`text-${trend > 0 ? "success" : "danger"} fw-medium d-block text-truncate mt-1`}>
                <i className={`bi bi-arrow-${trend > 0 ? "up" : "down"}-short`}></i>
                {Math.abs(trend)}% this month
              </small>
            )}
          </div>
          <div
            className="stat-icon rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              background: `var(--apms-${color}-light)`,
              width: "42px",
              height: "42px"
            }}
          >
            <i className={`bi ${icon} fs-5`} style={{ color: `var(--apms-${color})` }}></i>
          </div>
        </div>
      </div>
    </div>
  );
}
