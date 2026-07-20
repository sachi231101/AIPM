import { useState, useEffect } from "react";
import JobCard from "../../../components/JobCard/JobCard";
import SearchBar from "../../../components/SearchBar/SearchBar";
import EmptyState from "../../../components/EmptyState/EmptyState";
import Pagination from "../../../components/Pagination/Pagination";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { SkeletonGrid } from "../../../components/Skeleton/Skeleton";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { studentService, jobService, applicationService } from "../../../services/api";

const ITEMS_PER_PAGE = 6;

export default function AvailableJobs() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, jobsRes] = await Promise.all([
          studentService.getProfile(),
          jobService.getAll()
        ]);
        
        const profile = profileRes.data.data;
        setStudent(profile);

        const rawJobs = jobsRes.data.data || [];
        const mappedJobs = rawJobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company?.name || "Unknown Company",
          companyLogo: job.company?.logo_path
            ? `http://localhost:8000/storage/${job.company.logo_path}`
            : "https://placehold.co/100x100?text=" + encodeURIComponent(job.company?.name || "Job"),
          location: job.location,
          salary: job.salary,
          experience: job.experience,
          skills: job.skills || [],
          status: job.status === "published" ? "Published" : (job.status === "closed" ? "Closed" : "Pending"),
          lastDate: job.last_date,
          eligibleInstitutes: job.institutes?.map((i) => i.id) || [],
          instituteId: job.institutes?.map((i) => i.id) || [],
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

  // Calculate dynamic completion checklist
  const sections = {
    personal: !!(student.email && student.dob && student.gender && student.address),
    academic: !!(student.course && student.branch && student.batch),
    resume: !!(student.resume_url || student.resumeUrl),
    skills: !!(student.skills && student.skills.length > 0)
  };
  const completedCount = Object.values(sections).filter(Boolean).length;
  const profileCompletion = completedCount * 25;

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

  const handleApply = async (job) => {
    if (profileCompletion < 100) {
      toast.error("Please complete your profile and upload your resume before applying.");
      return;
    }
    try {
      await applicationService.apply({ job_id: job.id });
      toast.success(`Applied for ${job.title} at ${job.company}! 🎉`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit application.");
    }
  };

  return (
    <div className="container-lg">
      <PageHeader
        title="Available Jobs"
        subtitle="Placement drives available for your institute"
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Available Jobs" }]}
      />

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search jobs or companies..." />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}>
                <option value="">All Locations</option>
                {locations.map((loc) => <option key={loc}>{loc}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(""); setLocationFilter(""); setPage(1); }}>
                <i className="bi bi-x-lg me-1"></i>Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <p className="text-muted small mb-0"><strong>{filtered.length}</strong> jobs available for your institute</p>
      </div>

      {paginated.length > 0 ? (
        <>
          <div className="row g-4">
            {paginated.map((job) => (
              <div key={job.id} className="col-md-6 col-lg-4">
                <JobCard job={job} showApply onApply={handleApply} />
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
    </div>
  );
}
