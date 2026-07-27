import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { settingsService, subadminService } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";
import { useCachedData } from "../../../hooks/useCachedData";

export default function Settings() {
  const { role } = useAuth();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState("system");
  const [showModal, setShowModal] = useState(false);
  const [savingSubadmin, setSavingSubadmin] = useState(false);
  const [subadminForm, setSubadminForm] = useState({
    name: "",
    email: "",
    password: "",
    permissions: {
      students: false,
      jobs: false,
      institutes: false,
      settings: false,
    }
  });

  // Use caching hook for settings
  const { data: rawSettingsResponse, loading, refresh: refreshSettings } = useCachedData(
    "admin_settings",
    settingsService.get
  );

  useEffect(() => {
    if (rawSettingsResponse?.data) {
      reset(rawSettingsResponse.data);
      setLogoUrl(rawSettingsResponse.data.instituteLogo || "/logo.png");
    }
  }, [rawSettingsResponse, reset]);

  // Use caching hook for sub-admins
  const { data: rawSubadminsResponse, loading: loadingSubadmins, refresh: refreshSubadmins, setData: setSubadminsData } = useCachedData(
    "admin_subadmins",
    () => activeTab === "subadmins" && role === "admin" ? subadminService.list() : Promise.resolve({ data: [] }),
    [activeTab, role]
  );

  const subadmins = Array.isArray(rawSubadminsResponse) ? rawSubadminsResponse : (rawSubadminsResponse?.data || []);

  const setSubadmins = (val) => {
    if (typeof val === "function") {
      setSubadminsData((prev) => {
        const prevArray = Array.isArray(prev) ? prev : (prev?.data || []);
        return val(prevArray);
      });
    } else {
      setSubadminsData(val);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      setUploadingLogo(true);
      const res = await settingsService.uploadLogo(formData);
      const newLogoUrl = res.data.logo_url.startsWith("http")
        ? res.data.logo_url
        : `http://${window.location.hostname}:8000${res.data.logo_url}`;
      setLogoUrl(newLogoUrl);
      toast.success("Institute logo updated successfully! 🎉");
      refreshSettings();
    } catch (err) {
      console.error("Failed to upload logo", err);
      toast.error(err.response?.data?.message || "Failed to upload institute logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await settingsService.update(data);
      toast.success("Settings saved successfully!");
      refreshSettings();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save settings.");
    }
  };

  // Subadmin Handlers
  const handleTogglePermission = async (subadmin, permissionKey) => {
    const updatedPermissions = {
      ...subadmin.permissions,
      [permissionKey]: !subadmin.permissions[permissionKey]
    };

    try {
      await subadminService.update(subadmin.id, {
        name: subadmin.name,
        email: subadmin.email,
        permissions: updatedPermissions
      });
      setSubadmins(prev =>
        prev.map(s => (s.id === subadmin.id ? { ...s, permissions: updatedPermissions } : s))
      );
      toast.success(`Updated permission successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update sub-admin permission.");
    }
  };

  const handleDeleteSubadmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sub-admin? This action cannot be undone.")) return;

    try {
      await subadminService.delete(id);
      setSubadmins(prev => prev.filter(s => s.id !== id));
      toast.success("Sub-admin account deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete sub-admin.");
    }
  };

  const [editingSubadmin, setEditingSubadmin] = useState(null);

  const openCreateModal = () => {
    setEditingSubadmin(null);
    setSubadminForm({
      name: "",
      email: "",
      password: "",
      permissions: { students: false, jobs: false, institutes: false, settings: false }
    });
    setShowModal(true);
  };

  const openEditModal = (subadmin) => {
    setEditingSubadmin(subadmin);
    setSubadminForm({
      name: subadmin.name,
      email: subadmin.email,
      password: "",
      permissions: {
        students: !!subadmin.permissions?.students,
        jobs: !!subadmin.permissions?.jobs,
        institutes: !!subadmin.permissions?.institutes,
        settings: !!subadmin.permissions?.settings,
      }
    });
    setShowModal(true);
  };

  const handleSubmitSubadmin = async (e) => {
    e.preventDefault();
    try {
      setSavingSubadmin(true);
      if (editingSubadmin) {
        const payload = {
          name: subadminForm.name,
          email: subadminForm.email,
          permissions: subadminForm.permissions,
        };
        if (subadminForm.password) {
          payload.password = subadminForm.password;
        }
        await subadminService.update(editingSubadmin.id, payload);
        toast.success("Sub-admin updated successfully! 🎉");
      } else {
        await subadminService.create(subadminForm);
        toast.success("Sub-admin created successfully! 🎉");
      }
      setShowModal(false);
      setEditingSubadmin(null);
      setSubadminForm({
        name: "",
        email: "",
        password: "",
        permissions: { students: false, jobs: false, institutes: false, settings: false }
      });
      refreshSubadmins();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || `Failed to ${editingSubadmin ? 'update' : 'create'} sub-admin.`);
    } finally {
      setSavingSubadmin(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5" style={{ height: "400px" }}>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading system configuration...
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure system settings" breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Settings" }]} />

      {/* Tabs Menu */}
      {role === "admin" && (
        <ul className="nav nav-pills mb-4 bg-white p-2 rounded shadow-sm gap-2">
          <li className="nav-item">
            <button className={`nav-link fw-semibold ${activeTab === "system" ? "active btn-primary" : "text-secondary bg-transparent border-0"}`} onClick={() => setActiveTab("system")}>
              <i className="bi bi-gear-fill me-2"></i>System Settings
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link fw-semibold ${activeTab === "subadmins" ? "active btn-primary" : "text-secondary bg-transparent border-0"}`} onClick={() => setActiveTab("subadmins")}>
              <i className="bi bi-people-fill me-2"></i>Sub-admin Management
            </button>
          </li>
        </ul>
      )}

      {activeTab === "system" ? (
        <div className="row g-4">
          <div className="col-lg-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Institute Info */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-bank2 text-primary fs-5"></i>
                    <h6 className="fw-bold mb-0">Institute Information</h6>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-medium">Institute Name</label>
                      <input {...register("instituteName")} className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Contact Email</label>
                      <input type="email" {...register("email")} className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Phone Number</label>
                      <input {...register("phone")} className="form-control" />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium">Address</label>
                      <textarea {...register("address")} className="form-control" rows={2} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Website</label>
                      <input {...register("website")} className="form-control" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-image text-primary fs-5"></i>
                    <h6 className="fw-bold mb-0">Institute Logo</h6>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-4">
                    <img src={logoUrl} alt="Aadya Institute Logo" style={{ width: "120px", height: "72px", objectFit: "contain" }} />
                    <div>
                      <input type="file" className="form-control" accept="image/*" onChange={handleLogoChange} disabled={uploadingLogo} />
                      {uploadingLogo ? (
                        <small className="text-primary fw-medium"><span className="spinner-border spinner-border-sm me-1" style={{ width: "12px", height: "12px" }}></span>Uploading logo...</small>
                      ) : (
                        <small className="text-muted">PNG, JPG or SVG. Max 2MB. Recommended: 200×200px</small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-sliders text-primary fs-5"></i>
                    <h6 className="fw-bold mb-0">System Preferences</h6>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Max Resume File Size (MB)</label>
                      <select {...register("maxResumeSize")} className="form-select">
                        <option value="2">2 MB</option>
                        <option value="5">5 MB</option>
                        <option value="10">10 MB</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Application Deadline Buffer (Days)</label>
                      <input type="number" {...register("applicationDeadlineBuffer")} className="form-control" />
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch mb-3">
                        <input type="checkbox" className="form-check-input" role="switch" id="emailNotifications" {...register("emailNotifications")} />
                        <label className="form-check-label small fw-medium" htmlFor="emailNotifications">
                          Enable Email Notifications
                          <small className="text-muted d-block">Send email alerts to students and companies</small>
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input type="checkbox" className="form-check-input" role="switch" id="autoApprove" {...register("autoApproveCompanies")} />
                        <label className="form-check-label small fw-medium" htmlFor="autoApprove">
                          Auto-approve Company Submissions
                          <small className="text-muted d-block">Skip manual review for registered companies</small>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-3">
                <button type="submit" className="btn btn-primary px-5 fw-semibold" disabled={isSubmitting}>
                  {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-floppy me-2"></i>Save Settings</>}
                </button>
              </div>
            </form>
          </div>

          {/* System Info sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">System Information</h6>
                {[
                  { label: "Version", value: "v1.0.0" },
                  { label: "Environment", value: "Development" },
                  { label: "Backend", value: "Laravel 11" },
                  { label: "Database", value: "MySQL" },
                  { label: "Last Backup", value: "N/A" },
                ].map((item, i) => (
                  <div key={i} className="d-flex justify-content-between py-2 border-bottom small">
                    <span className="text-muted">{item.label}</span>
                    <span className="fw-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4 pb-0 px-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-shield-lock-fill text-primary fs-5"></i>
              <h6 className="fw-bold mb-0">Sub-admin Accounts</h6>
            </div>
            <button className="btn btn-primary btn-sm fw-semibold" onClick={openCreateModal}>
              <i className="bi bi-plus-circle me-1"></i>Create Sub-admin
            </button>
          </div>
          <div className="card-body p-4">
            {loadingSubadmins ? (
              <div className="text-center py-5">
                <span className="spinner-border spinner-border-sm me-2"></span>
                Fetching sub-admins...
              </div>
            ) : subadmins.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-people fs-1 d-block mb-2 text-secondary"></i>
                No sub-admins found. Create one to delegate access!
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle border-top">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th className="text-center">Students Access</th>
                      <th className="text-center">Jobs Access</th>
                      <th className="text-center">Settings Access</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subadmins.map((subadmin) => (
                      <tr key={subadmin.id}>
                        <td>
                          <div className="fw-semibold">{subadmin.name}</div>
                        </td>
                        <td>{subadmin.email}</td>
                        <td className="text-center">
                          <input type="checkbox" className="form-check-input" checked={!!subadmin.permissions?.students} onChange={() => handleTogglePermission(subadmin, "students")} />
                        </td>
                        <td className="text-center">
                          <input type="checkbox" className="form-check-input" checked={!!subadmin.permissions?.jobs} onChange={() => handleTogglePermission(subadmin, "jobs")} />
                        </td>
                        <td className="text-center">
                          <input type="checkbox" className="form-check-input" checked={!!subadmin.permissions?.settings} onChange={() => handleTogglePermission(subadmin, "settings")} />
                        </td>
                        <td className="text-end">
                          <button className="btn btn-outline-primary btn-sm border-0 me-2" onClick={() => openEditModal(subadmin)} title="Edit Subadmin">
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button className="btn btn-outline-danger btn-sm border-0" onClick={() => handleDeleteSubadmin(subadmin.id)} title="Delete Subadmin">
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Inline modal / Modal Backdrop */}
          {showModal && (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                  <div className="modal-header border-bottom-0 pt-4 px-4">
                    <h6 className="modal-title fw-bold">{editingSubadmin ? "Edit Sub-admin Account" : "Create Sub-admin Account"}</h6>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                  </div>
                  <form onSubmit={handleSubmitSubadmin}>
                    <div className="modal-body px-4 py-3">
                      <div className="mb-3">
                        <label className="form-label small fw-medium">Name</label>
                        <input type="text" required className="form-control" value={subadminForm.name} onChange={(e) => setSubadminForm({ ...subadminForm, name: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-medium">Email Address</label>
                        <input type="email" required className="form-control" value={subadminForm.email} onChange={(e) => setSubadminForm({ ...subadminForm, email: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-medium">Password</label>
                        <input type="password" required={!editingSubadmin} className="form-control" minLength={6} placeholder={editingSubadmin ? "Leave blank to keep current" : ""} value={subadminForm.password} onChange={(e) => setSubadminForm({ ...subadminForm, password: e.target.value })} />
                      </div>

                      <div className="mb-2 small fw-bold text-secondary">Initial Permission Levels</div>
                      <div className="row g-2">
                        {["students", "jobs", "settings"].map((key) => (
                          <div key={key} className="col-6">
                            <div className="form-check form-switch card p-2 border-0 bg-light flex-row align-items-center justify-content-between">
                              <label className="form-check-label small fw-medium text-capitalize mb-0" htmlFor={`switch-${key}`}>{key}</label>
                              <input type="checkbox" className="form-check-input" role="switch" id={`switch-${key}`} checked={subadminForm.permissions[key]} onChange={(e) => setSubadminForm({
                                ...subadminForm,
                                permissions: { ...subadminForm.permissions, [key]: e.target.checked }
                              })} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="modal-footer border-top-0 pb-4 px-4">
                      <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={savingSubadmin}>
                        {savingSubadmin ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                        {editingSubadmin ? "Save Changes" : "Create Account"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
