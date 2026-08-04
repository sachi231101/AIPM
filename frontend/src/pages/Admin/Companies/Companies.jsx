import { useState, useEffect } from "react";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { companyService } from "../../../services/api";
import { useCachedData, clearCache } from "../../../hooks/useCachedData";
import { getCompanyLogo, handleLogoError } from "../../../utils/logoHelper";
import { toast } from "react-toastify";

export default function Companies() {
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ company_name: "", hr_email: "", message: "" });
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

  const companyLoginUrl = `${window.location.origin}/company`;

  // Force fresh fetch every time this page mounts (clear stale cache)
  useEffect(() => {
    clearCache("admin_companies");
  }, []);

  const { data: rawCompaniesResponse, loading } = useCachedData(
    "admin_companies",
    companyService.getAll
  );

  const rawList = rawCompaniesResponse?.data || [];
  const companiesList = rawList.map((c) => ({
    id: c.id,
    name: c.name,
    logo: c.logo || getCompanyLogo(c.logo_path, c.name),
    website: c.website || "N/A",
    industry: c.industry || "Technology",
    hrName: c.hrName || c.hr_name || "N/A",
    hrEmail: c.hrEmail || c.hr_email || "N/A",
    phone: c.phone || "N/A",
    openings: c.openings || 0,
    status: "Active",
  }));

  const filtered = companiesList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const copyLoginLink = (companyName = "") => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(companyLoginUrl)
        .then(() => {
          toast.success(companyName ? `Company login link copied for ${companyName}! 📋` : "Company login link copied to clipboard! 📋");
        })
        .catch(() => fallbackCopy(companyLoginUrl, companyName));
    } else {
      fallbackCopy(companyLoginUrl, companyName);
    }
  };

  const fallbackCopy = (text, companyName = "") => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(companyName ? `Company login link copied for ${companyName}! 📋` : "Company login link copied to clipboard! 📋");
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.hr_email) {
      toast.error("Please enter HR Email address.");
      return;
    }
    setInviteSubmitting(true);
    try {
      if (companyService.inviteCompany) {
        await companyService.inviteCompany(inviteForm);
      }
      copyLoginLink(inviteForm.company_name || inviteForm.hr_email);
      toast.success(`Invitation generated & link copied for ${inviteForm.hr_email}! 🚀`);
      setShowInviteModal(false);
      setInviteForm({ company_name: "", hr_email: "", message: "" });
    } catch (err) {
      // Fallback copy even if server call fails
      copyLoginLink(inviteForm.company_name || inviteForm.hr_email);
      toast.success(`Login link copied to clipboard! 🚀`);
      setShowInviteModal(false);
      setInviteForm({ company_name: "", hr_email: "", message: "" });
    } finally {
      setInviteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5" style={{ height: "400px" }}>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading recruiters list...
      </div>
    );
  }

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
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary px-3 py-2">{filtered.length} Companies</span>
              <button className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm" onClick={() => setShowInviteModal(true)}>
                <i className="bi bi-send-fill"></i> Invite Company
              </button>
            </div>
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
                {filtered.length > 0 ? (
                  filtered.map((company, i) => (
                    <tr key={company.id}>
                      <td className="px-4 text-muted">{i + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={company.logo}
                            alt={company.name}
                            width={40}
                            height={40}
                            className="rounded-2"
                            style={{ objectFit: "cover" }}
                            onError={(e) => handleLogoError(e, company.name)}
                          />
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
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedCompany(company)}>
                            <i className="bi bi-eye me-1"></i>View Details
                          </button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => copyLoginLink(company.name)} title="Copy Company Login Link">
                            <i className="bi bi-link-45deg me-1"></i>Copy Link
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted small">No companies registered yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite Company Modal */}
      {showInviteModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 bg-primary text-white">
                <h6 className="modal-title fw-bold">
                  <i className="bi bi-send me-2"></i>Invite Company
                </h6>
                <button className="btn-close btn-close-white" onClick={() => setShowInviteModal(false)}></button>
              </div>
              <form onSubmit={handleSendInvite}>
                <div className="modal-body p-4">
                  <p className="text-muted small mb-3">
                    Invite a recruiter or company to join the placement portal. Copying the login link will copy the portal access link to your clipboard.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Company Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Acme Corp"
                      value={inviteForm.company_name}
                      onChange={(e) => setInviteForm({ ...inviteForm, company_name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">HR / Contact Email <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      required
                      className="form-control form-control-sm"
                      placeholder="hr@acme.com"
                      value={inviteForm.hr_email}
                      onChange={(e) => setInviteForm({ ...inviteForm, hr_email: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Personalized Note (Optional)</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      placeholder="Add a message for the company recruiter..."
                      value={inviteForm.message}
                      onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-muted">Company Login Link</label>
                    <div className="input-group input-group-sm">
                      <input type="text" className="form-control bg-light" value={companyLoginUrl} readOnly />
                      <button type="button" className="btn btn-outline-primary" onClick={() => copyLoginLink()}>
                        <i className="bi bi-clipboard me-1"></i>Copy Link
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowInviteModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-outline-primary btn-sm me-2" onClick={() => copyLoginLink(inviteForm.company_name || inviteForm.hr_email)}>
                    <i className="bi bi-link-45deg me-1"></i>Copy Login Link
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={inviteSubmitting}>
                    {inviteSubmitting ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-send me-1"></i>}
                    Send Invite & Copy Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                  <img
                    src={selectedCompany.logo}
                    alt={selectedCompany.name}
                    className="rounded-3 mb-3"
                    width={72}
                    height={72}
                    style={{ objectFit: "cover" }}
                    onError={(e) => handleLogoError(e, selectedCompany.name)}
                  />
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
                <button className="btn btn-outline-primary me-auto btn-sm" onClick={() => copyLoginLink(selectedCompany.name)}>
                  <i className="bi bi-link-45deg me-1"></i>Copy Login Link
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedCompany(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

