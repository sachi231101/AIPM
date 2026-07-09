export default function SearchBar({ value, onChange, placeholder = "Search...", onSearch }) {
  return (
    <div className="input-group search-bar">
      <span className="input-group-text bg-white border-end-0">
        <i className="bi bi-search text-muted"></i>
      </span>
      <input
        type="text"
        className="form-control border-start-0 ps-0"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
      />
      {value && (
        <button className="btn btn-outline-secondary border-start-0" onClick={() => onChange("")}>
          <i className="bi bi-x"></i>
        </button>
      )}
    </div>
  );
}
