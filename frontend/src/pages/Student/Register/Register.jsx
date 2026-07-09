import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { institutes } from "../../../utils/mockData";
import { useAuth } from "../../../hooks/useAuth";
import { getStudents, addStudent, calculateCompletion } from "../../../utils/studentStorage";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showOtherInstitute, setShowOtherInstitute] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const password = watch("password");

  const handleInstituteChange = (e) => {
    setShowOtherInstitute(e.target.value === "Other");
  };

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 800));

    const existingStudents = getStudents();

    // 1. Validate Unique Student ID Card Number
    const idExists = existingStudents.some(
      (s) => s.studentIdCardNumber?.toLowerCase() === data.studentIdCardNumber.trim().toLowerCase()
    );
    if (idExists) {
      toast.error("Student ID Card Number must be unique. This ID is already registered.");
      return;
    }

    // 2. Validate Unique Mobile Number
    const phoneExists = existingStudents.some(
      (s) => s.phone === data.phone.trim()
    );
    if (phoneExists) {
      toast.error("Mobile Number must be unique. This number is already registered.");
      return;
    }

    // Determine selected institute name and ID
    const selectedInstName = data.institute === "Other" ? data.otherInstitute : data.institute;
    const matchedInst = institutes.find((i) => i.name === data.institute);
    const selectedInstId = data.institute === "Other" ? 6 : (matchedInst ? matchedInst.id : 6);

    // Construct new student record
    const newStudent = {
      id: Date.now(),
      studentIdCardNumber: data.studentIdCardNumber.trim(),
      name: data.fullName.trim(),
      phone: data.phone.trim(),
      institute: selectedInstName,
      instituteId: selectedInstId,
      password: data.password,
      status: "Active",
      // Initially empty fields to be completed later
      email: "",
      dob: "",
      gender: "",
      address: "",
      course: "",
      branch: "",
      batch: "",
      cgpa: "",
      skills: [],
      technicalSkills: "",
      softSkills: "",
      resumeUrl: "",
      resumeName: "",
      linkedin: "",
      github: "",
      portfolio: "",
      profilePhoto: "",
      profileCompletion: 0,
    };

    // Calculate initial profile completion percentage (should be 0%)
    const { percentage } = calculateCompletion(newStudent);
    newStudent.profileCompletion = percentage;

    // Save student to localStorage
    addStudent(newStudent);

    // Log user in
    login(newStudent, "student", `mock-token-${newStudent.id}`);
    
    toast.success("Account created successfully! 🎉 Welcome to Aadya Placement Portal.");
    navigate("/student/dashboard");
  };

  return (
    <div className="min-vh-100 py-5 auth-bg d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="text-center mb-4">
              <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none">
                <img src="/logo.png" alt="Aadya Institute Logo" style={{ height: "48px", objectFit: "contain" }} />
                <span className="fw-bold fs-4 text-dark ms-1">Aadya Placements</span>
              </Link>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-header bg-primary text-white text-center py-4 border-0">
                <h5 className="fw-bold mb-1">Create Student Account</h5>
                <p className="small text-white-75 mb-0">Register in less than a minute and start finding jobs</p>
              </div>
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit(onSubmit)}>
                  
                  {/* Student ID Card Number */}
                  <div className="mb-3">
                    <label className="form-label fw-medium small">Student ID Card Number <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-card-text text-muted"></i></span>
                      <input 
                        type="text" 
                        {...register("studentIdCardNumber", { required: "Student ID Card Number is required" })} 
                        className={`form-control border-start-0 ps-0 ${errors.studentIdCardNumber ? "is-invalid" : ""}`} 
                        placeholder="e.g. STU1001" 
                      />
                      {errors.studentIdCardNumber && <div className="invalid-feedback">{errors.studentIdCardNumber.message}</div>}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label fw-medium small">Full Name <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-person text-muted"></i></span>
                      <input 
                        type="text" 
                        {...register("fullName", { required: "Full name is required" })} 
                        className={`form-control border-start-0 ps-0 ${errors.fullName ? "is-invalid" : ""}`} 
                        placeholder="Arjun Sharma" 
                      />
                      {errors.fullName && <div className="invalid-feedback">{errors.fullName.message}</div>}
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="mb-3">
                    <label className="form-label fw-medium small">Mobile Number <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-telephone text-muted"></i></span>
                      <input 
                        type="tel" 
                        {...register("phone", { 
                          required: "Mobile number is required", 
                          pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit mobile number" } 
                        })} 
                        className={`form-control border-start-0 ps-0 ${errors.phone ? "is-invalid" : ""}`} 
                        placeholder="9876543210" 
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                    </div>
                  </div>

                  {/* Institute Dropdown */}
                  <div className="mb-3">
                    <label className="form-label fw-medium small">Institute <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-bank2 text-muted"></i></span>
                      <select 
                        {...register("institute", { required: "Institute selection is required" })} 
                        className={`form-select border-start-0 ps-0 ${errors.institute ? "is-invalid" : ""}`} 
                        onChange={handleInstituteChange}
                      >
                        <option value="">-- Select Institute --</option>
                        {institutes.map((inst) => <option key={inst.id} value={inst.name}>{inst.name}</option>)}
                      </select>
                      {errors.institute && <div className="invalid-feedback">{errors.institute.message}</div>}
                    </div>
                  </div>

                  {/* Dynamic Other Institute Name */}
                  {showOtherInstitute && (
                    <div className="mb-3 animate__animated animate__fadeIn">
                      <label className="form-label fw-medium small">Institute Name <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-bank text-muted"></i></span>
                        <input 
                          type="text" 
                          {...register("otherInstitute", { required: showOtherInstitute ? "Please enter institute name" : false })} 
                          className={`form-control border-start-0 ps-0 ${errors.otherInstitute ? "is-invalid" : ""}`} 
                          placeholder="Enter your institute name" 
                        />
                        {errors.otherInstitute && <div className="invalid-feedback">{errors.otherInstitute.message}</div>}
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label fw-medium small">Password <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-muted"></i></span>
                      <input 
                        type="password" 
                        {...register("password", { 
                          required: "Password is required", 
                          minLength: { value: 8, message: "Password must be at least 8 characters" } 
                        })} 
                        className={`form-control border-start-0 ps-0 ${errors.password ? "is-invalid" : ""}`} 
                        placeholder="Min 8 characters" 
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="form-label fw-medium small">Confirm Password <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock-fill text-muted"></i></span>
                      <input 
                        type="password" 
                        {...register("confirmPassword", { 
                          required: "Please confirm your password", 
                          validate: (v) => v === password || "Passwords do not match" 
                        })} 
                        className={`form-control border-start-0 ps-0 ${errors.confirmPassword ? "is-invalid" : ""}`} 
                        placeholder="Repeat password" 
                      />
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={isSubmitting}>
                    {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating Account...</> : <><i className="bi bi-person-plus me-2"></i>Create Account</>}
                  </button>
                </form>

                <hr className="my-4" />
                <p className="text-center text-muted small mb-0">
                  Already registered? <Link to="/student/login" className="text-primary fw-semibold text-decoration-none">Sign In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
