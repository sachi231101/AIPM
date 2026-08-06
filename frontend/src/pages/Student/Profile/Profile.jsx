import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { useProfile } from "../../../context/ProfileContext";
import PageHeader from "../../../components/PageHeader/PageHeader";
import ResumeUpload from "../../../components/ResumeUpload/ResumeUpload";
import ProfileSwitcher from "../../../components/ProfileSwitcher/ProfileSwitcher";
import { studentService, resumeService } from "../../../services/api";
import { normalizePhotoUrl, getOverallProfileScore } from "../../../utils/resumeStorage";

export default function Profile() {
  const { user, login } = useAuth();
  const { activeProfile, fetchProfiles } = useProfile();

  const [student, setStudent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [photoBase64, setPhotoBase64] = useState("");
  const [builderResumes, setBuilderResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  // Load profile data scoped to active profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const activeId = activeProfile?.id || localStorage.getItem("apms_active_profile_id");
      const [profileRes, resumesRes] = await Promise.all([
        studentService.getProfile(activeId ? { profile_id: activeId } : {}),
        resumeService.getAll(activeId ? { profile_id: activeId } : {}).catch(() => ({ data: { data: [] } })),
      ]);
      const current = profileRes.data.data;
      setStudent(current);
      setImgError(false);
      // Normalize the photo URL so /storage/... becomes a full URL
      setPhotoBase64(normalizePhotoUrl(current.profile_photo || current.profilePhoto || ""));
      setBuilderResumes(resumesRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, activeProfile?.id]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (student) {
      reset({
        name: student.name || "",
        email: student.email || "",
        phone: student.mobile || student.phone || "",
        dob: student.dob || "",
        gender: student.gender || "",
        address: student.address || "",
        institute: student.institute || "",
        profile_name: student.profile_name || activeProfile?.profile_name || "",
        professional_title: student.professional_title || activeProfile?.professional_title || "",
        target_role: student.target_role || activeProfile?.target_role || "",
        summary: student.summary || activeProfile?.summary || "",
        course: student.course || "",
        branch: student.branch || "",
        batch: student.batch || "",
        cgpa: student.cgpa || "",
        technicalSkills: Array.isArray(student.skills) ? student.skills.join(", ") : (student.skills || ""),
        softSkills: Array.isArray(student.soft_skills) ? student.soft_skills.join(", ") : (student.soft_skills || ""),
        linkedin: student.linkedin || "",
        github: student.github || "",
        portfolio: student.portfolio || "",
      });
    }
  }, [student, activeProfile, reset, editing]);

  if (loading || !student) {
    return <div className="text-center py-5" style={{ height: "400px" }}><span className="spinner-border spinner-border-sm me-2"></span>Loading profile...</div>;
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!editing) {
      toast.info("Please click 'Edit Career Profile' to change your photo.");
      return;
    }

    if (file.size > 1024 * 1024 * 5) {
      toast.error("Profile photo must be smaller than 5MB.");
      return;
    }

    // Show preview ONLY — do NOT upload to server yet
    setPendingPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImgError(false);
      setPhotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCancelEditing = () => {
    setEditing(false);
    setPendingPhotoFile(null);
    setImgError(false);
    setPhotoBase64(normalizePhotoUrl(student?.profile_photo || ""));
  };

  const handleUploadResumeFile = async (file) => {
    if (!file) return;
    try {
      setUploadingResume(true);
      const activeId = activeProfile?.id || localStorage.getItem("apms_active_profile_id");
      const formData = new FormData();
      formData.append("resume", file);
      if (activeId) formData.append("profile_id", activeId);

      await studentService.uploadResume(formData);
      toast.success(`PDF Resume uploaded for profile "${activeProfile?.profile_name || 'Current Profile'}"! 🎉`);
      fetchProfile();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload PDF resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const activeId = activeProfile?.id || localStorage.getItem("apms_active_profile_id");

      // Save pending photo first if user selected a new photo
      if (pendingPhotoFile) {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append("photo", pendingPhotoFile);
        const photoRes = await studentService.uploadProfilePhoto(formData);
        if (photoRes.data?.photo_url) {
          setImgError(false);
          setPhotoBase64(normalizePhotoUrl(photoRes.data.photo_url));
        }
        setPendingPhotoFile(null);
      }

      if (resumeFile) {
        await handleUploadResumeFile(resumeFile);
      }

      const skillsArray = data.technicalSkills.split(",").map((s) => s.trim()).filter(Boolean);
      const softSkillsArray = data.softSkills.split(",").map((s) => s.trim()).filter(Boolean);

      const profileData = {
        profile_id: activeId,
        email: data.email.trim(),
        dob: data.dob,
        gender: data.gender,
        address: data.address.trim(),
        profile_name: data.profile_name,
        professional_title: data.professional_title,
        target_role: data.target_role,
        summary: data.summary,
        course: data.course,
        branch: data.branch.trim(),
        batch: data.batch,
        passing_year: parseInt(data.batch) || 2026,
        cgpa: data.cgpa ? parseFloat(data.cgpa) : null,
        skills: skillsArray,
        soft_skills: softSkillsArray,
        linkedin: data.linkedin?.trim() ? (data.linkedin.trim().startsWith("http") ? data.linkedin.trim() : "https://" + data.linkedin.trim()) : null,
        github: data.github?.trim() ? (data.github.trim().startsWith("http") ? data.github.trim() : "https://" + data.github.trim()) : null,
        portfolio: data.portfolio?.trim() ? (data.portfolio.trim().startsWith("http") ? data.portfolio.trim() : "https://" + data.portfolio.trim()) : null,

      };

      const response = await studentService.updateProfile(profileData);
      const updatedUser = response.data.data;

      setStudent(updatedUser);
      if (updatedUser.profile_photo) {
        setPhotoBase64(normalizePhotoUrl(updatedUser.profile_photo));
      }
      login({ ...user, name: updatedUser.name, email: updatedUser.email }, user.role, localStorage.getItem("apms_token"));
      fetchProfiles();

      setEditing(false);
      setResumeFile(null);
      toast.success("Profile updated successfully! 🎉");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const profileCompletion = getOverallProfileScore(student, activeProfile?.id);
  const hasUploadedResume = !!(student.resume_url || student.resumeUrl || student.resume_path);
  const hasCreatedResume = builderResumes.length > 0 || !!(student.has_created_resume);
  const resumeUrl = student.resume_url ? student.resume_url : (student.resumeUrl ? student.resumeUrl : "#");
  const createdResumeUrl = student.created_resume_url || `/created-resume/${student.student_id || student.id}?profile_id=${activeProfile?.id}`;

  return (
    <div className="container-lg">
      <PageHeader
        title="My Profile & Career Portfolios"
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Profile" }]}
        action={
          <Link to="/student/resume-builder" className="btn btn-warning btn-sm fw-bold d-flex align-items-center gap-2 text-dark shadow-sm">
            <i className="bi bi-file-earmark-person"></i> Open Resume Builder
          </Link>
        }
      />

      {/* ── PROFILE SWITCHER (Top Workspace Header) ── */}
      <ProfileSwitcher />

      {/* Profile Completion Bar */}
      <div className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold small text-dark">
              Profile Completion ({activeProfile?.profile_name}): <span className="text-primary fw-bold">{profileCompletion}%</span>
            </span>
            <span className={`badge ${profileCompletion >= 80 ? "bg-success bg-opacity-10 text-success" : "bg-warning bg-opacity-10 text-warning"} px-3 py-1 fw-semibold`}>
              {profileCompletion >= 80 ? "Eligible to Apply (Score >= 80%) 🎉" : "Action Required: Reaching 80% Score Required to Apply"}
            </span>
          </div>
          <div className="progress rounded-pill" style={{ height: "10px" }}>
            <div
              className={`progress-bar progress-bar-striped progress-bar-animated ${
                profileCompletion >= 80 ? "bg-success" : profileCompletion >= 50 ? "bg-primary" : "bg-warning"
              }`}
              role="progressbar"
              style={{ width: `${profileCompletion}%` }}
              aria-valuenow={profileCompletion}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Sidebar Photo & Identity */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 text-center p-4">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <div
                className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: 120, height: 120, background: "#e9ecef" }}
              >
                {/* Always show photo or initial — never replace with spinner */}
                {photoBase64 && !imgError ? (
                  <img
                    src={photoBase64}
                    alt={student.name}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="fs-1 fw-bold text-primary">{student.name?.charAt(0) || "S"}</span>
                )}
              </div>
              {/* Camera button — only visible and allowed when editing */}
              {editing && (
                <label
                  htmlFor="photoUploadInput"
                  className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow"
                  style={{ width: 36, height: 36, cursor: "pointer" }}
                  title="Choose New Photo"
                >
                  <i className="bi bi-camera-fill"></i>
                  <input
                    id="photoUploadInput"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>
            {/* Hint below photo */}
            {editing ? (
              <p className="text-primary small mb-2" style={{ fontSize: "0.72rem" }}>
                <i className="bi bi-camera me-1"></i>Click camera icon to change photo preview
              </p>
            ) : (
              <p className="text-muted small mb-2" style={{ fontSize: "0.72rem" }}>
                Click "Edit Career Profile" to change details or photo
              </p>
            )}

            <h5 className="fw-bold mb-1 text-dark">{student.name}</h5>
            <p className="text-primary fw-semibold small mb-1">{student.professional_title || activeProfile?.professional_title || "Software Engineer"}</p>
            <p className="text-muted small mb-3">{student.course || activeProfile?.course} - {student.branch || activeProfile?.branch} ({student.batch || activeProfile?.batch})</p>

            <div className="p-3 bg-light rounded-3 text-start small mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Mobile:</span>
                <span className="fw-medium text-dark">{student.mobile || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Email:</span>
                <span className="fw-medium text-dark ms-2 text-truncate">{student.email || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Approval Status:</span>
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                  Approved
                </span>
              </div>
            </div>

            {!editing ? (
              <button className="btn btn-outline-primary w-100 fw-semibold rounded-3" onClick={() => setEditing(true)}>
                <i className="bi bi-pencil-square me-2"></i>Edit Career Profile
              </button>
            ) : (
              <button className="btn btn-secondary w-100 fw-semibold rounded-3" onClick={handleCancelEditing}>
                Cancel Editing
              </button>
            )}
          </div>
        </div>

        {/* Main Details Form / Display */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-person-vcard text-primary"></i> Active Profile Details ({activeProfile?.profile_name})
              </h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Profile Header Info */}
                <h6 className="fw-bold text-muted small text-uppercase mb-3" style={{ letterSpacing: "0.05em" }}>
                  1. Career Profile Metadata
                </h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Profile Name</label>
                    <input
                      type="text"
                      disabled={!editing}
                      {...register("profile_name")}
                      className="form-control"
                      placeholder="e.g. Java Full Stack Developer"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Professional Title</label>
                    <input
                      type="text"
                      disabled={!editing}
                      {...register("professional_title")}
                      className="form-control"
                      placeholder="e.g. Java Developer"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Target Job Role</label>
                    <input
                      type="text"
                      disabled={!editing}
                      {...register("target_role")}
                      className="form-control"
                      placeholder="e.g. Backend Engineer"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-medium">Profile Summary / Objective</label>
                    <textarea
                      rows={2}
                      disabled={!editing}
                      {...register("summary")}
                      className="form-control"
                      placeholder="Short professional summary tailored for this role..."
                    ></textarea>
                  </div>
                </div>

                {/* Personal Info */}
                <h6 className="fw-bold text-muted small text-uppercase mb-3" style={{ letterSpacing: "0.05em" }}>
                  2. Personal Identity Details (Shared)
                </h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Full Name</label>
                    <input type="text" disabled className="form-control bg-light" value={student.name || ""} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Mobile Number (OTP Login)</label>
                    <input type="text" disabled className="form-control bg-light" value={student.mobile || ""} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Email Address</label>
                    <input
                      type="email"
                      disabled={!editing}
                      {...register("email", { required: "Email is required" })}
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Date of Birth</label>
                    <input
                      type="date"
                      disabled={!editing}
                      {...register("dob")}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Gender</label>
                    <select disabled={!editing} {...register("gender")} className="form-select">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Address</label>
                    <input
                      type="text"
                      disabled={!editing}
                      {...register("address")}
                      className="form-control"
                      placeholder="City, State"
                    />
                  </div>
                </div>



                {/* ── 4. RESUMES SECTION FOR THIS PROFILE ── */}
                <h6 className="fw-bold text-muted small text-uppercase mb-3 d-flex align-items-center justify-content-between" style={{ letterSpacing: "0.05em" }}>
                  <span>3. Resume Documents ({activeProfile?.profile_name})</span>
                  <Link to="/student/resume-builder" className="btn btn-xs btn-outline-warning text-dark fw-bold" style={{ fontSize: "0.75rem" }}>
                    <i className="bi bi-pencil-square me-1"></i>Open Resume Builder
                  </Link>
                </h6>

                <div className="mb-4 p-2.5 p-sm-4 bg-light rounded-4 border">
                  {/* Uploaded PDF Resume Box */}
                  {hasUploadedResume ? (
                    <div className="p-2.5 p-sm-3 bg-white rounded-3 border shadow-sm mb-3">
                      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle bg-danger bg-opacity-10 text-danger p-2.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44 }}>
                            <i className="bi bi-file-earmark-pdf-fill fs-4"></i>
                          </div>
                          <div>
                            <span className="fw-bold text-dark d-block">Uploaded PDF Resume</span>
                            <small className="text-muted">Direct PDF attached to profile <strong>{activeProfile?.profile_name}</strong></small>
                          </div>
                        </div>
                        <div className="d-flex gap-2 w-100 w-sm-auto justify-content-end">
                          <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary fw-semibold flex-grow-1 flex-sm-grow-0 text-nowrap">
                            <i className="bi bi-eye me-1"></i>View PDF
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Built Resume Status Box */}
                  <div className="p-2.5 p-sm-3 bg-white rounded-3 border shadow-sm mb-3">
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className={`rounded-circle ${hasCreatedResume ? "bg-success bg-opacity-10 text-success" : "bg-warning bg-opacity-10 text-dark"} p-2.5 d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: 44, height: 44 }}>
                          <i className={`bi ${hasCreatedResume ? "bi-check-circle-fill text-success fs-4" : "bi-magic fs-4 text-warning"}`}></i>
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold text-dark">Master Resume</span>
                            {hasCreatedResume && (
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5">
                                ✓ Created & Active
                              </span>
                            )}
                          </div>
                          <small className="text-muted">
                            {hasCreatedResume
                              ? `Master Resume generated & ready for ${activeProfile?.profile_name || 'this profile'}`
                              : `Create a professional ATS resume tailored for ${activeProfile?.profile_name || 'this profile'}`}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex gap-2 w-100 w-sm-auto flex-wrap flex-sm-nowrap mt-2 mt-sm-0">
                        {hasCreatedResume && (
                          <a href={createdResumeUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-success fw-semibold flex-grow-1 flex-sm-grow-0 text-nowrap">
                            <i className="bi bi-eye me-1"></i>View Master Resume
                          </a>
                        )}
                        <Link to="/student/resume-builder" className="btn btn-sm btn-warning text-dark fw-bold flex-grow-1 flex-sm-grow-0 text-nowrap">
                          <i className="bi bi-pencil-square me-1"></i>{hasCreatedResume ? "Edit Master Resume" : "Build Resume Now"}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Direct PDF Upload component */}
                  <div className="mt-3">
                    <label className="form-label small fw-bold text-muted">Upload New PDF Resume for this Profile</label>
                    <ResumeUpload onFileSelect={handleUploadResumeFile} loading={uploadingResume} />
                  </div>
                </div>

                {/* Social & Portfolio Links */}
                <h6 className="fw-bold text-muted small text-uppercase mb-3" style={{ letterSpacing: "0.05em" }}>
                  5. Portfolio & Social Links ({activeProfile?.profile_name})
                </h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">LinkedIn Profile</label>
                    <input
                      type="text"
                      disabled={!editing}
                      {...register("linkedin")}
                      className="form-control"
                      placeholder="https://linkedin.com/in/..."
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && !v.startsWith("http")) e.target.value = "https://" + v;
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">GitHub Profile</label>
                    <input
                      type="text"
                      disabled={!editing}
                      {...register("github")}
                      className="form-control"
                      placeholder="https://github.com/..."
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && !v.startsWith("http")) e.target.value = "https://" + v;
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Portfolio Website</label>
                    <input
                      type="text"
                      disabled={!editing}
                      {...register("portfolio")}
                      className="form-control"
                      placeholder="https://myportfolio.dev"
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && !v.startsWith("http")) e.target.value = "https://" + v;
                      }}
                    />
                  </div>
                </div>

                {editing && (
                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary fw-semibold px-4" disabled={isSubmitting}>
                      {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving Changes...</> : <><i className="bi bi-check-lg me-1"></i>Save Profile Changes</>}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
