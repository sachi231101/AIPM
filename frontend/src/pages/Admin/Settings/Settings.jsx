import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import PageHeader from "../../../components/PageHeader/PageHeader";

export default function Settings() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      instituteName: "Aadya Institute",
      email: "aadyainstitute2016@gmail.com",
      phone: "+91 99641 94324",
      address: "183, 2nd Floor, 1st Main Road, Opp. Old Police Station, Next to Uttam Sagar Hotel, Above Nilgiris, Ramamurthy Nagar, Bengaluru, Karnataka – 560016",
      website: "https://aadyainstitute.com",
      maxResumeSize: "5",
      applicationDeadlineBuffer: "2",
      emailNotifications: true,
      autoApproveCompanies: false,
    },
  });

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Settings saved successfully!");
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure system settings" breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Settings" }]} />

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
                  <img src="/logo.png" alt="Aadya Institute Logo" style={{ width: "120px", height: "72px", objectFit: "contain" }} />
                  <div>
                    <input type="file" className="form-control" accept="image/*" />
                    <small className="text-muted">PNG, JPG or SVG. Max 2MB. Recommended: 200×200px</small>
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
              <button type="button" className="btn btn-outline-secondary">Reset</button>
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
                { label: "Backend", value: "Laravel 11 (Pending)" },
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

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3 text-danger">Danger Zone</h6>
              <p className="text-muted small mb-3">These actions are irreversible. Proceed with caution.</p>
              <button className="btn btn-outline-danger btn-sm w-100 mb-2">
                <i className="bi bi-arrow-counterclockwise me-2"></i>Clear All Applications
              </button>
              <button className="btn btn-outline-danger btn-sm w-100">
                <i className="bi bi-trash me-2"></i>Reset System Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
