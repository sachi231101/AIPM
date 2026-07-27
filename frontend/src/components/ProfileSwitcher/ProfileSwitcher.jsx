import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { studentProfileService } from "../../services/api";
import { toast } from "react-toastify";
import AddProfileModal from "../AddProfileModal/AddProfileModal";

export default function ProfileSwitcher() {
  const { profilesList, activeProfile, switchProfile, fetchProfiles } = useProfile();
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!activeProfile || profilesList.length === 0) {
    return null;
  }

  const handleDuplicate = async (e, profileId) => {
    e.stopPropagation();
    try {
      setActionLoading(true);
      await studentProfileService.duplicate(profileId);
      toast.success("Profile duplicated successfully! 🎉");
      await fetchProfiles();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to duplicate profile.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDefault = async (e, profileId) => {
    e.stopPropagation();
    try {
      setActionLoading(true);
      await studentProfileService.setDefault(profileId);
      toast.success("Profile set as default!");
      await fetchProfiles();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to set default profile.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (e, profileId) => {
    e.stopPropagation();
    if (profilesList.length <= 1) {
      toast.error("Cannot delete the last remaining profile. At least one profile is required.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this career profile?")) return;

    try {
      setActionLoading(true);
      await studentProfileService.delete(profileId);
      toast.success("Profile deleted.");
      await fetchProfiles();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete profile.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div
        className="card border-0 shadow-sm mb-4 rounded-4"
        style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #0F4C81 100%)", color: "#fff" }}
      >
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <small className="text-white-50 text-uppercase fw-semibold d-block mb-1" style={{ letterSpacing: "0.08em", fontSize: "0.75rem" }}>
                Current Active Profile
              </small>

              {/* Workspace Dropdown Switcher */}
              <div className="dropdown d-inline-block">
                <button
                  className="btn btn-dark bg-white bg-opacity-10 text-white border border-white border-opacity-25 dropdown-toggle fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm"
                  type="button"
                  id="profileSwitcherDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ fontSize: "1rem" }}
                >
                  <i className="bi bi-briefcase-fill text-warning"></i>
                  <span>{activeProfile.profile_name}</span>
                  {activeProfile.is_default && (
                    <span className="badge bg-warning text-dark ms-1" style={{ fontSize: "0.65rem" }}>Default</span>
                  )}
                </button>

                <ul className="dropdown-menu shadow-lg border-0 rounded-3 mt-2 py-2" style={{ minWidth: 300, zIndex: 1050 }}>
                  <li className="px-3 py-1 small text-muted text-uppercase fw-bold" style={{ fontSize: "0.7rem" }}>
                    Select Career Profile
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>

                  {profilesList.map((p) => {
                    const isActive = p.id === activeProfile.id;
                    return (
                      <li key={p.id}>
                        <div
                          className={`dropdown-item py-2 px-3 d-flex align-items-center justify-content-between text-wrap cursor-pointer ${
                            isActive ? "bg-primary bg-opacity-10 text-primary fw-bold" : ""
                          }`}
                          onClick={() => switchProfile(p)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="d-flex align-items-center gap-2 me-2 overflow-hidden">
                            <i className={`bi ${isActive ? "bi-check-circle-fill text-primary" : "bi-circle text-muted"}`}></i>
                            <div>
                              <div className="text-dark small fw-semibold">{p.profile_name}</div>
                              <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                                {p.professional_title || p.target_role || "Career Profile"}
                              </small>
                            </div>
                          </div>

                          {/* Action icons */}
                          <div className="d-flex align-items-center gap-1">
                            {!p.is_default && (
                              <button
                                className="btn btn-link btn-sm text-muted p-0 text-decoration-none"
                                title="Set as Default"
                                onClick={(e) => handleSetDefault(e, p.id)}
                                disabled={actionLoading}
                              >
                                <i className="bi bi-star"></i>
                              </button>
                            )}
                            <button
                              className="btn btn-link btn-sm text-muted p-0 text-decoration-none"
                              title="Duplicate Profile"
                              onClick={(e) => handleDuplicate(e, p.id)}
                              disabled={actionLoading}
                            >
                              <i className="bi bi-files"></i>
                            </button>
                            {profilesList.length > 1 && (
                              <button
                                className="btn btn-link btn-sm text-danger p-0 text-decoration-none ms-1"
                                title="Delete Profile"
                                onClick={(e) => handleDelete(e, p.id)}
                                disabled={actionLoading}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}

                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button
                      className="dropdown-item py-2 px-3 text-primary fw-semibold small d-flex align-items-center gap-2"
                      onClick={() => setShowAddModal(true)}
                    >
                      <i className="bi bi-plus-circle-fill"></i> + Add Other Profile
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Action button right aligned */}
            <button
              className="btn btn-warning fw-bold d-flex align-items-center gap-2 shadow-sm text-dark px-3 py-2 rounded-3"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus-lg"></i> Add Other Profile
            </button>
          </div>
        </div>
      </div>

      {/* Add Profile Modal */}
      {showAddModal && <AddProfileModal onClose={() => setShowAddModal(false)} />}
    </>
  );
}
