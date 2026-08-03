// ─── RESUME STORAGE & MOCK AI UTILITIES ─────────────────────────────────────

const STORAGE_KEY = "apms_student_resumes";
const ACTIVE_RESUME_KEY = "apms_active_resume_id";

// Normalize a photo URL — handles absolute http URLs, base64, /storage/... paths, and relative paths
export function normalizePhotoUrl(url) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  let path = url;
  if (!path.startsWith("/storage/") && !path.startsWith("storage/")) {
    path = `/storage/${path.replace(/^\//, "")}`;
  } else if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return `http://${window.location.hostname}:8000${path}`;
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

  return {
    ...resumeObj,
    personal: mergedPersonal,
    education: mergedEducation,
    skills: mergedSkills,
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
    formatting: 0,
  };
  const tips = [];

  const p = resumeObj.personal || {};
  if (p.fullName) breakdown.personal += 5;
  if (p.email && p.email.includes("@")) breakdown.personal += 5;
  if (p.phone) breakdown.personal += 5;
  if (p.linkedin) breakdown.personal += 5;

  const s = resumeObj.summary || "";
  if (s.length > 50) breakdown.summary += 15;
  else if (s.length > 0) breakdown.summary += 8;
  else tips.push("Add a professional summary statement (50+ words) to boost ATS score by 15 points.");

  const edu = resumeObj.education || [];
  if (edu.length > 0) breakdown.education += 15;
  else tips.push("Add at least 1 education entry.");

  const exp = resumeObj.experience || [];
  if (exp.length > 0) {
    breakdown.experience += 20;
  } else {
    tips.push("Add relevant work experience or internships to improve your score.");
  }

  const proj = resumeObj.projects || [];
  if (proj.length > 0) {
    breakdown.projects += 15;
  } else {
    tips.push("Add academic or personal projects to highlight technical problem solving.");
  }

  const skillsObj = resumeObj.skills || {};
  const totalSkills = Object.values(skillsObj).flat().length;
  if (totalSkills >= 8) breakdown.skills += 15;
  else if (totalSkills > 0) breakdown.skills += 8;
  else tips.push("Add at least 8 technical and soft skills.");

  if (resumeObj.settings && resumeObj.settings.template) breakdown.formatting += 5;

  score = Object.values(breakdown).reduce((a, b) => a + b, 0);

  let grade = "C";
  if (score >= 90) grade = "A+";
  else if (score >= 80) grade = "A";
  else if (score >= 70) grade = "B+";
  else if (score >= 60) grade = "B";
  else if (score >= 50) grade = "C+";

  return { score, grade, breakdown, tips };
}

// ─── AI HELPER MOCKS (Produces Realistic Output) ────────────────────────────

export async function aiGenerateSummary(resumeObj, jobTitle = "Software Developer") {
  await new Promise((res) => setTimeout(res, 800));

  const name = resumeObj?.personal?.fullName || "Candidate";
  const title = jobTitle || resumeObj?.personal?.professionalTitle || "Software Engineer";
  const skillsList = resumeObj?.skills?.technical?.slice(0, 4).join(", ") || "problem solving and modern web technologies";

  return `Results-driven and motivated ${title} with a strong foundation in ${skillsList}. Experienced in building scalable applications, collaborating in agile environments, and delivering high-quality solutions. Passionate about technology innovation and continuous learning.`;
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
