import { useState } from "react";
import { jobs, currentStudent } from "../../../utils/mockData";
import { getStudents } from "../../../utils/studentStorage";
import JobCard from "../../../components/JobCard/JobCard";
import SearchBar from "../../../components/SearchBar/SearchBar";
import EmptyState from "../../../components/EmptyState/EmptyState";
import Pagination from "../../../components/Pagination/Pagination";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";

const ITEMS_PER_PAGE = 6;

export default function AvailableJobs() {
  const { user } = useAuth();
  const student = { ...currentStudent, ...user };

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);

  const eligibleJobs = jobs.filter(
    (j) => j.status === "Published" && j.eligibleInstitutes.includes(student.instituteId)
  );

  const locations = [...new Set(eligibleJobs.map((j) => j.location))];

  const filtered = eligibleJobs.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    const matchLocation = locationFilter ? j.location === locationFilter : true;
    return matchSearch && matchLocation;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleApply = (job) => {
    const allStudents = getStudents();
    const current = allStudents.find((s) => s.id === user?.id) || { ...currentStudent, ...user };
    if (current.profileCompletion < 100) {
      toast.error("Please complete your profile and upload your resume before applying.");
      return;
    }
    toast.success(`Applied for ${job.title} at ${job.company}! 🎉`);
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
