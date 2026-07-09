import { useState } from "react";
import { institutes } from "../../utils/mockData";

export default function InstituteSelector({ value, onChange, error }) {
  const [showOther, setShowOther] = useState(false);

  const handleChange = (e) => {
    const selected = e.target.value;
    setShowOther(selected === "Other");
    onChange(selected, "");
  };

  return (
    <div>
      <select
        className={`form-select ${error ? "is-invalid" : ""}`}
        value={value}
        onChange={handleChange}
      >
        <option value="">-- Select Institute --</option>
        {institutes.map((inst) => (
          <option key={inst.id} value={inst.name}>{inst.name}</option>
        ))}
      </select>
      {error && <div className="invalid-feedback">{error}</div>}
      {showOther && (
        <input
          type="text"
          className="form-control mt-2"
          placeholder="Enter your institute name"
          onChange={(e) => onChange("Other", e.target.value)}
        />
      )}
    </div>
  );
}
