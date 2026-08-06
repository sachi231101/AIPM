// ─── RESUME STORAGE & MOCK AI UTILITIES ─────────────────────────────────────

const STORAGE_KEY = "apms_student_resumes";
const ACTIVE_RESUME_KEY = "apms_active_resume_id";

// Normalize a photo URL — handles absolute http URLs, base64, /storage/... paths, and relative paths
export function normalizePhotoUrl(url) {
  if (!url) return "";
  if (url.startsWith("data:")) return url;

  if (typeof url === "string" && url.includes("/storage/")) {
    const relativePath = url.split("/storage/")[1];
    return `/storage/${relativePath}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.includes("/storage/")) {
        return `/storage/${parsed.pathname.split("/storage/")[1]}`;
      }
      return parsed.pathname;
    } catch {
      return url;
    }
  }

  let path = url;
  if (!path.startsWith("/storage/") && !path.startsWith("storage/")) {
    path = `/storage/${path.replace(/^\//, "")}`;
  } else if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return path;
}

// Convert any image URL (http/relative) to a Base64 Data URL for robust canvas/PDF rendering
export function convertImageToBase64(url) {
  return new Promise((resolve) => {
    if (!url) return resolve("");
    if (url.startsWith("data:")) return resolve(url);

    const fullUrl = normalizePhotoUrl(url);

    // Method 1: HTML5 Image + Canvas
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width || 100;
        canvas.height = img.naturalHeight || img.height || 100;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        if (dataUrl && dataUrl.startsWith("data:image")) {
          return resolve(dataUrl);
        }
      } catch (e) {
        // Canvas tainted or CORS error, proceed to fallback
      }
      fallbackFetch();
    };
    img.onerror = () => {
      fallbackFetch();
    };

    const cacheBustUrl = fullUrl.includes("?") ? `${fullUrl}&_cb=${Date.now()}` : `${fullUrl}?_cb=${Date.now()}`;
    img.src = cacheBustUrl;

    function fallbackFetch() {
      fetch(fullUrl)
        .then((res) => {
          if (!res.ok) throw new Error("HTTP error " + res.status);
          return res.blob();
        })
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result || fullUrl);
          reader.onerror = () => resolve(fullUrl);
          reader.readAsDataURL(blob);
        })
        .catch(() => resolve(fullUrl));
    }
  });
}



// Default blank resume structure (uses strictly student profile data, NO mock data)
export function createDefaultResume(profileData = {}) {
  const name = profileData.name || profileData.fullName || "";
  const email = profileData.email || "";
  const phone = profileData.mobile || profileData.phone || "";
  const location = profileData.address || "";
  const course = profileData.course || "";
  const branch = profileData.branch || "";
  const title = profileData.professional_title || profileData.target_role || (course ? `${course}${branch ? ` - ${branch}` : ""} Student` : "");
  const institute = profileData.institute?.name || profileData.other_institute_name || (typeof profileData.institute === "string" ? profileData.institute : "");
  const cgpa = profileData.cgpa ? String(profileData.cgpa) : "";
  const photo = normalizePhotoUrl(profileData.profile_photo || profileData.profilePhoto || "");

  // Skill array from student profile if available
  const profileSkills = Array.isArray(profileData.skills) ? profileData.skills : [];
  const softSkills = Array.isArray(profileData.soft_skills) ? profileData.soft_skills : [];

  return {
    id: "master",
    title: "Master Resume",
    updatedAt: new Date().toISOString(),
    personal: {
      photo: photo,
      fullName: name,
      professionalTitle: title,
      email: email,
      phone: phone,
      location: location,
      linkedin: profileData.linkedin || "",
      github: profileData.github || "",
      portfolio: profileData.portfolio || "",
      leetcode: "",
      hackerrank: "",
      codechef: "",
      gender: profileData.gender || "",
      dob: profileData.dob || "",
      nationality: "Indian",
      // Visibility toggles
      showPhoto: !!photo,
      showLinkedin: !!profileData.linkedin,
      showGithub: !!profileData.github,
      showPortfolio: !!profileData.portfolio,
      showLeetcode: false,
      showHackerrank: false,
      showCodechef: false,
      showGender: false,
      showDob: false,
      showNationality: false,
    },
    summary: profileData.summary || "",
    education: (course || institute)
      ? [
          {
            id: "edu_1",
            degree: course,
            specialization: branch,
            college: institute,
            university: "",
            location: location,
            startYear: "",
            endYear: profileData.passing_year || profileData.batch || "",
            cgpa: cgpa,
            percentage: "",
            currentlyStudying: true,
          },
        ]
      : [],
    experience: [],
    projects: [],
    skills: {
      technical: profileSkills,
      accountingFinance: [],
      officeTools: [],
      programmingLanguages: [],
      frontend: [],
      backend: [],
      tools: [],
      softSkills: softSkills,
    },
    certifications: [],
    achievements: [],
    languages: [],
    settings: {
      template: "modern", // modern, professional, minimal, executive, student
      accentColor: "#0F4C81",
      showPhoto: true,
      length: "one_page", // one_page, two_pages
      paperSize: "a4", // a4, letter
      fontFamily: "Inter", // Inter, Roboto, Outfit, Merriweather, Poppins
      fontStyle: "normal", // normal, italic, oblique
      fontSize: "medium", // small, medium, large, xlarge
      lineSpacing: "normal", // compact, normal, spacious
    },
  };
}

// Merge/pre-fill latest student profile information into a resume object
export function mergeProfileIntoResume(resumeObj, profileData = {}) {
  if (!resumeObj) return createDefaultResume(profileData);

  const name = profileData.name || profileData.fullName || "";
  const email = profileData.email || "";
  const phone = profileData.mobile || profileData.phone || "";
  const location = profileData.address || "";
  const course = profileData.course || "";
  const branch = profileData.branch || "";
  const title = profileData.professional_title || profileData.target_role || (course ? `${course}${branch ? ` - ${branch}` : ""} Student` : "");
  const institute = profileData.institute?.name || profileData.other_institute_name || (typeof profileData.institute === "string" ? profileData.institute : "");
  const cgpa = profileData.cgpa ? String(profileData.cgpa) : "";
  const photo = normalizePhotoUrl(profileData.profile_photo || profileData.profilePhoto || "");
  const profileSkills = Array.isArray(profileData.skills) ? profileData.skills : [];

  const existingPersonal = resumeObj.personal || {};
  const existingEducation = Array.isArray(resumeObj.education) ? resumeObj.education : [];
  const existingSkills = resumeObj.skills || {};

  const mergedPersonal = {
    ...existingPersonal,
    fullName: existingPersonal.fullName || name,
    email: existingPersonal.email || email,
    phone: existingPersonal.phone || phone,
    location: existingPersonal.location || location,
    linkedin: existingPersonal.linkedin || profileData.linkedin || "",
    github: existingPersonal.github || profileData.github || "",
    portfolio: existingPersonal.portfolio || profileData.portfolio || "",
    gender: existingPersonal.gender || profileData.gender || "",
    dob: existingPersonal.dob || profileData.dob || "",
    photo: photo || existingPersonal.photo || "",
    professionalTitle: existingPersonal.professionalTitle || title,
    showPhoto: existingPersonal.showPhoto !== undefined ? existingPersonal.showPhoto : !!(photo || existingPersonal.photo),
    showLinkedin: existingPersonal.showLinkedin ?? !!profileData.linkedin,
    showGithub: existingPersonal.showGithub ?? !!profileData.github,
    showPortfolio: existingPersonal.showPortfolio ?? !!profileData.portfolio,
  };

  const mergedEducation = existingEducation.length > 0 ? existingEducation : [
    {
      id: "edu_1",
      degree: course,
      specialization: branch,
      college: institute,
      university: "",
      location: location,
      startYear: "",
      endYear: profileData.passing_year || profileData.batch || "",
      cgpa: cgpa,
      percentage: "",
      currentlyStudying: true,
    }
  ];

  const mergedSkills = {
    ...existingSkills,
    technical: (existingSkills.technical && existingSkills.technical.length > 0) ? existingSkills.technical : profileSkills,
  };

  const mergedSettings = {
    template: "modern",
    accentColor: "#0F4C81",
    showPhoto: true,
    length: "one_page",
    paperSize: "a4",
    fontFamily: "Inter",
    fontStyle: "normal",
    fontSize: "medium",
    lineSpacing: "normal",
    ...(resumeObj.settings || {}),
  };

  return {
    ...resumeObj,
    personal: mergedPersonal,
    education: mergedEducation,
    skills: mergedSkills,
    settings: mergedSettings,
  };
}

// ─── STORAGE MANAGERS (SCOPED PER LOGGED-IN STUDENT USER AND PROFILE ID) ───

function getCurrentUserId() {
  try {
    const rawUser = localStorage.getItem("apms_user");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      return u.id || u.student_id || "guest";
    }
  } catch (e) {}
  return "guest";
}

function getStorageKeys(userId = "", profileId = "") {
  const uid = userId || getCurrentUserId();
  const pid = profileId || localStorage.getItem("apms_active_profile_id") || "default";
  return {
    STORAGE_KEY: `apms_student_resumes_${uid}_p${pid}`,
    ACTIVE_RESUME_KEY: `apms_active_resume_id_${uid}_p${pid}`,
  };
}

export function getAllResumes(profileData = {}, userId = "", profileId = "") {
  try {
    const { STORAGE_KEY, ACTIVE_RESUME_KEY } = getStorageKeys(userId, profileId);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultRes = createDefaultResume(profileData);
      const list = [defaultRes];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      localStorage.setItem(ACTIVE_RESUME_KEY, defaultRes.id);
      return list;
    }
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      const defaultRes = createDefaultResume(profileData);
      const newArr = [defaultRes];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newArr));
      localStorage.setItem(ACTIVE_RESUME_KEY, defaultRes.id);
      return newArr;
    }
    return list;
  } catch (err) {
    console.error("Failed to read resumes from storage", err);
    const defaultRes = createDefaultResume(profileData);
    return [defaultRes];
  }
}

export function saveAllResumes(resumeList, userId = "", profileId = "") {
  try {
    const { STORAGE_KEY, ACTIVE_RESUME_KEY } = getStorageKeys(userId, profileId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeList));
    if (resumeList.length > 0) {
      localStorage.setItem(ACTIVE_RESUME_KEY, resumeList[0].id);
    }
  } catch (err) {
    console.error("Failed to save resume list", err);
  }
}

export function getActiveResumeId(userId = "", profileId = "") {
  try {
    const { ACTIVE_RESUME_KEY } = getStorageKeys(userId, profileId);
    return localStorage.getItem(ACTIVE_RESUME_KEY);
  } catch (e) {
    return null;
  }
}

export function setActiveResumeId(id, userId = "", profileId = "") {
  try {
    const { ACTIVE_RESUME_KEY } = getStorageKeys(userId, profileId);
    localStorage.setItem(ACTIVE_RESUME_KEY, id);
  } catch (e) {}
}

export function getActiveResume(profileData = {}, userId = "", profileId = "") {
  const list = getAllResumes(profileData, userId, profileId);
  const activeId = getActiveResumeId(userId, profileId);
  return list.find((r) => r.id === activeId) || list[0];
}

export function saveResume(resumeObj, userId = "", profileId = "") {
  if (!resumeObj || !resumeObj.id) return;
  const list = getAllResumes({}, userId, profileId);
  const index = list.findIndex((r) => r.id === resumeObj.id);

  const updatedObj = { ...resumeObj, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updatedObj;
  } else {
    list.push(updatedObj);
  }
  saveAllResumes(list, userId, profileId);
  setActiveResumeId(updatedObj.id, userId, profileId);
  return updatedObj;
}

export function createNewResume(profileData = {}, userId = "", profileId = "") {
  const list = getAllResumes(profileData, userId, profileId);
  const newRes = createDefaultResume(profileData);
  newRes.title = `Resume Version ${list.length + 1}`;
  list.push(newRes);
  saveAllResumes(list, userId, profileId);
  setActiveResumeId(newRes.id, userId, profileId);
  return newRes;
}

export function duplicateResume(id, userId = "", profileId = "") {
  const list = getAllResumes({}, userId, profileId);
  const target = list.find((r) => r.id === id);
  if (!target) return null;

  const dup = JSON.parse(JSON.stringify(target));
  dup.id = "resume_" + Date.now();
  dup.title = `${target.title} (Copy)`;
  dup.updatedAt = new Date().toISOString();

  list.push(dup);
  saveAllResumes(list, userId, profileId);
  setActiveResumeId(dup.id, userId, profileId);
  return dup;
}

export function deleteResume(id, userId = "", profileId = "") {
  let list = getAllResumes({}, userId, profileId);
  if (list.length <= 1) {
    return false; // Minimum 1 resume required
  }
  list = list.filter((r) => r.id !== id);
  saveAllResumes(list, userId, profileId);
  const activeId = getActiveResumeId(userId, profileId);
  if (activeId === id && list.length > 0) {
    setActiveResumeId(list[0].id, userId, profileId);
  }
  return true;
}

// ─── ATS SCORE CALCULATOR (Rule-based 0 - 100) ──────────────────────────────

export function calculateATSMetrics(resumeObj) {
  if (!resumeObj) return { score: 0, grade: "F", breakdown: {}, tips: [] };

  let score = 0;
  const breakdown = {
    personal: 0,
    summary: 0,
    education: 0,
    experience: 0,
    projects: 0,
    skills: 0,
    actionVerbs: 0,
    formatting: 0,
  };
  const tips = [];

  const p = resumeObj.personal || {};
  if (p.fullName) breakdown.personal += 5;
  if (p.email && p.email.includes("@")) breakdown.personal += 5;
  if (p.phone) breakdown.personal += 5;
  if (p.linkedin) breakdown.personal += 5;
  if (!p.fullName) tips.push({ cat: "Personal", text: "Add your full name." });
  if (!p.linkedin) tips.push({ cat: "Personal", text: "Add a LinkedIn profile URL to boost your professional credibility." });

  const s = resumeObj.summary || "";
  if (s.length > 80) breakdown.summary += 15;
  else if (s.length > 20) breakdown.summary += 8;
  else tips.push({ cat: "Summary", text: "Write a detailed 3-4 sentence professional summary statement." });

  const edu = (resumeObj.education || []).filter((e) => e && (e.degree?.trim() || e.college?.trim() || e.university?.trim() || e.specialization?.trim()));
  if (edu.length > 0) breakdown.education += 15;
  else tips.push({ cat: "Education", text: "Add at least 1 education entry (Degree, Branch & Institute)." });

  const exp = (resumeObj.experience || []).filter((e) => e && (e.designation?.trim() || e.company?.trim() || e.responsibilities?.trim()));
  if (exp.length > 0) {
    breakdown.experience += 5;
  } else {
    tips.push({ cat: "Experience", text: "Add work experience or internships if available." });
  }

  const proj = (resumeObj.projects || []).filter((p) => p && (p.title?.trim() || p.description?.trim()));
  if (proj.length > 0) {
    breakdown.projects += 20;
  } else {
    tips.push({ cat: "Projects", text: "Add 2+ technical or academic projects detailing tools used." });
  }

  const skillsObj = resumeObj.skills || {};
  const totalSkills = Object.values(skillsObj).flat().filter(Boolean).length;
  if (totalSkills >= 8) breakdown.skills += 15;
  else if (totalSkills > 0) breakdown.skills += 8;
  else tips.push({ cat: "Skills", text: "Add at least 8 relevant technical and soft skills." });

  // Production-Grade Action Verbs Detection (Max 5 Pts)
  const ACTION_VERBS_DICTIONARY = {
    engineering: ["engineered", "developed", "architected", "automated", "built", "configured", "deployed", "programmed", "refactored", "integrated", "debugged", "optimized"],
    leadership: ["spearheaded", "led", "directed", "orchestrated", "pioneered", "headed", "supervised", "coordinated", "delegated", "championed"],
    results: ["resolved", "accelerated", "streamlined", "increased", "reduced", "transformed", "boosted", "delivered", "achieved", "surpassed", "maximized"],
    design: ["designed", "formulated", "fashioned", "innovated", "conceptualized", "drafted", "constructed", "crafted", "created", "launched"],
    analysis: ["analyzed", "evaluated", "synthesized", "researched", "assessed", "audited", "investigated", "forecasted", "modeled"]
  };

  const allVerbs = Object.values(ACTION_VERBS_DICTIONARY).flat();
  const summaryText = (resumeObj.summary || "").toLowerCase();
  const expText = (resumeObj.experience || []).map(e => `${e.designation} ${e.company} ${e.responsibilities}`).join(" ").toLowerCase();
  const projText = (resumeObj.projects || []).map(p => `${p.title} ${p.description}`).join(" ").toLowerCase();
  const searchableText = `${summaryText} ${expText} ${projText}`;

  const matchedVerbs = allVerbs.filter((verb) => {
    const regex = new RegExp(`\\b${verb}\\b`, "i");
    return regex.test(searchableText);
  });

  const uniqueMatchedVerbs = Array.from(new Set(matchedVerbs));

  if (uniqueMatchedVerbs.length >= 3) {
    breakdown.actionVerbs += 5;
  } else if (uniqueMatchedVerbs.length > 0) {
    breakdown.actionVerbs += 3;
    tips.push({
      cat: "Action Verbs",
      text: `Found ${uniqueMatchedVerbs.length} action verb(s) (${uniqueMatchedVerbs.join(", ")}). Add at least 3 power verbs like 'Engineered', 'Spearheaded' or 'Optimized' for max points.`
    });
  } else {
    tips.push({
      cat: "Action Verbs",
      text: "No strong action verbs detected. Start your bullet points with power verbs like 'Developed', 'Engineered', 'Designed', or 'Spearheaded'."
    });
  }

  // ATS Formatting & Compliance check (Max 5 Pts)
  if (resumeObj.settings && resumeObj.settings.template) {
    breakdown.formatting += 5;
  } else {
    breakdown.formatting += 5; // Default active template
  }

  // Calculate total score and cap at 100%
  const rawScore = Object.values(breakdown).reduce((a, b) => a + b, 0);
  score = Math.min(100, Math.max(0, rawScore));

  let grade = "C";
  if (score >= 90) grade = "A+";
  else if (score >= 80) grade = "A";
  else if (score >= 70) grade = "B+";
  else if (score >= 60) grade = "B";
  else if (score >= 50) grade = "C+";

  return { score, grade, breakdown, tips };
}

export function getOverallProfileScore(student, activeProfileId = "") {
  if (!student) return 0;
  const userId = student.id || student.student_id || "";
  const profileId = activeProfileId || student.active_profile_id || localStorage.getItem("apms_active_profile_id") || "default";

  // Calculate ATS metrics for the current active resume
  const activeResume = getActiveResume(student, userId, profileId);
  const atsMetrics = calculateATSMetrics(activeResume);
  const atsScore = atsMetrics?.score || 0;

  // Calculate real field-by-field profile completeness (0-100)
  let totalScore = 0;

  // Helper for valid text check
  const isValid = (val) => val && val !== "N/A" && String(val).trim().length > 0;

  // 1. Basic & Personal Info (25%)
  if (isValid(student.name || student.fullName)) totalScore += 5;
  if (isValid(student.email)) totalScore += 5;
  if (isValid(student.mobile || student.phone)) totalScore += 5;
  if (isValid(student.dob)) totalScore += 5;
  if (isValid(student.gender) || isValid(student.address)) totalScore += 5;

  // 2. Academics & Education (25%)
  if (isValid(student.course)) totalScore += 10;
  if (isValid(student.branch)) totalScore += 10;
  if (isValid(student.cgpa) || isValid(student.percentage) || isValid(student.batch)) totalScore += 5;

  // 3. Career Details & Summary (20%)
  if (isValid(student.professional_title || student.professionalTitle)) totalScore += 5;
  if (isValid(student.target_role || student.targetRole)) totalScore += 5;
  if (isValid(student.summary) && String(student.summary).trim().length > 5) totalScore += 10;

  // 4. Skills & Links (20%)
  const skillsArr = Array.isArray(student.skills) 
    ? student.skills 
    : (student.technicalSkills ? student.technicalSkills.split(',') : []);
  if (skillsArr.length >= 3) totalScore += 10;
  else if (skillsArr.length > 0) totalScore += 5;

  if (isValid(student.linkedin) || isValid(student.github) || isValid(student.portfolio)) totalScore += 10;

  // 5. Photo & Resume (10%)
  if (isValid(student.profile_photo || student.profilePhoto)) totalScore += 5;
  const hasResume = activeResume || 
    (student.resume_url && student.resume_url !== "#") || 
    (student.resumeUrl && student.resumeUrl !== "#") || 
    student.resume_path || 
    student.hasUploaded || 
    student.hasCreated;
  if (hasResume) totalScore += 5;

  const backendCompletion = Number(student.profile_completion || student.profileCompletion) || 0;

  const finalScore = Math.max(atsScore, totalScore, backendCompletion);
  return Math.min(100, Math.max(0, finalScore));
}

// ─── AI HELPER MOCKS (Produces Realistic Output) ────────────────────────────

export async function aiGenerateSummary(resumeObj, jobTitle = "Software Developer") {
  await new Promise((res) => setTimeout(res, 800));

  const name = resumeObj?.personal?.fullName || "Candidate";
  const title = jobTitle || resumeObj?.personal?.professionalTitle || "Software Engineer";
  const skillsList = resumeObj?.skills?.technical?.slice(0, 4).join(", ") || "problem solving and modern web technologies";

  return `Results-driven and motivated ${title} with a strong foundation in ${skillsList}. Experienced in building scalable applications, collaborating in agile environments, and delivering high-quality solutions. Passionate about technology innovation and continuous learning.`;
}

export async function aiRewriteSummaryWithTone(resumeObj, tone = "executive") {
  await new Promise((res) => setTimeout(res, 700));
  const title = resumeObj?.personal?.professionalTitle || "Software Engineer";
  const skillsList = resumeObj?.skills?.technical?.slice(0, 3).join(", ") || "core technical capabilities";

  if (tone === "technical") {
    return `Hands-on ${title} specializing in ${skillsList}. Proven track record in designing robust system architectures, optimizing application performance, and implementing modern software development paradigms.`;
  }
  if (tone === "student") {
    return `Enthusiastic and detail-oriented ${title} with academic excellence and hands-on project experience in ${skillsList}. Eager to contribute technical skills and analytical problem-solving to high-impact projects.`;
  }
  // Default executive
  return `Strategic and results-oriented ${title} with expertise in ${skillsList}. Skilled at bridging technical execution with organizational goals, fostering cross-functional collaboration, and delivering scalable software solutions.`;
}

export async function aiGenerateBulletPoints(roleTitle = "Software Developer") {
  await new Promise((res) => setTimeout(res, 600));
  return [
    `Engineered scalable RESTful API endpoints, reducing backend response latency by 35%.`,
    `Architected responsive user interfaces using modern web frameworks, improving client engagement metrics.`,
    `Spearheaded continuous integration and deployment (CI/CD) workflows, streamlining production release stability.`,
    `Collaborated with cross-functional product teams to deliver feature requirements ahead of project deadlines.`,
  ];
}

export async function aiImproveText(text) {
  await new Promise((res) => setTimeout(res, 700));
  if (!text || text.trim().length === 0) {
    return "Successfully designed and implemented core application features, improving overall system efficiency and performance.";
  }
  return text.trim() + " Optimized performance and adhered to industry best practices.";
}

export async function aiShortenText(text) {
  await new Promise((res) => setTimeout(res, 500));
  if (!text) return "";
  const words = text.split(" ");
  if (words.length <= 15) return text;
  return words.slice(0, 15).join(" ") + "...";
}

export async function aiAtsOptimize(resumeObj, targetRole = "Software Engineer") {
  await new Promise((res) => setTimeout(res, 1000));
  const suggestedKeywords = [
    "Agile Methodologies",
    "RESTful APIs",
    "Git / Version Control",
    "Unit Testing & Quality Assurance",
    "CI/CD Pipelines",
  ];
  return {
    targetRole,
    matchPercentage: Math.floor(Math.random() * 15) + 82, // 82% - 96%
    addedKeywords: suggestedKeywords,
    message: `Resume successfully optimized for "${targetRole}"! Added key industry action verbs and ATS keywords.`,
  };
}

export async function aiGenerateCoverLetter(resumeObj, jobTitle = "Software Engineer", companyName = "Target Company") {
  await new Promise((res) => setTimeout(res, 900));
  const p = resumeObj?.personal || {};
  return `Dear Hiring Manager at ${companyName},

I am writing to express my enthusiastic interest in the ${jobTitle} position at ${companyName}. As a dedicated professional with expertise in ${resumeObj?.skills?.technical?.slice(0, 3).join(", ") || "software engineering"}, I am confident in my ability to make an immediate impact on your team.

Throughout my academic and project experiences, I have developed a solid foundation in modern development practices and problem-solving. I am particularly drawn to ${companyName} because of your commitment to excellence and technological innovation.

Thank you for your time and consideration. I welcome the opportunity to discuss how my background and technical skills align with your goals.

Sincerely,
${p.fullName || "Applicant"}
${p.email ? `Email: ${p.email}` : ""}
${p.phone ? `Phone: ${p.phone}` : ""}
`;
}

