// ─── RESUME STORAGE & MOCK AI UTILITIES ─────────────────────────────────────

const STORAGE_KEY = "apms_student_resumes";
const ACTIVE_RESUME_KEY = "apms_active_resume_id";

// Default blank resume structure (uses strictly student profile data, NO mock data)
export function createDefaultResume(profileData = {}) {
  const name = profileData.name || profileData.fullName || "";
  const email = profileData.email || "";
  const phone = profileData.mobile || profileData.phone || "";
  const location = profileData.address || "";
  const course = profileData.course || "";
  const branch = profileData.branch || "";
  const institute = profileData.institute?.name || profileData.other_institute_name || (typeof profileData.institute === "string" ? profileData.institute : "");
  const cgpa = profileData.cgpa ? String(profileData.cgpa) : "";
  const photo = profileData.profile_photo || profileData.profilePhoto || "";

  // Skill array from student profile if available
  const profileSkills = Array.isArray(profileData.skills) ? profileData.skills : [];
  const softSkills = Array.isArray(profileData.soft_skills) ? profileData.soft_skills : [];

  return {
    id: "resume_" + Date.now(),
    title: "Master Resume",
    updatedAt: new Date().toISOString(),
    personal: {
      photo: photo,
      fullName: name,
      professionalTitle: course ? `${course}${branch ? ` - ${branch}` : ""} Student` : "",
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
    summary: "",
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
  const institute = profileData.institute?.name || profileData.other_institute_name || (typeof profileData.institute === "string" ? profileData.institute : "");
  const cgpa = profileData.cgpa ? String(profileData.cgpa) : "";
  const photo = profileData.profile_photo || profileData.profilePhoto || "";
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
    photo: existingPersonal.photo || photo,
    professionalTitle: existingPersonal.professionalTitle || (course ? `${course}${branch ? ` - ${branch}` : ""} Student` : ""),
    showPhoto: existingPersonal.showPhoto ?? !!photo,
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

// ─── STORAGE MANAGERS (SCOPED PER LOGGED-IN STUDENT USER) ───────────────────

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

function getStorageKeys(userId) {
  const uid = userId || getCurrentUserId();
  return {
    STORAGE_KEY: `apms_student_resumes_${uid}`,
    ACTIVE_RESUME_KEY: `apms_active_resume_id_${uid}`,
  };
}

// Purge old un-scoped global key if present to prevent cross-account leaks
try {
  localStorage.removeItem("apms_student_resumes");
  localStorage.removeItem("apms_active_resume_id");
} catch (e) {}

export function getAllResumes(profileData = {}, userId = "") {
  try {
    const { STORAGE_KEY, ACTIVE_RESUME_KEY } = getStorageKeys(userId);
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

export function saveAllResumes(resumeList, userId = "") {
  try {
    const { STORAGE_KEY, ACTIVE_RESUME_KEY } = getStorageKeys(userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeList));
    if (resumeList.length > 0) {
      localStorage.setItem(ACTIVE_RESUME_KEY, resumeList[0].id);
    }
  } catch (err) {
    console.error("Failed to save resume list", err);
  }
}

export function getActiveResumeId(userId = "") {
  const { ACTIVE_RESUME_KEY } = getStorageKeys(userId);
  return localStorage.getItem(ACTIVE_RESUME_KEY) || "";
}

export function saveResume(resumeObj, userId = "") {
  try {
    const { STORAGE_KEY, ACTIVE_RESUME_KEY } = getStorageKeys(userId);
    const list = getAllResumes({}, userId);
    const idx = list.findIndex((r) => r.id === resumeObj.id);
    const updatedObj = { ...resumeObj, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      list[idx] = updatedObj;
    } else {
      list.push(updatedObj);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    localStorage.setItem(ACTIVE_RESUME_KEY, updatedObj.id);
    return updatedObj;
  } catch (err) {
    console.error("Failed to save resume", err);
    return resumeObj;
  }
}

export function createNewResume(title = "New Resume", profileData = {}, userId = "") {
  const newRes = createDefaultResume(profileData);
  newRes.id = "resume_" + Date.now();
  newRes.title = title;
  saveResume(newRes, userId);
  return newRes;
}

export function duplicateResume(id, userId = "") {
  const list = getAllResumes({}, userId);
  const target = list.find((r) => r.id === id);
  if (!target) return null;
  const clone = JSON.parse(JSON.stringify(target));
  clone.id = "resume_" + Date.now();
  clone.title = `${target.title} (Copy)`;
  clone.updatedAt = new Date().toISOString();
  saveResume(clone, userId);
  return clone;
}

export function deleteResume(id, userId = "") {
  const { STORAGE_KEY, ACTIVE_RESUME_KEY } = getStorageKeys(userId);
  let list = getAllResumes({}, userId);
  list = list.filter((r) => r.id !== id);
  if (list.length === 0) {
    const defaultRes = createDefaultResume();
    list = [defaultRes];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  localStorage.setItem(ACTIVE_RESUME_KEY, list[0].id);
  return list;
}

// ─── ATS SCORING & ANALYSIS ENGINE ──────────────────────────────────────────

export function calculateATSMetrics(resume) {
  if (!resume) return { atsScore: 0, profileScore: 0, suggestions: [], missingSkills: [] };

  let atsScore = 50;
  let profileScore = 40;
  const suggestions = [];
  const missingSkills = [];

  // Personal info evaluation
  if (resume.personal?.fullName && resume.personal?.email && resume.personal?.phone) {
    atsScore += 10;
    profileScore += 10;
  } else {
    suggestions.push("Complete essential personal details (Name, Email, Phone).");
  }

  if (resume.personal?.linkedin) atsScore += 5;
  if (resume.personal?.github) atsScore += 5;

  // Summary evaluation
  const summary = resume.summary || "";
  if (summary.length > 100) {
    atsScore += 10;
    profileScore += 15;
  } else {
    suggestions.push("Expand your Professional Summary to at least 100 characters emphasizing key strengths.");
  }

  // Skills evaluation
  const allSkills = Object.values(resume.skills || {}).flat();
  if (allSkills.length >= 8) {
    atsScore += 10;
    profileScore += 15;
  } else {
    suggestions.push("Add at least 8 relevant technical and soft skills to improve ATS keyword matches.");
    missingSkills.push("Git / Version Control", "Docker", "RESTful APIs", "Agile / Scrum");
  }

  // Experience evaluation
  const expCount = resume.experience?.length || 0;
  if (expCount > 0) {
    atsScore += 10;
    profileScore += 20;
    const hasDetailedExp = resume.experience.some((e) => (e.responsibilities || "").length > 50);
    if (!hasDetailedExp) {
      suggestions.push("Add quantitative impact metrics (e.g. 'Improved efficiency by 20%') to work experience.");
    }
  } else {
    suggestions.push("Add internship or work experience items to boost recruiter ranking.");
  }

  // Projects evaluation
  const projCount = resume.projects?.length || 0;
  if (projCount >= 2) {
    atsScore += 10;
    profileScore += 15;
  } else {
    suggestions.push("Include at least 2 detailed technical projects with GitHub links and live demos.");
  }

  // Education evaluation
  if (resume.education?.length > 0) {
    atsScore += 5;
    profileScore += 10;
  }

  // Certifications evaluation
  if (resume.certifications?.length > 0) {
    atsScore += 5;
    profileScore += 5;
  }

  return {
    atsScore: Math.min(atsScore, 100),
    profileScore: Math.min(profileScore, 100),
    suggestions: suggestions.length > 0 ? suggestions : ["Your resume is highly optimized for ATS scanners!"],
    missingSkills: Array.from(new Set(missingSkills)),
  };
}

// ─── AI ASSISTANT SIMULATION UTILITIES ───────────────────────────────────────

export function aiGenerateSummary(role = "Full Stack Developer", skills = []) {
  const skillList = skills.length ? skills.slice(0, 4).join(", ") : "React, Node.js, JavaScript, and Databases";
  return `Results-driven ${role} with strong hands-on expertise in ${skillList}. Adept at designing scalable web architectures, writing clean reusable code, and optimizing application performance. Demonstrated track record in modern software development and eager to drive innovation in high-performing teams.`;
}

export function aiImproveText(text) {
  if (!text) return "Spearheaded front-end optimization and automated database pipelines, reducing system latency and enhancing user satisfaction across production applications.";
  return text
    .replace(/worked on/gi, "Spearheaded development of")
    .replace(/built/gi, "Engineered and deployed")
    .replace(/helped/gi, "Collaborated cross-functionally to optimize")
    .replace(/made/gi, "Architected and delivered") + " Achieved measurable productivity gains through clean modular code architecture.";
}

export function aiShortenText(text) {
  if (!text) return "";
  const sentences = text.split(". ").filter(Boolean);
  return sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "." : "");
}

export function aiAtsOptimize(text, targetRole = "Software Engineer") {
  return `${text} Optimized specifically for ${targetRole} positions with emphasis on Agile workflow, CI/CD practices, robust test coverage, and enterprise system reliability.`;
}

export function aiGenerateCoverLetter(resume, jobTitle = "Software Developer", companyName = "Top Tech Company") {
  const name = resume?.personal?.fullName || "Candidate";
  const email = resume?.personal?.email || "email@example.com";
  const phone = resume?.personal?.phone || "";
  const summary = resume?.summary || "";

  return `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${jobTitle} position at ${companyName}. As a dedicated software developer with background in modern web technologies and software engineering practices, I am confident in my ability to make immediate contributions to your development team.

During my academic and technical projects, I have developed a strong foundation in scalable frontend interfaces and backend API engineering. ${summary}

I am particularly drawn to ${companyName}'s commitment to innovation and technical excellence. I look forward to the opportunity to discuss how my skill set, academic background, and passion for problem-solving align with your team's goals.

Thank you for your time and consideration.

Sincerely,

${name}
${email} | ${phone}`;
}
