import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { jobs, institutes } from "../../../utils/mockData";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { toast } from "react-toastify";

const statusColors = { Published: "success", Approved: "primary", Pending: "warning", Rejected: "danger", Closed: "secondary" };

export default function AdminJobDetails() {
  const { id } = useParams();
  const job = jobs.find((j) => j.id === parseInt(id));
  const eligibleInstList = institutes.filter(i => i.name !== "Other");
  const [selected, setSelected] = useState(job?.eligibleInstitutes || []);

  if (!job) return (
    <div className="text-center py-5">
      <p className="text-muted">Job not found</p>
      <Link to="/admin/jobs" className="btn btn-primary">Back to Jobs</Link>
    </div>
  );

  const toggleInstitute = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = () => toast.success("Eligible institutes updated successfully!");

  return (
    <div>
      <PageHeader
        title={job.title}
        subtitle={job.company}
        breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Jobs", to: "/admin/jobs" }, { label: job.title }]}
      />

      <div className="row g-4">
        {/* Main Info */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-start gap-4 mb-4">
                <img src={job.companyLogo} alt={job.company} width={72} height={72} className="rounded-3" />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div>
                      <h4 className="fw-bold mb-1">{job.title}</h4>
                      <p className="text-primary fw-semibold mb-0">{job.company}</p>
                    </div>
                    <span className={`badge bg-${statusColors[job.status]} px-3 py-2`}>{job.status}</span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="row g-3 mb-4">
                {[
                  { icon: "bi-geo-alt", label: "Location", value: job.location, color: "primary" },
                  { icon: "bi-currency-rupee", label: "Salary", value: job.salary, color: "success" },
                  { icon: "bi-briefcase", label: "Experience", value: job.experience, color: "info" },
                  { icon: "bi-people", label: "Openings", value: `${job.openings} Positions`, color: "warning" },
                  { icon: "bi-calendar-event", label: "Posted", value: new Date(job.postedDate).toLocaleDateString("en-IN"), color: "secondary" },
                  { icon: "bi-calendar-x", label: "Last Date", value: new Date(job.lastDate).toLocaleDateString("en-IN"), color: "danger" },
                ].map((item, i) => (
                  <div key={i} className="col-6 col-md-4">
                    <div className="p-3 rounded-3 bg-light">
                      <small className="text-muted d-block mb-1"><i className={`bi ${item.icon} me-1 text-${item.color}`}></i>{item.label}</small>
                      <span className="fw-semibold small">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <h6 className="fw-bold mb-2">Description</h6>
              <p className="text-muted mb-4">{job.description}</p>

              <h6 className="fw-bold mb-2">Eligibility</h6>
              <p className="text-muted mb-4">{job.eligibility}</p>

              <h6 className="fw-bold mb-2">Skills Required</h6>
              <div className="d-flex flex-wrap gap-2">
                {job.skills.map((s, i) => (
                  <span key={i} className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Eligible Institutes */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: "80px" }}>
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h6 className="fw-bold mb-0"><i className="bi bi-bank2 me-2 text-primary"></i>Eligible Institutes</h6>
              <small className="text-muted">Select which institutes can apply</small>
            </div>
            <div className="card-body px-4 pb-4 pt-3">
              <div className="d-flex flex-column gap-2 mb-4">
                {eligibleInstList.map(inst => (
                  <div key={inst.id} className="form-check d-flex align-items-center gap-2 p-3 rounded-3 border" style={{ background: selected.includes(inst.id) ? "#e3f0ff" : "#fff" }}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`inst-${inst.id}`}
                      checked={selected.includes(inst.id)}
                      onChange={() => toggleInstitute(inst.id)}
                    />
                    <label className="form-check-label small fw-medium" htmlFor={`inst-${inst.id}`}>
                      <i className="bi bi-bank2 me-2 text-muted"></i>{inst.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={() => setSelected(eligibleInstList.map(i => i.id))}>Select All</button>
                <button className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={() => setSelected([])}>Clear All</button>
              </div>
              <button className="btn btn-primary w-100 mt-3" onClick={handleSave}>
                <i className="bi bi-floppy me-2"></i>Save Eligible Institutes
              </button>
              <small className="text-muted d-block text-center mt-2">{selected.length} of {eligibleInstList.length} selected</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
