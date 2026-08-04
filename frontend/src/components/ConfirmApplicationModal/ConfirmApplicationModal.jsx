import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { studentProfileService, studentService, resumeService } from "../../services/api";
import { getOverallProfileScore } from "../../utils/resumeStorage";

import ModernTemplate from "../ResumeTemplates/ModernTemplate";
import ProfessionalTemplate from "../ResumeTemplates/ProfessionalTemplate";
import MinimalTemplate from "../ResumeTemplates/MinimalTemplate";
import ExecutiveTemplate from "../ResumeTemplates/ExecutiveTemplate";
import StudentTemplate from "../ResumeTemplates/StudentTemplate";

export default function ConfirmApplicationModal({
  job,
  student,
  onConfirm,
  onClose,
  submitting
}) {
  const initialList = Array.isArray(student?.career_profiles)
    ? student.career_profiles
    : Array.isArray(student?.profiles)
      ? student.profiles
      : [];
  const savedId = typeof window !== "undefined" ? localStorage.getItem("apms_active_profile_id") : null;
  const initialSelected = initialList.find((p) => String(p.id) === String(savedId)) || initialList.find((p) => p.is_default) || initialList[0] || null;

  // Synchronous cached data for 0ms instant display
  const localResumeData = (() => {
    try {
      const raw = localStorage.getItem("apms_resume_builder_draft") || localStorage.getItem("apms_resume_data") || localStorage.getItem("apms_resumes");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed[0] : parsed;
    } catch (e) {
      return null;
    }
  })();

  const [profiles, setProfiles] = useState(initialList);
  const [selectedProfileId, setSelectedProfileId] = useState(initialSelected?.id || null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [selectedProfileDetails, setSelectedProfileDetails] = useState(() => student || initialSelected || null);
  const [resumesList, setResumesList] = useState(() => localResumeData ? [{ id: 1, content: localResumeData }] : []);
  const [loadingSelectedProfile, setLoadingSelectedProfile] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);

  // Synchronize student prop when changed
  useEffect(() => {
    if (student && !selectedProfileDetails) {
      setSelectedProfileDetails(student);
    }
  }, [student]);

  // Load profiles on mount (non-blocking)
  useEffect(() => {
    let isMounted = true;
    const fetchProfiles = async () => {
      try {
        if (profiles.length === 0) setLoadingProfiles(true);
        const res = await studentProfileService.getAll().catch(() => ({ data: { data: [] } }));
        if (!isMounted) return;

        const list = res.data?.data || initialList;
        if (list.length > 0) {
          setProfiles(list);
          const defaultSelected = list.find((p) => String(p.id) === String(savedId)) || list.find((p) => p.is_default) || list[0];
          if (defaultSelected && !selectedProfileId) {
            setSelectedProfileId(defaultSelected.id);
          }
        }
      } catch (err) {
        console.error("Failed to load profiles for job application", err);
      } finally {
        if (isMounted) setLoadingProfiles(false);
      }
    };

    fetchProfiles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Whenever selectedProfileId changes, revalidate details & resumes silently in background
  useEffect(() => {
    if (!selectedProfileId) return;

    let isMounted = true;
    const fetchSelectedDetails = async () => {
      try {
        const [profRes, resRes] = await Promise.all([
          studentService.getProfile({ profile_id: selectedProfileId }).catch(() => ({ data: { data: null } })),
          resumeService.getAll({ profile_id: selectedProfileId }).catch(() => ({ data: { data: [] } })),
        ]);

        if (!isMounted) return;
        if (profRes.data?.data) {
          setSelectedProfileDetails(profRes.data.data);
        }
        if (Array.isArray(resRes.data?.data) && resRes.data.data.length > 0) {
          setResumesList(resRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch selected profile details", err);
      }
    };

    fetchSelectedDetails();
    return () => {
      isMounted = false;
    };
  }, [selectedProfileId]);

  if (!job || !student) return null;

  const activeSelectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];
  const primaryProfile = profiles.find((p) => p.is_default) || profiles[0];

  const hasUploadedResume = !!(selectedProfileDetails?.resume_url || selectedProfileDetails?.resume_path);
  const activeMasterResume = resumesList.length > 0 ? resumesList[0] : null;
  const hasCreatedResume = resumesList.length > 0 || !!(selectedProfileDetails?.has_created_resume);
  const hasResume = hasUploadedResume || hasCreatedResume;

  const pdfResumeUrl = selectedProfileDetails?.resume_url || null;
  const resumeContent = activeMasterResume?.content || {};
  const templateKey = (resumeContent.settings?.template || "modern").toLowerCase();

  const overallScore = getOverallProfileScore(selectedProfileDetails || student, selectedProfileId);
  const isScoreTooLow = overallScore < 80;

  const eduList = Array.isArray(resumeContent.education) ? resumeContent.education : [];
  const firstEdu = eduList.length > 0 ? eduList[0] : null;

  const builderCourse = firstEdu?.degree || firstEdu?.course || "";
  const builderBranch = firstEdu?.field || firstEdu?.branch || firstEdu?.specialization || "";
  const builderBatch = firstEdu?.year || firstEdu?.batch || firstEdu?.passingYear || "";
  const builderCgpa = firstEdu?.gpa || firstEdu?.cgpa || firstEdu?.percentage || "";

  const currCourse = builderCourse || selectedProfileDetails?.course || student.course || primaryProfile?.course || "";
  const currBranch = builderBranch || selectedProfileDetails?.branch || student.branch || primaryProfile?.branch || "";
  const currBatch = builderBatch || selectedProfileDetails?.batch || selectedProfileDetails?.passing_year || student.batch || student.passing_year || primaryProfile?.batch || "2026";
  const currCgpa = builderCgpa || selectedProfileDetails?.cgpa || student.cgpa || primaryProfile?.cgpa || "8.5";

  // Calculate accurate completion score (up to 100%)
  const calculatedCompletion = (() => {
    let score = 0;
    if (student?.name && (student?.mobile || student?.phone)) score += 25;
    if (currCourse && currBranch) score += 25;
    if (hasResume) score += 25;
    if (currCgpa || (student?.skills && student.skills.length > 0)) score += 25;
    return score;
  })();

  const completionPercent = selectedProfileDetails?.profile_completion && selectedProfileDetails.profile_completion > calculatedCompletion
    ? selectedProfileDetails.profile_completion
    : calculatedCompletion;

  // Skill match calculation across profile and resume builder
  const extractSkillStrings = (data) => {
    if (!data) return [];
    if (typeof data === "string") {
      return data.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (Array.isArray(data)) {
      return data.flatMap((item) => extractSkillStrings(item));
    }
    if (typeof data === "object" && data !== null) {
      if (typeof data.name === "string") return extractSkillStrings(data.name);
      if (typeof data.skill === "string") return extractSkillStrings(data.skill);
      if (typeof data.title === "string") return extractSkillStrings(data.title);
      if (typeof data.value === "string") return extractSkillStrings(data.value);

      return Object.values(data).flatMap((val) => extractSkillStrings(val));
    }
    return [];
  };

  const studentSkillsList = extractSkillStrings(student?.skills || student?.technicalSkills);
  const profileSkillsList = extractSkillStrings(selectedProfileDetails?.skills);
  const resumeSkillsList = extractSkillStrings(resumeContent?.skills || resumeContent?.technicalSkills || resumeContent?.skillsList);

  const rawCandidateSkills = [...studentSkillsList, ...profileSkillsList, ...resumeSkillsList].filter(Boolean);
  const allCandidateSkills = [...new Set(rawCandidateSkills.map((s) => s.toLowerCase()))];

  const rawJobSkills = Array.isArray(job.skills)
    ? job.skills.flatMap((s) => (typeof s === "string" ? s.split(",") : []))
    : (typeof job.skills === "string" ? job.skills.split(",") : []);
  const cleanJobSkills = [...new Set(rawJobSkills.map((s) => s.trim()).filter(Boolean))];

  const matchedSkills = cleanJobSkills.filter((js) => {
    const jsLower = js.toLowerCase();
    return allCandidateSkills.some((cs) => cs.includes(jsLower) || jsLower.includes(cs));
  });

  const skillMatchPercent = cleanJobSkills.length > 0
    ? Math.round((matchedSkills.length / cleanJobSkills.length) * 100)
    : 100;

  // Degree eligibility matching (handles specific degrees, "Other", "All Streams", "Any Graduate")
  const isDegreeEligible = (() => {
    if (!job.eligibility) return true;
    const req = job.eligibility.toLowerCase().trim();
    const candidateDeg = (currCourse || "").toLowerCase().trim();

    // 1. If company specified "other", "all", "any", "open", or "graduate", all candidates qualify
    if (req.includes("other") || req.includes("all") || req.includes("any") || req.includes("open") || req.includes("graduate")) {
      return true;
    }

    if (!candidateDeg) return true;

    // 2. Tokenized match (e.g., "b.tech, bca, mca, b.sc, diploma")
    const allowedTokens = req.split(/[,/|]/).map(t => t.trim().replace(/[^a-z0-9]/g, "")).filter(Boolean);
    const candidateToken = candidateDeg.replace(/[^a-z0-9]/g, "");

    if (allowedTokens.length === 0) return true;

    return allowedTokens.some(token => candidateToken.includes(token) || token.includes(candidateToken));
  })();

  const incompleteFields = [];
  if (!currCourse) incompleteFields.push("Course");
  if (!currBranch) incompleteFields.push("Branch");
  if (!currBatch) incompleteFields.push("Batch");

  const isSkillTooLow = cleanJobSkills.length > 0 && matchedSkills.length === 0;
  const isProfileIncomplete = isScoreTooLow || !hasResume || !isDegreeEligible || isSkillTooLow;

  const handleConfirm = () => {
    onConfirm({ student_profile_id: selectedProfileId });
  };

  const renderTemplateComponent = () => {
    const resData = resumeContent || {};
    switch (templateKey) {
      case "professional":
        return <ProfessionalTemplate resume={resData} />;
      case "minimal":
        return <MinimalTemplate resume={resData} />;
      case "executive":
        return <ExecutiveTemplate resume={resData} />;
      case "student":
        return <StudentTemplate resume={resData} />;
      case "modern":
      default:
        return <ModernTemplate resume={resData} />;
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.6)", zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

          {/* Header */}
          <div className="modal-header border-0 bg-primary text-white py-3 px-4">
            <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-check-fill"></i> Confirm Application Submission
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4" style={{ maxHeight: "75vh", overflowY: "auto" }}>

            {/* Job Summary Banner */}
            <div className="p-3 bg-light rounded-3 border mb-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <h6 className="fw-bold text-dark mb-1">{job.title}</h6>
                  <p className="text-primary fw-semibold small mb-0">{job.company}</p>
                </div>
                <div className="text-end">
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 fw-semibold me-2">
                    {job.salary || "Best in Industry"}
                  </span>
                  <small className="text-muted d-block mt-1">
                    <i className="bi bi-geo-alt me-1"></i>{job.location}
                  </small>
                </div>
              </div>
            </div>

            {/* ATS Match & Eligibility Badge Bar */}
            <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
              <span className={`badge ${skillMatchPercent >= 75 ? "bg-success bg-opacity-10 text-success border border-success" : "bg-warning bg-opacity-10 text-dark border border-warning"} px-3 py-1.5 fw-bold`}>
                <i className="bi bi-cpu me-1.5"></i>{skillMatchPercent}% Skill Match ({matchedSkills.length}/{cleanJobSkills.length || 1} Skills)
              </span>
              <span className={`badge ${isDegreeEligible ? "bg-primary bg-opacity-10 text-primary border border-primary" : "bg-warning bg-opacity-10 text-dark border border-warning"} px-3 py-1.5 fw-semibold`}>
                <i className="bi bi-mortarboard me-1.5"></i>{isDegreeEligible ? "Degree Eligible ✓" : "Degree Under Review"}
              </span>
              <span className={`badge ${overallScore >= 80 ? "bg-success bg-opacity-10 text-success border border-success" : "bg-danger bg-opacity-10 text-danger border border-danger"} px-3 py-1.5 fw-bold`}>
                <i className="bi bi-speedometer2 me-1.5"></i>ATS Score: {overallScore}% ({overallScore >= 80 ? "Unlocked" : "Minimum 80% Required"})
              </span>
            </div>

            {/* Profile Selection Radio List */}
            {profiles.length > 0 && (
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: "0.05em" }}>
                  1. Select Career Profile to Apply With
                </label>
                <div className="row g-2">
                  {profiles.map((p) => {
                    const isSelected = p.id === selectedProfileId;
                    return (
                      <div key={p.id} className="col-md-6">
                        <div
                          className={`p-3 rounded-3 border cursor-pointer transition-all ${isSelected
                              ? "border-primary bg-primary bg-opacity-10 shadow-sm"
                              : "bg-white hover-bg-light"
                            }`}
                          onClick={() => setSelectedProfileId(p.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="form-check d-flex align-items-center gap-2 mb-0">
                            <input
                              className="form-check-input flex-shrink-0"
                              type="radio"
                              name="applyProfileChoice"
                              id={`profile_radio_${p.id}`}
                              checked={isSelected}
                              onChange={() => setSelectedProfileId(p.id)}
                            />
                            <label className="form-check-label w-100 cursor-pointer" htmlFor={`profile_radio_${p.id}`}>
                              <span className="fw-bold text-dark small d-block">{p.profile_name}</span>
                              <span className="text-muted small d-block" style={{ fontSize: "0.75rem" }}>
                                {p.professional_title || "Career Profile"}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Profile / Eligibility Incomplete Alert */}
            {isProfileIncomplete ? (
              <div className="alert alert-warning border-0 shadow-sm p-4 rounded-3 mb-3">
                <div className="d-flex align-items-start gap-3">
                  <i className="bi bi-exclamation-triangle-fill fs-3 text-warning me-1"></i>
                  <div className="flex-grow-1">
                    <h6 className="fw-bold text-dark mb-1">
                      {!isDegreeEligible
                        ? "Application Locked: Degree Eligibility Mismatch"
                        : isSkillTooLow
                          ? "Application Locked: Required Skills Missing in Resume"
                          : isScoreTooLow
                            ? `Application Locked: Profile/Resume Score Must Be At Least 80% (Current: ${overallScore}%)`
                            : "Application Locked: Incomplete Profile / Missing Resume"}
                    </h6>
                    <p className="small mb-3 text-dark opacity-75">
                      To submit your application for <strong>{job.title}</strong>, your degree must match job eligibility, your resume must include required skills, and your ATS score must be at least <strong>80%</strong>.
                    </p>

                    {!isDegreeEligible && (
                      <div className="p-3 bg-white rounded-3 border mb-3">
                        <span className="small text-danger fw-bold d-block mb-1">
                          <i className="bi bi-mortarboard-fill me-1"></i>Degree Mismatch
                        </span>
                        <small className="text-muted d-block mb-2">
                          This placement drive requires degrees in <strong>{job.eligibility}</strong>. Your current degree is <strong>{currCourse || "Not Specified"}</strong>.
                        </small>
                        <Link to="/student/profile" className="btn btn-warning btn-sm text-dark fw-bold" onClick={onClose}>
                          <i className="bi bi-pencil me-1"></i>Update Profile Degree / Course
                        </Link>
                      </div>
                    )}

                    {isSkillTooLow && (
                      <div className="p-3 bg-white rounded-3 border mb-3">
                        <span className="small text-danger fw-bold d-block mb-1">
                          <i className="bi bi-cpu-fill me-1"></i>Required Skills Missing (0/{cleanJobSkills.length} Matched)
                        </span>
                        <small className="text-muted d-block mb-2">
                          Your resume does not list any of the required job skills (<strong>{cleanJobSkills.join(", ")}</strong>). Add these skills in the Resume Builder to qualify for this role.
                        </small>
                        <Link to="/student/resume-builder" className="btn btn-warning btn-sm text-dark fw-bold" onClick={onClose}>
                          <i className="bi bi-pencil-square me-1"></i>Add Required Skills in Resume Builder
                        </Link>
                      </div>
                    )}

                    {isScoreTooLow && (
                      <div className="p-3 bg-white rounded-3 border mb-3">
                        <span className="small text-danger fw-bold d-block mb-1">
                          <i className="bi bi-speedometer2 me-1"></i>Minimum 80% Score Required
                        </span>
                        <small className="text-muted d-block mb-2">
                          Update your details in the Resume Builder (experience, projects, skills, education, professional summary) to reach an ATS score of 80%+ and unlock applications.
                        </small>
                        <div className="d-flex gap-2 flex-wrap">
                          <Link to="/student/resume-builder" className="btn btn-warning btn-sm text-dark fw-bold" onClick={onClose}>
                            <i className="bi bi-pencil-square me-1"></i>Open Resume Builder & Boost Score ({overallScore}%)
                          </Link>
                        </div>
                      </div>
                    )}

                    {!hasResume && !isScoreTooLow && (
                      <div className="p-3 bg-white rounded-3 border mb-3">
                        <span className="small text-danger fw-bold d-block mb-1">
                          <i className="bi bi-x-circle-fill me-1"></i>No Resume Found for "{activeSelectedProfile?.profile_name}"
                        </span>
                        <small className="text-muted d-block mb-2">
                          You haven't built or uploaded a resume for this career profile yet. Create a resume now to enable job applications.
                        </small>
                        <div className="d-flex gap-2 flex-wrap">
                          <Link to="/student/resume-builder" className="btn btn-warning btn-sm text-dark fw-bold" onClick={onClose}>
                            <i className="bi bi-magic me-1"></i>Build Resume Now
                          </Link>
                          <Link to="/student/profile" className="btn btn-outline-primary btn-sm fw-semibold" onClick={onClose}>
                            <i className="bi bi-upload me-1"></i>Upload PDF Resume
                          </Link>
                        </div>
                      </div>
                    )}

                    {incompleteFields && incompleteFields.length > 0 && (
                      <Link to="/student/profile" className="btn btn-warning btn-sm fw-semibold me-2" onClick={onClose}>
                        <i className="bi bi-person-fill-gear me-1"></i>Complete Missing Profile Fields ({incompleteFields.join(", ")})
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* ── ATTACHED RESUME VERIFICATION & PREVIEW CARD ── */}
                <div className="p-3 bg-white border border-success border-opacity-50 rounded-3 mb-3 shadow-sm">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-success bg-opacity-10 text-success p-2.5 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                        <i className="bi bi-file-earmark-check-fill fs-4"></i>
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold text-dark">Attached Resume Verified</span>
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5 me-2">
                            ✓ Ready
                          </span>
                          {hasCreatedResume && (
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-0.5 text-uppercase">
                              Template: {templateKey}
                            </span>
                          )}
                        </div>
                        <small className="text-muted">
                          {hasCreatedResume
                            ? `Master Resume (${templateKey} design) ready for ${activeSelectedProfile?.profile_name}`
                            : `PDF Resume attached for ${activeSelectedProfile?.profile_name}`}
                        </small>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary fw-bold px-3 shadow-sm"
                        onClick={() => setShowResumePreview(!showResumePreview)}
                      >
                        <i className={`bi ${showResumePreview ? "bi-eye-slash" : "bi-eye"} me-1.5`}></i>
                        {showResumePreview ? "Hide Resume Preview" : "Preview Resume Before Applying"}
                      </button>
                    </div>
                  </div>

                  {/* ── EMBEDDED INLINE RESUME PREVIEW PANEL ── */}
                  {showResumePreview && (
                    <div className="mt-3 pt-3 border-top bg-light p-3 rounded-3 border">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                          <i className="bi bi-file-earmark-person-fill text-primary"></i> Live Template Preview ({templateKey.toUpperCase()})
                        </h6>
                        {pdfResumeUrl && (
                          <a href={pdfResumeUrl} target="_blank" rel="noreferrer" className="btn btn-xs btn-outline-primary fw-semibold">
                            <i className="bi bi-box-arrow-up-right me-1"></i>Open PDF in New Window
                          </a>
                        )}
                      </div>

                      {hasCreatedResume && resumeContent && (
                        <div className="bg-white p-2 rounded-3 border shadow-sm text-dark overflow-auto" style={{ maxHeight: "450px" }}>
                          {renderTemplateComponent()}
                        </div>
                      )}

                      {pdfResumeUrl && !hasCreatedResume && (
                        <div className="rounded-3 overflow-hidden border bg-white" style={{ height: "350px" }}>
                          <iframe
                            src={pdfResumeUrl}
                            title="Attached PDF Resume Preview"
                            className="w-100 h-100 border-0"
                          ></iframe>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-light rounded-3 text-muted small border">
                  <i className="bi bi-shield-check text-success me-1"></i>
                  By clicking <strong>Confirm & Submit</strong>, your profile <strong>{activeSelectedProfile?.profile_name}</strong> and verified resume will be submitted to <strong>{job.company}</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-light border-0 py-3 px-4">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <Link to="/student/profile" className="btn btn-outline-primary" onClick={onClose}>
              <i className="bi bi-pencil me-1"></i>Edit Profile
            </Link>
            {!isProfileIncomplete ? (
              <button
                type="button"
                className="btn btn-success fw-semibold px-4"
                onClick={handleConfirm}
                disabled={submitting || loadingProfiles || loadingSelectedProfile}
              >
                {submitting ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</>
                ) : (
                  <><i className="bi bi-send-fill me-1"></i>Confirm & Submit Application</>
                )}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary fw-semibold px-4 cursor-not-allowed"
                disabled
                title="Application Disabled: Eligibility or skill requirements not met"
              >
                <i className="bi bi-lock-fill me-1"></i>Confirm & Submit Application (Locked)
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
