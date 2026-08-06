import { useState } from "react";
import { toast } from "react-toastify";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { studentService } from "../../../services/api";
import { useCachedData } from "../../../hooks/useCachedData";

export default function Students() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "approved" | "hold" | "rejected" | "pending"
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const { data: rawStudentsResponse, loading, refresh: refetch, setData } = useCachedData(
    "admin_students",
    studentService.getAll
  );

  const listToDisplay = rawStudentsResponse?.data || [];

  const updateStudentStatusLocally = (id, newStatus) => {
    if (rawStudentsResponse?.data) {
      const updatedList = rawStudentsResponse.data.map((s) =>
        s.id === id ? { ...s, approval_status: newStatus, approvalStatus: newStatus } : s
      );
      setData({ ...rawStudentsResponse, data: updatedList });
    }
  };

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    updateStudentStatusLocally(id, "approved");
    try {
      await studentService.approve(id);
      toast.success("Student account approved successfully! 🎉");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to approve student.");
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleHold = async (id) => {
    setActionLoadingId(id);
    updateStudentStatusLocally(id, "hold");
    try {
      await studentService.hold(id);
      toast.warning("Student account placed on hold.");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to hold student.");
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    updateStudentStatusLocally(id, "rejected");
    try {
      await studentService.reject(id);
      toast.info("Student status set to Rejected.");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reject student.");
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };


  const filtered = listToDisplay.filter((s) => {
    const sName = s.name || "";
    const sEmail = s.email || "";
    const sPhone = s.mobile || s.phone || "";
    const matchSearch =
      sName.toLowerCase().includes(search.toLowerCase()) ||
      sEmail.toLowerCase().includes(search.toLowerCase()) ||
      sPhone.includes(search);

    const sStatus = s.approval_status || s.approvalStatus || "approved";
    const matchStatus = statusFilter === "all" ? true : sStatus === statusFilter;

    return matchSearch && matchStatus;
  });

  const counts = {
    all: listToDisplay.length,
    approved: listToDisplay.filter(s => (s.approval_status || s.approvalStatus || "approved") === "approved").length,
    hold: listToDisplay.filter(s => (s.approval_status || s.approvalStatus) === "hold" || (s.approval_status || s.approvalStatus) === "pending").length,
    rejected: listToDisplay.filter(s => (s.approval_status || s.approvalStatus) === "rejected").length,
  };

  if (loading && listToDisplay.length === 0) {
    return (
      <div className="text-center py-5" style={{ height: "400px" }}>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading students records...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Student Management"
        subtitle="Manage student access and hold statuses"
        breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Students" }]}
      />

      {/* Filter Tabs */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="nav nav-pills bg-white p-1.5 rounded-3 shadow-sm border">
          <button
            className={`nav-link py-2 px-3 small fw-medium border-0 ${statusFilter === "all" ? "active bg-primary text-white" : "text-dark"}`}
            onClick={() => setStatusFilter("all")}
          >
            All Students <span className="badge bg-secondary ms-1">{counts.all}</span>
          </button>
          <button
            className={`nav-link py-2 px-3 small fw-medium border-0 ${statusFilter === "approved" ? "active bg-success text-white" : "text-dark"}`}
            onClick={() => setStatusFilter("approved")}
          >
            Approved (Default) <span className="badge bg-success ms-1">{counts.approved}</span>
          </button>
          <button
            className={`nav-link py-2 px-3 small fw-medium border-0 ${statusFilter === "hold" ? "active bg-warning text-dark" : "text-dark"}`}
            onClick={() => setStatusFilter("hold")}
          >
            On Hold <span className="badge bg-warning text-dark ms-1">{counts.hold}</span>
          </button>
          <button
            className={`nav-link py-2 px-3 small fw-medium border-0 ${statusFilter === "rejected" ? "active bg-danger text-white" : "text-dark"}`}
            onClick={() => setStatusFilter("rejected")}
          >
            Rejected <span className="badge bg-danger ms-1">{counts.rejected}</span>
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="input-group style-search" style={{ minWidth: "260px" }}>
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="py-3">Name</th>
                  <th className="py-3">Mobile Number</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Course</th>
                  <th className="py-3">Profile Completion</th>
                  <th className="py-3">Resume Status</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((student, i) => {
                    const status = student.approval_status || student.approvalStatus || "approved";
                    const hasResume = student.hasCreated || student.hasUploaded || (student.resumeUrl && student.resumeUrl !== "#");

                    return (
                      <tr key={student.id || i}>
                        <td className="px-4 text-muted">{i + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: 36, height: 36, fontSize: 14 }}>
                              {(student.name || "S")[0]}
                            </div>
                            <span className="fw-semibold text-dark">{student.name || "N/A"}</span>
                          </div>
                        </td>
                        <td className="fw-medium text-dark">{student.mobile || student.phone || "N/A"}</td>
                        <td className="text-muted small">{student.email || "N/A"}</td>
                        <td className="small">{student.course || "N/A"}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: 6, width: 60 }}>
                              <div
                                className={`progress-bar ${student.profileCompletion >= 75 ? "bg-success" : "bg-primary"}`}
                                style={{ width: `${student.profileCompletion || student.profile_completion || 0}%` }}
                              ></div>
                            </div>
                            <small className="fw-semibold text-muted">{student.profileCompletion || student.profile_completion || 0}%</small>
                          </div>
                        </td>
                        <td>
                          {hasResume ? (
                            <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1">
                              <i className="bi bi-file-earmark-check me-1"></i>Available
                            </span>
                          ) : (
                            <span className="badge bg-light text-muted border px-2 py-1">
                              Not Added
                            </span>
                          )}
                        </td>
                        <td>
                          {status === "approved" && (
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1.5 fw-semibold">
                              <i className="bi bi-check-circle-fill me-1"></i>Approved
                            </span>
                          )}
                          {(status === "hold" || status === "pending") && (
                            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2.5 py-1.5 fw-semibold">
                              <i className="bi bi-pause-circle-fill me-1"></i>On Hold
                            </span>
                          )}
                          {status === "rejected" && (
                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2.5 py-1.5 fw-semibold">
                              <i className="bi bi-x-circle-fill me-1"></i>Rejected
                            </span>
                          )}
                        </td>
                        <td className="text-end px-4">
                          <div className="d-flex gap-2 justify-content-end">
                            {status !== "approved" && (
                              <button
                                className="btn btn-sm btn-success px-2.5 py-1"
                                title="Approve Student"
                                onClick={() => handleApprove(student.id || student.student_id)}
                                disabled={actionLoadingId === (student.id || student.student_id)}
                              >
                                <i className="bi bi-check-lg me-1"></i>Approve
                              </button>
                            )}
                            {status !== "hold" && status !== "pending" && (
                              <button
                                className="btn btn-sm btn-warning text-dark px-2.5 py-1"
                                title="Put Student On Hold"
                                onClick={() => handleHold(student.id || student.student_id)}
                                disabled={actionLoadingId === (student.id || student.student_id)}
                              >
                                <i className="bi bi-pause-fill me-1"></i>Put On Hold
                              </button>
                            )}
                            {status !== "rejected" && (
                              <button
                                className="btn btn-sm btn-outline-danger px-2.5 py-1"
                                title="Reject Student"
                                onClick={() => handleReject(student.id || student.student_id)}
                                disabled={actionLoadingId === (student.id || student.student_id)}
                              >
                                <i className="bi bi-x-lg me-1"></i>Reject
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-light border px-2 py-1"
                              title="View Profile Details"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-5 text-muted">
                      <i className="bi bi-people fs-2 d-block mb-2 text-muted opacity-50"></i>
                      No students found matching your criteria.
                    </td>
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
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 bg-primary text-white py-3">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-person-badge"></i> Student Profile Details
                </h6>
                <button className="btn-close btn-close-white" onClick={() => setSelectedStudent(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-4 text-center border-end pe-md-4">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold mx-auto mb-3" style={{ width: 72, height: 72, fontSize: 24 }}>
                      {(selectedStudent.name || "S")[0]}
                    </div>
                    <h6 className="fw-bold mb-1">{selectedStudent.name || "N/A"}</h6>
                    <p className="text-muted small mb-2">{selectedStudent.course || "Course N/A"}</p>
                    
                    <div className="mb-3">
                      {(selectedStudent.approval_status || selectedStudent.approvalStatus || "approved") === "approved" && (
                        <span className="badge bg-success px-3 py-1.5"><i className="bi bi-check-circle me-1"></i>Approved Student</span>
                      )}
                      {((selectedStudent.approval_status || selectedStudent.approvalStatus) === "hold" || (selectedStudent.approval_status || selectedStudent.approvalStatus) === "pending") && (
                        <span className="badge bg-warning text-dark px-3 py-1.5"><i className="bi bi-pause-circle me-1"></i>Account On Hold</span>
                      )}
                      {(selectedStudent.approval_status || selectedStudent.approvalStatus) === "rejected" && (
                        <span className="badge bg-danger px-3 py-1.5"><i className="bi bi-x-circle me-1"></i>Rejected</span>
                      )}
                    </div>

                    <div className="progress mb-1" style={{ height: 8 }}>
                      <div className="progress-bar bg-primary" style={{ width: `${selectedStudent.profileCompletion || selectedStudent.profile_completion || 0}%` }}></div>
                    </div>
                    <small className="text-muted">{selectedStudent.profileCompletion || selectedStudent.profile_completion || 0}% Complete</small>
                  </div>

                  <div className="col-md-8">
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <small className="text-muted d-block"><i className="bi bi-telephone me-1"></i>Mobile Number</small>
                        <span className="fw-medium small text-dark">{selectedStudent.mobile || selectedStudent.phone || "N/A"}</span>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block"><i className="bi bi-envelope me-1"></i>Email Address</small>
                        <span className="fw-medium small text-dark">{selectedStudent.email || "N/A"}</span>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block"><i className="bi bi-journal-bookmark me-1"></i>Course / Branch</small>
                        <span className="fw-medium small text-dark">{selectedStudent.course ? `${selectedStudent.course} (${selectedStudent.branch || "N/A"})` : "N/A"}</span>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block"><i className="bi bi-calendar-check me-1"></i>Passing Batch</small>
                        <span className="fw-medium small text-dark">{selectedStudent.batch || selectedStudent.passing_year || "N/A"}</span>
                      </div>
                    </div>

                    <hr className="my-3" />

                    <div className="d-flex flex-wrap gap-2">
                      {selectedStudent.createdResumeUrl && (
                        <a href={selectedStudent.createdResumeUrl} className="btn btn-sm btn-outline-primary" target="_blank" rel="noreferrer">
                          <i className="bi bi-file-earmark-person me-1"></i>View Master Resume
                        </a>
                      )}
                      {selectedStudent.uploadedResumeUrl && (
                        <a href={selectedStudent.uploadedResumeUrl} className="btn btn-sm btn-outline-secondary" target="_blank" rel="noreferrer">
                          <i className="bi bi-file-earmark-pdf me-1"></i>Uploaded Resume PDF
                        </a>
                      )}
                      {!selectedStudent.createdResumeUrl && !selectedStudent.uploadedResumeUrl && selectedStudent.resumeUrl && selectedStudent.resumeUrl !== "#" && (
                        <a href={selectedStudent.resumeUrl} className="btn btn-sm btn-outline-primary" target="_blank" rel="noreferrer">
                          <i className="bi bi-file-earmark-pdf me-1"></i>View Resume
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light border-0 py-2.5">
                {(selectedStudent.approval_status || selectedStudent.approvalStatus || "approved") !== "approved" && (
                  <button
                    className="btn btn-sm btn-success fw-semibold px-3"
                    onClick={() => {
                      handleApprove(selectedStudent.id || selectedStudent.student_id);
                      setSelectedStudent(null);
                    }}
                  >
                    <i className="bi bi-check-lg me-1"></i>Approve Account
                  </button>
                )}
                {(selectedStudent.approval_status || selectedStudent.approvalStatus) !== "hold" && (selectedStudent.approval_status || selectedStudent.approvalStatus) !== "pending" && (
                  <button
                    className="btn btn-sm btn-warning fw-semibold px-3 text-dark"
                    onClick={() => {
                      handleHold(selectedStudent.id || selectedStudent.student_id);
                      setSelectedStudent(null);
                    }}
                  >
                    <i className="bi bi-pause-fill me-1"></i>Put On Hold
                  </button>
                )}
                {(selectedStudent.approval_status || selectedStudent.approvalStatus) !== "rejected" && (
                  <button
                    className="btn btn-sm btn-outline-danger fw-semibold px-3"
                    onClick={() => {
                      handleReject(selectedStudent.id || selectedStudent.student_id);
                      setSelectedStudent(null);
                    }}
                  >
                    <i className="bi bi-x-lg me-1"></i>Reject Account
                  </button>
                )}
                <button className="btn btn-sm btn-secondary px-3" onClick={() => setSelectedStudent(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
