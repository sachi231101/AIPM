export function Skeleton({ width = "100%", height = "1rem", borderRadius = "4px", className = "", style = {} }) {
  return (
    <span
      className={`skeleton-box ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

export function SkeletonJobCard() {
  return (
    <div className="card border-0 shadow-sm p-4 h-100 skeleton-card">
      <div className="d-flex align-items-center gap-3 mb-3">
        <Skeleton width="52px" height="52px" borderRadius="12px" />
        <div className="flex-grow-1">
          <Skeleton width="75%" height="1.2rem" className="mb-2" />
          <Skeleton width="45%" height="0.85rem" />
        </div>
      </div>
      <div className="my-3 d-flex flex-column gap-2">
        <Skeleton width="60%" height="0.9rem" />
        <Skeleton width="50%" height="0.9rem" />
        <Skeleton width="80%" height="0.9rem" />
      </div>
      <div className="d-flex gap-2 my-3">
        <Skeleton width="60px" height="24px" borderRadius="12px" />
        <Skeleton width="70px" height="24px" borderRadius="12px" />
        <Skeleton width="50px" height="24px" borderRadius="12px" />
      </div>
      <div className="pt-3 border-top d-flex justify-content-between align-items-center mt-auto">
        <Skeleton width="30%" height="0.85rem" />
        <Skeleton width="90px" height="32px" borderRadius="6px" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-md-6 col-lg-4">
          <SkeletonJobCard />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><Skeleton width="80px" height="1rem" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}><Skeleton width={c === 0 ? "60%" : "40%"} height="1rem" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Skeleton;
