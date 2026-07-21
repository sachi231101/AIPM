import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { studentService, resumeService } from "../../../services/api";
import {
  getAllResumes,
  saveResume,
  createDefaultResume,
  mergeProfileIntoResume,
  createNewResume,
  duplicateResume,
  deleteResume,
  calculateATSMetrics,
  aiGenerateSummary,
  aiImproveText,
  aiShortenText,
  aiAtsOptimize,
  aiGenerateCoverLetter,
} from "../../../utils/resumeStorage";

import PageHeader from "../../../components/PageHeader/PageHeader";
import ResumePreview from "../../../components/ResumePreview/ResumePreview";
import TemplateGalleryModal, { TEMPLATE_DEFINITIONS, RealResumeThumbnail } from "../../../components/TemplateGalleryModal/TemplateGalleryModal";

const STEP_NAMES = [
  "Personal Information",
  "Professional Summary",
  "Education",
  "Experience",
  "Projects",
  "Skills",
  "Certifications",
  "Achievements",
  "Languages",
  "Resume Settings",
  "Review & Generate",
];

const SKILL_CATEGORIES = [
  { key: "accountingFinance", label: "Accounting, Tally & Finance" },
  { key: "officeTools", label: "Office & Software Tools (Excel, Word, etc.)" },
  { key: "technical", label: "Technical & IT Skills" },
  { key: "programmingLanguages", label: "Programming & Coding" },
  { key: "frontend", label: "Frontend & Web Technologies" },
  { key: "backend", label: "Backend & Databases" },
  { key: "businessManagement", label: "Business, Sales & Administration" },
  { key: "designCreative", label: "Design & Digital Media" },
  { key: "tools", label: "Software Tools & Platforms" },
  { key: "softSkills", label: "Soft Skills & Interpersonal" },
  { key: "otherSkills", label: "Other / Custom Skills" },
];

const POPULAR_SKILLS_SUGGESTIONS = [
  { name: "JavaScript", category: "programmingLanguages" },
  { name: "React", category: "frontend" },
  { name: "Node.js", category: "backend" },
  { name: "Python", category: "programmingLanguages" },
  { name: "HTML5 & CSS3", category: "frontend" },
  { name: "Git & GitHub", category: "tools" },
  { name: "Java", category: "programmingLanguages" },
  { name: "SQL", category: "backend" },
  { name: "React.js", category: "frontend" },
  { name: "Digital Marketing", category: "businessManagement" },
  { name: "Graphic Design (Canva)", category: "designCreative" },
  { name: "Communication", category: "softSkills" },
  { name: "Problem Solving", category: "softSkills" },
];

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [activeResume, setActiveResume] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 to 10
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [newSkillInput, setNewSkillInput] = useState({});

  // Fetch student profile & pre-fill single Master Resume
  useEffect(() => {
    let profileData = {};
    studentService.getProfile()
      .then((pres) => {
        profileData = pres.data?.data || {};
        return resumeService.getAll();
      })
      .then((res) => {
        const dbResumes = res.data?.data || [];
        if (dbResumes.length > 0) {
          const first = dbResumes[0].content || {};
          // Merge profile info into existing resume so missing fields get pre-filled
          const merged = mergeProfileIntoResume(first, profileData);
          const masterRes = {
            ...merged,
            id: dbResumes[0].resume_key || "master",
            title: "Master Resume",
          };
          setActiveResume(masterRes);
          saveResume(masterRes, user?.id);
        } else {
          // 0 resumes in DB -> create single default Master Resume pre-filled with profile data
          const freshResume = createDefaultResume(profileData);
          freshResume.id = "master";
          freshResume.title = "Master Resume";
          setActiveResume(freshResume);
          saveResume(freshResume, user?.id);
          resumeService.save({
            resume_key: "master",
            title: "Master Resume",
            content: freshResume,
          }).catch(() => {});
        }
      })
      .catch(() => {
        const fallback = createDefaultResume({});
        fallback.id = "master";
        fallback.title = "Master Resume";
        setActiveResume(fallback);
      });
  }, [user?.id]);

  const handleSyncProfile = async () => {
    try {
      const pres = await studentService.getProfile();
      const pdata = pres.data?.data || {};
      const merged = mergeProfileIntoResume(activeResume, pdata);
      handleUpdateResume(merged);
      toast.success("Pre-filled resume with your latest profile information! 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch profile information.");
    }
  };

  // Autosave when activeResume changes (syncs to both user-scoped localStorage & database)
  const handleUpdateResume = (updatedObj) => {
    setActiveResume(updatedObj);
    saveResume(updatedObj, user?.id);

    // Save to Database API
    resumeService.save({
      resume_key: updatedObj.id || "master",
      title: "Master Resume",
      content: updatedObj,
    }).catch((err) => console.warn("Database sync notice", err));
  };

  if (!activeResume) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  const atsMetrics = calculateATSMetrics(activeResume);

  // Field change helper for Personal Info
  const handlePersonalChange = (field, val) => {
    const updated = {
      ...activeResume,
      personal: { ...activeResume.personal, [field]: val },
    };
    handleUpdateResume(updated);
  };

  // Education list handlers
  const handleAddEdu = () => {
    const newEdu = {
      id: "edu_" + Date.now(),
      degree: "B.Tech",
      specialization: "Computer Science",
      college: "Aadya Institute",
      university: "Bangalore University",
      location: "Bengaluru",
      startYear: "2021",
      endYear: "2025",
      cgpa: "8.5",
      percentage: "85%",
      currentlyStudying: true,
    };
    handleUpdateResume({ ...activeResume, education: [...(activeResume.education || []), newEdu] });
  };

  const handleEduChange = (id, field, val) => {
    const list = (activeResume.education || []).map((e) => (e.id === id ? { ...e, [field]: val } : e));
    handleUpdateResume({ ...activeResume, education: list });
  };

  const handleRemoveEdu = (id) => {
    const list = (activeResume.education || []).filter((e) => e.id !== id);
    handleUpdateResume({ ...activeResume, education: list });
  };

  // Experience list handlers
  const handleAddExp = () => {
    const newExp = {
      id: "exp_" + Date.now(),
      company: "Company Name",
      designation: "Role Title",
      employmentType: "Full-time",
      location: "Bengaluru",
      startDate: "2024-01",
      endDate: "2024-06",
      currentCompany: false,
      responsibilities: "Key responsibilities and achievements.",
      technologies: "React, Node.js",
    };
    handleUpdateResume({ ...activeResume, experience: [...(activeResume.experience || []), newExp] });
  };

  const handleExpChange = (id, field, val) => {
    const list = (activeResume.experience || []).map((e) => (e.id === id ? { ...e, [field]: val } : e));
    handleUpdateResume({ ...activeResume, experience: list });
  };

  const handleRemoveExp = (id) => {
    const list = (activeResume.experience || []).filter((e) => e.id !== id);
    handleUpdateResume({ ...activeResume, experience: list });
  };

  // Projects list handlers
  const handleAddProject = () => {
    const newProj = {
      id: "proj_" + Date.now(),
      name: "Project Title",
      role: "Developer",
      duration: "2 Months",
      technologies: "JavaScript, HTML, CSS",
      githubLink: "",
      liveDemo: "",
      description: "Short project summary.",
      responsibilities: "Key contributions.",
    };
    handleUpdateResume({ ...activeResume, projects: [...(activeResume.projects || []), newProj] });
  };

  const handleProjChange = (id, field, val) => {
    const list = (activeResume.projects || []).map((p) => (p.id === id ? { ...p, [field]: val } : p));
    handleUpdateResume({ ...activeResume, projects: list });
  };

  const handleRemoveProj = (id) => {
    const list = (activeResume.projects || []).filter((p) => p.id !== id);
    handleUpdateResume({ ...activeResume, projects: list });
  };

  // Skills handlers
  const handleAddSkill = (categoryKey, skillText = null) => {
    const text = (skillText || newSkillInput[categoryKey] || "").trim();
    if (!text) return;
    const currentList = activeResume.skills?.[categoryKey] || [];
    if (!currentList.includes(text)) {
      const updatedSkills = {
        ...activeResume.skills,
        [categoryKey]: [...currentList, text],
      };
      handleUpdateResume({ ...activeResume, skills: updatedSkills });
    }
    setNewSkillInput({ ...newSkillInput, [categoryKey]: "" });
  };

  const handleRemoveSkill = (categoryKey, skillName) => {
    const currentList = activeResume.skills?.[categoryKey] || [];
    const updatedSkills = {
      ...activeResume.skills,
      [categoryKey]: currentList.filter((s) => s !== skillName),
    };
    handleUpdateResume({ ...activeResume, skills: updatedSkills });
  };

  // Certifications handlers
  const handleAddCert = () => {
    const newCert = {
      id: "cert_" + Date.now(),
      name: "Certification Name",
      organization: "Issuing Organization",
      issueDate: "2024-01",
      credentialUrl: "",
      description: "",
    };
    handleUpdateResume({ ...activeResume, certifications: [...(activeResume.certifications || []), newCert] });
  };

  const handleCertChange = (id, field, val) => {
    const list = (activeResume.certifications || []).map((c) => (c.id === id ? { ...c, [field]: val } : c));
    handleUpdateResume({ ...activeResume, certifications: list });
  };

  const handleRemoveCert = (id) => {
    const list = (activeResume.certifications || []).filter((c) => c.id !== id);
    handleUpdateResume({ ...activeResume, certifications: list });
  };

  // Achievements handlers
  const handleAddAchievement = () => {
    const newAch = {
      id: "ach_" + Date.now(),
      category: "Hackathons",
      title: "Achievement Title",
      issuer: "Organization",
      date: "2024-02",
      description: "Brief details",
    };
    handleUpdateResume({ ...activeResume, achievements: [...(activeResume.achievements || []), newAch] });
  };

  const handleAchChange = (id, field, val) => {
    const list = (activeResume.achievements || []).map((a) => (a.id === id ? { ...a, [field]: val } : a));
    handleUpdateResume({ ...activeResume, achievements: list });
  };

  const handleRemoveAch = (id) => {
    const list = (activeResume.achievements || []).filter((a) => a.id !== id);
    handleUpdateResume({ ...activeResume, achievements: list });
  };

  // Languages handlers
  const handleAddLang = () => {
    const newLang = { id: "lang_" + Date.now(), language: "English", proficiency: "Professional" };
    handleUpdateResume({ ...activeResume, languages: [...(activeResume.languages || []), newLang] });
  };

  const handleLangChange = (id, field, val) => {
    const list = (activeResume.languages || []).map((l) => (l.id === id ? { ...l, [field]: val } : l));
    handleUpdateResume({ ...activeResume, languages: list });
  };

  const handleRemoveLang = (id) => {
    const list = (activeResume.languages || []).filter((l) => l.id !== id);
    handleUpdateResume({ ...activeResume, languages: list });
  };

  // AI helper triggers
  const handleAiGenerateSummary = () => {
    const allSkills = Object.values(activeResume.skills || {}).flat();
    const generated = aiGenerateSummary(activeResume.personal?.professionalTitle || "Developer", allSkills);
    handleUpdateResume({ ...activeResume, summary: generated });
    toast.success("Generated Summary with AI!");
  };

  const handleAiImproveSummary = () => {
    const improved = aiImproveText(activeResume.summary);
    handleUpdateResume({ ...activeResume, summary: improved });
    toast.success("Improved Summary with AI!");
  };

  const handleAiShortenSummary = () => {
    const shortened = aiShortenText(activeResume.summary);
    handleUpdateResume({ ...activeResume, summary: shortened });
    toast.info("Shortened Summary.");
  };

  const handleAiAtsOptimizeSummary = () => {
    const optimized = aiAtsOptimize(activeResume.summary, targetRole);
    handleUpdateResume({ ...activeResume, summary: optimized });
    toast.success(`ATS Optimized Summary for ${targetRole}!`);
  };

  const handleGenerateCoverLetter = (role = "Software Developer") => {
    const cl = aiGenerateCoverLetter(activeResume, role, "Aadya Recruiting Partner");
    setCoverLetterText(cl);
    setShowCoverLetterModal(true);
  };

  return (
    <div className="container-fluid py-3">
      <PageHeader
        title="Resume Builder"
        subtitle="Create, customize, and optimize ATS-friendly resumes for your placement applications."
        action={
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" onClick={handleSyncProfile}>
              <i className="bi bi-arrow-repeat"></i> Auto-Fill Profile Info
            </button>
            <button className="btn btn-success btn-sm d-flex align-items-center gap-1" onClick={() => setShowPreviewModal(true)}>
              <i className="bi bi-eye"></i> Live Preview
            </button>
          </div>
        }
      />

      <div className="row g-4">
        {/* ─── LEFT SIDEBAR (25%) ─────────────────────────────────────────── */}
        <div className="col-lg-3">
          {/* Master Resume Card */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between">
                <span className="fw-bold text-primary small">
                  <i className="bi bi-file-earmark-person-fill me-1"></i> My Master Resume
                </span>
                <span className="badge bg-success" style={{ fontSize: "0.65rem" }}>Active & Synced</span>
              </div>
              <small className="text-muted d-block mt-1 mb-2" style={{ fontSize: "0.75rem" }}>
                Auto-saved and attached to your job applications.
              </small>
              <button className="btn btn-sm btn-light-primary w-100 text-primary fw-semibold" style={{ fontSize: "0.75rem" }} onClick={handleSyncProfile}>
                <i className="bi bi-arrow-repeat me-1"></i> Pre-fill Profile Info
              </button>
            </div>
          </div>

          {/* Small Live Resume Preview in Sidebar */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-2">
              <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                <span className="fw-bold text-dark small" style={{ fontSize: "0.8rem" }}>
                  <i className="bi bi-file-earmark-text text-primary me-1"></i> Live Resume Preview
                </span>
                <span className="badge bg-primary text-capitalize" style={{ fontSize: "0.65rem" }}>
                  {activeResume.settings?.template || "modern"}
                </span>
              </div>

              {/* Scaled Miniature Live Resume */}
              <div className="border rounded bg-white overflow-hidden shadow-sm">
                <RealResumeThumbnail templateId={activeResume.settings?.template || "modern"} resumeData={activeResume} />
              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline-primary w-100 fw-semibold mt-2"
                style={{ fontSize: "0.75rem" }}
                onClick={() => setShowPreviewModal(true)}
              >
                <i className="bi bi-arrows-angle-expand me-1"></i> Fullscreen Preview
              </button>
            </div>
          </div>

          {/* Select Template Style directly in Sidebar */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-3">
              <label className="form-label small text-muted fw-bold uppercase mb-2" style={{ letterSpacing: "0.5px" }}>Select Template Style</label>
              <div className="d-flex flex-column gap-1">
                {TEMPLATE_DEFINITIONS.map((tpl) => {
                  const isSelected = (activeResume.settings?.template || "modern") === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      className={`btn btn-sm text-start d-flex align-items-center justify-content-between p-2 rounded transition-all ${
                        isSelected ? "btn-primary fw-bold shadow-sm" : "btn-outline-light text-dark border border-light-subtle"
                      }`}
                      style={{ fontSize: "0.78rem" }}
                      onClick={() => handleUpdateResume({ ...activeResume, settings: { ...activeResume.settings, template: tpl.id } })}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="rounded-circle border" style={{ width: 10, height: 10, background: tpl.accentColor }}></span>
                        <span>{tpl.name}</span>
                      </div>
                      {isSelected && <i className="bi bi-check-circle-fill"></i>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-3 d-grid gap-2">
              <button className="btn btn-primary btn-sm fw-semibold" onClick={() => setShowPreviewModal(true)}>
                <i className="bi bi-eye me-1"></i> Preview Resume
              </button>
              <button className="btn btn-success btn-sm fw-semibold" onClick={() => setShowPreviewModal(true)}>
                <i className="bi bi-file-earmark-pdf me-1"></i> Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT CONTENT (75%) ─────────────────────────────────────────── */}
        <div className="col-lg-9">
          {/* Horizontal Stepper */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3 overflow-auto">
              <div className="d-flex justify-content-between align-items-center min-w-max">
                {STEP_NAMES.map((name, idx) => {
                  const isActive = idx === currentStep;
                  const isCompleted = idx < currentStep;
                  return (
                    <div
                      key={idx}
                      className={`d-flex align-items-center gap-2 cursor-pointer px-2 py-1 rounded transition-all ${
                        isActive ? "bg-primary text-white fw-bold" : isCompleted ? "text-success fw-medium" : "text-muted"
                      }`}
                      onClick={() => setCurrentStep(idx)}
                    >
                      <span
                        className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                          isActive ? "bg-white text-primary" : isCompleted ? "bg-success text-white" : "bg-light text-muted"
                        }`}
                        style={{ width: 24, height: 24, fontSize: "0.75rem" }}
                      >
                        {isCompleted ? <i className="bi bi-check"></i> : idx + 1}
                      </span>
                      <span className="small text-nowrap">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stepper Content Form */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              {/* STEP 1: Personal Info */}
              {currentStep === 0 && (
                <div>
                  <h5 className="fw-bold text-primary mb-3"><i className="bi bi-person me-2"></i>Personal Information</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Full Name</label>
                      <input type="text" className="form-control" value={activeResume.personal?.fullName || ""} onChange={(e) => handlePersonalChange("fullName", e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Professional Title</label>
                      <input type="text" className="form-control" value={activeResume.personal?.professionalTitle || ""} onChange={(e) => handlePersonalChange("professionalTitle", e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Email Address</label>
                      <input type="email" className="form-control" value={activeResume.personal?.email || ""} onChange={(e) => handlePersonalChange("email", e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Phone Number</label>
                      <input type="text" className="form-control" value={activeResume.personal?.phone || ""} onChange={(e) => handlePersonalChange("phone", e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Location / City</label>
                      <input type="text" className="form-control" value={activeResume.personal?.location || ""} onChange={(e) => handlePersonalChange("location", e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">LinkedIn URL</label>
                      <input type="text" className="form-control" value={activeResume.personal?.linkedin || ""} onChange={(e) => handlePersonalChange("linkedin", e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">GitHub URL</label>
                      <input type="text" className="form-control" value={activeResume.personal?.github || ""} onChange={(e) => handlePersonalChange("github", e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Portfolio / Website</label>
                      <input type="text" className="form-control" value={activeResume.personal?.portfolio || ""} onChange={(e) => handlePersonalChange("portfolio", e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-muted">LeetCode URL</label>
                      <input type="text" className="form-control" value={activeResume.personal?.leetcode || ""} onChange={(e) => handlePersonalChange("leetcode", e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-muted">HackerRank URL</label>
                      <input type="text" className="form-control" value={activeResume.personal?.hackerrank || ""} onChange={(e) => handlePersonalChange("hackerrank", e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-muted">CodeChef URL</label>
                      <input type="text" className="form-control" value={activeResume.personal?.codechef || ""} onChange={(e) => handlePersonalChange("codechef", e.target.value)} />
                    </div>
                  </div>

                  {/* Visibility Toggles */}
                  <hr className="my-4" />
                  <h6 className="fw-bold mb-3">Field Visibility Toggles</h6>
                  <div className="d-flex flex-wrap gap-4 small">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="showPhoto" checked={activeResume.personal?.showPhoto || false} onChange={(e) => handlePersonalChange("showPhoto", e.target.checked)} />
                      <label className="form-check-label" htmlFor="showPhoto">Profile Photo</label>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="showLinkedin" checked={activeResume.personal?.showLinkedin || false} onChange={(e) => handlePersonalChange("showLinkedin", e.target.checked)} />
                      <label className="form-check-label" htmlFor="showLinkedin">LinkedIn</label>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="showGithub" checked={activeResume.personal?.showGithub || false} onChange={(e) => handlePersonalChange("showGithub", e.target.checked)} />
                      <label className="form-check-label" htmlFor="showGithub">GitHub</label>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="showPortfolio" checked={activeResume.personal?.showPortfolio || false} onChange={(e) => handlePersonalChange("showPortfolio", e.target.checked)} />
                      <label className="form-check-label" htmlFor="showPortfolio">Portfolio</label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Professional Summary */}
              {currentStep === 1 && (
                <div>
                  <h5 className="fw-bold text-primary mb-3"><i className="bi bi-file-text me-2"></i>Professional Summary</h5>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows={6}
                      value={activeResume.summary || ""}
                      onChange={(e) => handleUpdateResume({ ...activeResume, summary: e.target.value })}
                      placeholder="Write a concise overview of your technical background and career goals..."
                    >
                    </textarea>
                    <div className="d-flex justify-content-between align-items-center mt-2 small text-muted">
                      <span>Word Count: <strong>{(activeResume.summary || "").split(/\s+/).filter(Boolean).length} words</strong></span>
                      <span>Target: ~50-80 words</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Education */}
              {currentStep === 2 && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-primary mb-0"><i className="bi bi-mortarboard me-2"></i>Education</h5>
                    <button className="btn btn-primary btn-sm" onClick={handleAddEdu}>
                      <i className="bi bi-plus-lg me-1"></i> Add Education
                    </button>
                  </div>

                  {(activeResume.education || []).map((edu, idx) => (
                    <div key={edu.id} className="card border mb-3">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold text-dark">Education #{idx + 1}</span>
                          <button className="btn btn-link btn-sm text-danger p-0" onClick={() => handleRemoveEdu(edu.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Degree</label>
                            <input type="text" className="form-control form-control-sm" value={edu.degree} onChange={(e) => handleEduChange(edu.id, "degree", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Specialization / Branch</label>
                            <input type="text" className="form-control form-control-sm" value={edu.specialization} onChange={(e) => handleEduChange(edu.id, "specialization", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">College / Institute</label>
                            <input type="text" className="form-control form-control-sm" value={edu.college} onChange={(e) => handleEduChange(edu.id, "college", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">University / Board</label>
                            <input type="text" className="form-control form-control-sm" value={edu.university} onChange={(e) => handleEduChange(edu.id, "university", e.target.value)} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small text-muted">Start Year</label>
                            <input type="text" className="form-control form-control-sm" value={edu.startYear} onChange={(e) => handleEduChange(edu.id, "startYear", e.target.value)} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small text-muted">End Year</label>
                            <input type="text" className="form-control form-control-sm" value={edu.endYear} onChange={(e) => handleEduChange(edu.id, "endYear", e.target.value)} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small text-muted">CGPA</label>
                            <input type="text" className="form-control form-control-sm" value={edu.cgpa} onChange={(e) => handleEduChange(edu.id, "cgpa", e.target.value)} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small text-muted">Percentage</label>
                            <input type="text" className="form-control form-control-sm" value={edu.percentage} onChange={(e) => handleEduChange(edu.id, "percentage", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 4: Experience */}
              {currentStep === 3 && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-primary mb-0"><i className="bi bi-briefcase me-2"></i>Experience & Internships</h5>
                    <button className="btn btn-primary btn-sm" onClick={handleAddExp}>
                      <i className="bi bi-plus-lg me-1"></i> Add Experience
                    </button>
                  </div>

                  {(activeResume.experience || []).map((exp, idx) => (
                    <div key={exp.id} className="card border mb-3">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold text-dark">Experience #{idx + 1}</span>
                          <button className="btn btn-link btn-sm text-danger p-0" onClick={() => handleRemoveExp(exp.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Company Name</label>
                            <input type="text" className="form-control form-control-sm" value={exp.company} onChange={(e) => handleExpChange(exp.id, "company", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Designation / Role</label>
                            <input type="text" className="form-control form-control-sm" value={exp.designation} onChange={(e) => handleExpChange(exp.id, "designation", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Employment Type</label>
                            <select className="form-select form-select-sm" value={exp.employmentType} onChange={(e) => handleExpChange(exp.id, "employmentType", e.target.value)}>
                              <option value="Internship">Internship</option>
                              <option value="Full-time">Full-time</option>
                              <option value="Part-time">Part-time</option>
                              <option value="Contract">Contract</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Technologies Used</label>
                            <input type="text" className="form-control form-control-sm" value={exp.technologies} onChange={(e) => handleExpChange(exp.id, "technologies", e.target.value)} />
                          </div>
                          <div className="col-12">
                            <label className="form-label small text-muted">Responsibilities & Achievements</label>
                            <textarea className="form-control form-control-sm" rows={3} value={exp.responsibilities} onChange={(e) => handleExpChange(exp.id, "responsibilities", e.target.value)}></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 5: Projects */}
              {currentStep === 4 && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-primary mb-0"><i className="bi bi-folder-check me-2"></i>Projects</h5>
                    <button className="btn btn-primary btn-sm" onClick={handleAddProject}>
                      <i className="bi bi-plus-lg me-1"></i> Add Project
                    </button>
                  </div>

                  {(activeResume.projects || []).map((proj, idx) => (
                    <div key={proj.id} className="card border mb-3">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold text-dark">Project #{idx + 1}</span>
                          <button className="btn btn-link btn-sm text-danger p-0" onClick={() => handleRemoveProj(proj.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Project Name</label>
                            <input type="text" className="form-control form-control-sm" value={proj.name} onChange={(e) => handleProjChange(proj.id, "name", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Role</label>
                            <input type="text" className="form-control form-control-sm" value={proj.role} onChange={(e) => handleProjChange(proj.id, "role", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">GitHub Link</label>
                            <input type="text" className="form-control form-control-sm" value={proj.githubLink} onChange={(e) => handleProjChange(proj.id, "githubLink", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Live Demo Link</label>
                            <input type="text" className="form-control form-control-sm" value={proj.liveDemo} onChange={(e) => handleProjChange(proj.id, "liveDemo", e.target.value)} />
                          </div>
                          <div className="col-12">
                            <label className="form-label small text-muted">Project Description & Key Bullet Points</label>
                            <textarea className="form-control form-control-sm" rows={3} value={proj.description} onChange={(e) => handleProjChange(proj.id, "description", e.target.value)}></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 6: Skills */}
              {currentStep === 5 && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-primary mb-0"><i className="bi bi-tools me-2"></i>Skills & Competencies</h5>
                    <small className="text-muted">Supports Accounting, Office, Technical & Soft Skills</small>
                  </div>

                  {/* Popular Quick Add Chips */}
                  <div className="card bg-light border-0 p-3 mb-4 rounded-3">
                    <label className="form-label small fw-bold text-dark mb-2">
                      <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Add Popular Skills:
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {POPULAR_SKILLS_SUGGESTIONS.map((ps, idx) => {
                        const existingCategorySkills = activeResume.skills?.[ps.category] || [];
                        const isAdded = existingCategorySkills.includes(ps.name);
                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`btn btn-sm ${isAdded ? "btn-success" : "btn-outline-primary"} rounded-pill py-1 px-3 fs-7`}
                            onClick={() => !isAdded && handleAddSkill(ps.category, ps.name)}
                            disabled={isAdded}
                          >
                            {isAdded ? <i className="bi bi-check-lg me-1"></i> : <i className="bi bi-plus-lg me-1"></i>}
                            {ps.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="row g-4">
                    {SKILL_CATEGORIES.map((cat) => {
                      const currentSkills = activeResume.skills?.[cat.key] || [];
                      return (
                        <div key={cat.key} className="col-md-6">
                          <div className="card border h-100 shadow-sm">
                            <div className="card-body p-3">
                              <label className="form-label fw-bold text-dark mb-2">{cat.label}</label>

                              {/* Skill Chips */}
                              <div className="d-flex flex-wrap gap-1 mb-3">
                                {currentSkills.map((s, i) => (
                                  <span key={i} className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1 d-inline-flex align-items-center gap-1">
                                    {s}
                                    <i className="bi bi-x cursor-pointer ms-1 fs-6" onClick={() => handleRemoveSkill(cat.key, s)}></i>
                                  </span>
                                ))}
                                {currentSkills.length === 0 && <span className="small text-muted fst-italic">No skills added yet</span>}
                              </div>

                              {/* Input + Add */}
                              <div className="input-group input-group-sm">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder={`Add any ${cat.label.toLowerCase()}...`}
                                  value={newSkillInput[cat.key] || ""}
                                  onChange={(e) => setNewSkillInput({ ...newSkillInput, [cat.key]: e.target.value })}
                                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill(cat.key)}
                                />
                                <button className="btn btn-outline-primary" onClick={() => handleAddSkill(cat.key)}>Add</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 7: Certifications */}
              {currentStep === 6 && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-primary mb-0"><i className="bi bi-patch-check me-2"></i>Certifications</h5>
                    <button className="btn btn-primary btn-sm" onClick={handleAddCert}>
                      <i className="bi bi-plus-lg me-1"></i> Add Certification
                    </button>
                  </div>

                  {(activeResume.certifications || []).map((c, idx) => (
                    <div key={c.id} className="card border mb-3">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold text-dark">Certification #{idx + 1}</span>
                          <button className="btn btn-link btn-sm text-danger p-0" onClick={() => handleRemoveCert(c.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Certification Name</label>
                            <input type="text" className="form-control form-control-sm" value={c.name} onChange={(e) => handleCertChange(c.id, "name", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Issuing Organization</label>
                            <input type="text" className="form-control form-control-sm" value={c.organization} onChange={(e) => handleCertChange(c.id, "organization", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Issue Date</label>
                            <input type="month" className="form-control form-control-sm" value={c.issueDate} onChange={(e) => handleCertChange(c.id, "issueDate", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Credential URL</label>
                            <input type="text" className="form-control form-control-sm" value={c.credentialUrl} onChange={(e) => handleCertChange(c.id, "credentialUrl", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 8: Achievements */}
              {currentStep === 7 && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-primary mb-0"><i className="bi bi-trophy me-2"></i>Achievements & Awards</h5>
                    <button className="btn btn-primary btn-sm" onClick={handleAddAchievement}>
                      <i className="bi bi-plus-lg me-1"></i> Add Achievement
                    </button>
                  </div>

                  {(activeResume.achievements || []).map((ach, idx) => (
                    <div key={ach.id} className="card border mb-3">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold text-dark">Achievement #{idx + 1}</span>
                          <button className="btn btn-link btn-sm text-danger p-0" onClick={() => handleRemoveAch(ach.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Category</label>
                            <select className="form-select form-select-sm" value={ach.category} onChange={(e) => handleAchChange(ach.id, "category", e.target.value)}>
                              <option value="Awards">Awards</option>
                              <option value="Hackathons">Hackathons</option>
                              <option value="Coding Competitions">Coding Competitions</option>
                              <option value="Leadership">Leadership</option>
                              <option value="Volunteer Work">Volunteer Work</option>
                              <option value="Scholarships">Scholarships</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Title / Honor</label>
                            <input type="text" className="form-control form-control-sm" value={ach.title} onChange={(e) => handleAchChange(ach.id, "title", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Issuer / Host</label>
                            <input type="text" className="form-control form-control-sm" value={ach.issuer} onChange={(e) => handleAchChange(ach.id, "issuer", e.target.value)} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Description</label>
                            <input type="text" className="form-control form-control-sm" value={ach.description} onChange={(e) => handleAchChange(ach.id, "description", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 9: Languages */}
              {currentStep === 8 && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-primary mb-0"><i className="bi bi-translate me-2"></i>Languages</h5>
                    <button className="btn btn-primary btn-sm" onClick={handleAddLang}>
                      <i className="bi bi-plus-lg me-1"></i> Add Language
                    </button>
                  </div>

                  {(activeResume.languages || []).map((l, idx) => (
                    <div key={l.id} className="card border mb-2">
                      <div className="card-body p-3 d-flex align-items-center gap-3">
                        <input type="text" className="form-control form-control-sm" value={l.language} onChange={(e) => handleLangChange(l.id, "language", e.target.value)} placeholder="Language Name" />
                        <select className="form-select form-select-sm" value={l.proficiency} onChange={(e) => handleLangChange(l.id, "proficiency", e.target.value)}>
                          <option value="Native">Native</option>
                          <option value="Professional">Professional</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Basic">Basic</option>
                        </select>
                        <button className="btn btn-link btn-sm text-danger p-0" onClick={() => handleRemoveLang(l.id)}>
                          <i className="bi bi-trash fs-5"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 10: Settings */}
              {currentStep === 9 && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold text-primary mb-0"><i className="bi bi-palette2 me-2"></i>Resume Layout & Template Examples</h5>
                    <button className="btn btn-primary btn-sm fw-semibold" onClick={() => setShowTemplateGallery(true)}>
                      <i className="bi bi-grid-fill me-1"></i> Open Full Gallery & Examples
                    </button>
                  </div>

                  <div className="row g-3 mb-4">
                    {TEMPLATE_DEFINITIONS.map((tpl) => {
                      const isSelected = (activeResume.settings?.template || "modern") === tpl.id;
                      return (
                        <div key={tpl.id} className="col-md-6 col-lg-4">
                          <div
                            className={`card border-2 h-100 shadow-sm rounded-3 cursor-pointer overflow-hidden ${
                              isSelected ? "border-primary bg-primary bg-opacity-10" : "border-light-subtle bg-white"
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleUpdateResume({ ...activeResume, settings: { ...activeResume.settings, template: tpl.id } })}
                          >
                            <div className="bg-white p-2 border-bottom">
                              <RealResumeThumbnail templateId={tpl.id} resumeData={activeResume} />
                            </div>
                            <div className="card-body p-3">
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="fw-bold small text-dark">{tpl.name}</span>
                                {isSelected && <span className="badge bg-primary">Active</span>}
                              </div>
                              <small className="text-muted d-block mb-2" style={{ fontSize: "0.75rem" }}>
                                {tpl.category}
                              </small>
                              <button
                                type="button"
                                className={`btn btn-xs w-100 ${isSelected ? "btn-primary fw-bold" : "btn-outline-primary"}`}
                                style={{ fontSize: "0.75rem" }}
                              >
                                {isSelected ? "Active Selected" : "Use This Template"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-bold">Accent Theme Color</label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="color"
                          className="form-control form-control-color"
                          value={activeResume.settings?.accentColor || "#0F4C81"}
                          onChange={(e) => handleUpdateResume({ ...activeResume, settings: { ...activeResume.settings, accentColor: e.target.value } })}
                        />
                        <span className="small text-muted font-monospace">{activeResume.settings?.accentColor || "#0F4C81"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 11: Review & Generate */}
              {currentStep === 10 && (
                <div>
                  <h5 className="fw-bold text-success mb-3"><i className="bi bi-check-circle me-2"></i>Review & Generate Resume</h5>
                  <div className="alert alert-success d-flex align-items-center gap-3 mb-4">
                    <i className="bi bi-shield-check fs-2"></i>
                    <div>
                      <h6 className="fw-bold mb-1">Your Resume is ATS Ready!</h6>
                      <p className="mb-0 small">ATS Score: <strong>{atsMetrics.atsScore}%</strong> | Profile Score: <strong>{atsMetrics.profileScore}%</strong></p>
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    {["Personal Information", "Education", "Experience", "Projects", "Skills", "Certifications", "Languages"].map((sec, i) => (
                      <div key={i} className="col-md-4">
                        <div className="p-3 bg-light rounded border d-flex align-items-center gap-2">
                          <i className="bi bi-check-circle-fill text-success fs-5"></i>
                          <span className="fw-medium text-dark">{sec}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex flex-wrap gap-3">
                    <button className="btn btn-primary btn-lg fw-bold px-4" onClick={() => setShowPreviewModal(true)}>
                      <i className="bi bi-eye me-2"></i> Preview Resume
                    </button>
                    <button className="btn btn-success btn-lg fw-bold px-4" onClick={() => setShowPreviewModal(true)}>
                      <i className="bi bi-file-earmark-pdf me-2"></i> Download PDF
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <button
                  className="btn btn-outline-secondary"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                >
                  <i className="bi bi-arrow-left me-1"></i> Previous
                </button>
                <span className="small text-muted">Step {currentStep + 1} of {STEP_NAMES.length}</span>
                <button
                  className="btn btn-primary"
                  disabled={currentStep === STEP_NAMES.length - 1}
                  onClick={() => setCurrentStep((s) => Math.min(STEP_NAMES.length - 1, s + 1))}
                >
                  Next <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── LIVE PREVIEW MODAL ───────────────────────────────────────────── */}
      {showPreviewModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: "90vw" }}>
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-body p-3">
                <ResumePreview resume={activeResume} onClose={() => setShowPreviewModal(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── VISUAL TEMPLATE GALLERY MODAL ─────────────────────────────────── */}
      {showTemplateGallery && (
        <TemplateGalleryModal
          currentTemplate={activeResume.settings?.template || "modern"}
          resumeData={activeResume}
          onSelectTemplate={(tplId) =>
            handleUpdateResume({
              ...activeResume,
              settings: { ...activeResume.settings, template: tplId },
            })
          }
          onClose={() => setShowTemplateGallery(false)}
        />
      )}
    </div>
  );
}
