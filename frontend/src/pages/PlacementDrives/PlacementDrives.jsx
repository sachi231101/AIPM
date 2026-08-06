import { useState } from "react";
import JobCard from "../../components/JobCard/JobCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import EmptyState from "../../components/EmptyState/EmptyState";
import Pagination from "../../components/Pagination/Pagination";
import { SkeletonGrid } from "../../components/Skeleton/Skeleton";
import { jobService } from "../../services/api";
import { useCachedData } from "../../hooks/useCachedData";
import { toast } from "react-toastify";

import { getCompanyLogo } from "../../utils/logoHelper";

const ITEMS_PER_PAGE = 6;

const statusMap = {
  published: "Published",
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  closed: "Closed"
};

export default function PlacementDrives() {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data: rawJobsResponse, loading } = useCachedData(
    "public_jobs",
    jobService.getAll
  );

  const rawJobs = rawJobsResponse ? (Array.isArray(rawJobsResponse.data) ? rawJobsResponse.data : (rawJobsResponse.data?.data || [])) : [];
  const jobsList = rawJobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company?.name || "Unknown Company",
    companyLogo: getCompanyLogo(job.company?.logo_path, job.company?.name),
    location: job.location,
    employmentType: job.employment_type || job.employmentType || "Full Time",
    salary: job.salary,
    experience: job.experience,
    skills: job.skills || [],
    status: statusMap[job.status] || "Published",
    lastDate: job.last_date,
  }));

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
      <div className="container py-5">
        <SkeletonGrid count={6} />
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="inner-page-hero text-white py-3 py-md-5">
        <div className="container py-2 py-md-3">
          <h1 className="display-5 fw-bold">Placement Drives</h1>
          <p className="lead text-white-75 mb-0">Explore opportunities from top companies</p>
        </div>
      </section>

      <section className="py-3 py-md-5">
        <div className="container">
          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3 p-md-4">
              <div className="row g-2 g-md-3 align-items-end">
                <div className="col-12 col-md-5">
                  <label className="form-label small fw-medium mb-1">Search</label>
                  <SearchBar
                    value={search}
                    onChange={handleSearch}
                    placeholder="Search by job title or company..."
                  />
                </div>
                <div className="col-6 col-md-3">
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
                <div className="col-6 col-md-3">
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
                <div className="col-12 col-md-1">
                  {(search || locationFilter || statusFilter) ? (
                    <button
                      className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-1"
                      onClick={() => { setSearch(""); setLocationFilter(""); setStatusFilter(""); setPage(1); }}
                      title="Clear filters"
                    >
                      <i className="bi bi-x-circle-fill"></i>
                      <span className="d-md-none small">Clear Filters</span>
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
                      disabled
                      title="No filters applied"
                    >
                      <i className="bi bi-funnel"></i>
                      <span className="d-md-none small">Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filters Summary Bar */}
              {(search || locationFilter || statusFilter) && (
                <div className="d-flex align-items-center gap-2 flex-wrap mt-3 pt-3 border-top">
                  <span className="small text-muted fw-medium me-1">Active Filters:</span>
                  {search && (
                    <span className="badge bg-primary bg-opacity-10 text-primary fw-normal py-2 px-3 rounded-pill d-inline-flex align-items-center gap-2">
                      Search: "{search}"
                      <i className="bi bi-x-lg cursor-pointer ms-1" onClick={() => setSearch("")}></i>
                    </span>
                  )}
                  {locationFilter && (
                    <span className="badge bg-info bg-opacity-10 text-info fw-normal py-2 px-3 rounded-pill d-inline-flex align-items-center gap-2">
                      Location: {locationFilter}
                      <i className="bi bi-x-lg cursor-pointer ms-1" onClick={() => setLocationFilter("")}></i>
                    </span>
                  )}
                  {statusFilter && (
                    <span className="badge bg-success bg-opacity-10 text-success fw-normal py-2 px-3 rounded-pill d-inline-flex align-items-center gap-2">
                      Status: {statusFilter}
                      <i className="bi bi-x-lg cursor-pointer ms-1" onClick={() => setStatusFilter("")}></i>
                    </span>
                  )}
                  <button 
                    className="btn btn-link btn-sm text-decoration-none text-danger p-0 ms-auto small"
                    onClick={() => { setSearch(""); setLocationFilter(""); setStatusFilter(""); setPage(1); }}
                  >
                    Clear All
                  </button>
                </div>
              )}
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
