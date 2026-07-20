import { useRef, useState, useEffect } from "react";

export default function ResumeUpload({ onFileSelect, currentFile }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(currentFile || null);

  useEffect(() => {
    setFileName(currentFile || null);
  }, [currentFile]);

  const handleFile = (file) => {
    if (file && file.type === "application/pdf") {
      setFileName(file.name);
      onFileSelect?.(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`resume-upload-area rounded-3 text-center p-4 ${dragging ? "dragging" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{ cursor: "pointer", border: "2px dashed #1E88E5", background: dragging ? "#e3f2fd" : "#f8faff" }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="d-none"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <i className="bi bi-file-earmark-pdf-fill text-danger fs-2 mb-2 d-block"></i>
      {fileName ? (
        <div>
          <p className="mb-0 fw-medium text-success"><i className="bi bi-check-circle-fill me-1"></i>{fileName}</p>
          <small className="text-muted">Click to change file</small>
        </div>
      ) : (
        <div>
          <p className="mb-1 fw-medium">Drag & drop your resume here</p>
          <small className="text-muted">or click to browse — PDF only, max 5MB</small>
        </div>
      )}
    </div>
  );
}
