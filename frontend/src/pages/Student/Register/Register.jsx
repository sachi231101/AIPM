import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { getStudents, addStudent } from "../../../utils/studentStorage";
import { authService, instituteService } from "../../../services/api";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showOtherInstitute, setShowOtherInstitute] = useState(false);
  const [instList, setInstList] = useState([]);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const password = watch("password");

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await instituteService.getAll();
        const list = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
        setInstList(list);
      } catch (err) {
        console.error("Failed to fetch institutes, using fallback", err);
        setInstList([
          { id: 1, name: "Aadya Institute" },
          { id: 2, name: "PES University" },
          { id: 3, name: "Oxford College" },
          { id: 4, name: "RV College of Engineering" }
        ]);
      }
    };
    fetchInstitutes();
  }, []);

  const handleInstituteChange = (e) => {
    setShowOtherInstitute(e.target.value === "other");
  };

  const onSubmit = async (data) => {
    const payload = {
      student_id_card: data.studentIdCardNumber.trim(),
      full_name: data.fullName.trim(),
      mobile: data.phone.trim(),
      institute_id: data.institute === "other" ? "other" : data.institute,
      other_institute_name: data.institute === "other" ? data.otherInstitute.trim() : null,
      password: data.password,
      password_confirmation: data.confirmPassword
    };

    try {
      // 1. Save to backend database
      const response = await authService.studentRegister(payload);
      const registeredUser = response.data.user;
      const token = response.data.token;

      // 2. Map institute name for frontend localStorage mockup
      const selectedInst = instList.find(i => String(i.id) === String(data.institute));
      const selectedInstName = data.institute === "other" ? data.otherInstitute : (selectedInst ? selectedInst.name : "");

      // 3. For compatibility with other pages that read from localStorage, save there too
      const newStudent = {
        id: registeredUser.id,
        studentIdCardNumber: registeredUser.student_id_card,
        name: registeredUser.name,
        phone: registeredUser.mobile,
        institute: selectedInstName,
        instituteId: registeredUser.institute_id || 6,
        password: data.password,
        status: "Active",
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

      addStudent(newStudent);

      // 4. Do not login automatically, redirect to Login option
      toast.success("Account created successfully! 🎉 Please sign in to access your portal.");
      navigate("/student/login");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    }
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
                        {instList.map((inst) => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                        <option value="other">Other</option>
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
