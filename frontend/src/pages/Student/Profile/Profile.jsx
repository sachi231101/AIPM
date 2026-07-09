import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { institutes } from "../../../utils/mockData";
import { getStudents, updateStudentProfile, calculateCompletion } from "../../../utils/studentStorage";
import PageHeader from "../../../components/PageHeader/PageHeader";
import ResumeUpload from "../../../components/ResumeUpload/ResumeUpload";

export default function Profile() {
  const { user, login } = useAuth();
  const [student, setStudent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [photoBase64, setPhotoBase64] = useState("");

  // Load latest student data from storage
  useEffect(() => {
    if (user) {
      const allStudents = getStudents();
      const current = allStudents.find((s) => s.id === user.id) || user;
      setStudent(current);
      setPhotoBase64(current.profilePhoto || "");
    }
  }, [user]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  // Reset form values when student data is loaded or editing state changes
  useEffect(() => {
    if (student) {
      reset({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        dob: student.dob || "",
        gender: student.gender || "",
        address: student.address || "",
        institute: student.institute || "",
        course: student.course || "",
        branch: student.branch || "",
        batch: student.batch || "",
        cgpa: student.cgpa || "",
        technicalSkills: student.technicalSkills || student.skills?.join(", ") || "",
        softSkills: student.softSkills || "",
        linkedin: student.linkedin || "",
        github: student.github || "",
        portfolio: student.portfolio || "",
      });
    }
  }, [student, reset, editing]);

  if (!student) {
    return <div className="text-center py-5"><span className="spinner-border spinner-border-sm me-2"></span>Loading profile...</div>;
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        toast.error("Profile photo must be smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 800));

    const resumeName = resumeFile ? resumeFile.name : (student.resumeName || student.resumeUrl?.split("/").pop() || "");

    const updatedFields = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      dob: data.dob,
      gender: data.gender,
      address: data.address.trim(),
      institute: data.institute,
      course: data.course,
      branch: data.branch.trim(),
      batch: data.batch,
      cgpa: data.cgpa ? parseFloat(data.cgpa) : "",
      technicalSkills: data.technicalSkills.trim(),
      softSkills: data.softSkills.trim(),
      skills: data.technicalSkills.split(",").map((s) => s.trim()).filter(Boolean),
      linkedin: data.linkedin.trim(),
      github: data.github.trim(),
      portfolio: data.portfolio.trim(),
      profilePhoto: photoBase64,
      resumeName: resumeName,
      resumeUrl: resumeFile ? "/resumes/" + resumeName : student.resumeUrl
    };

    // Calculate new completion percentage
    const { percentage } = calculateCompletion({ ...student, ...updatedFields });
    updatedFields.profileCompletion = percentage;

    // Update in localStorage
    const updated = updateStudentProfile(student.id, updatedFields);
    if (updated) {
      setStudent(updated);
      
      // Update the auth context state to reflect changes elsewhere instantly
      const token = localStorage.getItem("apms_token");
      login(updated, "student", token);

      toast.success("Profile Updated Successfully 🎉");
      setEditing(false);
    } else {
      toast.error("Failed to update profile.");
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

  return (
    <div className="container-lg">
      <PageHeader
        title="My Profile"
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Profile" }]}
      />

      <div className="row g-4">
        {/* Left Card: Photo and completion summary */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm text-center p-4 mb-4">
            <div className="position-relative d-inline-block mx-auto mb-3">
              {photoBase64 ? (
                <img
                  src={photoBase64}
                  alt={student.name}
                  className="rounded-circle border border-primary border-2 p-1"
                  style={{ width: 100, height: 100, objectFit: "cover" }}
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
                <small className="fw-bold text-primary">{student.profileCompletion}%</small>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar bg-primary" style={{ width: `${student.profileCompletion}%` }}></div>
              </div>
            </div>

            {!editing && (
              <button className="btn btn-outline-primary btn-sm w-100" onClick={() => setEditing(true)}>
                <i className="bi bi-pencil me-1"></i> Edit Profile
              </button>
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

                {/* 4. RESUME UPLOAD */}
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-file-earmark-arrow-up-fill text-danger"></i>
                  <h6 className="fw-bold mb-0">Resume Upload <span className="text-danger">*</span></h6>
                </div>
                <div className="mb-4">
                  {editing ? (
                    <ResumeUpload onFileSelect={setResumeFile} currentFile={student.resumeName || student.resumeUrl?.split("/").pop()} />
                  ) : (
                    student.resumeName || student.resumeUrl ? (
                      <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                        <i className="bi bi-file-earmark-pdf-fill text-danger fs-4"></i>
                        <div className="flex-grow-1">
                          <p className="fw-medium mb-0 small">{student.resumeName || student.resumeUrl?.split("/").pop()}</p>
                          <small className="text-muted">Uploaded and active</small>
                        </div>
                        <a href="#" onClick={(e) => e.preventDefault()} className="btn btn-sm btn-outline-primary"><i className="bi bi-eye me-1"></i>View Resume</a>
                      </div>
                    ) : (
                      <div className="alert alert-warning small py-2 mb-0"><i className="bi bi-exclamation-triangle-fill me-2"></i>No resume uploaded. Please edit your profile to upload one.</div>
                    )
                  )}
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
