import { useState, useEffect } from "react";
import JobCard from "../../components/JobCard/JobCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import EmptyState from "../../components/EmptyState/EmptyState";
import Pagination from "../../components/Pagination/Pagination";
import { jobService } from "../../services/api";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 6;

const statusMap = {
  published: "Published",
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  closed: "Closed"
};

export default function PlacementDrives() {
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await jobService.getAll();
        const rawJobs = res.data.data || [];
        const mapped = rawJobs.map((job) => ({
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
          status: statusMap[job.status] || "Published",
          lastDate: job.last_date,
        }));
        setJobsList(mapped);
      } catch (err) {
        console.error("Failed to fetch public drives", err);
        toast.error("Failed to load public placement drives.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const locations = [...new Set(jobsList.map((j) => j.location))];

  const filtered = jobsList.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    const matchLocation = locationFilter ? j.location === locationFilter : true;
    const matchStatus = statusFilter ? j.status === statusFilter : true;
    return matchSearch && matchLocation && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  if (loading) {
    return (
      <div className="text-center py-5" style={{ height: "400px" }}>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading placement drives...
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="inner-page-hero text-white py-5">
        <div className="container py-3">
          <h1 className="display-5 fw-bold">Placement Drives</h1>
          <p className="lead text-white-75 mb-0">Explore opportunities from top companies</p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="row g-3 align-items-end">
                <div className="col-md-5">
                  <label className="form-label small fw-medium mb-1">Search</label>
                  <SearchBar
                    value={search}
                    onChange={handleSearch}
                    placeholder="Search by job title or company..."
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-medium mb-1">Location</label>
                  <select
                    className="form-select"
                    value={locationFilter}
                    onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc) => <option key={loc}>{loc}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-medium mb-1">Status</label>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  >
                    <option value="">All Status</option>
                    <option>Published</option>
                    <option>Approved</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div className="col-md-1">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => { setSearch(""); setLocationFilter(""); setStatusFilter(""); setPage(1); }}
                    title="Clear filters"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <p className="text-muted small mb-0">
              Showing <strong>{paginated.length}</strong> of <strong>{filtered.length}</strong> drives
            </p>
          </div>

          {/* Grid */}
          {paginated.length > 0 ? (
            <>
              <div className="row g-4">
                {paginated.map((job) => (
                  <div key={job.id} className="col-md-6 col-lg-4">
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
              <div className="mt-4 d-flex justify-content-center">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          ) : (
            <EmptyState
              icon="bi-briefcase"
              title="No placement drives found"
              description="Try adjusting your search or filter criteria."
            />
          )}
        </div>
      </section>
    </>
  );
}
