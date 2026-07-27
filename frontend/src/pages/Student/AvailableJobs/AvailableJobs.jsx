import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JobCard from "../../../components/JobCard/JobCard";
import SearchBar from "../../../components/SearchBar/SearchBar";
import EmptyState from "../../../components/EmptyState/EmptyState";
import Pagination from "../../../components/Pagination/Pagination";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { SkeletonGrid } from "../../../components/Skeleton/Skeleton";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { studentService, jobService, applicationService } from "../../../services/api";
import { getCompanyLogo } from "../../../utils/logoHelper";
import ConfirmApplicationModal from "../../../components/ConfirmApplicationModal/ConfirmApplicationModal";

const ITEMS_PER_PAGE = 6;

export default function AvailableJobs() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [selectedJobForConfirm, setSelectedJobForConfirm] = useState(null);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, profileRes, appsRes] = await Promise.all([
          jobService.getAll(),
          studentService.getProfile(),
          applicationService.getMyApplications().catch(() => ({ data: { data: [] } })),
        ]);

        const profile = profileRes.data.data;
        setStudent(profile);

        const myApps = appsRes.data?.data || [];
        const appliedJobIds = new Set(myApps.map((app) => app.job?.id));

        const rawJobs = jobsRes.data.data || [];
        const mappedJobs = rawJobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company?.name || "Unknown Company",
          companyLogo: getCompanyLogo(job.company?.logo_path, job.company?.name),
          location: job.location,
          salary: job.salary,
          experience: job.experience,
          skills: job.skills || [],
          status: job.status === "published" ? "Published" : (job.status === "closed" ? "Closed" : "Pending"),
          lastDate: job.last_date,
          isApplied: appliedJobIds.has(job.id),
        }));
        setJobsList(mappedJobs);
      } catch (err) {
        console.error("Failed to load available jobs", err);
        toast.error("Failed to load available jobs.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container-lg py-4">
        <SkeletonGrid count={6} />
      </div>
    );
  }

  const approvalStatus = student?.approval_status || user?.approval_status || "approved";

  // Check if student has a resume uploaded or created
  const hasUploadedResume = !!(student?.resume_path || student?.resume_url || student?.resumeUrl);
  const hasCreatedResume = !!(student?.has_created_resume);
  const hasAnyResume = hasUploadedResume || hasCreatedResume;

  const locations = [...new Set(jobsList.map((j) => j.location))];

  const filtered = jobsList.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    const matchLocation = locationFilter ? j.location === locationFilter : true;
    return matchSearch && matchLocation;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleOpenConfirm = (job) => {
    if (approvalStatus !== "approved") {
      if (approvalStatus === "rejected") {
        toast.error("Your account status is rejected. You cannot apply for placement drives.");
      } else {
        toast.info("Your account is currently on hold. You can apply for jobs once the Placement Team releases the hold on your account.");
      }
      return;
    }

    setSelectedJobForConfirm(job);
  };

  const handleConfirmApply = async () => {
    if (!selectedJobForConfirm) return;
    const job = selectedJobForConfirm;

    try {
      setApplyingJobId(job.id);
      await applicationService.apply({ job_id: job.id });
      toast.success(`Applied for ${job.title} at ${job.company}! 🎉`);
      setJobsList((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, isApplied: true } : j))
      );
      setSelectedJobForConfirm(null);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to submit application.";
      toast.error(msg);
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="container-lg">
      <PageHeader
        title="Available Jobs"
        subtitle="Explore active placement drives"
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Available Jobs" }]}
      />

      {/* ── On Hold Banner ── */}
      {(approvalStatus === "hold" || approvalStatus === "pending") && (
        <div className="alert alert-warning border-0 mb-4 rounded-3 p-3 d-flex align-items-center gap-3">
          <i className="bi bi-pause-circle-fill fs-4 text-warning"></i>
          <div>
            <p className="fw-semibold mb-0" style={{ fontSize: "0.95rem" }}>Account On Hold</p>
            <small className="text-dark opacity-75">Your account is currently placed on hold. You can view all jobs but applications are temporarily locked.</small>
          </div>
        </div>
      )}

      {/* ── No-Resume Banner ── */}
      {!hasAnyResume && (
        <div
          className="alert border-0 mb-4 rounded-3 p-4"
          style={{
            background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
            borderLeft: "4px solid #f39c12 !important",
          }}
          role="alert"
        >
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 48, height: 48, background: "#f39c12", color: "#fff", fontSize: 20 }}
            >
              <i className="bi bi-file-earmark-person-fill"></i>
            </div>
            <div className="flex-grow-1">
              <h6 className="fw-bold mb-1" style={{ color: "#856404" }}>
                Resume Required to Apply
              </h6>
              <p className="mb-3 small" style={{ color: "#533f03" }}>
                You haven't uploaded a resume yet. To apply for placement drives, you need to
                upload your resume first or build one using our Resume Builder.
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <Link
                  to="/student/profile"
                  className="btn btn-sm fw-semibold"
                  style={{ background: "#f39c12", color: "#fff", borderRadius: 8 }}
                >
                  <i className="bi bi-upload me-2"></i>Upload Resume Now
                </Link>
                <Link
                  to="/student/resume-builder"
                  className="btn btn-sm btn-outline-secondary fw-semibold"
                  style={{ borderRadius: 8 }}
                >
                  <i className="bi bi-pencil-square me-2"></i>Build Resume with AI
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Resume Active Banner ── */}
      {hasAnyResume && (
        <div
          className="alert border-0 mb-4 rounded-3 py-2 px-3 d-flex align-items-center gap-2"
          style={{ background: "#d1fae5", color: "#065f46" }}
        >
          <i className="bi bi-check-circle-fill text-success"></i>
          <span className="small fw-medium">
            Your resume is ready.{" "}
            <span className="text-muted fw-normal">
              It will be automatically submitted with your application.
            </span>
          </span>
          <Link
            to="/student/profile"
            className="ms-auto btn btn-sm btn-outline-success"
            style={{ fontSize: 12, borderRadius: 8 }}
          >
            <i className="bi bi-pencil me-1"></i>Update Resume
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="row g-2 g-md-3 align-items-end">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-medium mb-1">Search</label>
              <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search jobs or companies..." />
            </div>
            <div className="col-7 col-md-4">
              <label className="form-label small fw-medium mb-1">Location</label>
              <select className="form-select" value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}>
                <option value="">All Locations</option>
                {locations.map((loc) => <option key={loc}>{loc}</option>)}
              </select>
            </div>
            <div className="col-5 col-md-2">
              <button
                className={`btn w-100 ${search || locationFilter ? "btn-outline-danger" : "btn-outline-secondary"}`}
                disabled={!search && !locationFilter}
                onClick={() => { setSearch(""); setLocationFilter(""); setPage(1); }}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <p className="text-muted small mb-0"><strong>{filtered.length}</strong> placement drives available</p>
      </div>

      {paginated.length > 0 ? (
        <>
          <div className="row g-4">
            {paginated.map((job) => (
              <div key={job.id} className="col-md-6 col-lg-4">
                <div className="position-relative">
                  <JobCard
                    job={job}
                    showApply
                    onApply={() => handleOpenConfirm(job)}
                    applyDisabled={!hasAnyResume || approvalStatus !== "approved" || applyingJobId === job.id}
                    applyLoading={applyingJobId === job.id}
                  />
                  {/* Lock overlay when no resume */}
                  {!hasAnyResume && !job.isApplied && (
                    <div
                      className="position-absolute bottom-0 start-0 end-0 d-flex align-items-center justify-content-center rounded-bottom-3"
                      style={{
                        background: "rgba(243,156,18,0.12)",
                        padding: "8px 12px",
                        borderTop: "1px dashed #f39c12",
                        pointerEvents: "none",
                      }}
                    >
                      <i className="bi bi-lock-fill text-warning me-2" style={{ fontSize: 12 }}></i>
                      <span className="text-warning fw-semibold" style={{ fontSize: 12 }}>
                        Create or upload resume to apply
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 d-flex justify-content-center">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState icon="bi-briefcase" title="No Jobs Found" description="No placement drives match your current filters." />
      )}

      {/* Confirmation Modal */}
      {selectedJobForConfirm && (
        <ConfirmApplicationModal
          job={selectedJobForConfirm}
          student={student}
          onConfirm={handleConfirmApply}
          onClose={() => setSelectedJobForConfirm(null)}
          submitting={applyingJobId === selectedJobForConfirm.id}
        />
      )}
    </div>
  );
}
