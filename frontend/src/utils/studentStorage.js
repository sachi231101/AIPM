import { currentStudent } from "./mockData";

const STORAGE_KEY = "apms_students";

// Get all registered students from localStorage. Seed if empty.
export const getStudents = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored students", e);
    }
  }

  // Seed with default student from mockData.js
  const defaultStudent = {
    ...currentStudent,
    studentIdCardNumber: "STU1001",
    password: "password123",
    dob: "2004-05-15",
    gender: "Male",
    address: "183, 2nd Floor, Ramamurthy Nagar, Bengaluru",
    technicalSkills: "React, Node.js, MySQL, Git",
    softSkills: "Communication, Problem Solving",
    linkedin: "https://linkedin.com/in/arjun-sharma",
    github: "https://github.com/arjun-sharma",
    portfolio: "https://arjunsharma.dev",
    profilePhoto: "",
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultStudent]));
  return [defaultStudent];
};

// Save student array
export const saveStudents = (students) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
};

// Add new registered student
export const addStudent = (student) => {
  const students = getStudents();
  students.push(student);
  saveStudents(students);
};

// Update existing student profile
export const updateStudentProfile = (studentId, updatedFields) => {
  const students = getStudents();
  const index = students.findIndex((s) => s.id === studentId);
  if (index !== -1) {
    const updated = { ...students[index], ...updatedFields };
    students[index] = updated;
    saveStudents(students);
    return updated;
  }
  return null;
};

// Helper to calculate profile completion percentage based on checklist
export const calculateCompletion = (student) => {
  let sections = {
    personal: false,
    academic: false,
    resume: false,
    skills: false
  };

  // 1. Personal Info checklist: email, dob, gender, address
  if (student.email && student.dob && student.gender && student.address) {
    sections.personal = true;
  }

  // 2. Academic Info checklist: course, branch, batch
  // Note: branch corresponds to specialization, course is B.E/BCA/etc.
  if (student.course && student.branch && student.batch) {
    sections.academic = true;
  }

  // 3. Resume checklist: resumeUrl or resumeFile name
  if (student.resumeUrl || student.resumeName) {
    sections.resume = true;
  }

  // 4. Skills checklist: technicalSkills or softSkills
  if (student.technicalSkills || student.softSkills || (student.skills && student.skills.length > 0)) {
    sections.skills = true;
  }

  const completedCount = Object.values(sections).filter(Boolean).length;
  const percentage = completedCount * 25;

  return {
    percentage,
    sections
  };
};
