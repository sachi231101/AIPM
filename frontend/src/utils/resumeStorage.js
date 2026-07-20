// ─── RESUME STORAGE & MOCK AI UTILITIES ─────────────────────────────────────

const STORAGE_KEY = "apms_student_resumes";
const ACTIVE_RESUME_KEY = "apms_active_resume_id";

// Default blank/populated resume structure
export function createDefaultResume(profileData = {}) {
  const name = profileData.name || "Student Name";
  const email = profileData.email || "student@example.com";
  const phone = profileData.mobile || profileData.phone || "+91 9876543210";
  const location = profileData.address || "Bengaluru, India";
  const course = profileData.course || "B.Tech";
  const branch = profileData.branch || "Computer Science";
  const institute = profileData.institute || "Aadya Institute";
  const cgpa = profileData.cgpa || "8.5";
  const photo = profileData.profile_photo || profileData.profilePhoto || "";

  return {
    id: "resume_" + Date.now(),
    title: "Master Resume",
    updatedAt: new Date().toISOString(),
    personal: {
      photo: photo,
      fullName: name,
      professionalTitle: `${branch} Student / Developer`,
      email: email,
      phone: phone,
      location: location,
      linkedin: profileData.linkedin || "https://linkedin.com/in/student",
      github: profileData.github || "https://github.com/student",
      portfolio: profileData.portfolio || "https://student.dev",
      leetcode: profileData.leetcode || "https://leetcode.com/student",
      hackerrank: profileData.hackerrank || "",
      codechef: profileData.codechef || "",
      gender: profileData.gender || "Male",
      dob: profileData.dob || "2002-05-15",
      nationality: "Indian",
      // Visibility toggles
      showPhoto: true,
      showLinkedin: true,
      showGithub: true,
      showPortfolio: true,
      showLeetcode: true,
      showHackerrank: true,
      showCodechef: false,
      showGender: false,
      showDob: false,
      showNationality: false,
    },
    summary: `Motivated and detail-oriented ${course} graduate specializing in ${branch} from ${institute}. Proficient in modern software development methodologies, algorithms, and web technologies. Passionate about solving complex technical challenges and contributing to high-impact projects.`,
    education: [
      {
        id: "edu_1",
        degree: course,
        specialization: branch,
        college: institute,
        university: "Bangalore University",
        location: "Bengaluru, Karnataka",
        startYear: "2021",
        endYear: "2025",
        cgpa: cgpa,
        percentage: "85%",
        currentlyStudying: true,
      },
      {
        id: "edu_2",
        degree: "Higher Secondary (XII)",
        specialization: "Science (PCMB)",
        college: "Aadya PU College",
        university: "State Board",
        location: "Bengaluru, Karnataka",
        startYear: "2019",
        endYear: "2021",
        cgpa: "9.0",
        percentage: "90%",
        currentlyStudying: false,
      },
    ],
    experience: [
      {
        id: "exp_1",
        company: "Tech Mahindra (Internship)",
        designation: "Software Developer Intern",
        employmentType: "Internship",
        location: "Bengaluru, India",
        startDate: "2024-05",
        endDate: "2024-08",
        currentCompany: false,
        responsibilities: "Developed RESTful APIs using Node.js and Express. Integrated PostgreSQL database schemas. Improved API latency by 25% through indexing and caching queries.",
        technologies: "Node.js, Express, PostgreSQL, REST API, Git",
      },
    ],
    projects: [
      {
        id: "proj_1",
        name: "Campus Placement Management System",
        role: "Full Stack Developer",
        duration: "3 Months",
        technologies: "React, Node.js, Express, SQLite, Bootstrap 5",
        githubLink: "https://github.com/student/campus-placement-portal",
        liveDemo: "https://placement.aadyainstitution.com",
        description: "A complete recruitment automation portal enabling companies to post drives and students to apply online.",
        responsibilities: "Designed responsive React UI components. Implemented JWT authentication and backend REST endpoints. Created real-time application status tracking for 1000+ candidates.",
      },
      {
        id: "proj_2",
        name: "AI Resume & ATS Optimization Engine",
        role: "Frontend & AI Integration Developer",
        duration: "2 Months",
        technologies: "React 19, JavaScript ES6+, HTML5, CSS3, Vite",
        githubLink: "https://github.com/student/ai-resume-builder",
        liveDemo: "",
        description: "Interactive resume builder tool featuring real-time ATS scoring, custom templates, and AI text enhancement.",
        responsibilities: "Built interactive 11-step stepper form. Integrated client-side PDF export engine with instant live document preview.",
      },
    ],
    skills: {
      accountingFinance: ["Tally Prime", "Tally ERP 9", "Financial Accounting", "GST Filing"],
      officeTools: ["Advanced MS Excel", "MS Word", "MS PowerPoint", "Data Entry"],
      programmingLanguages: ["JavaScript", "Python", "Java", "SQL"],
      frontend: ["React.js", "HTML5", "CSS3", "Bootstrap 5"],
      backend: ["Node.js", "Express.js", "REST APIs"],
      tools: ["VS Code", "Postman", "Canva"],
      softSkills: ["Problem Solving", "Communication", "Team Leadership", "Time Management"],
    },
    certifications: [
      {
        id: "cert_1",
        name: "Full Stack Web Development Certification",
        organization: "Aadya Institute",
        issueDate: "2024-04",
        credentialUrl: "https://aadyainstitution.com/certificates/12345",
        description: "Intensive 6-month hands-on certification covering MERN stack web application development and system architecture.",
      },
    ],
    achievements: [
      {
        id: "ach_1",
        category: "Hackathons",
        title: "First Runner Up - Smart India Hackathon 2024",
        issuer: "Ministry of Education, Govt of India",
        date: "2024-03",
        description: "Built an automated AI candidate ranking prototype within 36 hours competing against 150+ national teams.",
      },
      {
        id: "ach_2",
        category: "Coding Competitions",
        title: "Top 5% Rank in LeetCode Weekly Contest",
        issuer: "LeetCode",
        date: "2024-01",
        description: "Solved 4/4 algorithmic problems in 45 minutes achieving global rank 850 out of 18,000 participants.",
      },
    ],
    languages: [
      { id: "lang_1", language: "English", proficiency: "Professional" },
      { id: "lang_2", language: "Kannada", proficiency: "Native" },
      { id: "lang_3", language: "Hindi", proficiency: "Intermediate" },
    ],
    settings: {
      template: "modern", // modern, professional, minimal, executive, student
      accentColor: "#0F4C81",
      showPhoto: true,
      length: "one_page", // one_page, two_pages
      paperSize: "a4", // a4, letter
    },
  };
}

// ─── STORAGE MANAGERS ────────────────────────────────────────────────────────

export function getAllResumes(profileData = {}) {
  try {
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

export function getActiveResumeId() {
  return localStorage.getItem(ACTIVE_RESUME_KEY) || "";
}

export function saveResume(resumeObj) {
  try {
    const list = getAllResumes();
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

export function createNewResume(title = "New Resume", profileData = {}) {
  const newRes = createDefaultResume(profileData);
  newRes.id = "resume_" + Date.now();
  newRes.title = title;
  saveResume(newRes);
  return newRes;
}

export function duplicateResume(id) {
  const list = getAllResumes();
  const target = list.find((r) => r.id === id);
  if (!target) return null;
  const clone = JSON.parse(JSON.stringify(target));
  clone.id = "resume_" + Date.now();
  clone.title = `${target.title} (Copy)`;
  clone.updatedAt = new Date().toISOString();
  saveResume(clone);
  return clone;
}

export function deleteResume(id) {
  let list = getAllResumes();
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
