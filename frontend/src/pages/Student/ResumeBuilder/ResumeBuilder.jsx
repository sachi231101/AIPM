import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { useProfile } from "../../../context/ProfileContext";
import { studentService, resumeService } from "../../../services/api";
import {
  getAllResumes,
  saveResume,
  createDefaultResume,
  mergeProfileIntoResume,
  normalizePhotoUrl,
  convertImageToBase64,
  createNewResume,
  duplicateResume,
  deleteResume,
  calculateATSMetrics,
  aiGenerateSummary,
  aiRewriteSummaryWithTone,
  aiGenerateBulletPoints,
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
  "Review & Generate",
];

const STEP_ICONS = [
  "bi-person-fill",
  "bi-card-text",
  "bi-mortarboard-fill",
  "bi-briefcase-fill",
  "bi-code-slash",
  "bi-tools",
  "bi-patch-check-fill",
  "bi-trophy-fill",
  "bi-translate",
  "bi-file-earmark-check-fill",
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
];

const getStepIndexFromCategory = (key) => {
  if (!key) return 0;
  const k = key.toString().toLowerCase();
  if (k.includes("personal") || k.includes("contact")) return 0;
  if (k.includes("summary") || k.includes("actionverb") || k.includes("action verb") || k.includes("bio")) return 1;
  if (k.includes("education") || k.includes("degree") || k.includes("college") || k.includes("school")) return 2;
  if (k.includes("experience") || k.includes("work") || k.includes("job") || k.includes("intern")) return 3;
  if (k.includes("project")) return 4;
  if (k.includes("skill")) return 5;
  if (k.includes("certif")) return 6;
  if (k.includes("achieve") || k.includes("award")) return 7;
  if (k.includes("language")) return 8;
  if (k.includes("format") || k.includes("review") || k.includes("generate")) return 9;
  return 0;
};

const getStepStatus = (idx, activeResume, atsMetrics) => {
  if (!activeResume) return { status: "empty", pts: 0, bg: "bg-secondary bg-opacity-25 text-secondary", text: "text-secondary opacity-50", icon: "bi-circle" };
  const breakdown = atsMetrics?.breakdown || {};
  
  let pts = 0;
  let isFilled = false;
  
  switch (idx) {
    case 0: // Personal Information
      pts = breakdown.personal ?? (activeResume.personal?.fullName ? 15 : 0);
      isFilled = !!(activeResume.personal?.fullName && activeResume.personal?.email && activeResume.personal?.phone);
      break;
    case 1: // Professional Summary
      pts = breakdown.summary ?? (activeResume.summary?.trim()?.length > 20 ? 10 : (activeResume.summary?.trim() ? 5 : 0));
      isFilled = !!(activeResume.summary?.trim()?.length > 20);
      break;
    case 2: // Education
      pts = breakdown.education ?? (Array.isArray(activeResume.education) && activeResume.education.length > 0 ? 15 : 0);
      isFilled = Array.isArray(activeResume.education) && activeResume.education.length > 0;
      break;
    case 3: // Experience
      pts = breakdown.experience ?? (Array.isArray(activeResume.experience) && activeResume.experience.length > 0 ? 15 : 0);
      isFilled = Array.isArray(activeResume.experience) && activeResume.experience.length > 0;
      break;
    case 4: // Projects
      pts = breakdown.projects ?? (Array.isArray(activeResume.projects) && activeResume.projects.length > 0 ? 15 : 0);
      isFilled = Array.isArray(activeResume.projects) && activeResume.projects.length > 0;
      break;
    case 5: // Skills
      pts = breakdown.skills ?? (Array.isArray(activeResume.skills) && activeResume.skills.length > 0 ? 15 : 0);
      isFilled = Array.isArray(activeResume.skills) && activeResume.skills.length > 0;
      break;
    case 6: // Certifications
      isFilled = Array.isArray(activeResume.certifications) && activeResume.certifications.length > 0;
      pts = isFilled ? 10 : 0;
      break;
    case 7: // Achievements
      isFilled = Array.isArray(activeResume.achievements) && activeResume.achievements.length > 0;
      pts = isFilled ? 10 : 0;
      break;
    case 8: // Languages
      isFilled = Array.isArray(activeResume.languages) && activeResume.languages.length > 0;
      pts = isFilled ? 10 : 0;
      break;
    case 9: // Review & Generate
      pts = (atsMetrics?.score >= 70) ? 10 : (atsMetrics?.score > 0 ? 5 : 0);
      isFilled = (atsMetrics?.score >= 70);
      break;
    default:
      pts = 0;
  }

  // - Filled all / points >= 10 -> Green (bg-success) with checkmark ✓
  // - Points less than 10 (1-9 pts) -> Yellow (bg-warning) with checkmark ✓
  // - Not filled (0 pts) -> Gray (bg-secondary opacity-25)
  if (pts >= 10 || (isFilled && pts > 0)) {
    return { status: "filled", pts, bg: "bg-success text-white", text: "text-success", icon: "bi-check-lg" };
  } else if (pts > 0) {
    return { status: "partial", pts, bg: "bg-warning text-dark", text: "text-warning", icon: "bi-check-lg" };
  } else {
    return { status: "empty", pts: 0, bg: "bg-secondary bg-opacity-25 text-secondary", text: "text-secondary opacity-50", icon: "bi-circle" };
  }
};

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeProfile } = useProfile();
  const [activeResume, setActiveResume] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 to 10
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [targetRole, setTargetRole] = useState(activeProfile?.target_role || "Full Stack Developer");
  const [newSkillInput, setNewSkillInput] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const [viewingDoc, setViewingDoc] = useState(null); // { url, name }

  // Validate mandatory Personal Information fields
  const validatePersonalInfo = () => {
    const personal = activeResume?.personal || {};
    const errors = {};

    if (!personal.fullName?.trim()) {
      errors.fullName = "Full Name is mandatory";
    }
    if (!personal.professionalTitle?.trim()) {
      errors.professionalTitle = "Professional Title is mandatory";
    }
    if (!personal.email?.trim()) {
      errors.email = "Email Address is mandatory";
    }
    if (!personal.phone?.trim()) {
      errors.phone = "Phone Number is mandatory";
    }
    if (!personal.location?.trim()) {
      errors.location = "Location / City is mandatory";
    }

    setStepErrors(errors);
    return errors;
  };

  const handleGoToStep = (targetStep) => {
    // If moving forward or leaving step 0
    if (currentStep === 0 || targetStep > currentStep) {
      const errors = validatePersonalInfo();
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(`field_${firstErrorKey}`);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
    }
    setCurrentStep(targetStep);
  };

  // Fetch student profile & pre-fill Master Resume for activeProfile
  useEffect(() => {
    let profileData = {};
    const activeId = activeProfile?.id || localStorage.getItem("apms_active_profile_id");

    studentService.getProfile(activeId ? { profile_id: activeId } : {})
      .then((pres) => {
        profileData = pres.data?.data || {};
        return resumeService.getAll(activeId ? { profile_id: activeId } : {});
      })
      .then((res) => {
        const dbResumes = res.data?.data || [];
        let loadedResume = null;
        if (dbResumes.length > 0) {
          const first = dbResumes[0].content || {};
          const merged = mergeProfileIntoResume(first, profileData);
          loadedResume = {
            ...merged,
            id: dbResumes[0].resume_key || "master",
            title: "Master Resume",
          };
          setActiveResume(loadedResume);
          saveResume(loadedResume, user?.id, activeId);
        } else {
          loadedResume = createDefaultResume(profileData);
          loadedResume.id = "master";
          loadedResume.title = "Master Resume";
          setActiveResume(loadedResume);
          saveResume(loadedResume, user?.id, activeId);
          resumeService.save({
            student_profile_id: activeId,
            resume_key: "master",
            title: "Master Resume",
            content: loadedResume,
          }).catch(() => {});
        }

        // Convert photo to Base64 in background for flawless PDF generation
        if (loadedResume?.personal?.photo && !loadedResume.personal.photo.startsWith("data:")) {
          convertImageToBase64(loadedResume.personal.photo).then((b64) => {
            if (b64 && b64.startsWith("data:image")) {
              setActiveResume((prev) => prev ? {
                ...prev,
                personal: { ...prev.personal, photo: b64, showPhoto: true }
              } : prev);
            }
          });
        }
      })
      .catch(() => {
        const fallback = createDefaultResume({});
        fallback.id = "master";
        fallback.title = "Master Resume";
        setActiveResume(fallback);
      });
  }, [user?.id, activeProfile?.id]);

  const handleSyncProfile = async () => {
    try {
      const activeId = activeProfile?.id || localStorage.getItem("apms_active_profile_id");
      const pres = await studentService.getProfile(activeId ? { profile_id: activeId } : {});
      const pdata = pres.data?.data || {};
      const merged = mergeProfileIntoResume(activeResume, pdata);
      handleUpdateResume(merged);
      toast.success("Pre-filled resume with your latest profile information! 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch profile information.");
    }
  };

  // Upload profile photo from within the resume builder
  const handleResumePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 5) {
      toast.error("Photo must be smaller than 5MB.");
      return;
    }
    // Show preview instantly & keep Base64 in state for 100% reliable live preview & PDF download
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;

      // Update photo and showPhoto atomically in one state update
      const updated = {
        ...activeResume,
        personal: {
          ...activeResume.personal,
          photo: base64Data,
          showPhoto: true,
        },
      };
      handleUpdateResume(updated);

      // Upload to backend in background so it's persisted to profile
      try {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append("photo", file);
        const photoRes = await studentService.uploadProfilePhoto(formData);
        if (photoRes.data?.photo_url) {
          const serverPhotoUrl = photoRes.data.photo_url;
          // Keep base64 or server url synced atomically
          const finalUpdated = {
            ...updated,
            personal: {
              ...updated.personal,
              photo: base64Data || serverPhotoUrl,
              showPhoto: true,
            },
          };
          handleUpdateResume(finalUpdated);
        }
        toast.success("Profile photo saved to your account! 📸");
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to save photo to backend.");
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Autosave when activeResume changes (syncs to both profile-scoped localStorage & database)
  const handleUpdateResume = (updatedObj) => {
    const activeId = activeProfile?.id || localStorage.getItem("apms_active_profile_id");

    setActiveResume(updatedObj);
    saveResume(updatedObj, user?.id, activeId);

    // Save to Database API
    resumeService.save({
      student_profile_id: activeId,
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
      degree: "",
      specialization: "",
      college: "",
      university: "",
      location: "",
      startYear: "",
      endYear: "",
      cgpa: "",
      percentage: "",
      currentlyStudying: false,
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
      company: "",
      designation: "",
      employmentType: "Full-time",
      location: "",
      startDate: "",
      endDate: "",
      currentCompany: false,
      responsibilities: "",
      technologies: "",
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
      name: "",
      role: "",
      duration: "",
      technologies: "",
      githubLink: "",
      liveDemo: "",
      description: "",
      responsibilities: "",
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
      name: "",
      organization: "",
      issueDate: "",
      credentialUrl: "",
      fileName: "",
      description: "",
    };
    handleUpdateResume({ ...activeResume, certifications: [...(activeResume.certifications || []), newCert] });
  };

  const handleCertFileChange = (certId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Certificate file must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      const list = (activeResume.certifications || []).map((c) =>
        c.id === certId
          ? { ...c, credentialUrl: dataUrl, fileName: file.name }
          : c
      );
      handleUpdateResume({ ...activeResume, certifications: list });
      toast.success(`Certificate "${file.name}" attached successfully! 📄`);
    };
    reader.readAsDataURL(file);
  };

  const handleCertChange = (id, field, val) => {
    const list = (activeResume.certifications || []).map((c) => (c.id === id ? { ...c, [field]: val } : c));
    handleUpdateResume({ ...activeResume, certifications: list });
  };

  const handleRemoveCertFile = (certId) => {
    const list = (activeResume.certifications || []).map((c) =>
      c.id === certId ? { ...c, credentialUrl: "", fileName: "" } : c
    );
    handleUpdateResume({ ...activeResume, certifications: list });
    toast.info("Attached certificate document removed.");
  };

  const handleViewCertDocument = (url, name) => {
    if (!url) return;
    setViewingDoc({ url, name: name || "Certificate Document" });
  };

  const handleRemoveCert = (id) => {
    const list = (activeResume.certifications || []).filter((c) => c.id !== id);
    handleUpdateResume({ ...activeResume, certifications: list });
  };

  // Achievements handlers
  const handleAddAchievement = () => {
    const newAch = {
      id: "ach_" + Date.now(),
      category: "Awards",
      title: "",
      issuer: "",
      date: "",
      description: "",
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
    const newLang = { id: "lang_" + Date.now(), language: "", proficiency: "Professional" };
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
  const handleAiGenerateSummary = async () => {
    const generated = await aiGenerateSummary(activeResume, targetRole);
    handleUpdateResume({ ...activeResume, summary: generated });
    toast.success("Generated Summary with AI! ✨");
  };

  const handleAiGenerateSummaryWithTone = async (tone) => {
    const rewritten = await aiRewriteSummaryWithTone(activeResume, tone);
    handleUpdateResume({ ...activeResume, summary: rewritten });
    toast.success(`Generated ${tone.toUpperCase()} summary with AI! ✨`);
  };

  const handleAiGenerateExpBullets = async (expId, roleTitle) => {
    const bullets = await aiGenerateBulletPoints(roleTitle || "Software Engineer");
    const bulletText = bullets.join("\n");
    const list = (activeResume.experience || []).map((e) => {
      if (e.id === expId) {
        const existing = e.description ? `${e.description}\n` : "";
        return { ...e, description: existing + bulletText };
      }
      return e;
    });
    handleUpdateResume({ ...activeResume, experience: list });
    toast.success("Generated impact bullet points with AI! ✨");
  };

  const handleAiGenerateProjBullets = async (projId, projTitle) => {
    const bullets = await aiGenerateBulletPoints(projTitle || "Web Application");
    const bulletText = bullets.join("\n");
    const list = (activeResume.projects || []).map((p) => {
      if (p.id === projId) {
        const existing = p.description ? `${p.description}\n` : "";
        return { ...p, description: existing + bulletText };
      }
      return p;
    });
    handleUpdateResume({ ...activeResume, projects: list });
    toast.success("Generated project bullet points with AI! ✨");
  };

  const handleSettingChange = (key, value) => {
    const updatedSettings = { ...(activeResume.settings || {}), [key]: value };
    handleUpdateResume({ ...activeResume, settings: updatedSettings });
  };

  const handleAiImproveSummary = async () => {
    const improved = await aiImproveText(activeResume.summary);
    handleUpdateResume({ ...activeResume, summary: improved });
    toast.success("Improved Summary with AI! ✨");
  };

  const handleAiShortenSummary = async () => {
    const shortened = await aiShortenText(activeResume.summary);
    handleUpdateResume({ ...activeResume, summary: shortened });
    toast.info("Shortened Summary.");
  };

  const handleAiAtsOptimizeSummary = async () => {
    const res = await aiAtsOptimize(activeResume, targetRole);
    toast.success(res.message);
  };

  const handleGenerateCoverLetter = async (role = "Software Developer") => {
    const cl = await aiGenerateCoverLetter(activeResume, role, "Aadya Recruiting Partner");
    setCoverLetterText(cl);
    setShowCoverLetterModal(true);
  };

  const handleSubmitResume = async () => {
    try {
      if (activeResume) {
        saveResume(activeResume, user?.id, activeResumeId);
        await resumeService.save({
          active_resume_id: activeResumeId,
          resume_data: activeResume,
        });
      }
    } catch (e) {
      console.error("Save error on submit:", e);
    }
    toast.success("Resume submitted successfully! Redirecting to Dashboard... 🎉");
    navigate("/student/dashboard");
  };

  return (
    <div className="container-fluid py-3">
      <PageHeader
        title="Resume Builder"
        subtitle="Create, customize, and optimize ATS-friendly resumes for your placement applications."
        action={
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1.5 d-none d-md-inline-flex align-items-center gap-1 small">
              <i className="bi bi-cloud-check-fill text-success"></i> Auto-Saved to Cloud
            </span>
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

          {/* Live Resume Preview (Responsive for Mobile & Desktop) */}
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

          {/* Typography & Layout Customization Card */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-3">
              <label className="form-label small text-muted fw-bold uppercase mb-2" style={{ letterSpacing: "0.5px" }}>
                <i className="bi bi-fonts text-primary me-1"></i> Typography & Layout
              </label>
              
              {/* Font Family */}
              <div className="mb-2">
                <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>Font Family</small>
                <select
                  className="form-select form-select-sm"
                  style={{ fontSize: "0.78rem" }}
                  value={activeResume.settings?.fontFamily || "Inter"}
                  onChange={(e) => handleSettingChange("fontFamily", e.target.value)}
                >
                  <option value="Inter">Inter (Sans-Serif)</option>
                  <option value="Roboto">Roboto (Clean)</option>
                  <option value="Outfit">Outfit (Modern)</option>
                  <option value="Merriweather">Merriweather (Classic Serif)</option>
                  <option value="Poppins">Poppins (Geometric)</option>
                </select>
              </div>

              {/* Font Size & Line Spacing */}
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>Font Size</small>
                  <select
                    className="form-select form-select-sm"
                    style={{ fontSize: "0.75rem" }}
                    value={activeResume.settings?.fontSize || "medium"}
                    onChange={(e) => handleSettingChange("fontSize", e.target.value)}
                  >
                    <option value="small">Small (Dense)</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>Spacing</small>
                  <select
                    className="form-select form-select-sm"
                    style={{ fontSize: "0.75rem" }}
                    value={activeResume.settings?.lineSpacing || "normal"}
                    onChange={(e) => handleSettingChange("lineSpacing", e.target.value)}
                  >
                    <option value="compact">Compact</option>
                    <option value="normal">Normal</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>
              </div>

              {/* Accent Color Palette */}
              <div>
                <small className="text-muted d-block mb-1" style={{ fontSize: "0.75rem" }}>Color Theme</small>
                <div className="d-flex align-items-center gap-2">
                  {[
                    { name: "Corporate Blue", color: "#0F4C81" },
                    { name: "Emerald", color: "#059669" },
                    { name: "Slate Gray", color: "#475569" },
                    { name: "Royal Purple", color: "#7C3AED" },
                    { name: "Crimson", color: "#991B1B" },
                    { name: "Charcoal", color: "#1F2937" },
                  ].map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      className="rounded-circle border-0 transition-all p-0"
                      style={{
                        width: 22,
                        height: 22,
                        background: p.color,
                        boxShadow: (activeResume.settings?.accentColor === p.color) ? "0 0 0 2px #fff, 0 0 0 4px " + p.color : "none",
                        transform: (activeResume.settings?.accentColor === p.color) ? "scale(1.15)" : "scale(1)",
                      }}
                      title={p.name}
                      onClick={() => handleSettingChange("accentColor", p.color)}
                    />
                  ))}
                </div>
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
              <div className="d-flex justify-content-between align-items-center min-w-max px-2">
                {STEP_NAMES.map((name, idx) => {
                  const isActive = idx === currentStep;
                  const stepStat = getStepStatus(idx, activeResume, atsMetrics);
                  const nextStat = idx < STEP_NAMES.length - 1 ? getStepStatus(idx + 1, activeResume, atsMetrics) : null;
                  const lineColor = (stepStat.status === "filled" && (nextStat?.status === "filled" || nextStat?.status === "partial"))
                    ? "#198754"
                    : (stepStat.status === "filled" || stepStat.status === "partial")
                    ? "#ffc107"
                    : "#cbd5e1";

                  return (
                    <div key={idx} className="d-flex align-items-center flex-grow-1">
                      <div
                        className="d-flex align-items-center cursor-pointer p-1"
                        onClick={() => handleGoToStep(idx)}
                        title={`${idx + 1}. ${name}: ${stepStat.pts} Pts (${stepStat.status.toUpperCase()})`}
                      >
                        <span
                          className={`rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm transition-all ${
                            isActive
                              ? "bg-primary text-white fw-bold border border-2 border-white"
                              : stepStat.bg
                          }`}
                          style={{
                            width: 34,
                            height: 34,
                            fontSize: "1rem",
                            transform: isActive ? "scale(1.15)" : "scale(1)"
                          }}
                        >
                          <i className={`bi ${STEP_ICONS[idx] || "bi-app"}`}></i>
                        </span>
                      </div>
                      {idx < STEP_NAMES.length - 1 && (
                        <div
                          className="flex-grow-1"
                          style={{
                            height: "3px",
                            minWidth: "16px",
                            backgroundColor: lineColor,
                            borderRadius: "2px",
                            transition: "background-color 0.3s ease",
                            margin: "0 4px"
                          }}
                        />
                      )}
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

                  {/* Photo Upload Widget */}
                  <div className="card border bg-light mb-4 rounded-3">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center gap-4">
                        {/* Photo preview circle */}
                        <div
                          className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0 border border-2"
                          style={{ width: 80, height: 80, background: "#e9ecef", borderColor: "#dee2e6" }}
                        >
                          {uploadingPhoto ? (
                            <span className="spinner-border spinner-border-sm text-primary"></span>
                          ) : activeResume.personal?.photo ? (
                            <img
                              src={normalizePhotoUrl(activeResume.personal.photo)}
                              alt="Profile"
                              className="w-100 h-100"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <i className="bi bi-person-fill text-secondary fs-2"></i>
                          )}
                        </div>
                        {/* Upload info */}
                        <div className="flex-grow-1">
                          <p className="fw-semibold mb-1 small text-dark">Profile Photo for Resume</p>
                          <p className="text-muted mb-2" style={{ fontSize: "0.78rem" }}>
                            {activeResume.personal?.photo
                              ? "Photo loaded from your profile. You can update it below."
                              : "No photo yet. Upload to include your photo in the resume."}
                          </p>
                          <label
                            htmlFor="resumePhotoInput"
                            className={`btn btn-sm ${ uploadingPhoto ? "btn-secondary disabled" : "btn-outline-primary" } fw-semibold`}
                            style={{ cursor: uploadingPhoto ? "not-allowed" : "pointer" }}
                          >
                            {uploadingPhoto ? (
                              <><span className="spinner-border spinner-border-sm me-1"></span>Uploading...</>
                            ) : (
                              <><i className="bi bi-camera me-1"></i>{activeResume.personal?.photo ? "Change Photo" : "Upload Photo"}</>
                            )}
                            <input
                              id="resumePhotoInput"
                              type="file"
                              accept="image/*"
                              className="d-none"
                              disabled={uploadingPhoto}
                              onChange={handleResumePhotoChange}
                            />
                          </label>
                          {activeResume.personal?.photo && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger ms-2"
                              onClick={() => {
                                const updated = {
                                  ...activeResume,
                                  personal: {
                                    ...activeResume.personal,
                                    photo: "",
                                    showPhoto: false,
                                  },
                                };
                                handleUpdateResume(updated);
                              }}
                            >
                              <i className="bi bi-trash me-1"></i>Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-semibold">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        id="field_fullName"
                        type="text"
                        className={`form-control ${stepErrors.fullName ? "is-invalid border-danger" : ""}`}
                        value={activeResume.personal?.fullName || ""}
                        onChange={(e) => {
                          handlePersonalChange("fullName", e.target.value);
                          if (stepErrors.fullName) setStepErrors((prev) => ({ ...prev, fullName: null }));
                        }}
                        placeholder="e.g. John Doe"
                      />
                      {stepErrors.fullName && <div className="invalid-feedback d-block text-danger small mt-1"><i className="bi bi-exclamation-circle me-1"></i>{stepErrors.fullName}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-semibold">
                        Professional Title <span className="text-danger">*</span>
                      </label>
                      <input
                        id="field_professionalTitle"
                        type="text"
                        className={`form-control ${stepErrors.professionalTitle ? "is-invalid border-danger" : ""}`}
                        value={activeResume.personal?.professionalTitle || ""}
                        onChange={(e) => {
                          handlePersonalChange("professionalTitle", e.target.value);
                          if (stepErrors.professionalTitle) setStepErrors((prev) => ({ ...prev, professionalTitle: null }));
                        }}
                        placeholder="e.g. Full Stack Engineer"
                      />
                      {stepErrors.professionalTitle && <div className="invalid-feedback d-block text-danger small mt-1"><i className="bi bi-exclamation-circle me-1"></i>{stepErrors.professionalTitle}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-semibold">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        id="field_email"
                        type="email"
                        className={`form-control ${stepErrors.email ? "is-invalid border-danger" : ""}`}
                        value={activeResume.personal?.email || ""}
                        onChange={(e) => {
                          handlePersonalChange("email", e.target.value);
                          if (stepErrors.email) setStepErrors((prev) => ({ ...prev, email: null }));
                        }}
                        placeholder="e.g. john.doe@example.com"
                      />
                      {stepErrors.email && <div className="invalid-feedback d-block text-danger small mt-1"><i className="bi bi-exclamation-circle me-1"></i>{stepErrors.email}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-semibold">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        id="field_phone"
                        type="text"
                        className={`form-control ${stepErrors.phone ? "is-invalid border-danger" : ""}`}
                        value={activeResume.personal?.phone || ""}
                        onChange={(e) => {
                          handlePersonalChange("phone", e.target.value);
                          if (stepErrors.phone) setStepErrors((prev) => ({ ...prev, phone: null }));
                        }}
                        placeholder="e.g. +91 9876543210"
                      />
                      {stepErrors.phone && <div className="invalid-feedback d-block text-danger small mt-1"><i className="bi bi-exclamation-circle me-1"></i>{stepErrors.phone}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-semibold">
                        Location / City <span className="text-danger">*</span>
                      </label>
                      <input
                        id="field_location"
                        type="text"
                        className={`form-control ${stepErrors.location ? "is-invalid border-danger" : ""}`}
                        value={activeResume.personal?.location || ""}
                        onChange={(e) => {
                          handlePersonalChange("location", e.target.value);
                          if (stepErrors.location) setStepErrors((prev) => ({ ...prev, location: null }));
                        }}
                        placeholder="e.g. Bengaluru, Karnataka"
                      />
                      {stepErrors.location && <div className="invalid-feedback d-block text-danger small mt-1"><i className="bi bi-exclamation-circle me-1"></i>{stepErrors.location}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">LinkedIn URL</label>
                      <input type="text" className="form-control" value={activeResume.personal?.linkedin || ""} onChange={(e) => handlePersonalChange("linkedin", e.target.value)} placeholder="https://linkedin.com/in/username" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">GitHub URL</label>
                      <input type="text" className="form-control" value={activeResume.personal?.github || ""} onChange={(e) => handlePersonalChange("github", e.target.value)} placeholder="https://github.com/username" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Portfolio / Website</label>
                      <input type="text" className="form-control" value={activeResume.personal?.portfolio || ""} onChange={(e) => handlePersonalChange("portfolio", e.target.value)} placeholder="https://myportfolio.com" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-muted">LeetCode URL</label>
                      <input type="text" className="form-control" value={activeResume.personal?.leetcode || ""} onChange={(e) => handlePersonalChange("leetcode", e.target.value)} placeholder="https://leetcode.com/username" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-muted">HackerRank URL</label>
                      <input type="text" className="form-control" value={activeResume.personal?.hackerrank || ""} onChange={(e) => handlePersonalChange("hackerrank", e.target.value)} placeholder="https://hackerrank.com/username" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-muted">CodeChef URL</label>
                      <input type="text" className="form-control" value={activeResume.personal?.codechef || ""} onChange={(e) => handlePersonalChange("codechef", e.target.value)} placeholder="https://codechef.com/users/username" />
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
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold text-primary mb-0"><i className="bi bi-file-text me-2"></i>Professional Summary</h5>
                  </div>

                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows={5}
                      value={activeResume.summary || ""}
                      onChange={(e) => handleUpdateResume({ ...activeResume, summary: e.target.value })}
                      placeholder="Write a concise overview of your technical background and career goals..."
                      style={{ fontSize: "0.95rem" }}
                    />
                    <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 small text-muted">
                      <span>Word Count: <strong>{(activeResume.summary || "").split(/\s+/).filter(Boolean).length} words</strong></span>
                      {(() => {
                        const summaryText = (activeResume.summary || "").toLowerCase();
                        const verbs = ["engineered", "developed", "architected", "optimized", "built", "implemented", "managed", "created", "designed", "launched", "spearheaded", "led", "automated", "analyzed", "improved", "constructed", "delivered", "integrated", "accelerated", "collaborated", "formulated", "executed", "streamlined", "resolved"];
                        const found = Array.from(new Set(verbs.filter(v => summaryText.includes(v))));
                        return (
                          <span className={found.length >= 3 ? "text-success fw-bold" : found.length > 0 ? "text-warning fw-semibold" : "text-danger"}>
                            <i className={`bi ${found.length >= 3 ? "bi-check-circle-fill text-success" : "bi-lightning-charge-fill text-warning"} me-1`}></i>
                            Detected Action Verbs ({found.length}): {found.length > 0 ? found.join(", ") : "None detected yet"}
                          </span>
                        );
                      })()}
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
                            <input type="text" className="form-control form-control-sm" value={edu.degree || ""} onChange={(e) => handleEduChange(edu.id, "degree", e.target.value)} placeholder="e.g. B.Tech / B.E." />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Specialization / Branch</label>
                            <input type="text" className="form-control form-control-sm" value={edu.specialization || ""} onChange={(e) => handleEduChange(edu.id, "specialization", e.target.value)} placeholder="e.g. Computer Science & Engineering" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">College / Institute</label>
                            <input type="text" className="form-control form-control-sm" value={edu.college || ""} onChange={(e) => handleEduChange(edu.id, "college", e.target.value)} placeholder="e.g. Aadya Institute of Technology" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">University / Board</label>
                            <input type="text" className="form-control form-control-sm" value={edu.university || ""} onChange={(e) => handleEduChange(edu.id, "university", e.target.value)} placeholder="e.g. Bangalore University / VTU" />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small text-muted">Start Year</label>
                            <input type="text" className="form-control form-control-sm" value={edu.startYear || ""} onChange={(e) => handleEduChange(edu.id, "startYear", e.target.value)} placeholder="e.g. 2021" />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small text-muted">End Year</label>
                            <input type="text" className="form-control form-control-sm" value={edu.endYear || ""} onChange={(e) => handleEduChange(edu.id, "endYear", e.target.value)} placeholder="e.g. 2025" />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small text-muted">CGPA</label>
                            <input type="text" className="form-control form-control-sm" value={edu.cgpa || ""} onChange={(e) => handleEduChange(edu.id, "cgpa", e.target.value)} placeholder="e.g. 8.5" />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small text-muted">Percentage</label>
                            <input type="text" className="form-control form-control-sm" value={edu.percentage || ""} onChange={(e) => handleEduChange(edu.id, "percentage", e.target.value)} placeholder="e.g. 85%" />
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
                            <input type="text" className="form-control form-control-sm" value={exp.company || ""} onChange={(e) => handleExpChange(exp.id, "company", e.target.value)} placeholder="e.g. TechCorp Solutions" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Designation / Role</label>
                            <input type="text" className="form-control form-control-sm" value={exp.designation || ""} onChange={(e) => handleExpChange(exp.id, "designation", e.target.value)} placeholder="e.g. Software Engineer Intern" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Employment Type</label>
                            <select className="form-select form-select-sm" value={exp.employmentType || "Full-time"} onChange={(e) => handleExpChange(exp.id, "employmentType", e.target.value)}>
                              <option value="Internship">Internship</option>
                              <option value="Full-time">Full-time</option>
                              <option value="Part-time">Part-time</option>
                              <option value="Contract">Contract</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Technologies Used</label>
                            <input type="text" className="form-control form-control-sm" value={exp.technologies || ""} onChange={(e) => handleExpChange(exp.id, "technologies", e.target.value)} placeholder="e.g. React, Node.js, MySQL" />
                          </div>
                          <div className="col-12">
                            <label className="form-label small text-muted">Responsibilities & Achievements</label>
                            <textarea className="form-control form-control-sm" rows={3} value={exp.responsibilities || ""} onChange={(e) => handleExpChange(exp.id, "responsibilities", e.target.value)} placeholder="Describe key responsibilities and achievements..."></textarea>
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
                            <input type="text" className="form-control form-control-sm" value={proj.name || ""} onChange={(e) => handleProjChange(proj.id, "name", e.target.value)} placeholder="e.g. AI Placement Management Portal" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Role</label>
                            <input type="text" className="form-control form-control-sm" value={proj.role || ""} onChange={(e) => handleProjChange(proj.id, "role", e.target.value)} placeholder="e.g. Full Stack Developer" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">GitHub Link</label>
                            <input type="text" className="form-control form-control-sm" value={proj.githubLink || ""} onChange={(e) => handleProjChange(proj.id, "githubLink", e.target.value)} placeholder="https://github.com/username/project" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Live Demo Link</label>
                            <input type="text" className="form-control form-control-sm" value={proj.liveDemo || ""} onChange={(e) => handleProjChange(proj.id, "liveDemo", e.target.value)} placeholder="https://myprojectdemo.com" />
                          </div>
                          <div className="col-12">
                            <label className="form-label small text-muted">Project Description & Key Bullet Points</label>
                            <textarea className="form-control form-control-sm" rows={3} value={proj.description || ""} onChange={(e) => handleProjChange(proj.id, "description", e.target.value)} placeholder="Brief summary of the project, features built, and key contributions..."></textarea>
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
                    <h5 className="fw-bold text-primary mb-0"><i className="bi bi-patch-check me-2"></i>Certifications & Documents</h5>
                    <button className="btn btn-primary btn-sm" onClick={handleAddCert}>
                      <i className="bi bi-plus-lg me-1"></i> Add Certification
                    </button>
                  </div>

                  {(activeResume.certifications || []).map((c, idx) => (
                    <div key={c.id} className="card border mb-3 shadow-sm rounded-3">
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
                            <input type="text" className="form-control form-control-sm" value={c.name || ""} onChange={(e) => handleCertChange(c.id, "name", e.target.value)} placeholder="e.g. AWS Certified Developer" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Issuing Organization</label>
                            <input type="text" className="form-control form-control-sm" value={c.organization || ""} onChange={(e) => handleCertChange(c.id, "organization", e.target.value)} placeholder="e.g. Amazon Web Services" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Issue Date</label>
                            <input type="month" className="form-control form-control-sm" value={c.issueDate || ""} onChange={(e) => handleCertChange(c.id, "issueDate", e.target.value)} />
                          </div>

                          {/* Certificate Document Upload */}
                          <div className="col-md-6">
                            <label className="form-label small text-muted fw-semibold">
                              Upload Certificate (PDF / Image)
                            </label>
                            {c.credentialUrl && c.credentialUrl.startsWith("data:") ? (
                              <div className="p-2 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div className="d-flex align-items-center gap-2 overflow-hidden">
                                  <i className="bi bi-file-earmark-check-fill text-success fs-5 flex-shrink-0"></i>
                                  <span className="fw-semibold text-success small text-truncate" style={{ maxWidth: "160px" }}>
                                    {c.fileName || "Certificate Attached"}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-outline-success fw-semibold"
                                    onClick={() => handleViewCertDocument(c.credentialUrl, c.fileName)}
                                  >
                                    <i className="bi bi-eye me-1"></i> View
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-outline-danger"
                                    title="Remove uploaded file"
                                    onClick={() => handleRemoveCertFile(c.id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="form-control form-control-sm"
                                onChange={(e) => handleCertFileChange(c.id, e)}
                              />
                            )}
                          </div>

                          <div className="col-12">
                            <label className="form-label small text-muted">
                              Or Credential Verification Link <span className="fst-italic text-muted">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={c.credentialUrl && !c.credentialUrl.startsWith("data:") ? c.credentialUrl : ""}
                              onChange={(e) => handleCertChange(c.id, "credentialUrl", e.target.value)}
                              placeholder="https://credential-verification-link.com"
                            />
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
                            <select className="form-select form-select-sm" value={ach.category || "Awards"} onChange={(e) => handleAchChange(ach.id, "category", e.target.value)}>
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
                            <input type="text" className="form-control form-control-sm" value={ach.title || ""} onChange={(e) => handleAchChange(ach.id, "title", e.target.value)} placeholder="e.g. 1st Place in Smart India Hackathon" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Issuer / Host</label>
                            <input type="text" className="form-control form-control-sm" value={ach.issuer || ""} onChange={(e) => handleAchChange(ach.id, "issuer", e.target.value)} placeholder="e.g. Ministry of Education" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted">Description</label>
                            <input type="text" className="form-control form-control-sm" value={ach.description || ""} onChange={(e) => handleAchChange(ach.id, "description", e.target.value)} placeholder="Brief details about the achievement..." />
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
                        <input type="text" className="form-control form-control-sm" value={l.language || ""} onChange={(e) => handleLangChange(l.id, "language", e.target.value)} placeholder="e.g. English, Kannada, Hindi" />
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


              {/* STEP 10: Review & Generate */}
              {currentStep === 9 && (
                <div>
                  <h5 className="fw-bold text-success mb-3"><i className="bi bi-check-circle me-2"></i>Review & Generate Resume</h5>
                  
                  {/* ATS Score Card */}
                  {(() => {
                    const ats = calculateATSMetrics(activeResume);
                    return (
                      <div className="card border-0 bg-primary bg-opacity-10 rounded-3 mb-4 p-4">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: 60, height: 60 }}>
                              {ats.score}%
                            </div>
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <h5 className="fw-bold mb-0 text-dark">ATS Resume Health Score</h5>
                                <span className="badge bg-primary fs-6">Grade {ats.grade}</span>
                              </div>
                              <p className="text-muted small mb-0 mt-1">
                                High ATS compliance ensures your resume passes recruiter screening software.
                              </p>
                            </div>
                          </div>
                         
                        </div>

                        {/* Breakdown meters */}
                        <div className="row g-3 mt-3">
                          {Object.entries(ats.breakdown).map(([key, val], idx) => {
                            const targetStep = getStepIndexFromCategory(key);
                            const SECTION_MAX_POINTS = {
                              personal: 20,
                              summary: 15,
                              education: 15,
                              experience: 5,
                              projects: 20,
                              skills: 15,
                              actionVerbs: 5,
                              formatting: 5,
                            };
                            const maxPts = SECTION_MAX_POINTS[key] || 15;
                            const isGreen = val >= maxPts;
                            const isYellow = val > 0 && val < maxPts;
                            const isGray = val === 0;
                            const pct = Math.min(100, Math.round((val / maxPts) * 100));

                            const ptsTextColor = isGreen ? "text-success" : isYellow ? "text-warning" : "text-danger opacity-75";
                            const progressBg = isGreen ? "bg-success" : isYellow ? "bg-warning" : "bg-secondary bg-opacity-25";
                            const borderHighlight = isGreen ? "#198754" : isYellow ? "#ffc107" : "#6c757d";

                            return (
                              <div key={idx} className="col-6 col-md-3">
                                <div 
                                  className="p-2 bg-white rounded border small shadow-sm cursor-pointer"
                                  style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                                  onClick={() => handleGoToStep(targetStep)}
                                  title={`Click to fill/edit ${key} section (${val}/${maxPts} Pts)`}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.borderColor = borderHighlight;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.borderColor = "#dee2e6";
                                  }}
                                >
                                  <div className="d-flex justify-content-between text-capitalize text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                                    <span className="fw-semibold text-dark d-flex align-items-center gap-1">
                                      {key} 
                                      {isGreen && <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "0.75rem" }}></i>}
                                      {isYellow && <i className="bi bi-exclamation-circle-fill text-warning" style={{ fontSize: "0.75rem" }}></i>}
                                      {isGray && <i className="bi bi-pencil-square text-secondary opacity-50" style={{ fontSize: "0.75rem" }}></i>}
                                    </span>
                                    <span className={`fw-bold ${ptsTextColor}`}>{val} Pts</span>
                                  </div>
                                  <div className="progress" style={{ height: 5 }}>
                                    <div className={`progress-bar ${progressBg}`} style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Actionable Tips */}
                        {ats.tips && ats.tips.length > 0 && (
                          <div className="mt-3 pt-3 border-top border-primary border-opacity-25">
                            <h6 className="fw-bold text-dark small mb-2">
                              <i className="bi bi-lightbulb text-warning me-1"></i> Recommended Optimization Improvements (Click to jump & fill):
                            </h6>
                            <div className="d-flex flex-column gap-2">
                              {ats.tips.map((t, idx) => {
                                const targetStep = getStepIndexFromCategory(t.cat || t.text);
                                return (
                                  <div 
                                    key={idx} 
                                    className="d-flex align-items-center justify-content-between p-2.5 rounded bg-white border border-light shadow-sm text-dark cursor-pointer"
                                    style={{ cursor: "pointer", transition: "all 0.15s ease", fontSize: "0.85rem" }}
                                    onClick={() => handleGoToStep(targetStep)}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = "#f0f4ff";
                                      e.currentTarget.style.borderColor = "#0d6efd";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "#ffffff";
                                      e.currentTarget.style.borderColor = "#f8f9fa";
                                    }}
                                  >
                                    <div>
                                      <span className="badge bg-primary bg-opacity-10 text-primary fw-bold me-2">[{t.cat}]</span>
                                      <span>{t.text}</span>
                                    </div>
                                    <span className="badge bg-primary text-white ms-2 px-2 py-1 flex-shrink-0 d-inline-flex align-items-center gap-1">
                                      Fix Section <i className="bi bi-arrow-right"></i>
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}



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
                {currentStep === STEP_NAMES.length - 1 ? (
                  <button
                    className="btn btn-success fw-bold px-4 d-inline-flex align-items-center gap-2"
                    onClick={handleSubmitResume}
                  >
                    <i className="bi bi-check-circle-fill"></i> Submit
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGoToStep(currentStep + 1)}
                  >
                    Next <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── LIVE PREVIEW MODAL ───────────────────────────────────────────── */}
      {showPreviewModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-75" tabIndex="-1" style={{ zIndex: 1055 }}>
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
            style={{ maxWidth: "min(90vw, 900px)", margin: "0.5rem auto" }}
          >
            <div className="modal-content border-0 shadow-lg" style={{ maxHeight: "95vh" }}>
              <div className="modal-body p-0 p-sm-2 overflow-auto">
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

      {/* ─── DOCUMENT PREVIEW MODAL ───────────────────────────────────────── */}
      {viewingDoc && (
        <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white py-2">
                <h6 className="modal-title fw-bold d-flex align-items-center">
                  <i className="bi bi-file-earmark-medical me-2"></i>
                  {viewingDoc.name || "Certificate Document"}
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setViewingDoc(null)}
                ></button>
              </div>
              <div className="modal-body p-3 text-center bg-light" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                {viewingDoc.url?.startsWith("data:image/") || viewingDoc.url?.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ? (
                  <img
                    src={viewingDoc.url}
                    alt={viewingDoc.name || "Certificate"}
                    className="img-fluid rounded shadow-sm border"
                    style={{ maxHeight: "65vh", objectFit: "contain" }}
                  />
                ) : viewingDoc.url?.startsWith("data:application/pdf") || viewingDoc.url?.endsWith(".pdf") ? (
                  <iframe
                    src={viewingDoc.url}
                    title={viewingDoc.name || "Certificate PDF"}
                    width="100%"
                    height="500px"
                    className="border rounded shadow-sm"
                  ></iframe>
                ) : (
                  <div className="py-4">
                    <i className="bi bi-file-earmark-text text-primary display-4 mb-2 d-block"></i>
                    <p className="fw-semibold text-dark mb-2">{viewingDoc.name}</p>
                    <a
                      href={viewingDoc.url}
                      download={viewingDoc.name || "certificate"}
                      className="btn btn-primary btn-sm"
                    >
                      <i className="bi bi-download me-1"></i> Download Document
                    </a>
                  </div>
                )}
              </div>
              <div className="modal-footer py-2 bg-white d-flex justify-content-between">
                <a
                  href={viewingDoc.url}
                  download={viewingDoc.name || "certificate"}
                  className="btn btn-sm btn-outline-primary fw-semibold"
                >
                  <i className="bi bi-download me-1"></i> Download
                </a>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setViewingDoc(null)}
                >
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
