import { useState } from "react";
import { companies } from "../../../utils/mockData";
import PageHeader from "../../../components/PageHeader/PageHeader";

export default function Companies() {
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Companies" subtitle="Manage recruiting companies" breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Companies" }]} />

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div className="input-group" style={{ maxWidth: 350 }}>
              <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
              <input className="form-control border-start-0" placeholder="Search companies or industry..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span className="badge bg-primary px-3 py-2">{filtered.length} Companies</span>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="py-3">Company</th>
                  <th className="py-3">Industry</th>
                  <th className="py-3">HR Contact</th>
                  <th className="py-3">Openings</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((company, i) => (
                  <tr key={company.id}>
                    <td className="px-4 text-muted">{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img src={company.logo} alt={company.name} width={40} height={40} className="rounded-2" />
                        <div>
                          <p className="fw-medium mb-0 small">{company.name}</p>
                          <small className="text-muted">{company.website}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge bg-info bg-opacity-10 text-info">{company.industry}</span></td>
                    <td>
                      <p className="small fw-medium mb-0">{company.hrName}</p>
                      <small className="text-muted">{company.hrEmail}</small>
                    </td>
                    <td><span className="fw-bold text-primary">{company.openings}</span></td>
                    <td><span className="badge bg-success bg-opacity-10 text-success">{company.status}</span></td>
                    <td className="text-end px-4">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedCompany(company)}>
                        <i className="bi bi-eye me-1"></i>View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Company Modal */}
      {selectedCompany && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 bg-primary text-white">
                <h6 className="modal-title fw-bold">Company Details</h6>
                <button className="btn-close btn-close-white" onClick={() => setSelectedCompany(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <img src={selectedCompany.logo} alt={selectedCompany.name} className="rounded-3 mb-3" width={72} height={72} />
                  <h5 className="fw-bold mb-1">{selectedCompany.name}</h5>
                  <span className="badge bg-info bg-opacity-10 text-info">{selectedCompany.industry}</span>
                </div>
                <div className="row g-3">
                  {[
                    { label: "HR Name", value: selectedCompany.hrName, icon: "bi-person" },
                    { label: "HR Email", value: selectedCompany.hrEmail, icon: "bi-envelope" },
                    { label: "Phone", value: selectedCompany.phone, icon: "bi-telephone" },
                    { label: "Website", value: selectedCompany.website, icon: "bi-globe" },
                    { label: "Openings", value: selectedCompany.openings, icon: "bi-door-open" },
                    { label: "Status", value: selectedCompany.status, icon: "bi-circle-fill" },
                  ].map((item, i) => (
                    <div key={i} className="col-6">
                      <small className="text-muted d-block"><i className={`bi ${item.icon} me-1`}></i>{item.label}</small>
                      <span className="fw-medium small">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={() => setSelectedCompany(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
