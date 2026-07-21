import { useState, useEffect } from "react";
import { resumeService } from "../../services/api";

export default function ApplyResumeModal({ job, student, onConfirm, onClose, loading }) {
  const [builtResumes, setBuiltResumes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [fetchingResumes, setFetchingResumes] = useState(true);

  const hasUploaded = !!(student?.resume_path || student?.resume_url || student?.resumeUrl);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setFetchingResumes(true);
        const res = await resumeService.getAll();
        const list = res.data?.data || [];
        setBuiltResumes(list);

        // Pre-select best option
        if (list.length > 0) {
          const defaultOne = list.find(r => r.is_default) || list[0];
          setSelectedType("builder");
          setSelectedKey(defaultOne.resume_key);
        } else if (hasUploaded) {
          setSelectedType("uploaded");
          setSelectedKey("");
        }
      } catch (err) {
        console.error("Failed to load student builder resumes", err);
        if (hasUploaded) {
          setSelectedType("uploaded");
        }
      } finally {
        setFetchingResumes(false);
      }
    };

    fetchResumes();
  }, [student, hasUploaded]);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!selectedType) return;
    onConfirm({
      resume_type: selectedType,
      resume_key: selectedType === "builder" ? selectedKey : "",
    });
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0, 0, 0, 0.6)", zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-primary text-white border-0 py-3 px-4">
            <div>
              <h6 className="modal-title fw-bold mb-0">Select Resume for Application</h6>
              <small className="text-white-75">Applying for <strong>{job?.title}</strong> at {job?.company}</small>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading}></button>
          </div>

          {/* Body */}
          <form onSubmit={handleApplySubmit}>
            <div className="modal-body p-4">
              <p className="text-muted small mb-3">
                Choose which resume version you want to submit to <strong>{job?.company}</strong>:
              </p>

              {fetchingResumes ? (
                <div className="text-center py-4">
                  <span className="spinner-border spinner-border-sm me-2 text-primary"></span>
                  Loading your available resumes...
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {/* Option 1: Uploaded PDF */}
                  {hasUploaded && (
                    <div
                      className={`card border ${selectedType === "uploaded" ? "border-primary bg-primary bg-opacity-10" : "border-light-subtle"} p-3 rounded-3 cursor-pointer`}
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                      onClick={() => { setSelectedType("uploaded"); setSelectedKey(""); }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <input
                            type="radio"
                            name="resumeSelect"
                            checked={selectedType === "uploaded"}
                            onChange={() => { setSelectedType("uploaded"); setSelectedKey(""); }}
                            className="form-check-input mt-0"
                          />
                          <div>
                            <span className="fw-semibold d-block small">
                              <i className="bi bi-file-earmark-pdf-fill text-danger me-1"></i>
                              Uploaded PDF Resume
                            </span>
                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                              File attached in your profile
                            </small>
                          </div>
                        </div>
                        {student?.resume_url && (
                          <a
                            href={student.resume_url.startsWith("http") ? student.resume_url : `http://localhost:8000${student.resume_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-xs btn-outline-secondary"
                            style={{ fontSize: "0.75rem" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="bi bi-eye me-1"></i>Preview
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Option 2: AI Builder Resumes */}
                  {builtResumes.map((res) => {
                    const isSelected = selectedType === "builder" && selectedKey === res.resume_key;
                    return (
                      <div
                        key={res.id || res.resume_key}
                        className={`card border ${isSelected ? "border-success bg-success bg-opacity-10" : "border-light-subtle"} p-3 rounded-3 cursor-pointer`}
                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                        onClick={() => { setSelectedType("builder"); setSelectedKey(res.resume_key); }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-3">
                            <input
                              type="radio"
                              name="resumeSelect"
                              checked={isSelected}
                              onChange={() => { setSelectedType("builder"); setSelectedKey(res.resume_key); }}
                              className="form-check-input mt-0"
                            />
                            <div>
                              <span className="fw-semibold d-block small">
                                <i className="bi bi-pencil-square text-success me-1"></i>
                                {res.title || "AI Built Resume"}
                                {res.is_default && (
                                  <span className="badge bg-success ms-2" style={{ fontSize: "0.65rem" }}>Default</span>
                                )}
                              </span>
                              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                Created in AI Resume Builder
                              </small>
                            </div>
                          </div>
                          <a
                            href={`http://localhost:8000/created-resume/${student?.student_id || student?.id}?key=${res.resume_key}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-xs btn-outline-success"
                            style={{ fontSize: "0.75rem" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="bi bi-eye me-1"></i>View Created
                          </a>
                        </div>
                      </div>
                    );
                  })}

                  {!hasUploaded && builtResumes.length === 0 && (
                    <div className="alert alert-warning small mb-0">
                      No resume found. Please create one in the AI Resume Builder or upload a PDF first.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 bg-light px-4 py-3 d-flex justify-content-between">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success btn-sm px-4 fw-semibold"
                disabled={loading || !selectedType || (selectedType === "builder" && !selectedKey)}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill me-1"></i>Confirm & Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
