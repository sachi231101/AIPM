import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { getStudents, updateStudentProfile } from "../../../utils/studentStorage";
import PageHeader from "../../../components/PageHeader/PageHeader";
import ResumeUpload from "../../../components/ResumeUpload/ResumeUpload";
import { studentService, resumeService } from "../../../services/api";

export default function Profile() {
  const { user, login } = useAuth();
  const [student, setStudent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [photoBase64, setPhotoBase64] = useState("");
  const [builderResumes, setBuilderResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [imgError, setImgError] = useState(false);

  // Load latest student data from backend API
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, resumesRes] = await Promise.all([
        studentService.getProfile(),
        resumeService.getAll().catch(() => ({ data: { data: [] } })),
      ]);
      const current = profileRes.data.data;
      setStudent(current);
      setImgError(false);
      setPhotoBase64(current.profile_photo || current.profilePhoto || "");
      setBuilderResumes(resumesRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load profile from database, using fallback", err);
      // Fallback
      const allStudents = getStudents();
      const current = allStudents.find((s) => s.id === user?.id) || user;
      setStudent(current);
      setPhotoBase64(current.profilePhoto || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  // Reset form values when student data is loaded or editing state changes
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
        course: student.course || "",
        branch: student.branch || "",
        batch: student.batch || "",
        cgpa: student.cgpa || "",
        technicalSkills: student.technicalSkills || student.skills?.join(", ") || "",
        softSkills: student.soft_skills?.join(", ") || (Array.isArray(student.softSkills) ? student.softSkills.join(", ") : student.softSkills) || "",
        linkedin: student.linkedin || "",
        github: student.github || "",
        portfolio: student.portfolio || "",
      });
    }
  }, [student, reset, editing]);

  if (loading || !student) {
    return <div className="text-center py-5" style={{ height: "400px" }}><span className="spinner-border spinner-border-sm me-2"></span>Loading profile...</div>;
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) {
        toast.error("Profile photo must be smaller than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgError(false);
        setPhotoBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      // 1. Handle resume upload if selected
      let resumeName = student.resumeName || "";
      let resumeUrl = student.resumeUrl || "";
      
      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        const resumeRes = await studentService.uploadResume(formData);
        resumeName = resumeFile.name;
        resumeUrl = resumeRes.data.resume_url;
      }

      // 2. Prepare payload for profile update
      const skillsArray = data.technicalSkills.split(",").map((s) => s.trim()).filter(Boolean);
      const softSkillsArray = data.softSkills.split(",").map((s) => s.trim()).filter(Boolean);
      const profileData = {
        email: data.email.trim(),
        dob: data.dob,
        gender: data.gender,
        address: data.address.trim(),
        course: data.course,
        branch: data.branch.trim(),
        batch: data.batch,
        passing_year: parseInt(data.batch) || 2026,
        cgpa: data.cgpa ? parseFloat(data.cgpa) : null,
        skills: skillsArray,
        soft_skills: softSkillsArray,
        linkedin: data.linkedin.trim() || null,
        github: data.github.trim() || null,
        portfolio: data.portfolio.trim() || null,
        profile_photo: photoBase64 || null,
      };

      // 3. Save to backend database
      const response = await studentService.updateProfile(profileData);
      const updatedUser = response.data.data;

      // 4. Calculate local completion and save to localStorage for compatibility
      const mockFields = {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.mobile,
        dob: updatedUser.dob,
        gender: updatedUser.gender,
        address: updatedUser.address,
        course: updatedUser.course,
        branch: updatedUser.branch,
        batch: updatedUser.batch,
        cgpa: updatedUser.cgpa,
        skills: updatedUser.skills,
        technicalSkills: data.technicalSkills,
        softSkills: data.softSkills,
        soft_skills: updatedUser.soft_skills || softSkillsArray,
        linkedin: updatedUser.linkedin,
        github: updatedUser.github,
        portfolio: updatedUser.portfolio,
        profilePhoto: photoBase64,
        resumeName: resumeName,
        resumeUrl: resumeUrl,
        profileCompletion: updatedUser.profile_completion,
      };

      updateStudentProfile(student.id, mockFields);

      // 5. Update auth context & state
      const token = localStorage.getItem("apms_token");
      login(updatedUser, "student", token);
      setStudent(updatedUser);
      setImgError(false);
      if (updatedUser.profile_photo) {
        setPhotoBase64(updatedUser.profile_photo);
      }

      toast.success("Profile Updated Successfully 🎉");
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const courses = [
    "Full Stack Development",
    "Python Training",
    "Microsoft Excel",
    "Digital Marketing",
    "SAP Training",
    "Tally Training",
    "B.E – Computer Science",
    "B.E – Information Science",
    "B.E – Electronics",
    "B.E – Mechanical",
    "BCA",
    "MCA",
    "MBA"
  ];

  const profileCompletion = student.profile_completion ?? student.profileCompletion ?? 0;
  const hasResume = !!(student.resume_url || student.resumeUrl);
  const resumeFileName = hasResume ? (student.resume_url?.split("/").pop() || student.resumeUrl?.split("/").pop() || student.resumeName || "resume.pdf") : null;
  const resumeUrl = student.resume_url ? `http://${window.location.hostname}:8000${student.resume_url}` : (student.resumeUrl ? `http://${window.location.hostname}:8000${student.resumeUrl}` : "#");

  return (
    <div className="container-lg">
      <PageHeader
        title="My Profile"
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Profile" }]}
        action={
          <Link to="/student/resume-builder" className="btn btn-warning btn-sm fw-bold d-flex align-items-center gap-2 text-dark">
            <i className="bi bi-file-earmark-person"></i> Generate Resume
          </Link>
        }
      />

      <div className="row g-4">
        {/* Left Card: Photo and completion summary */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm text-center p-4 mb-4">
            <div className="position-relative d-inline-block mx-auto mb-3">
              {photoBase64 && !imgError ? (
                <img
                  src={photoBase64}
                  alt={student.name}
                  className="rounded-circle border border-primary border-2 p-1"
                  style={{ width: 100, height: 100, objectFit: "cover" }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 100, height: 100, fontSize: 32 }}>
                  {student.name?.[0]}
                </div>
              )}
              {editing && (
                <label className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow cursor-pointer d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                  <i className="bi bi-camera-fill" style={{ fontSize: "0.85rem" }}></i>
                  <input type="file" accept="image/*" className="d-none" onChange={handlePhotoChange} />
                </label>
              )}
            </div>

            <h5 className="fw-bold mb-1">{student.name}</h5>
            <small className="text-muted d-block mb-3">{student.course || "No Course Selected"}</small>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <small className="fw-semibold">Profile Completion</small>
                <small className="fw-bold text-primary">{profileCompletion}%</small>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar bg-primary" style={{ width: `${profileCompletion}%` }}></div>
              </div>
            </div>

            {!editing && (
              <div className="d-flex flex-column gap-2">
                <button className="btn btn-outline-primary btn-sm w-100" onClick={() => setEditing(true)}>
                  <i className="bi bi-pencil me-1"></i> Edit Profile
                </button>
                <Link to="/student/resume-builder" className="btn btn-warning btn-sm w-100 fw-bold text-dark">
                  <i className="bi bi-file-earmark-person me-1"></i> Generate Resume
                </Link>
              </div>
            )}
          </div>

          <div className="card border-0 shadow-sm p-3">
            <h6 className="fw-bold mb-3 small text-muted text-uppercase">Technical Skills</h6>
            <div className="d-flex flex-wrap gap-2">
              {student.skills && student.skills.length > 0 ? (
                student.skills.map((s, i) => (
                  <span key={i} className="badge bg-primary bg-opacity-10 text-primary px-2 py-1">{s}</span>
                ))
              ) : (
                <span className="text-muted small">No technical skills added yet</span>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm p-3 mt-3">
            <h6 className="fw-bold mb-3 small text-muted text-uppercase">Soft Skills</h6>
            <div className="d-flex flex-wrap gap-2">
              {(student.soft_skills || student.softSkills) && (student.soft_skills || student.softSkills).length > 0 ? (
                (student.soft_skills || student.softSkills).map((s, i) => (
                  <span key={i} className="badge bg-success bg-opacity-10 text-success px-2 py-1">{s}</span>
                ))
              ) : (
                <span className="text-muted small">No soft skills added yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Full Profile Form */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit(onSubmit)}>
                
                {/* 1. PERSONAL INFORMATION */}
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-person-fill text-primary"></i>
                  <h6 className="fw-bold mb-0">Personal Information</h6>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Full Name <span className="text-danger">*</span></label>
                    <input 
                      {...register("name", { required: "Name is required" })} 
                      disabled={!editing} 
                      className={`form-control ${!editing ? "bg-light" : ""}`} 
                    />
                    {errors.name && <div className="text-danger small">{errors.name.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Email Address <span className="text-danger">*</span></label>
                    <input 
                      type="email" 
                      {...register("email", { 
                        required: "Email is required", 
                        pattern: { value: /^\S+@\S+$/i, message: "Enter a valid email" } 
                      })} 
                      disabled={!editing} 
                      className={`form-control ${!editing ? "bg-light" : ""}`} 
                    />
                    {errors.email && <div className="text-danger small">{errors.email.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Mobile Number <span className="text-danger">*</span></label>
                    <input 
                      type="tel" 
                      {...register("phone", { required: "Mobile number is required" })} 
                      disabled={!editing} 
                      className={`form-control ${!editing ? "bg-light" : ""}`} 
                    />
                    {errors.phone && <div className="text-danger small">{errors.phone.message}</div>}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Date of Birth <span className="text-danger">*</span></label>
                    <input 
                      type="date" 
                      {...register("dob", { required: "Date of birth is required" })} 
                      disabled={!editing} 
                      className={`form-control ${!editing ? "bg-light" : ""}`} 
                    />
                    {errors.dob && <div className="text-danger small">{errors.dob.message}</div>}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Gender <span className="text-danger">*</span></label>
                    <select 
                      {...register("gender", { required: "Gender is required" })} 
                      disabled={!editing} 
                      className={`form-select ${!editing ? "bg-light" : ""}`}
                    >
                      <option value="">-- Gender --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <div className="text-danger small">{errors.gender.message}</div>}
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-medium">Address <span className="text-danger">*</span></label>
                    <textarea 
                      {...register("address", { required: "Address is required" })} 
                      disabled={!editing} 
                      rows={2}
                      className={`form-control ${!editing ? "bg-light" : ""}`} 
                    />
                    {errors.address && <div className="text-danger small">{errors.address.message}</div>}
                  </div>
                </div>

                <hr className="my-4" />

                {/* 2. ACADEMIC INFORMATION */}
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-mortarboard-fill text-primary"></i>
                  <h6 className="fw-bold mb-0">Academic Information</h6>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Institute</label>
                    <input 
                      value={student.institute || ""} 
                      disabled 
                      className="form-control bg-light" 
                    />
                    <small className="text-muted">Institute is set during registration</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Course / Program <span className="text-danger">*</span></label>
                    <select 
                      {...register("course", { required: "Course is required" })} 
                      disabled={!editing} 
                      className={`form-select ${!editing ? "bg-light" : ""}`}
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.course && <div className="text-danger small">{errors.course.message}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Branch / Specialization <span className="text-danger">*</span></label>
                    <input 
                      {...register("branch", { required: "Branch is required" })} 
                      disabled={!editing} 
                      placeholder="e.g. CSE, Finance, Accounting" 
                      className={`form-control ${!editing ? "bg-light" : ""}`} 
                    />
                    {errors.branch && <div className="text-danger small">{errors.branch.message}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Batch / Passing Year <span className="text-danger">*</span></label>
                    <select 
                      {...register("batch", { required: "Batch is required" })} 
                      disabled={!editing} 
                      className={`form-select ${!editing ? "bg-light" : ""}`}
                    >
                      <option value="">-- Select Batch --</option>
                      {["2023", "2024", "2025", "2026", "2027", "2028"].map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.batch && <div className="text-danger small">{errors.batch.message}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Percentage / CGPA (Optional)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      {...register("cgpa")} 
                      disabled={!editing} 
                      placeholder="e.g. 8.5 or 85%" 
                      className={`form-control ${!editing ? "bg-light" : ""}`} 
                    />
                  </div>
                </div>

                <hr className="my-4" />

                {/* 3. SKILLS */}
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-lightbulb-fill text-warning"></i>
                  <h6 className="fw-bold mb-0">Skills</h6>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Technical Skills <span className="text-danger">*</span></label>
                    <input 
                      {...register("technicalSkills", { required: "Technical skills are required" })} 
                      disabled={!editing} 
                      placeholder="React, Python, Tally, Excel (comma separated)" 
                      className={`form-control ${!editing ? "bg-light" : ""}`} 
                    />
                    {errors.technicalSkills && <div className="text-danger small">{errors.technicalSkills.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Soft Skills <span className="text-danger">*</span></label>
                    <input 
                      {...register("softSkills", { required: "Soft skills are required" })} 
                      disabled={!editing} 
                      placeholder="Communication, Teamwork, Leadership (comma separated)" 
                      className={`form-control ${!editing ? "bg-light" : ""}`} 
                    />
                    {errors.softSkills && <div className="text-danger small">{errors.softSkills.message}</div>}
                  </div>
                </div>

                <hr className="my-4" />

                {/* 4. RESUME & DOCUMENTS */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-file-earmark-person-fill text-primary"></i>
                    <h6 className="fw-bold mb-0">My Resumes & Documents <span className="text-danger">*</span></h6>
                  </div>
                  <Link to="/student/resume-builder" className="btn btn-warning btn-sm fw-bold text-dark">
                    <i className="bi bi-plus-lg me-1"></i> Build Resume
                  </Link>
                </div>

                <div className="mb-4 d-flex flex-column gap-3">
                  {/* Uploaded PDF Section */}
                  <div className="card border-0 bg-light p-3 rounded-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-bold small text-dark">
                        <i className="bi bi-file-earmark-pdf-fill text-danger me-2"></i>
                        Uploaded PDF Resume
                      </span>
                      {hasResume && !editing && (
                        <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary py-1 px-3" style={{ fontSize: "0.75rem" }}>
                          <i className="bi bi-eye me-1"></i>View PDF
                        </a>
                      )}
                    </div>
                    {editing ? (
                      <ResumeUpload onFileSelect={setResumeFile} currentFile={resumeFileName} />
                    ) : (
                      hasResume ? (
                        <p className="text-muted small mb-0">{resumeFileName}</p>
                      ) : (
                        <p className="text-warning small mb-0"><i className="bi bi-exclamation-circle me-1"></i>No PDF file uploaded. Edit profile to upload a file.</p>
                      )
                    )}
                  </div>

                  {/* Created Resume Section */}
                  <div className="card border-0 bg-light p-3 rounded-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-bold small text-dark">
                        <i className="bi bi-pencil-square text-success me-2"></i>
                        Created Master Resume
                      </span>
                      <Link to="/student/resume-builder" className="btn btn-sm btn-outline-success py-1 px-3" style={{ fontSize: "0.75rem" }}>
                        <i className="bi bi-pencil me-1"></i>Edit Resume
                      </Link>
                    </div>

                    <div className="d-flex align-items-center justify-content-between bg-white p-2 px-3 rounded border mt-1">
                      <div>
                        <span className="fw-semibold small d-block text-dark">
                          Master Resume
                          <span className="badge bg-success ms-2" style={{ fontSize: "0.65rem" }}>Active</span>
                        </span>
                        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                          Auto-synced with placement applications
                        </small>
                      </div>
                      <div className="d-flex gap-2">
                        <a
                          href={`http://${window.location.hostname}:8000/created-resume/${student?.student_id || student?.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-xs btn-outline-primary"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <i className="bi bi-eye me-1"></i>View Resume
                        </a>
                        <Link
                          to="/student/resume-builder"
                          className="btn btn-xs btn-outline-secondary"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <i className="bi bi-pencil me-1"></i>Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                {/* 5. SOCIAL PROFILES (OPTIONAL) */}
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-share-fill text-primary"></i>
                  <h6 className="fw-bold mb-0">Social Profiles (Optional)</h6>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label small fw-medium"><i className="bi bi-linkedin me-1 text-primary"></i> LinkedIn URL</label>
                    <input 
                      {...register("linkedin")} 
                      disabled={!editing} 
                      placeholder="https://linkedin.com/in/username" 
                      className={`form-control ${!editing ? "bg-light" : ""}`} 
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium"><i className="bi bi-github me-1 text-dark"></i> GitHub URL</label>
                    <input 
                      {...register("github")} 
                      disabled={!editing} 
                      placeholder="https://github.com/username" 
                      className={`form-control ${!editing ? "bg-light" : ""}`} 
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium"><i className="bi bi-globe me-1 text-success"></i> Portfolio Website</label>
                    <input 
                      {...register("portfolio")} 
                      disabled={!editing} 
                      placeholder="https://myportfolio.com" 
                      className={`form-control ${!editing ? "bg-light" : ""}`} 
                    />
                  </div>
                </div>

                {editing && (
                  <div className="mt-4 d-flex gap-3">
                    <button type="submit" className="btn btn-primary px-5 fw-semibold" disabled={isSubmitting}>
                      {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-check2-circle me-2"></i>Save Profile</>}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button>
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
