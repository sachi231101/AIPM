import { useState } from "react";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { studentService } from "../../../services/api";
import { useCachedData } from "../../../hooks/useCachedData";

export default function Students() {
  const [search, setSearch] = useState("");
  const [instituteFilter, setInstituteFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data: rawStudentsResponse, loading } = useCachedData(
    "admin_students",
    studentService.getAll
  );

  const rawList = rawStudentsResponse?.data || [];
  const studentsList = rawList.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.mobile || "N/A",
    gender: s.gender || "N/A",
    dob: s.dob || "N/A",
    address: s.address || "N/A",
    institute: s.institute || "Unknown Institute",
    course: s.course || "N/A",
    branch: s.branch || "N/A",
    batch: s.batch || "N/A",
    cgpa: s.cgpa || 0,
    skills: s.skills || [],
    softSkills: s.softSkills || s.soft_skills || [],
    profileCompletion: s.profile_completion || 0,
    resumeUrl: s.resume_url ? `http://localhost:8000${s.resume_url}` : "#"
  }));

  const institutes = [...new Set(studentsList.map(s => s.institute).filter(Boolean))];

  const filtered = studentsList.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchInstitute = instituteFilter ? s.institute === instituteFilter : true;
    return matchSearch && matchInstitute;
  });

  if (loading) {
    return (
      <div className="text-center py-5" style={{ height: "400px" }}>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading students records...
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Students" subtitle="View and manage registered students" breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Students" }]} />

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input className="form-control border-start-0" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={instituteFilter} onChange={e => setInstituteFilter(e.target.value)}>
                <option value="">All Institutes</option>
                {institutes.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="col-md-3 text-end">
              <span className="badge bg-primary px-3 py-2">{filtered.length} Students</span>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="py-3">Student</th>
                  <th className="py-3">Institute</th>
                  <th className="py-3">Course</th>
                  <th className="py-3">CGPA</th>
                  <th className="py-3">Profile</th>
                  <th className="py-3 text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((student, i) => (
                    <tr key={student.id}>
                      <td className="px-4 text-muted">{i + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: 36, height: 36, fontSize: 14 }}>
                            {student.name[0]}
                          </div>
                          <div>
                            <p className="fw-medium mb-0 small">{student.name}</p>
                            <small className="text-muted">{student.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="small text-muted">{student.institute}</td>
                      <td className="small">{student.course}</td>
                      <td>
                        <span className={`fw-bold text-${student.cgpa >= 8 ? "success" : student.cgpa >= 7 ? "warning" : "danger"}`}>{student.cgpa || "N/A"}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: 6, width: 60 }}>
                            <div className="progress-bar bg-primary" style={{ width: `${student.profileCompletion}%` }}></div>
                          </div>
                          <small className="text-muted">{student.profileCompletion}%</small>
                        </div>
                      </td>
                      <td className="text-end px-4">
                        <div className="d-flex gap-2 justify-content-end">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedStudent(student)}>
                            <i className="bi bi-eye me-1"></i>View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted small">No students registered yet matching filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Student Modal */}
      {selectedStudent && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 bg-primary text-white">
                <h6 className="modal-title fw-bold">Student Profile</h6>
                <button className="btn-close btn-close-white" onClick={() => setSelectedStudent(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-4 text-center">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold mx-auto mb-3" style={{ width: 72, height: 72, fontSize: 24 }}>
                      {selectedStudent.name[0]}
                    </div>
                    <h6 className="fw-bold">{selectedStudent.name}</h6>
                    <p className="text-muted small">{selectedStudent.course}</p>
                    <div className="progress mb-2" style={{ height: 8 }}>
                      <div className="progress-bar bg-primary" style={{ width: `${selectedStudent.profileCompletion}%` }}></div>
                    </div>
                    <small className="text-muted">{selectedStudent.profileCompletion}% Profile Complete</small>
                  </div>
                  <div className="col-md-8">
                    <div className="row g-3">
                      {[
                        { label: "Email", value: selectedStudent.email, icon: "bi-envelope" },
                        { label: "Phone", value: selectedStudent.phone, icon: "bi-telephone" },
                        { label: "Institute", value: selectedStudent.institute, icon: "bi-bank2" },
                        { label: "Batch/Passing Year", value: selectedStudent.batch, icon: "bi-calendar" },
                        { label: "CGPA / Percentage", value: selectedStudent.cgpa || "N/A", icon: "bi-star" },
                        { label: "Gender", value: selectedStudent.gender, icon: "bi-gender-ambiguous" },
                        { label: "Date of Birth", value: selectedStudent.dob, icon: "bi-calendar-event" },
                      ].map((item, i) => (
                        <div key={i} className="col-6">
                          <small className="text-muted d-block"><i className={`bi ${item.icon} me-1`}></i>{item.label}</small>
                          <span className="fw-medium small">{item.value}</span>
                        </div>
                      ))}
                      <div className="col-12">
                        <small className="text-muted d-block mb-2"><i className="bi bi-tools me-1"></i>Technical Skills</small>
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          {selectedStudent.skills.length > 0 ? (
                            selectedStudent.skills.map((s, i) => <span key={i} className="badge bg-primary bg-opacity-10 text-primary">{s}</span>)
                          ) : (
                            <span className="text-muted small">No technical skills added</span>
                          )}
                        </div>
                      </div>
                      <div className="col-12">
                        <small className="text-muted d-block mb-2"><i className="bi bi-person-heart me-1"></i>Soft Skills</small>
                        <div className="d-flex flex-wrap gap-1">
                          {selectedStudent.softSkills.length > 0 ? (
                            selectedStudent.softSkills.map((s, i) => <span key={i} className="badge bg-success bg-opacity-10 text-success">{s}</span>)
                          ) : (
                            <span className="text-muted small">No soft skills added</span>
                          )}
                        </div>
                      </div>
                      <div className="col-12">
                        {selectedStudent.resumeUrl && selectedStudent.resumeUrl !== "#" ? (
                          <a href={selectedStudent.resumeUrl} className="btn btn-sm btn-outline-primary" target="_blank" rel="noreferrer">
                            <i className="bi-file-earmark-pdf me-1"></i>View / Download Resume
                          </a>
                        ) : (
                          <span className="text-muted small">No resume uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
