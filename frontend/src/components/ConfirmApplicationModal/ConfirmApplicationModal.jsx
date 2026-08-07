import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { studentProfileService, studentService, resumeService } from "../../services/api";
import { getOverallProfileScore } from "../../utils/resumeStorage";

import ResumePreview from "../ResumePreview/ResumePreview";
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

  const missingSkills = cleanJobSkills.filter((js) => {
    const jsLower = js.toLowerCase();
    return !allCandidateSkills.some((cs) => cs.includes(jsLower) || jsLower.includes(cs));
  });

  const skillMatchPercent = cleanJobSkills.length > 0
    ? Math.round((matchedSkills.length / cleanJobSkills.length) * 100)
    : 100;

  const MIN_MATCH_PERCENT = 60;
  const isSkillMatchSufficient = cleanJobSkills.length === 0 || skillMatchPercent >= MIN_MATCH_PERCENT;
  const isSkillMismatch = cleanJobSkills.length > 0 && !isSkillMatchSufficient;
  const isPartialMatchEligible = isSkillMatchSufficient && missingSkills.length > 0 && cleanJobSkills.length > 0;
  const isProfileIncomplete = isSkillMismatch || !hasResume;

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
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable mx-2 mx-sm-auto">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

          {/* Header */}
          <div className="modal-header border-0 bg-primary text-white py-3 px-3 px-sm-4">
            <h6 className="modal-title fw-bold d-flex align-items-center gap-2 small-sm-base text-truncate">
              <i className="bi bi-file-earmark-check-fill flex-shrink-0"></i> Confirm Application Submission
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-3 p-sm-4" style={{ maxHeight: "75vh", overflowY: "auto" }}>

            {/* Job Summary Banner */}
            <div className="p-3 bg-light rounded-3 border mb-3">
              <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
                <div>
                  <h6 className="fw-bold text-dark mb-1 text-break">{job.title}</h6>
                  <p className="text-primary fw-semibold small mb-0">{job.company}</p>
                </div>
                <div className="text-start text-sm-end">
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 fw-semibold me-1 mb-1 d-inline-block text-wrap">
                    {job.salary || "Best in Industry"}
                  </span>
                  <small className="text-muted d-block mt-0 text-wrap">
                    <i className="bi bi-geo-alt me-1"></i>{job.location}
                  </small>
                </div>
              </div>
            </div>

            {/* Skill Match Status Badge Bar */}
            <div className="d-flex align-items-center gap-2 mb-3.5 flex-wrap">
              <span className={`badge ${isSkillMatchSufficient ? "bg-success bg-opacity-10 text-success border border-success" : "bg-danger bg-opacity-10 text-danger border border-danger"} px-3 py-2 fw-bold fs-6 text-wrap text-start lh-base mw-100`}>
                <i className={`bi ${isSkillMatchSufficient ? "bi-check-circle-fill me-1.5 text-success" : "bi-x-circle-fill me-1.5 text-danger"}`}></i>
                {cleanJobSkills.length === 0
                  ? "Skill Match Confirmed ✓ (No Skills Specified for Drive)"
                  : isSkillMatchSufficient
                    ? skillMatchPercent === 100
                      ? "100% Perfect Skill Match Confirmed ✓ (All Required Skills Matched)"
                      : `✓ ${skillMatchPercent}% Skill Match (Min 60% Met — Eligible to Apply)`
                    : `⚠️ ${skillMatchPercent}% Skill Match — Below Min 60% Requirement (${matchedSkills.length}/${cleanJobSkills.length} Skills Matched)`}
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
                            <label className="form-check-label w-100 cursor-pointer text-truncate" htmlFor={`profile_radio_${p.id}`}>
                              <span className="fw-bold text-dark small d-block text-truncate">{p.profile_name}</span>
                              <span className="text-muted small d-block text-truncate" style={{ fontSize: "0.75rem" }}>
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

            {/* Skill Match < 60% Error Alert */}
            {isSkillMismatch ? (
              <div className="alert alert-danger border-0 shadow-sm p-3 p-sm-4 rounded-3 mb-3">
                <div className="d-flex align-items-start gap-2.5">
                  <i className="bi bi-exclamation-octagon-fill fs-3 text-danger me-1 flex-shrink-0"></i>
                  <div className="flex-grow-1 min-w-0">
                    <h6 className="fw-bold text-danger mb-1 fs-6 text-wrap">
                      Application Locked: Minimum 60% Skill Match Required (Current: {skillMatchPercent}%)
                    </h6>
                    <p className="small mb-3 text-dark opacity-90 text-wrap">
                      This placement drive requires at least a <strong>60% skill match</strong> for <strong>{job.title}</strong>. Your profile/resume currently matches <strong>{matchedSkills.length} out of {cleanJobSkills.length} required skills ({skillMatchPercent}%)</strong>.
                    </p>

                    <div className="p-2.5 p-sm-3 bg-white rounded-3 border border-danger border-opacity-25 mb-3">
                      {/* Matched Skills */}
                      {matchedSkills.length > 0 && (
                        <div className="mb-3">
                          <span className="small text-success fw-bold d-block mb-1">
                            <i className="bi bi-check-circle-fill me-1"></i>Matched Skills ({matchedSkills.length}):
                          </span>
                          <div className="d-flex flex-wrap gap-1.5">
                            {matchedSkills.map((s, i) => (
                              <span key={i} className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 text-wrap text-start">
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Skills */}
                      <div>
                        <span className="small text-danger fw-bold d-block mb-1">
                          <i className="bi bi-x-circle-fill me-1"></i>Missing Required Skills ({missingSkills.length}):
                        </span>
                        <div className="d-flex flex-wrap gap-1.5">
                          {missingSkills.map((s, i) => (
                            <span key={i} className="badge bg-danger text-white px-2.5 py-1 fw-bold shadow-sm text-wrap text-start">
                              + {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Link
                        to="/student/resume-builder?step=skills"
                        className="btn btn-danger text-white fw-bold px-3 py-2 shadow-sm d-inline-flex align-items-center gap-2 text-wrap text-start mw-100"
                        onClick={onClose}
                      >
                        <i className="bi bi-pencil-square fs-6 flex-shrink-0"></i>
                        <span>Update Resume in Resume Builder to Add Missing Skills</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Partial Skill Match Warning Banner (>= 60% & < 100%) */}
                {isPartialMatchEligible && (
                  <div className="alert alert-warning border-0 shadow-sm p-3 p-sm-3.5 rounded-3 mb-3">
                    <div className="d-flex align-items-start gap-2.5">
                      <i className="bi bi-exclamation-triangle-fill fs-4 text-warning me-1 flex-shrink-0"></i>
                      <div className="flex-grow-1 min-w-0">
                        <h6 className="fw-bold text-dark mb-1">
                          Eligible to Apply ({skillMatchPercent}% Skill Match)!
                        </h6>
                        <p className="small mb-2 text-dark opacity-90 text-wrap">
                          Great! You meet the minimum 60% skill requirement to submit your application. However, adding the remaining <strong>{missingSkills.length} skill(s)</strong> will further boost your selection score.
                        </p>
                        <div className="d-flex flex-wrap gap-1.5 mb-2">
                          <span className="small text-muted fw-bold me-1">Recommended Skills to Add:</span>
                          {missingSkills.map((s, i) => (
                            <span key={i} className="badge bg-warning bg-opacity-20 text-dark border border-warning px-2 py-0.5 small text-wrap">
                              {s}
                            </span>
                          ))}
                        </div>
                        <Link
                          to="/student/resume-builder?step=skills"
                          className="btn btn-warning btn-sm text-dark fw-bold mt-1 text-wrap d-inline-flex align-items-center gap-1.5"
                          onClick={onClose}
                        >
                          <i className="bi bi-plus-circle me-1"></i>Add Missing Skills in Resume Builder
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ATTACHED RESUME VERIFICATION & PREVIEW CARD ── */}
                <div className="p-3 bg-white border border-success border-opacity-50 rounded-3 mb-3 shadow-sm">
                  <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-start gap-2.5 min-w-0">
                      <div className="rounded-circle bg-success bg-opacity-10 text-success p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                        <i className="bi bi-file-earmark-check-fill fs-5"></i>
                      </div>
                      <div className="min-w-0">
                        <div className="d-flex align-items-center gap-1.5 flex-wrap mb-1">
                          <span className="fw-bold text-dark small">Attached Resume Verified</span>
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5 me-1">
                            ✓ Ready
                          </span>
                          {hasCreatedResume && (
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-0.5 text-uppercase">
                              {templateKey}
                            </span>
                          )}
                        </div>
                        <small className="text-muted text-break d-block" style={{ fontSize: "0.75rem" }}>
                          {hasCreatedResume
                            ? `Master Resume (${templateKey} design) ready for ${activeSelectedProfile?.profile_name}`
                            : `PDF Resume attached for ${activeSelectedProfile?.profile_name}`}
                        </small>
                      </div>
                    </div>

                    <div className="w-100 w-sm-auto mt-1 mt-sm-0">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary fw-bold w-100 w-sm-auto shadow-sm text-nowrap"
                        onClick={() => setShowResumePreview(!showResumePreview)}
                      >
                        <i className={`bi ${showResumePreview ? "bi-eye-slash" : "bi-eye"} me-1.5`}></i>
                        {showResumePreview ? "Hide Preview" : "Preview Resume"}
                      </button>
                    </div>
                  </div>

                  {/* ── EMBEDDED INLINE RESUME PREVIEW PANEL ── */}
                  {showResumePreview && (
                    <div className="mt-3 pt-3 border-top bg-light p-2.5 p-sm-3 rounded-3 border">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                        <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2 small-sm-base">
                          <i className="bi bi-file-earmark-person-fill text-primary"></i> Template Preview ({templateKey.toUpperCase()})
                        </h6>
                        {pdfResumeUrl && (
                          <a href={pdfResumeUrl} target="_blank" rel="noreferrer" className="btn btn-xs btn-outline-primary fw-semibold">
                            <i className="bi bi-box-arrow-up-right me-1"></i>Open PDF
                          </a>
                        )}
                      </div>

                      {hasCreatedResume && resumeContent && (
                        <div className="rounded-3 border shadow-sm text-dark overflow-hidden" style={{ height: "450px" }}>
                          <ResumePreview resume={{ ...resumeContent, settings: resumeContent.settings || { template: templateKey } }} />
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

                <div className="p-3 bg-light rounded-3 text-muted small border text-wrap">
                  <i className="bi bi-shield-check text-success me-1"></i>
                  By clicking <strong>Confirm & Submit</strong>, your profile <strong>{activeSelectedProfile?.profile_name}</strong> and verified resume will be submitted to <strong>{job.company}</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-light border-0 py-3 px-3 px-sm-4 d-flex align-items-center justify-content-end flex-wrap gap-2">
            <button type="button" className="btn btn-secondary btn-sm px-3" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <Link to="/student/profile" className="btn btn-outline-primary btn-sm px-3" onClick={onClose}>
              <i className="bi bi-pencil me-1"></i>Edit Profile
            </Link>
            {(() => {
              const rawDate = job?.lastDate || job?.last_date || job?.deadline;
              const isDeadlinePassed = (() => {
                if (!rawDate || rawDate === "N/A") return false;
                const deadlineDate = new Date(rawDate);
                if (isNaN(deadlineDate.getTime())) return false;
                deadlineDate.setHours(23, 59, 59, 999);
                return new Date() > deadlineDate;
              })();

              if (isDeadlinePassed) {
                return (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm fw-bold px-3 px-sm-4 cursor-not-allowed text-nowrap"
                    disabled
                    title="Application Disabled: Application deadline has passed"
                  >
                    <i className="bi bi-clock-history me-1"></i>Application Deadline Passed (Locked)
                  </button>
                );
              }

              if (!isProfileIncomplete) {
                return (
                  <button
                    type="button"
                    className="btn btn-success btn-sm fw-bold px-3 px-sm-4 text-nowrap"
                    onClick={handleConfirm}
                    disabled={submitting || loadingProfiles || loadingSelectedProfile}
                  >
                    {submitting ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</>
                    ) : (
                      <><i className="bi bi-send-fill me-1"></i>Confirm & Submit Application</>
                    )}
                  </button>
                );
              }

              return (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm fw-bold px-3 px-sm-4 cursor-not-allowed text-nowrap"
                  disabled
                  title="Application Disabled: Minimum 60% skill match required"
                >
                  <i className="bi bi-lock-fill me-1"></i>Confirm & Submit Application (Locked)
                </button>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
}
