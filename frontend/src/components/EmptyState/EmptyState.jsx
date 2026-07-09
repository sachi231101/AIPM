export default function EmptyState({
  icon = "bi-inbox",
  title = "Nothing here yet",
  description = "No data available at the moment.",
  action,
}) {
  return (
    <div className="text-center py-5">
      <div className="empty-state-icon mb-4">
        <i className={`bi ${icon}`} style={{ fontSize: "4rem", color: "#b0bec5" }}></i>
      </div>
      <h5 className="text-muted fw-semibold">{title}</h5>
      <p className="text-muted small mb-4">{description}</p>
      {action && action}
    </div>
  );
}
