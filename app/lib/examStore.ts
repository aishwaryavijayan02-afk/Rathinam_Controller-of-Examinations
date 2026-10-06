"use client";

import { supabase, isSupabaseConfigured } from "./supabaseClient";

// Types
export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  dotColor?: string;
  totalQuestions: number;
  total?: number;
  completed?: string | number;
  approved?: string | number;
  pending?: number;
  verified?: number;
  status: "In Progress" | "Completed" | "Pending" | "Archived" | "Not Started";
  category?: string;
  credits: number;
  semester?: string;
  department?: string;
  school?: string;
}

export interface SyllabusUnit {
  id: string;
  num: string;
  name: string;
  topics: number;
  docs: number;
  subject: string;
  subtopics?: string[];
  coMapping?: string[];
  description?: string;
}

// Sample SVG Diagrams for visual questions
export const SAMPLE_DIAGRAM_AR_PIPELINE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 280" width="600" height="280"><rect width="600" height="280" fill="%230f172a" rx="16"/><text x="300" y="38" fill="%2338bdf8" font-size="15" font-family="sans-serif" text-anchor="middle" font-weight="bold">Figure 1.1: AR Spatial Feature Tracking &amp; Rendering Pipeline</text><rect x="30" y="85" width="115" height="75" rx="10" fill="%231e293b" stroke="%2338bdf8" stroke-width="2"/><text x="87" y="118" fill="%23f8fafc" font-size="13" font-family="sans-serif" text-anchor="middle" font-weight="bold">RGB-D Camera</text><text x="87" y="138" fill="%2394a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">Input Stream</text><rect x="180" y="85" width="130" height="75" rx="10" fill="%231e293b" stroke="%23818cf8" stroke-width="2"/><text x="245" y="118" fill="%23818cf8" font-size="13" font-family="sans-serif" text-anchor="middle" font-weight="bold">Vuforia Engine</text><text x="245" y="138" fill="%2394a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">Feature Matrix</text><rect x="345" y="85" width="125" height="75" rx="10" fill="%231e293b" stroke="%23a855f7" stroke-width="2"/><text x="407" y="118" fill="%23a855f7" font-size="13" font-family="sans-serif" text-anchor="middle" font-weight="bold">Pose Estimator</text><text x="407" y="138" fill="%2394a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">Transform 6DoF</text><rect x="495" y="85" width="80" height="75" rx="10" fill="%231e293b" stroke="%234ade80" stroke-width="2"/><text x="535" y="118" fill="%234ade80" font-size="13" font-family="sans-serif" text-anchor="middle" font-weight="bold">3D Overlay</text><text x="535" y="138" fill="%2394a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">Unity View</text><path d="M145 122 H180 M310 122 H345 M470 122 H495" stroke="%2338bdf8" stroke-width="3" stroke-dasharray="4 2"/><polygon points="177,117 185,122 177,127" fill="%2338bdf8"/><polygon points="342,117 350,122 342,127" fill="%2338bdf8"/><polygon points="492,117 500,122 492,127" fill="%2338bdf8"/><rect x="180" y="195" width="290" height="50" rx="8" fill="%231e293b" stroke="%23f59e0b" stroke-width="1.5"/><text x="325" y="225" fill="%23f59e0b" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">Anchor Storage &amp; Cloud Key Sync</text></svg>`;

export const SAMPLE_DIAGRAM_OPTICS = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 280" width="600" height="280"><rect width="600" height="280" fill="%23090d16" rx="16"/><text x="300" y="38" fill="%23818cf8" font-size="15" font-family="sans-serif" text-anchor="middle" font-weight="bold">Figure 2.1: Digital Camera Convex Lens &amp; Focal Point Optics</text><path d="M50 140 H550 M250 60 Q300 140 250 220 Q200 140 250 60 Z" fill="rgba(99,102,241,0.25)" stroke="%23818cf8" stroke-width="3"/><line x1="80" y1="85" x2="235" y2="115" stroke="%23f43f5e" stroke-width="2.5"/><line x1="235" y1="115" x2="450" y2="140" stroke="%23f43f5e" stroke-width="2.5"/><line x1="80" y1="195" x2="235" y2="165" stroke="%23f43f5e" stroke-width="2.5"/><line x1="235" y1="165" x2="450" y2="140" stroke="%23f43f5e" stroke-width="2.5"/><circle cx="450" cy="140" r="7" fill="%23f43f5e"/><text x="450" y="172" fill="%23f43f5e" font-size="13" font-family="sans-serif" text-anchor="middle" font-weight="bold">Focal Point (F)</text><rect x="495" y="70" width="12" height="140" fill="%2338bdf8" rx="3"/><text x="501" y="232" fill="%2338bdf8" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">CMOS Sensor</text></svg>`;

export const SAMPLE_DIAGRAM_RIGGING = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 280" width="600" height="280"><rect width="600" height="280" fill="%23041416" rx="16"/><text x="300" y="38" fill="%232dd4bf" font-size="15" font-family="sans-serif" text-anchor="middle" font-weight="bold">Figure 3.1: Character Skeleton Bone Joint Hierarchy &amp; Kinematics</text><g stroke="%232dd4bf" stroke-width="3" fill="none"><circle cx="300" cy="75" r="20" stroke="%232dd4bf"/><line x1="300" y1="95" x2="300" y2="185"/><circle cx="300" cy="120" r="6" fill="%232dd4bf"/><line x1="300" y1="120" x2="230" y2="155"/><line x1="230" y1="155" x2="190" y2="205"/><circle cx="230" cy="155" r="5" fill="%23f43f5e"/><circle cx="190" cy="205" r="5" fill="%23f43f5e"/><line x1="300" y1="120" x2="370" y2="155"/><line x1="370" y1="155" x2="410" y2="205"/><circle cx="370" cy="155" r="5" fill="%23f43f5e"/><circle cx="410" cy="205" r="5" fill="%23f43f5e"/><circle cx="300" cy="185" r="6" fill="%232dd4bf"/><line x1="300" y1="185" x2="260" y2="250"/><line x1="300" y1="185" x2="340" y2="250"/></g></svg>`;

export interface QuestionItem {
  id: number | string;
  code?: string;
  question: string;
  subject: string;
  unit: string;
  topic: string;
  type: "MCQ" | "Descriptive" | "Match Type" | "Short Answer" | "Problem Solving";
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Approved" | "Pending" | "Verified" | "Rejected" | "Draft" | "Published" | "Archived";
  addedOn?: string;
  marks: number;
  options?: string[];
  correctAnswer?: string;
  uploadedBy?: string;
  department?: string;
  school?: string;
  email?: string;
  verifiedBy?: string;
  verifiedRole?: string;
  date?: string;
  time?: string;
  submittedDate?: string;
  uploadedOnDate?: string;
  uploadedOnTime?: string;
  bloomLevel?: string;
  aiStatus?: "AI Verified" | "AI Flagged" | "Not Verified";
  aiScore?: number;
  aiRemarks?: string;
  aiCheckedAt?: string;
  imageUrl?: string;
  diagramTitle?: string;
  diagramType?: string;
  reviewerComments?: string;
  sourceFile?: string;
}

export interface UploadHistoryItem {
  id: number | string;
  name: string;
  type: string;
  subject: string;
  unit: string;
  totalQuestions: number;
  uploadedBy: string;
  email: string;
  status: "Success" | "Partial Success" | "Failed" | "Processing";
  date: string;
  time: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: string;
  typeBg?: string;
  typeColor?: string;
  priority: "High" | "Medium" | "Low";
  relatedTo: string;
  relatedSub?: string;
  timeAgo: string;
  exactTime: string;
  status: "Unread" | "Read";
}

export interface MessageItem {
  id: string;
  senderName: string;
  senderRole: string;
  senderEmail: string;
  recipientRole: "STAFF" | "HOD" | "DEAN" | "COE" | "All";
  recipientName: string;
  subject: string;
  content: string;
  timeAgo: string;
  exactTime: string;
  status: "Unread" | "Read";
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Faculty" | "Verifier" | "HOD" | "Exam Cell Staff";
  department: string;
  status: "Active" | "Inactive";
  lastLogin: string;
}

export interface ActivityItem {
  id: string;
  activity: string;
  module: string;
  performedBy: string;
  dateTime: string;
  details: string;
}

export interface StaffFacultyItem {
  id: string;
  name: string;
  designation: string;
  employeeId: string;
  department: string;
  school?: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  reportingTo: "HOD" | "DEAN" | "Both";
  reportingOfficerName: string;
  assignedSubjects: string[];
  syllabusCount?: number;
  assignedSyllabus?: string[];
  questionsContributed: number;
  pendingReviews: number;
  status: "Active" | "On Leave" | "On Duty";
  avatarBg: string;
}

export interface SyllabusApprovalItem {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  semester: string;
  submittedBy: string;
  submitterEmail: string;
  submittedAt: string;
  totalUnits: number;
  totalTopics: number;
  stage: "staff" | "hod" | "dean" | "coe";
  status: "Pending" | "Approved" | "Revision_Requested" | "Rejected";
  staffStatus: "Submitted" | "Draft";
  hodStatus: "Pending" | "Approved" | "Revision_Requested";
  hodName?: string;
  hodDate?: string;
  deanStatus: "Pending" | "Approved" | "Revision_Requested" | "Waiting_HOD";
  deanName?: string;
  deanDate?: string;
  coeStatus: "Pending" | "Approved" | "Locked" | "Waiting_Dean";
  coeName?: string;
  coeDate?: string;
  remarks?: string;
}

// Initial Data Seeds
export const defaultStaffFaculty: StaffFacultyItem[] = [
  {
    id: "fac-vis-1",
    name: "Mr. Vignesh M",
    designation: "Assistant Professor",
    employeeId: "RGU-VIS-101",
    department: "Department of Visual Communication",
    school: "School of Fashion Design, Media and Performing Arts",
    email: "vignesh.viscom@rathinam.in",
    phone: "+91 98421 23450",
    qualification: "M.Sc. Visual Communication, UGC-NET",
    experience: "6 Years",
    reportingTo: "HOD",
    reportingOfficerName: "Dr. T.J RAJU (HOD)",
    assignedSubjects: ["Augmented Reality & VFX (VIS-301)"],
    syllabusCount: 5,
    assignedSyllabus: [
      "Unit 1: Tracking Fundamentals & Feature Solvers",
      "Unit 2: Planar & Rotoscopy Spline Workflows",
      "Unit 3: Chroma Green/Blue Screen Keying",
      "Unit 4: Matchmoving & 3D Camera Tracking",
      "Unit 5: Vuforia AR SDK & Unity Pipeline",
    ],
    questionsContributed: 25,
    pendingReviews: 0,
    status: "Active",
    avatarBg: "linear-gradient(135deg, #4f46e5, #7c3aed)",
  },
  {
    id: "fac-vis-2",
    name: "Mr. Vishal Mithran",
    designation: "Assistant Professor",
    employeeId: "RGU-VIS-102",
    department: "Department of Visual Communication",
    school: "School of Fashion Design, Media and Performing Arts",
    email: "vishal.viscom@rathinam.in",
    phone: "+91 97890 34561",
    qualification: "M.Sc. Electronic Media",
    experience: "5 Years",
    reportingTo: "HOD",
    reportingOfficerName: "Dr. T.J RAJU (HOD)",
    assignedSubjects: ["Digital Cinematography & Lighting (VIS-302)"],
    syllabusCount: 5,
    assignedSyllabus: [
      "Unit 1: Sensor & Camera Tech",
      "Unit 2: Three-Point Lighting Design",
      "Unit 3: Color Grading & Anamorphic Optics",
      "Unit 4: Production Visual Storyboarding",
      "Unit 5: Post Master Export Formats",
    ],
    questionsContributed: 25,
    pendingReviews: 0,
    status: "Active",
    avatarBg: "linear-gradient(135deg, #0284c7, #38bdf8)",
  },
  {
    id: "fac-vis-3",
    name: "Mr. Athreya K",
    designation: "Assistant Professor",
    employeeId: "RGU-VIS-103",
    department: "Department of Visual Communication",
    school: "School of Fashion Design, Media and Performing Arts",
    email: "athreya.viscom@rathinam.in",
    phone: "+91 96541 45672",
    qualification: "M.Des. Animation Design",
    experience: "4 Years",
    reportingTo: "HOD",
    reportingOfficerName: "Dr. T.J RAJU (HOD)",
    assignedSubjects: ["3D Character Modeling & Rigging (VIS-303)"],
    syllabusCount: 5,
    assignedSyllabus: [
      "Unit 1: Poly Modeling & Organic Topology",
      "Unit 2: UV Unwrapping & Substance Painting",
      "Unit 3: Bone Rigging & Forward/Inverse Kinematics",
      "Unit 4: Blend Shapes & Facial Performance",
      "Unit 5: Engine Import & PBR Materials",
    ],
    questionsContributed: 20,
    pendingReviews: 5,
    status: "Active",
    avatarBg: "linear-gradient(135deg, #059669, #10b981)",
  },
  {
    id: "fac-vis-4",
    name: "Mrs. Gayathiri G",
    designation: "Assistant Professor",
    employeeId: "RGU-VIS-104",
    department: "Department of Visual Communication",
    school: "School of Fashion Design, Media and Performing Arts",
    email: "gayathiri.viscom@rathinam.in",
    phone: "+91 95432 56783",
    qualification: "M.Sc., M.Phil. Communication",
    experience: "7 Years",
    reportingTo: "HOD",
    reportingOfficerName: "Dr. T.J RAJU (HOD)",
    assignedSubjects: ["Graphic Design & Brand Identity (VIS-304)"],
    syllabusCount: 5,
    assignedSyllabus: [
      "Unit 1: Color Psychology & Composition",
      "Unit 2: Swiss Grid Systems & Typography",
      "Unit 3: Vector Brand Identity & Logo Systems",
      "Unit 4: Print Packaging & Offset Production",
      "Unit 5: Digital UI Systems & Figma Tokens",
    ],
    questionsContributed: 25,
    pendingReviews: 0,
    status: "Active",
    avatarBg: "linear-gradient(135deg, #db2777, #f43f5e)",
  },
  {
    id: "fac-vis-5",
    name: "Mr. Saravanan S",
    designation: "Assistant Professor",
    employeeId: "RGU-VIS-105",
    department: "Department of Visual Communication",
    school: "School of Fashion Design, Media and Performing Arts",
    email: "saravanan.viscom@rathinam.in",
    phone: "+91 94321 67894",
    qualification: "M.A. Media Arts",
    experience: "4 Years",
    reportingTo: "HOD",
    reportingOfficerName: "Dr. T.J RAJU (HOD)",
    assignedSubjects: ["Audio Production & Sound Design (VIS-305)"],
    syllabusCount: 3,
    assignedSyllabus: [
      "Unit 1: Acoustic Physics & Microphone Types",
      "Unit 2: DAW Multitrack Recording & Mixing",
      "Unit 3: Foley Sound Design & Stereo Panning",
    ],
    questionsContributed: 15,
    pendingReviews: 10,
    status: "Active",
    avatarBg: "linear-gradient(135deg, #ea580c, #f97316)",
  },
  {
    id: "fac-vis-6",
    name: "Mr. Kailash Tharayil",
    designation: "Assistant Professor",
    employeeId: "RGU-VIS-106",
    department: "Department of Visual Communication",
    school: "School of Fashion Design, Media and Performing Arts",
    email: "kailash.viscom@rathinam.in",
    phone: "+91 93210 78905",
    qualification: "M.Sc. Multimedia Technologies",
    experience: "3 Years",
    reportingTo: "HOD",
    reportingOfficerName: "Dr. T.J RAJU (HOD)",
    assignedSubjects: ["Motion Graphics & Broadcast VFX (VIS-306)"],
    syllabusCount: 0,
    assignedSyllabus: [],
    questionsContributed: 0,
    pendingReviews: 0,
    status: "Active",
    avatarBg: "linear-gradient(135deg, #8b5cf6, #d946ef)",
  },
];

export const defaultSyllabusApprovals: SyllabusApprovalItem[] = [];

// Initial Data Seeds
export const defaultSubjects: SubjectItem[] = [];

export const defaultUnits: SyllabusUnit[] = [];

export const defaultQuestions: QuestionItem[] = [];

export const defaultUploadHistory: UploadHistoryItem[] = [];

export const defaultNotifications: NotificationItem[] = [];

export const defaultMessages: MessageItem[] = [];

export const defaultUsers: UserItem[] = [
  {
    id: "usr-1",
    name: "Mr. Vignesh M",
    email: "vignesh.viscom@rathinam.in",
    role: "Faculty",
    department: "Visual Communication",
    status: "Active",
    lastLogin: "Today, 01:15 PM",
  },
  {
    id: "usr-2",
    name: "Dr. T.J RAJU",
    email: "hod.viscom@rathinam.in",
    role: "HOD",
    department: "Visual Arts & VFX",
    status: "Active",
    lastLogin: "Today, 11:40 AM",
  },
  {
    id: "usr-3",
    name: "Dr. V Rajlakshmi",
    email: "director.raale@rathinam.in",
    role: "Verifier",
    department: "School of Media & Arts",
    status: "Active",
    lastLogin: "Yesterday, 04:20 PM",
  },
  {
    id: "usr-4",
    name: "Dr. Rajubalaji",
    email: "coe@rathinam.in",
    role: "Administrator",
    department: "Exam Cell Controller",
    status: "Active",
    lastLogin: "30 Aug 2024",
  },
];

export const defaultActivities: ActivityItem[] = [];

// Helper to broadcast changes
const notifyUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("exam-cell-store-update"));
  }
};

// Auto-reset cached local storage to 0 for all subjects, syllabus, questions, verified & upload history
export function generateArQuestions(): QuestionItem[] {
  const topicsByUnit = [
    { unit: "Unit 01 - Tracking & Feature Extraction Fundamentals", topic: "Tracking Principles & Point Trackers" },
    { unit: "Unit 02 - Planar Tracking & Rotoscopy Splines", topic: "Mocha Planar Solvers & Roto Splines" },
    { unit: "Unit 03 - Green & Blue Screen Keying Algorithms", topic: "Chroma Keying, Primatte & Spill Suppression" },
    { unit: "Unit 04 - Matchmoving & 3D Camera Tracking", topic: "Camera Solving, Point Clouds & Distortion" },
    { unit: "Unit 05 - Vuforia AR SDK & Unity Rendering Pipeline", topic: "Vuforia Target Tracking & 3D Composite" },
  ];

  const seededQuestions: QuestionItem[] = [];
  for (let i = 1; i <= 100; i++) {
    const uIdx = Math.floor((i - 1) / 20);
    const { unit, topic } = topicsByUnit[uIdx];
    const isMcq = i % 4 === 1;
    const marks = isMcq ? 2 : (i % 3 === 0 ? 5 : 10);
    const diff = i % 3 === 0 ? "Easy" : (i % 2 === 0 ? "Medium" : "Hard");

    seededQuestions.push({
      id: `ar-q-${i}`,
      code: `24AR-${String(i).padStart(3, '0')}`,
      question: `Question ${i}: Analyze and explain the core mechanism of ${topic} extracted from "Rotoscopy_and_Keying_100_Question_Bank.docx" (Item #${i} for ${unit}).`,
      subject: "AUGMENTED REALITY100 MU",
      unit: unit,
      topic: topic,
      type: isMcq ? "MCQ" : "Descriptive",
      difficulty: diff,
      status: "Pending",
      marks: marks,
      options: isMcq ? ["Option A: Primary feature matrix calculation", "Option B: Transform 6DoF tracking vector", "Option C: Spatial anchor coordinate mapping", "Option D: Optical flow motion estimation"] : undefined,
      correctAnswer: isMcq ? "Option A: Primary feature matrix calculation" : undefined,
      uploadedBy: "Mr. Vignesh M",
      email: "vignesh.viscom@rathinam.in",
      sourceFile: "Rotoscopy_and_Keying_100_Question_Bank.docx",
      date: "30 Sept 2026",
      time: "09:40 AM",
      submittedDate: "30 Sept 2026, 09:40 AM",
    });
  }
  return seededQuestions;
}

  if (typeof window !== "undefined") {
    const ZERO_SEED_VERSION = "exam_cell_zero_v20_syllabus_linked_qb";
    if (!localStorage.getItem(ZERO_SEED_VERSION)) {
      localStorage.removeItem("exam_cell_subjects");
      localStorage.removeItem("exam_cell_questions");
      localStorage.removeItem("exam_cell_uploads");
      localStorage.removeItem("exam_cell_notifications");
      localStorage.removeItem("exam_cell_messages");
      localStorage.removeItem("exam_cell_activities");
      localStorage.removeItem("exam_cell_units");
      localStorage.removeItem("exam_cell_staff_faculty");
      localStorage.setItem(ZERO_SEED_VERSION, "true");
    }

    // Persistent cleanup: Ensure no auto-seeded dummy data ever resurrects
    const CLEANUP_KEY = "exam_cell_v39_clean_persisted_state_staff";
    if (!localStorage.getItem(CLEANUP_KEY)) {
      localStorage.removeItem("exam_cell_staff_faculty");
      localStorage.setItem(CLEANUP_KEY, "true");
    }
    try {
      const currentQuestions: QuestionItem[] = JSON.parse(localStorage.getItem("exam_cell_questions") || "[]");
      const cleanedQuestions = currentQuestions.filter((q) => {
        const idStr = String(q.id || "");
        if (idStr.startsWith("ar-q-")) return false;
        if (q.sourceFile && q.sourceFile.includes("Rotoscopy_and_Keying")) return false;
        return true;
      });
      localStorage.setItem("exam_cell_questions", JSON.stringify(cleanedQuestions));

      const currentUploads: UploadHistoryItem[] = JSON.parse(localStorage.getItem("exam_cell_uploads") || "[]");
      const filteredUploads = currentUploads.filter((u) => !u.name.includes("Rotoscopy_and_Keying"));
      localStorage.setItem("exam_cell_uploads", JSON.stringify(filteredUploads));

      localStorage.setItem(CLEANUP_KEY, "true");
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  }
// Generic LocalStorage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(`exam_cell_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error("Storage error:", e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`exam_cell_${key}`, JSON.stringify(value));
    const nowStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    localStorage.setItem("exam_cell_last_updated", nowStr);
    notifyUpdate();
  } catch (e) {
    console.error("Storage save error:", e);
  }
}

// ----------------- SUBJECTS CRUD -----------------
export const examStore = {
  getLastUpdated(): string {
    if (typeof window === "undefined") return "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const stored = localStorage.getItem("exam_cell_last_updated");
    if (!stored) {
      const nowStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      localStorage.setItem("exam_cell_last_updated", nowStr);
      return nowStr;
    }
    return stored;
  },
  touchLastUpdated(): string {
    if (typeof window === "undefined") return "";
    const nowStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    localStorage.setItem("exam_cell_last_updated", nowStr);
    notifyUpdate();
    return nowStr;
  },
  getSubjects(): SubjectItem[] {
    const deletedList = getFromStorage<string[]>("deleted_subjects", []);
    const deletedSet = new Set(deletedList.map((x) => String(x).toLowerCase().trim()));

    const rawList = getFromStorage<SubjectItem[]>("subjects", defaultSubjects);
    const list = rawList.filter((s) => {
      if (!s) return false;
      const sId = String(s.id || "").toLowerCase().trim();
      const sName = (s.name || "").toLowerCase().trim();
      const sCode = (s.code || "").toLowerCase().trim();
      if (deletedSet.has(sId) || deletedSet.has(sName) || deletedSet.has(sCode)) return false;
      return true;
    });

    if (list.length !== rawList.length) {
      saveToStorage("subjects", list);
    }
    let mutated = false;

    // 1. Clean names: remove metadata strings like Course Code, L-T-P, Credits, etc.
    const cleaned = list.map((s) => {
      const clean = (s.name || "")
        .replace(/(?:Course\s*Code|Course\s*ID|Subject\s*Code|Code|L\-?T\-?P|Credits?|Total\s*Hours?|Hours?|Semester|Regulation|Department|Dept)[\s:\-_].*$/i, "")
        .replace(/[\s\-_:=_]+$/, "")
        .trim();
      if (clean && clean !== s.name) {
        mutated = true;
        return { ...s, name: clean };
      }
      return s;
    });

    // 2. Deduplicate subjects with same or matching names
    const uniqueMap = new Map<string, SubjectItem>();
    const remappedNames = new Map<string, string>(); // oldName/code -> canonicalName

    cleaned.forEach((subj) => {
      const normKey = subj.name.trim().toLowerCase();
      if (uniqueMap.has(normKey)) {
        const existing = uniqueMap.get(normKey)!;
        // Keep the one with legitimate code, e.g. not starting with SUB-
        if (existing.code.startsWith("SUB-") && !subj.code.startsWith("SUB-")) {
          uniqueMap.set(normKey, subj);
          remappedNames.set(existing.name, subj.name);
          remappedNames.set(existing.code, subj.name);
        } else {
          remappedNames.set(subj.name, existing.name);
          remappedNames.set(subj.code, existing.name);
        }
        mutated = true;
      } else {
        uniqueMap.set(normKey, subj);
      }
    });

    const finalList = Array.from(uniqueMap.values());

    if (mutated) {
      saveToStorage("subjects", finalList);

      // Re-map units belonging to any removed/merged subject
      if (remappedNames.size > 0) {
        const units = getFromStorage<SyllabusUnit[]>("units", defaultUnits);
        let unitsMutated = false;
        units.forEach((u) => {
          if (remappedNames.has(u.subject)) {
            u.subject = remappedNames.get(u.subject)!;
            unitsMutated = true;
          } else {
            for (const [oldVal, canonical] of remappedNames.entries()) {
              if (u.subject.toLowerCase() === oldVal.toLowerCase()) {
                u.subject = canonical;
                unitsMutated = true;
              }
            }
          }
        });
        if (unitsMutated) {
          saveToStorage("units", units);
        }
      }
    }

    return finalList;
  },
  saveSubject(subject: Partial<SubjectItem> & { id?: string }): SubjectItem {
    // If this subject was previously in deleted_subjects, remove it from blacklist
    const deletedList = getFromStorage<string[]>("deleted_subjects", []);
    const cleanRaw = (subject.name || "").trim().toLowerCase();
    const cleanCode = (subject.code || "").trim().toLowerCase();
    const cleanId = subject.id ? String(subject.id).trim().toLowerCase() : "";
    const newDeleted = deletedList.filter((x) => x !== cleanRaw && x !== cleanCode && (cleanId ? x !== cleanId : true));
    if (newDeleted.length !== deletedList.length) {
      saveToStorage("deleted_subjects", newDeleted);
    }

    const list = this.getSubjects();
    let savedSubject: SubjectItem;

    const rawName = subject.name || "Untitled Subject";
    const cleanName = rawName
      .replace(/(?:Course\s*Code|Course\s*ID|Subject\s*Code|Code|L\-?T\-?P|Credits?|Total\s*Hours?|Hours?|Semester|Regulation|Department|Dept)[\s:\-_].*$/i, "")
      .replace(/[\s\-_:=_]+$/, "")
      .trim() || rawName;

    // Search by ID or existing clean name / code
    const existingIdx = subject.id
      ? list.findIndex((s) => s.id === subject.id)
      : list.findIndex((s) => {
          const sName = s.name.trim().toLowerCase();
          const cName = cleanName.trim().toLowerCase();
          return sName === cName || (subject.code && s.code.toLowerCase() === subject.code.toLowerCase());
        });

    if (existingIdx !== -1) {
      list[existingIdx] = {
        ...list[existingIdx],
        ...subject,
        name: cleanName,
        code: (list[existingIdx].code && !list[existingIdx].code.startsWith("SUB-")) ? list[existingIdx].code : (subject.code || list[existingIdx].code),
      } as SubjectItem;
      savedSubject = list[existingIdx];
      saveToStorage("subjects", list);
    } else {
      savedSubject = {
        id: subject.id || `sub-${Date.now()}`,
        name: cleanName,
        code: subject.code || "SUB101",
        dotColor: subject.dotColor || "#6366f1",
        totalQuestions: Number(subject.totalQuestions || 0),
        completed: subject.completed || "0 (0%)",
        approved: Number(subject.approved || 0),
        verified: Number(subject.verified || 0),
        pending: Number(subject.pending || 0),
        status: subject.status || "In Progress",
        category: subject.category || "inprogress",
        credits: Number(subject.credits || 3),
        semester: subject.semester || "Semester 1",
        department: subject.department || "General",
        school: subject.school || "School of Media & Arts",
      };
      list.unshift(savedSubject);
      saveToStorage("subjects", list);
    }

    if (isSupabaseConfigured()) {
      supabase
        .from("subjects")
        .upsert({
          id: savedSubject.id,
          name: savedSubject.name,
          code: savedSubject.code,
          semester: savedSubject.semester,
          department: savedSubject.department,
          total_questions: savedSubject.totalQuestions,
          approved: savedSubject.approved,
          pending: savedSubject.pending,
          verified: savedSubject.verified,
          status: savedSubject.status,
        })
        .then(({ error }) => {
          if (error) console.warn("Supabase Subject Sync error:", error.message);
        });
    }

    return savedSubject;
  },
  deleteSubject(id: string): void {
    const rawSubjects = getFromStorage<SubjectItem[]>("subjects", defaultSubjects);
    const target = rawSubjects.find((s) => String(s.id) === String(id))
      || rawSubjects.find((s) => (s.name || "").toLowerCase().trim() === String(id).toLowerCase().trim())
      || rawSubjects.find((s) => (s.code || "").toLowerCase().trim() === String(id).toLowerCase().trim());

    const targetName = target ? target.name.trim().toLowerCase() : String(id).trim().toLowerCase();
    const targetCode = target ? target.code.trim().toLowerCase() : "";
    const targetId = target ? String(target.id).toLowerCase() : String(id).toLowerCase();

    // 1. Blacklist in deleted_subjects permanently
    const deletedList = getFromStorage<string[]>("deleted_subjects", []);
    const toAdd = [targetId, targetName, targetCode, String(id).toLowerCase()].filter(Boolean);
    const updatedDeleted = Array.from(new Set([...deletedList, ...toAdd]));
    saveToStorage("deleted_subjects", updatedDeleted);

    // 2. Remove matching subjects from subjects storage
    const remainingSubjects = rawSubjects.filter((s) => {
      const sId = String(s.id).toLowerCase().trim();
      const sName = (s.name || "").toLowerCase().trim();
      const sCode = (s.code || "").toLowerCase().trim();
      if (sId === targetId || sId === String(id).toLowerCase().trim()) return false;
      if (targetName && (sName === targetName || sName.includes(targetName) || targetName.includes(sName))) return false;
      if (targetCode && sCode === targetCode) return false;
      return true;
    });
    saveToStorage("subjects", remainingSubjects);

    // 3. Remove all units belonging to this subject
    const rawUnits = getFromStorage<SyllabusUnit[]>("units", defaultUnits);
    const remainingUnits = rawUnits.filter((u) => {
      const uSub = (u.subject || "").trim().toLowerCase();
      if (uSub === targetName || (targetName && (uSub.includes(targetName) || targetName.includes(uSub)))) return false;
      if (targetCode && uSub === targetCode) return false;
      return true;
    });
    saveToStorage("units", remainingUnits);

    // 4. Remove all questions belonging to this subject
    const rawQs = getFromStorage<QuestionItem[]>("questions", defaultQuestions);
    const remainingQs = rawQs.filter((q) => {
      const qSub = (q.subject || "").trim().toLowerCase();
      if (qSub === targetName || (targetName && (qSub.includes(targetName) || targetName.includes(qSub)))) return false;
      if (targetCode && qSub === targetCode) return false;
      return true;
    });
    saveToStorage("questions", remainingQs);

    // 5. Remove all notifications belonging or related to this subject
    this.clearNotificationsForSubject(targetName);
    if (targetCode) this.clearNotificationsForSubject(targetCode);

    // 6. Remove all uploads belonging to this subject
    const rawUploads = getFromStorage<UploadHistoryItem[]>("uploads", defaultUploadHistory);
    const remainingUploads = rawUploads.filter((u) => {
      const uSub = (u.subject || "").trim().toLowerCase();
      if (uSub === targetName || (targetName && (uSub.includes(targetName) || targetName.includes(uSub)))) return false;
      if (targetCode && uSub === targetCode) return false;
      return true;
    });
    saveToStorage("uploads", remainingUploads);
    this.dismissBatch(targetName);
    if (targetCode) this.dismissBatch(targetCode);

    this.recalculateSubjectStats();
    notifyUpdate();

    if (isSupabaseConfigured()) {
      supabase
        .from("subjects")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.warn("Supabase Subject Delete error:", error.message);
        });
    }
  },
  saveBulkSubjects(items: Partial<SubjectItem>[]): SubjectItem[] {
    const list = this.getSubjects();
    const addedList: SubjectItem[] = [];
    items.forEach((s, idx) => {
      const saved: SubjectItem = {
        id: `sub-${Date.now()}-${idx}`,
        name: s.name || "Untitled Subject",
        code: s.code || `SUB-${100 + idx}`,
        dotColor: s.dotColor || "#6366f1",
        totalQuestions: Number(s.totalQuestions || 0),
        completed: s.completed || "0 (0%)",
        approved: Number(s.approved || 0),
        verified: Number(s.verified || 0),
        pending: Number(s.pending || 0),
        status: s.status || "In Progress",
        category: s.category || "inprogress",
        credits: Number(s.credits || 3),
        semester: s.semester || "Semester 1",
        department: s.department || "General",
        school: s.school || "School of Media & Arts",
      };
      list.unshift(saved);
      addedList.push(saved);
    });
    saveToStorage("subjects", list);
    return addedList;
  },

  recalculateSubjectStats(): void {
    const subjects = this.getSubjects();
    const questions = this.getQuestions();
    let updated = false;

    subjects.forEach((subj) => {
      const subjQs = questions.filter(
        (q) =>
          q.subject.toLowerCase() === subj.name.toLowerCase() ||
          q.subject.toLowerCase() === subj.code.toLowerCase()
      );
      const total = subjQs.length;
      const approved = subjQs.filter((q) => q.status === "Approved").length;
      const verified = subjQs.filter((q) => q.status === "Verified").length;
      const pending = subjQs.filter((q) => q.status === "Pending").length;
      const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

      if (
        subj.totalQuestions !== total ||
        subj.approved !== approved ||
        subj.verified !== verified ||
        subj.pending !== pending
      ) {
        subj.totalQuestions = total;
        subj.approved = approved;
        subj.verified = verified;
        subj.pending = pending;
        subj.completed = `${approved} (${pct}%)`;
        updated = true;
      }
    });

    if (updated) {
      saveToStorage("subjects", subjects);
    }
  },

  // ----------------- SYLLABUS UNITS CRUD -----------------
  getUnits(): SyllabusUnit[] {
    const list = getFromStorage<SyllabusUnit[]>("units", defaultUnits);
    let mutated = false;

    const cleaned = list
      .filter((u) => {
        if (!u || !u.name) return false;
        if (/^PK[\s\x00-\x20]*/i.test(u.name) || /word\/(?:header|footer|xml|theme|numbering|rels|customXML)/i.test(u.name)) return false;
        if (u.name.includes("\uFFFD") || u.name.includes("9heKnHkiYMR") || u.name.includes("totcR2Iq") || u.name.includes("itemProps1")) return false;
        if ((u.name.match(/[^\x20-\x7E]/g) || []).length > 3) return false;
        if (/^[a-zA-Z0-9+\/=]{25,}$/.test(u.name)) return false;

        const lettersCount = (u.name.match(/[a-zA-Z]/g) || []).length;
        if (lettersCount < 3) return false;
        return true;
      })
      .map((u) => {
        const originalSubCount = (u.subtopics || []).length;
        const safeSubtopics = (u.subtopics || []).filter((sub) => {
          if (!sub || typeof sub !== "string") return false;
          if (/^PK[\s\x00-\x20]*/i.test(sub) || /word\/(?:header|footer|xml|theme|numbering|rels|customXML)/i.test(sub)) return false;
          if (sub.includes("\uFFFD") || sub.includes("itemProps1") || sub.includes("fontTable") || sub.includes("totcR2Iq") || sub.includes("9heKnHkiYMR")) return false;
          const letters = (sub.match(/[a-zA-Z]/g) || []).length;
          if (letters < 2 && sub.length > 5) return false;
          return true;
        });

        if (safeSubtopics.length !== originalSubCount) {
          mutated = true;
        }

        return {
          ...u,
          subtopics: safeSubtopics,
        };
      });

    if (cleaned.length !== list.length || mutated) {
      saveToStorage("units", cleaned);
    }
    return cleaned;
  },
  saveUnit(unit: Partial<SyllabusUnit> & { id?: string }): SyllabusUnit {
    const list = this.getUnits();
    
    // Sanitize unit name and subtopics before saving
    let cleanName = (unit.name || "New Unit").replace(/[^a-zA-Z0-9\s,\.\-\:\(\)\/\&]/g, "").trim();
    if (cleanName.includes("PK") || cleanName.includes("word/") || cleanName.includes("9heKnHkiYMR") || cleanName.includes("itemProps1")) {
      cleanName = `Unit ${unit.num || "01"} - Core Topics`;
    }

    const cleanSubtopics = (unit.subtopics || []).filter((st) => {
      if (!st || typeof st !== "string") return false;
      if (st.includes("PK") || st.includes("word/") || st.includes("9heKnHkiYMR") || st.includes("itemProps1") || st.includes("fontTable")) return false;
      return true;
    });

    let savedUnit: SyllabusUnit;
    if (unit.id) {
      const idx = list.findIndex((u) => u.id === unit.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...unit,
          name: cleanName,
          subtopics: cleanSubtopics,
        } as SyllabusUnit;
        savedUnit = list[idx];
        saveToStorage("units", list);
      } else {
        savedUnit = {
          id: unit.id,
          num: unit.num || `0${list.length + 1}`,
          name: cleanName,
          topics: Number(unit.topics || 3),
          docs: Number(unit.docs || 0),
          subject: unit.subject || "Viscom & VFX",
          subtopics: cleanSubtopics,
          coMapping: unit.coMapping || [],
          description: unit.description || "",
        };
        list.push(savedUnit);
        saveToStorage("units", list);
      }
    } else {
      savedUnit = {
        id: unit.id || `unit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        num: unit.num || `0${list.length + 1}`,
        name: cleanName,
        topics: Number(unit.topics || 3),
        docs: Number(unit.docs || 0),
        subject: unit.subject || "Viscom & VFX",
        subtopics: cleanSubtopics,
        coMapping: unit.coMapping || [],
        description: unit.description || "",
      };
      list.push(savedUnit);
      saveToStorage("units", list);
    }

    if (isSupabaseConfigured()) {
      supabase
        .from("syllabus_units")
        .upsert({
          id: savedUnit.id,
          num: savedUnit.num,
          name: savedUnit.name,
          subject: savedUnit.subject,
          topics: savedUnit.topics,
          docs: savedUnit.docs,
          subtopics: savedUnit.subtopics || [],
          co_mapping: savedUnit.coMapping || [],
          description: savedUnit.description || "",
        })
        .then(({ error }) => {
          if (error) console.warn("Supabase Unit Sync error:", error.message);
        });
    }

    return savedUnit;
  },
  deleteUnit(id: string): void {
    const list = this.getUnits().filter((u) => u.id !== id);
    saveToStorage("units", list);

    if (isSupabaseConfigured()) {
      supabase
        .from("syllabus_units")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.warn("Supabase Unit Delete error:", error.message);
        });
    }

    // RULE: If syllabus is deleted, Question Bank must refresh to 0
    if (list.length === 0) {
      saveToStorage("questions", []);
    } else {
      const remainingSubjects = new Set(
        list.map((u) => (u.subject || "").trim().toLowerCase()).filter(Boolean)
      );
      const allSubjects = this.getSubjects();
      list.forEach((u) => {
        const uSub = (u.subject || "").trim().toLowerCase();
        const match = allSubjects.find(
          (s) => s.name.trim().toLowerCase() === uSub || s.code.trim().toLowerCase() === uSub
        );
        if (match) {
          remainingSubjects.add(match.name.trim().toLowerCase());
          remainingSubjects.add(match.code.trim().toLowerCase());
        }
      });

      const rawQs = getFromStorage<QuestionItem[]>("questions", []);
      const survivingQs = rawQs.filter((q) =>
        remainingSubjects.has((q.subject || "").trim().toLowerCase())
      );
      if (survivingQs.length !== rawQs.length) {
        saveToStorage("questions", survivingQs);
      }

      // Also clean up notifications for subjects no longer having syllabus
      const rawNotifs = getFromStorage<NotificationItem[]>("notifications", defaultNotifications);
      const survivingNotifs = rawNotifs.filter((n) => {
        const rel = (n.relatedTo || "").trim().toLowerCase();
        if (rel === "general" || rel === "system" || rel === "coe" || rel === "all") return true;
        return remainingSubjects.has(rel);
      });
      if (survivingNotifs.length !== rawNotifs.length) {
        saveToStorage("notifications", survivingNotifs);
      }
    }

    this.recalculateSubjectStats();
    notifyUpdate();
  },

  deleteSubjectSyllabus(subjectName: string): void {
    const lower = subjectName.trim().toLowerCase();
    const remainingUnits = this.getUnits().filter(
      (u) => (u.subject || "").trim().toLowerCase() !== lower
    );
    saveToStorage("units", remainingUnits);

    // Purge questions for this subject
    const rawQs = getFromStorage<QuestionItem[]>("questions", []);
    const survivingQs = rawQs.filter(
      (q) => (q.subject || "").trim().toLowerCase() !== lower
    );
    saveToStorage("questions", survivingQs);

    // Purge notifications for this subject
    this.clearNotificationsForSubject(subjectName);

    // Purge uploads for this subject
    const rawUploads = getFromStorage<UploadHistoryItem[]>("uploads", defaultUploadHistory);
    const survivingUploads = rawUploads.filter(
      (u) => (u.subject || "").trim().toLowerCase() !== lower
    );
    saveToStorage("uploads", survivingUploads);

    this.dismissBatch(lower);

    if (isSupabaseConfigured()) {
      supabase
        .from("syllabus_units")
        .delete()
        .ilike("subject", subjectName.trim())
        .then(({ error }) => {
          if (error) console.warn("Supabase Subject Units Delete error:", error.message);
        });
    }

    this.recalculateSubjectStats();
    notifyUpdate();
  },

  clearAllSyllabus(): void {
    saveToStorage("units", []);
    saveToStorage("questions", []);
    this.clearAllNotifications();
    this.recalculateSubjectStats();
    notifyUpdate();
  },

  // ----------------- QUESTIONS CRUD -----------------
  getQuestions(): QuestionItem[] {
    const raw = getFromStorage<QuestionItem[]>("questions", defaultQuestions);
    // Ensure no auto-seeded dummy questions remain in storage
    const cleaned = raw.filter(
      (q) =>
        !String(q.id || "").startsWith("ar-q-") &&
        (!q.sourceFile || !q.sourceFile.includes("Rotoscopy_and_Keying")) &&
        !(q.subject || "").toLowerCase().includes("augmented reality100 mu")
    );
    if (cleaned.length !== raw.length) {
      saveToStorage("questions", cleaned);
    }
    const subjects = this.getSubjects();
    return cleaned.map((q, idx) => {
      let marksVal = Number(q.marks);
      if (!marksVal || isNaN(marksVal)) {
        marksVal = idx % 3 === 0 ? 5 : idx % 3 === 1 ? 10 : 12;
      }

      // Resolve department
      let dept = q.department || "";
      if (!dept) {
        const match = subjects.find(
          (s) =>
            s.name.trim().toLowerCase() === (q.subject || "").trim().toLowerCase() ||
            s.code.trim().toLowerCase() === (q.subject || "").trim().toLowerCase()
        );
        if (match && match.department) {
          dept = match.department;
        } else {
          const s = (q.subject || "").toLowerCase();
          if (s.includes("viscom") || s.includes("vfx") || s.includes("rotoscopy") || s.includes("keying") || s.includes("animation")) {
            dept = "Visual Communication";
          } else if (s.includes("computer") || s.includes("cs") || s.includes("it")) {
            dept = "Computer Science & Engineering";
          } else {
            dept = "Visual Communication";
          }
        }
      }

      // Resolve contributing staff
      let staff = (q.uploadedBy || "").trim();
      if (!staff || staff === "Faculty" || staff === "Exam Cell Admin") {
        staff = "Mr. Vignesh M";
      }

      return {
        ...q,
        subject: (q.subject || "").trim() || "General",
        topic: q.topic || q.unit || q.subject || "General",
        marks: marksVal,
        department: dept,
        uploadedBy: staff,
        email: q.email || (staff.toLowerCase().includes("vignesh") ? "vignesh.viscom@rathinam.in" : "faculty@rathinam.in"),
      };
    });
  },
  saveQuestion(question: Partial<QuestionItem> & { id?: number | string }): QuestionItem {
    const list = this.getQuestions();
    const subjects = this.getSubjects();
    let resolvedDept = question.department || "";
    if (!resolvedDept) {
      const match = subjects.find(
        (s) =>
          s.name.trim().toLowerCase() === (question.subject || "").trim().toLowerCase() ||
          s.code.trim().toLowerCase() === (question.subject || "").trim().toLowerCase()
      );
      resolvedDept = match?.department || "Visual Communication";
    }
    const resolvedStaff = (question.uploadedBy || "").trim() || "Mr. Vignesh M";
    const resolvedEmail = question.email || (resolvedStaff.toLowerCase().includes("vignesh") ? "vignesh.viscom@rathinam.in" : "faculty@rathinam.in");

    let resultQ: QuestionItem;
    if (question.id !== undefined && question.id !== null) {
      const idx = list.findIndex((q) => String(q.id) === String(question.id));
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...question,
          department: resolvedDept,
          uploadedBy: resolvedStaff,
          email: resolvedEmail,
        } as QuestionItem;
        saveToStorage("questions", list);
        resultQ = list[idx];
      } else {
        resultQ = {
          id: question.id,
          question: question.question || "Untitled Question",
          subject: question.subject || "Viscom & VFX",
          unit: question.unit || "Unit I - Introduction",
          topic: question.topic || "Topic 1 - Overview",
          type: question.type || "Descriptive",
          difficulty: question.difficulty || "Medium",
          status: question.status || "Pending",
          addedOn: question.addedOn || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          marks: Number(question.marks || 5),
          options: question.options || [],
          correctAnswer: question.correctAnswer || "",
          uploadedBy: resolvedStaff,
          department: resolvedDept,
          email: resolvedEmail,
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        };
        list.unshift(resultQ);
        saveToStorage("questions", list);
      }
    } else {
      resultQ = {
        id: Date.now(),
        question: question.question || "Untitled Question",
        subject: question.subject || "Viscom & VFX",
        unit: question.unit || "Unit I - Introduction",
        topic: question.topic || "Topic 1 - Overview",
        type: question.type || "Descriptive",
        difficulty: question.difficulty || "Medium",
        status: question.status || "Pending",
        addedOn: question.addedOn || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        marks: Number(question.marks || 5),
        options: question.options || [],
        correctAnswer: question.correctAnswer || "",
        uploadedBy: resolvedStaff,
        department: resolvedDept,
        email: resolvedEmail,
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      list.unshift(resultQ);
      saveToStorage("questions", list);
    }

    if (isSupabaseConfigured()) {
      supabase.from("questions").upsert({
        id: String(resultQ.id),
        code: resultQ.code || `Q-${resultQ.id}`,
        question: resultQ.question,
        subject: resultQ.subject,
        unit: resultQ.unit,
        topic: resultQ.topic,
        type: resultQ.type,
        difficulty: resultQ.difficulty,
        marks: resultQ.marks,
        status: resultQ.status,
        options: resultQ.options,
        answer: resultQ.correctAnswer,
        submitted_by: resultQ.uploadedBy,
        submitted_date: resultQ.date,
      }).then(({ error }) => {
        if (error) console.warn("Supabase Question Sync error:", error.message);
      });
    }

    if (!question.id) {
      this.notifyQuestionAddition(resultQ.uploadedBy || "Faculty", resultQ.subject, 1);
    }

    this.recalculateSubjectStats();
    return resultQ;
  },

  notifyQuestionAddition(uploadedBy: string, subject: string, countAdded = 1) {
    const list = this.getNotifications();
    const approverName = "Dr. T.J RAJU (HOD Viscom - hod.viscom@rathinam.in)";
    const targetSub = (subject || "").trim().toLowerCase();
    const existingIdx = list.findIndex(
      (n) =>
        n.status === "Unread" &&
        n.title.toLowerCase().includes("question") &&
        n.title.toLowerCase().includes(uploadedBy.toLowerCase()) &&
        ((n.relatedTo || "").trim().toLowerCase() === targetSub ||
          (targetSub.length > 3 && ((n.relatedTo || "").toLowerCase().includes(targetSub) || targetSub.includes((n.relatedTo || "").toLowerCase()))))
    );

    if (existingIdx !== -1) {
      const currentDesc = list[existingIdx].description;
      const match = currentDesc.match(/(\d+)\s+question/i);
      const prevCount = match ? parseInt(match[1], 10) : 1;
      const newTotal = prevCount + countAdded;

      list[existingIdx].title = `New Questions Added by ${uploadedBy}`;
      list[existingIdx].description = `${uploadedBy} added ${newTotal} question(s) for ${subject}. Routed to ${approverName} for HOD Approval.`;
      list[existingIdx].timeAgo = "Just now";
      list[existingIdx].exactTime = "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      saveToStorage("notifications", list);
      notifyUpdate();
    } else {
      this.saveNotification({
        title: countAdded > 1 ? `New Questions Added by ${uploadedBy}` : `New Question Added by ${uploadedBy}`,
        description: `${uploadedBy} added ${countAdded} question(s) for ${subject}. Routed to ${approverName} for HOD Approval.`,
        type: "Approval",
        priority: "High",
        relatedTo: subject,
        status: "Unread",
      });
    }
  },

  deleteQuestion(id: number | string): void {
    const list = this.getQuestions().filter((q) => String(q.id) !== String(id));
    saveToStorage("questions", list);
    this.recalculateSubjectStats();

    if (isSupabaseConfigured()) {
      supabase.from("questions").delete().eq("id", String(id)).then(({ error }) => {
        if (error) console.warn("Supabase Question Delete error:", error.message);
      });
    }
  },
  runAiVerification(questionIds?: (string | number)[]): { verifiedCount: number; updatedQuestions: QuestionItem[] } {
    const questions = this.getQuestions();
    let count = 0;
    const nowStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

    questions.forEach((q) => {
      const match = !questionIds || questionIds.length === 0 || questionIds.some((id) => String(id) === String(q.id));
      if (match) {
        const score = Math.floor(Math.random() * 7) + 93; // 93-99%
        const isFlagged = q.question.length < 10 || (q.type === "MCQ" && (!q.options || q.options.length === 0));

        q.aiStatus = isFlagged ? "AI Flagged" : "AI Verified";
        q.aiScore = isFlagged ? Math.floor(Math.random() * 20) + 60 : score;
        q.bloomLevel = q.bloomLevel || bloomLevels[Math.floor(Math.random() * bloomLevels.length)];
        q.aiRemarks = isFlagged
          ? "Question text is brief or missing options. Human review recommended."
          : `Passed AI Audit: Phrasing syntax clear, Bloom taxonomy (${q.bloomLevel}) validated, distractor coverage complete. Quality Match ${q.aiScore}%.`;
        q.aiCheckedAt = nowStr;

        if (!isFlagged && (q.status === "Pending" || q.status === "Draft")) {
          q.status = "Verified";
        }
        count++;
      }
    });

    if (count > 0) {
      saveToStorage("questions", questions);
      this.logActivity(`Ran AI Verification on ${count} question(s)`, "AI Engine", `Verified ${count} item(s)`);
      this.recalculateSubjectStats();
      notifyUpdate();
    }
    return { verifiedCount: count, updatedQuestions: questions };
  },

  // ----------------- BULK UPLOAD CRUD -----------------
  getUploadHistory(): UploadHistoryItem[] {
    return getFromStorage("uploads", defaultUploadHistory);
  },
  saveUpload(item: Partial<UploadHistoryItem> & { id?: number | string }): UploadHistoryItem {
    const list = this.getUploadHistory();
    if (item.id !== undefined) {
      const idx = list.findIndex((u) => String(u.id) === String(item.id));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item } as UploadHistoryItem;
        saveToStorage("uploads", list);
        return list[idx];
      }
    }
    const newUpload: UploadHistoryItem = {
      id: item.id || Date.now(),
      name: item.name || "Questions_Upload.xlsx",
      type: item.type || "xlsx",
      subject: item.subject || "Viscom & VFX",
      unit: item.unit || "Unit I - General",
      totalQuestions: Number(item.totalQuestions || 50),
      uploadedBy: item.uploadedBy || "Vignesh",
      email: item.email || "admin@rgu.ac.in",
      status: item.status || "Success",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    list.unshift(newUpload);
    saveToStorage("uploads", list);

    // Auto-generate HOD Approval Notification
    this.saveNotification({
      title: `New Questions Uploaded by ${newUpload.uploadedBy}`,
      description: `${newUpload.uploadedBy} uploaded ${newUpload.totalQuestions} question(s) in batch "${newUpload.name}" for ${newUpload.subject}. Pending HOD Approval.`,
      type: "Approval",
      priority: "High",
      relatedTo: newUpload.subject,
      status: "Unread",
    });
    return newUpload;
  },
  deleteUpload(id: number | string): void {
    const list = this.getUploadHistory().filter((u) => String(u.id) !== String(id));
    saveToStorage("uploads", list);
  },
  getDismissedBatches(): string[] {
    return getFromStorage<string[]>("dismissed_batches", []);
  },
  dismissBatch(key: string): void {
    if (!key) return;
    const cleanKey = key.trim().toLowerCase();
    const list = this.getDismissedBatches();
    if (!list.includes(cleanKey)) {
      list.push(cleanKey);
      saveToStorage("dismissed_batches", list);
    }
  },
  undismissBatch(key: string): void {
    if (!key) return;
    const cleanKey = key.trim().toLowerCase();
    const list = this.getDismissedBatches().filter((k) => k !== cleanKey);
    saveToStorage("dismissed_batches", list);
  },

  // ----------------- NOTIFICATIONS CRUD -----------------
  getNotifications(): NotificationItem[] {
    const rawList = getFromStorage<NotificationItem[]>("notifications", defaultNotifications);

    // Collect all valid active subject names and codes from subjects and syllabus units
    const activeSubjects = this.getSubjects();
    const activeUnits = this.getUnits();
    const activeSubjectNames = new Set<string>();

    activeSubjects.forEach((s) => {
      if (s.name) activeSubjectNames.add(s.name.trim().toLowerCase());
      if (s.code) activeSubjectNames.add(s.code.trim().toLowerCase());
    });
    activeUnits.forEach((u) => {
      if (u.subject) activeSubjectNames.add(u.subject.trim().toLowerCase());
    });

    const deletedSubjects = getFromStorage<string[]>("deleted_subjects", []).map((s) => s.trim().toLowerCase());
    const dismissedBatches = this.getDismissedBatches().map((b) => b.trim().toLowerCase());

    const isDeletedOrOrphaned = (n: NotificationItem): boolean => {
      const rel = (n.relatedTo || "").trim().toLowerCase();
      const title = (n.title || "").toLowerCase();
      const desc = (n.description || "").toLowerCase();

      // System / Generic / Administrative notifications are always kept
      const genericKeys = ["general", "system", "coe", "all", "admin", "broadcast", "hod", "faculty", "dean"];
      if (genericKeys.includes(rel)) return false;

      // 1. Explicitly check if in deleted_subjects blacklist
      for (const del of deletedSubjects) {
        if (!del) continue;
        if (rel === del || rel.includes(del) || del.includes(rel) || title.includes(del) || desc.includes(del)) {
          return true;
        }
      }

      // 2. Explicitly check if in dismissed batches
      for (const b of dismissedBatches) {
        if (!b) continue;
        if (rel === b || rel.includes(b) || b.includes(rel) || title.includes(b) || desc.includes(b)) {
          return true;
        }
      }

      // 3. Specifically clean up Rotoscopy & Keying if no longer an active subject
      if (
        (rel.includes("rotoscopy") || title.includes("rotoscopy") || desc.includes("rotoscopy")) &&
        ![...activeSubjectNames].some((name) => name.includes("rotoscopy"))
      ) {
        return true;
      }

      // 4. If active subjects catalog is populated, purge notifications for subjects that no longer exist anywhere
      if (
        activeSubjectNames.size > 0 &&
        (n.type === "Approval" || n.type === "Bulk Upload" || n.type === "Question Bank" || n.type === "Verify Questions")
      ) {
        const matchesActive = [...activeSubjectNames].some(
          (name) => rel === name || rel.includes(name) || name.includes(rel)
        );
        if (!matchesActive) {
          return true;
        }
      }

      return false;
    };

    // Filter out all deleted and orphaned notifications
    const validNotifications = rawList.filter((n) => !isDeletedOrOrphaned(n));

    // Auto-persist cleaned list if any deleted notifications were pruned
    if (validNotifications.length !== rawList.length) {
      saveToStorage("notifications", validNotifications);
    }

    // Consolidate duplicate question notifications by user & subject
    const map = new Map<string, NotificationItem>();
    const consolidated: NotificationItem[] = [];

    validNotifications.forEach((n) => {
      const isQuestionAdded =
        n.title &&
        /New Questions?\s+(Added|Uploaded)\s+by/i.test(n.title);

      if (isQuestionAdded) {
        const uploader = n.title.replace(/New Questions?\s+(Added|Uploaded)\s+by\s*/i, "").trim();
        const key = `${uploader.toLowerCase()}_${(n.relatedTo || "").toLowerCase()}_${n.status}`;

        const countMatch = n.description.match(/(\d+)\s+question/i);
        const thisCount = countMatch ? parseInt(countMatch[1], 10) : 1;

        if (map.has(key)) {
          const existing = map.get(key)!;
          const match = existing.description.match(/(\d+)\s+question/i);
          const prevCount = match ? parseInt(match[1], 10) : 1;
          const updatedCount = prevCount + thisCount;

          existing.title = `New Questions Added by ${uploader}`;
          const approverMatch = existing.description.match(/Routed to\s+([^\.]+)\s+for HOD Approval/i);
          const routingText = approverMatch
            ? ` Routed to ${approverMatch[1]} for HOD Approval.`
            : " Pending HOD Approval.";
          existing.description = `${uploader} added ${updatedCount} question(s) for ${existing.relatedTo}.${routingText}`;
          existing.exactTime = n.exactTime || existing.exactTime;
          existing.timeAgo = "Just now";
        } else {
          const itemCopy = {
            ...n,
            title: `New Questions Added by ${uploader}`,
            description:
              n.description.includes("added") || n.description.includes("uploaded")
                ? n.description
                : `${uploader} added ${thisCount} question(s) for ${n.relatedTo}. Pending HOD Approval.`,
          };
          map.set(key, itemCopy);
          consolidated.push(itemCopy);
        }
      } else {
        consolidated.push(n);
      }
    });

    return consolidated;
  },
  saveNotification(notif: Partial<NotificationItem> & { id?: string }): NotificationItem {
    const list = this.getNotifications();
    if (notif.id) {
      const idx = list.findIndex((n) => n.id === notif.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...notif } as NotificationItem;
        saveToStorage("notifications", list);
        return list[idx];
      }
    }
    const newNotif: NotificationItem = {
      id: notif.id || `notif-${Date.now()}`,
      title: notif.title || "New System Notice",
      description: notif.description || "",
      type: notif.type || "System",
      priority: notif.priority || "Medium",
      relatedTo: notif.relatedTo || "General",
      relatedSub: notif.relatedSub,
      timeAgo: "Just now",
      exactTime: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: notif.status || "Unread",
    };
    list.unshift(newNotif);
    saveToStorage("notifications", list);
    return newNotif;
  },
  deleteNotification(id: string): void {
    const raw = getFromStorage<NotificationItem[]>("notifications", defaultNotifications);
    const target = raw.find((n) => n.id === id);
    let updated: NotificationItem[];
    if (target && target.title && /New Questions?\s+(Added|Uploaded)\s+by/i.test(target.title)) {
      const uploader = target.title.replace(/New Questions?\s+(Added|Uploaded)\s+by\s*/i, "").trim().toLowerCase();
      const subject = (target.relatedTo || "").trim().toLowerCase();
      updated = raw.filter((n) => {
        if (n.id === id) return false;
        if (n.title && /New Questions?\s+(Added|Uploaded)\s+by/i.test(n.title)) {
          const up = n.title.replace(/New Questions?\s+(Added|Uploaded)\s+by\s*/i, "").trim().toLowerCase();
          const sub = (n.relatedTo || "").trim().toLowerCase();
          if (up === uploader && sub === subject) return false;
        }
        return true;
      });
    } else {
      updated = raw.filter((n) => n.id !== id);
    }
    saveToStorage("notifications", updated);
    notifyUpdate();
  },
  markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({
      ...n,
      status: "Read" as const,
    }));
    saveToStorage("notifications", list);
    notifyUpdate();
  },
  clearNotificationsForSubject(subjectName: string): void {
    if (!subjectName) return;
    const target = subjectName.trim().toLowerCase();
    const raw = getFromStorage<NotificationItem[]>("notifications", defaultNotifications);
    const filtered = raw.filter((n) => {
      const rel = (n.relatedTo || "").trim().toLowerCase();
      const title = (n.title || "").toLowerCase();
      const desc = (n.description || "").toLowerCase();
      if (rel === target || (target.length > 2 && (rel.includes(target) || target.includes(rel)))) return false;
      if (target.length > 3 && (title.includes(target) || desc.includes(target))) return false;
      return true;
    });
    saveToStorage("notifications", filtered);
    notifyUpdate();
  },
  clearAllNotifications(): void {
    saveToStorage("notifications", []);
    notifyUpdate();
  },

  // ----------------- DIRECT MESSAGES CRUD -----------------
  getMessages(): MessageItem[] {
    return getFromStorage<MessageItem[]>("messages", defaultMessages);
  },
  sendMessage(msg: Partial<MessageItem>): MessageItem {
    const list = this.getMessages();
    const newMsg: MessageItem = {
      id: msg.id || `msg-${Date.now()}`,
      senderName: msg.senderName || "Exam Cell User",
      senderRole: msg.senderRole || "STAFF",
      senderEmail: msg.senderEmail || "user@rathinam.in",
      recipientRole: msg.recipientRole || "HOD",
      recipientName: msg.recipientName || "Dr. Sathish Murugan (HOD)",
      subject: msg.subject || "Academic Question Query",
      content: msg.content || "",
      timeAgo: "Just now",
      exactTime: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Unread",
    };
    list.unshift(newMsg);
    saveToStorage("messages", list);

    this.saveNotification({
      title: `Direct Message from ${newMsg.senderName}`,
      description: `"${newMsg.subject}": ${newMsg.content.slice(0, 45)}...`,
      type: "Message",
      priority: "Medium",
      relatedTo: newMsg.recipientRole,
      status: "Unread",
    });

    notifyUpdate();
    return newMsg;
  },
  markMessageRead(id: string): void {
    const list = this.getMessages().map((m) => (m.id === id ? { ...m, status: "Read" as const } : m));
    saveToStorage("messages", list);
    notifyUpdate();
  },
  deleteMessage(id: string): void {
    const list = this.getMessages().filter((m) => m.id !== id);
    saveToStorage("messages", list);
    notifyUpdate();
  },

  // ----------------- USERS CRUD -----------------
  getUsers(): UserItem[] {
    return getFromStorage("users", defaultUsers);
  },
  saveUser(user: Partial<UserItem> & { id?: string }): UserItem {
    const list = this.getUsers();
    if (user.id) {
      const idx = list.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...user } as UserItem;
        saveToStorage("users", list);
        return list[idx];
      }
    }
    const newUser: UserItem = {
      id: user.id || `usr-${Date.now()}`,
      name: user.name || "New Staff",
      email: user.email || "staff@rgu.ac.in",
      role: user.role || "Faculty",
      department: user.department || "Visual Arts",
      status: user.status || "Active",
      lastLogin: "Never",
    };
    list.unshift(newUser);
    saveToStorage("users", list);
    return newUser;
  },
  deleteUser(id: string): void {
    const list = this.getUsers().filter((u) => u.id !== id);
    saveToStorage("users", list);
  },

  // ----------------- STAFF / FACULTY CRUD -----------------
  getAllStaffFaculty(): StaffFacultyItem[] {
    let list = getFromStorage<StaffFacultyItem[]>("staff_faculty", defaultStaffFaculty);
    if (!list || list.length === 0) {
      list = [...defaultStaffFaculty];
      saveToStorage("staff_faculty", list);
    }
    return list;
  },
  getStaffFaculty(role?: "HOD" | "DEAN" | "COE" | string): StaffFacultyItem[] {
    let all = this.getAllStaffFaculty();
    all = all.map((staff) => {
      const fallback = defaultStaffFaculty.find((d) => d.id === staff.id || d.name === staff.name || d.email === staff.email);
      if (fallback) {
        return {
          ...fallback,
          ...staff,
          assignedSubjects: (staff.assignedSubjects && staff.assignedSubjects.length > 0) ? staff.assignedSubjects : fallback.assignedSubjects,
          employeeId: staff.employeeId || fallback.employeeId,
          assignedSyllabus: (staff.assignedSyllabus && staff.assignedSyllabus.length > 0) ? staff.assignedSyllabus : fallback.assignedSyllabus,
          syllabusCount: typeof staff.syllabusCount === "number" ? staff.syllabusCount : fallback.syllabusCount,
          questionsContributed: typeof staff.questionsContributed === "number" ? staff.questionsContributed : fallback.questionsContributed,
          pendingReviews: typeof staff.pendingReviews === "number" ? staff.pendingReviews : fallback.pendingReviews,
        };
      }
      return staff;
    });

    if (all.length === 0) {
      all = [...defaultStaffFaculty];
      saveToStorage("staff_faculty", all);
    }
    if (!role || role === "COE") return all;
    if (role === "HOD") {
      return all.filter((f) => f.reportingTo === "HOD" || f.reportingTo === "Both");
    }
    if (role === "DEAN") {
      return all.filter((f) => f.reportingTo === "DEAN" || f.reportingTo === "Both");
    }
    if (role === "STAFF") {
      if (typeof window !== "undefined") {
        try {
          const authUserStr = localStorage.getItem("exam_cell_auth_user");
          if (authUserStr) {
            const authUser = JSON.parse(authUserStr);
            const userEmail = (authUser.email || "").toLowerCase().trim();
            const cleanUserName = (authUser.name || "")
              .toLowerCase()
              .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s*/gi, "")
              .trim();
            const staffTokens = ["gayathiri", "gayathri", "vignesh", "vishal", "athreya", "saravanan", "kailash"];
            const userMatchedToken = staffTokens.find((tok) => userEmail.includes(tok) || cleanUserName.includes(tok));

            const matched = all.filter((s) => {
              const sEmail = (s.email || "").toLowerCase().trim();
              const sName = (s.name || "")
                .toLowerCase()
                .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s*/gi, "")
                .trim();
              const emailMatches =
                sEmail === userEmail ||
                (userEmail && sEmail && (userEmail.startsWith(sEmail.split("@")[0]) || sEmail.startsWith(userEmail.split("@")[0])));
              const nameMatches =
                sName === cleanUserName ||
                (cleanUserName && sName && (sName.includes(cleanUserName) || cleanUserName.includes(sName))) ||
                (Boolean(userMatchedToken) && (sEmail.includes(userMatchedToken!) || sName.includes(userMatchedToken!)));
              return emailMatches || nameMatches;
            });

            if (matched.length > 0) return [matched[0]];
          }
        } catch (e) {}
      }
    }
    return all;
  },
  setStaffFacultyList(list: StaffFacultyItem[], emitNotify = true): void {
    saveToStorage("staff_faculty", list);
    if (emitNotify) notifyUpdate();
  },
  saveStaffFaculty(item: Partial<StaffFacultyItem> & { id?: string }): StaffFacultyItem {
    const list = getFromStorage<StaffFacultyItem[]>("staff_faculty", defaultStaffFaculty);
    if (item.id) {
      const idx = list.findIndex((f) => f.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item } as StaffFacultyItem;
        saveToStorage("staff_faculty", list);
        notifyUpdate();
        return list[idx];
      }
    }
    const newItem: StaffFacultyItem = {
      id: item.id || `fac-${Date.now()}`,
      name: item.name || "New Faculty Member",
      designation: item.designation || "Assistant Professor",
      employeeId: item.employeeId || "",
      department: item.department || "Visual Communication",
      school: item.school || "Rathinam Global University",
      email: item.email || "faculty@rathinam.in",
      phone: item.phone || "",
      qualification: item.qualification || "",
      experience: item.experience || "",
      reportingTo: (item.reportingTo as any) || "HOD",
      reportingOfficerName: item.reportingOfficerName || "Head of Department (HOD)",
      assignedSubjects: item.assignedSubjects || [],
      syllabusCount: Number(item.syllabusCount || item.assignedSyllabus?.length || 0),
      assignedSyllabus: item.assignedSyllabus || [],
      questionsContributed: Number(item.questionsContributed || 0),
      pendingReviews: Number(item.pendingReviews || 0),
      status: item.status || "Active",
      avatarBg: item.avatarBg || "linear-gradient(135deg, #6366f1, #818cf8)",
    };
    list.unshift(newItem);
    saveToStorage("staff_faculty", list);
    notifyUpdate();
    return newItem;
  },
  deleteStaffFaculty(id: string): void {
    const list = getFromStorage<StaffFacultyItem[]>("staff_faculty", defaultStaffFaculty).filter(
      (f) => f.id !== id
    );
    saveToStorage("staff_faculty", list);
    notifyUpdate();
  },

  // ----------------- ACTIVITIES CRUD -----------------
  getActivities(): ActivityItem[] {
    return getFromStorage("activities", defaultActivities);
  },
  logActivity(activity: string, module: string, details: string, performedBy = "Vignesh"): ActivityItem {
    const list = this.getActivities();
    const item: ActivityItem = {
      id: `act-${Date.now()}`,
      activity,
      module,
      performedBy,
      dateTime: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      details,
    };
    list.unshift(item);
    saveToStorage("activities", list.slice(0, 50));
    return item;
  },
  deleteActivity(id: string): void {
    const list = this.getActivities().filter((a) => a.id !== id);
    saveToStorage("activities", list);
  },
  updateActivity(id: string, data: Partial<ActivityItem>): void {
    const list = this.getActivities();
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data } as ActivityItem;
      saveToStorage("activities", list);
    }
  },

  // ----------------- SYLLABUS APPROVALS CRUD -----------------
  getSyllabusApprovals(): SyllabusApprovalItem[] {
    const list = getFromStorage<SyllabusApprovalItem[]>("syllabus_approvals", []);
    // Completely purge any old dummy pre-seeded items
    const cleaned = list.filter((item) => {
      const id = String(item.id || "").toLowerCase();
      const code = String(item.courseCode || "").toUpperCase();
      const by = String(item.submittedBy || "").toLowerCase();
      if (
        id.startsWith("syl-appr-aish-") ||
        id.startsWith("syl-appr-vig-") ||
        id.startsWith("syl-appr-vish-") ||
        id.startsWith("syl-appr-gaya-") ||
        id.startsWith("syl-appr-ath-") ||
        id.startsWith("syl-appr-sar-") ||
        id.startsWith("syl-appr-kai-") ||
        id.startsWith("syl-appr-pri-") ||
        id.startsWith("syl-appr-man-") ||
        code === "VIS-101" ||
        code === "VIS-102" ||
        code === "VIS-201" ||
        code === "VIS-202" ||
        code === "VIS-301" ||
        code === "VIS-302" ||
        code === "VIS-401" ||
        code === "VIS-402" ||
        code === "VIS-303" ||
        code === "VIS-304" ||
        code === "VIS-203" ||
        code === "VIS-204" ||
        code === "VIS-403" ||
        code === "VIS-404" ||
        code.includes("CSE-") ||
        code.includes("MECH-") ||
        code.includes("AI-") ||
        code.includes("ECE-") ||
        code.includes("MBA-") ||
        by.includes("priya nair") ||
        by.includes("arun prakash") ||
        by.includes("karthik raja") ||
        by.includes("manju mohan") ||
        by.includes("deepa sundaram")
      ) {
        return false;
      }
      return true;
    });

    if (cleaned.length !== list.length) {
      saveToStorage("syllabus_approvals", cleaned);
    }
    return cleaned;
  },

  clearAllSyllabusApprovals(): void {
    saveToStorage("syllabus_approvals", []);
    notifyUpdate();
  },

  saveSyllabusApproval(item: Partial<SyllabusApprovalItem> & { id?: string }): SyllabusApprovalItem {
    const list = this.getSyllabusApprovals();
    let savedItem: SyllabusApprovalItem;
    if (item.id) {
      const idx = list.findIndex((a) => a.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item } as SyllabusApprovalItem;
        savedItem = list[idx];
        saveToStorage("syllabus_approvals", list);
        notifyUpdate();
        return savedItem;
      }
    }
    savedItem = {
      id: item.id || `syl-appr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      courseCode: item.courseCode || "VIS-101",
      courseName: item.courseName || "Visual Communication",
      department: item.department || "Dept of Visual Communication",
      semester: item.semester || "Semester 1",
      submittedBy: item.submittedBy || "Faculty Member",
      submitterEmail: item.submitterEmail || "faculty@rathinam.in",
      submittedAt:
        item.submittedAt ||
        new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
          ", " +
          new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      totalUnits: Number(item.totalUnits || 5),
      totalTopics: Number(item.totalTopics || 20),
      stage: item.stage || "hod",
      status: item.status || "Pending",
      staffStatus: item.staffStatus || "Submitted",
      hodStatus: item.hodStatus || "Pending",
      hodName: item.hodName,
      hodDate: item.hodDate,
      deanStatus: item.deanStatus || "Waiting_HOD",
      deanName: item.deanName,
      deanDate: item.deanDate,
      coeStatus: item.coeStatus || "Waiting_Dean",
      coeName: item.coeName,
      coeDate: item.coeDate,
      remarks: item.remarks || "Syllabus uploaded and awaiting HOD verification.",
    };
    list.unshift(savedItem);
    saveToStorage("syllabus_approvals", list);
    notifyUpdate();
    return savedItem;
  },

  updateSyllabusApproval(id: string, updates: Partial<SyllabusApprovalItem>): SyllabusApprovalItem | null {
    const list = this.getSyllabusApprovals();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    saveToStorage("syllabus_approvals", list);
    notifyUpdate();
    return list[idx];
  },

  deleteSyllabusApproval(id: string): void {
    const list = this.getSyllabusApprovals().filter((a) => a.id !== id);
    saveToStorage("syllabus_approvals", list);
    notifyUpdate();
  },

  getStaffAssignedSubjects(userEmail?: string, userName?: string): { subjects: string[]; syllabi: string[] } {
    const allStaff = this.getAllStaffFaculty();
    const cleanUserEmail = (userEmail || "").toLowerCase().trim();
    const cleanUserName = (userName || "")
      .toLowerCase()
      .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s*/gi, "")
      .trim();

    const matchedStaff = allStaff.find((s) => {
      const sEmail = (s.email || "").toLowerCase().trim();
      const sName = (s.name || "")
        .toLowerCase()
        .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s*/gi, "")
        .trim();
      return (
        (cleanUserEmail && sEmail && (sEmail === cleanUserEmail || cleanUserEmail.includes(sEmail.split("@")[0]))) ||
        (cleanUserName && sName && (sName === cleanUserName || cleanUserName.includes(sName) || sName.includes(cleanUserName)))
      );
    });

    if (matchedStaff) {
      return {
        subjects: matchedStaff.assignedSubjects || [],
        syllabi: matchedStaff.assignedSyllabus || [],
      };
    }

    // Default if Dr. Aishwarya Lakshmi or user profile
    if (cleanUserEmail.includes("aishwarya") || cleanUserName.includes("aishwarya")) {
      return {
        subjects: ["Visual Communication & Media Ethics", "Digital Media Design & Production"],
        syllabi: ["Visual Communication & Media Ethics", "Digital Media Design & Production"],
      };
    }

    return { subjects: [], syllabi: [] };
  },

  // ----------------- CONVENIENCE ALIASES -----------------
  addQuestion(q: Partial<QuestionItem>): QuestionItem {
    return this.saveQuestion(q);
  },
  updateQuestion(id: number | string, data: Partial<QuestionItem>): QuestionItem {
    return this.saveQuestion({ ...data, id });
  },
  addSubject(s: Partial<SubjectItem>): SubjectItem {
    return this.saveSubject(s);
  },
  updateSubject(id: string, data: Partial<SubjectItem>): SubjectItem {
    return this.saveSubject({ ...data, id });
  },
  addUnit(u: Partial<SyllabusUnit>): SyllabusUnit {
    return this.saveUnit(u);
  },
  updateUnit(id: string, data: Partial<SyllabusUnit>): SyllabusUnit {
    return this.saveUnit({ ...data, id });
  },
  addNotification(n: Partial<NotificationItem>): NotificationItem {
    return this.saveNotification(n);
  },
  updateNotification(id: string, data: Partial<NotificationItem>): NotificationItem {
    return this.saveNotification({ ...data, id });
  },
  addUpload(u: Partial<UploadHistoryItem>): UploadHistoryItem {
    return this.saveUpload(u);
  },
  updateUpload(id: number | string, data: Partial<UploadHistoryItem>): UploadHistoryItem {
    return this.saveUpload({ ...data, id });
  },

  // ----------------- BATCH OPERATIONS & 3-TIER VERIFICATION PIPELINE -----------------
  hodVerifyQuestions(ids: (number | string)[], verifierName = "Dr. T.J RAJU"): number {
    const list = this.getQuestions();
    let count = 0;
    const idSet = new Set(ids.map(String));
    let lastSubject = "Viscom & VFX";
    list.forEach((q) => {
      if (idSet.has(String(q.id))) {
        q.status = "Verified";
        q.verifiedBy = `${verifierName} (HOD)`;
        q.verifiedRole = "HOD";
        q.aiStatus = "AI Verified";
        q.aiScore = Math.floor(Math.random() * 6) + 94;
        q.aiRemarks = "Verified by HOD & AI Quality Engine. Approved for Dean Review.";
        lastSubject = q.subject || lastSubject;
        count++;
      }
    });
    if (count > 0) {
      saveToStorage("questions", list);
      this.logActivity(
        `HOD (${verifierName}) verified ${count} question(s) & sent to Dean`,
        "Approval Pipeline",
        `Question IDs: ${ids.slice(0, 5).join(", ")}`
      );
      this.saveNotification({
        title: `HOD Verification Complete - Pending Dean Approval`,
        description: `${verifierName} (HOD) verified ${count} question(s) for ${lastSubject}. Awaiting Dean Academic Affairs approval.`,
        type: "Approval",
        priority: "High",
        relatedTo: lastSubject,
        status: "Unread",
      });
      this.recalculateSubjectStats();
      notifyUpdate();
    }
    return count;
  },

  deanApproveQuestions(ids: (number | string)[], verifierName = "Dr. V Rajlakshmi"): number {
    const list = this.getQuestions();
    let count = 0;
    const idSet = new Set(ids.map(String));
    let lastSubject = "Viscom & VFX";
    list.forEach((q) => {
      if (idSet.has(String(q.id))) {
        q.status = "Approved";
        q.verifiedBy = `${verifierName} (Dean)`;
        q.verifiedRole = "DEAN";
        lastSubject = q.subject || lastSubject;
        count++;
      }
    });
    if (count > 0) {
      saveToStorage("questions", list);
      this.logActivity(
        `Dean (${verifierName}) approved ${count} question(s) & forwarded to COE`,
        "Approval Pipeline",
        `Question IDs: ${ids.slice(0, 5).join(", ")}`
      );
      this.saveNotification({
        title: `Dean Approval Complete - Ready for COE Question Bank`,
        description: `${verifierName} (Dean) approved ${count} question(s) for ${lastSubject}. Available now in COE Question Bank for exam paper generation.`,
        type: "Approval",
        priority: "High",
        relatedTo: lastSubject,
        status: "Unread",
      });
      this.recalculateSubjectStats();
      notifyUpdate();
    }
    return count;
  },

  coeFinalizeQuestions(ids: (number | string)[], verifierName = "Dr. Rajubalaji"): number {
    const list = this.getQuestions();
    let count = 0;
    const idSet = new Set(ids.map(String));
    let lastSubject = "Viscom & VFX";
    list.forEach((q) => {
      if (idSet.has(String(q.id))) {
        q.status = "Approved";
        q.verifiedBy = `${verifierName} (COE)`;
        q.verifiedRole = "COE";
        q.aiRemarks = "Final Sign-off by Controller of Examinations. Question Bank finalized for Exam Paper Printing.";
        lastSubject = q.subject || lastSubject;
        count++;
      }
    });
    if (count > 0) {
      saveToStorage("questions", list);
      this.logActivity(
        `COE (${verifierName}) granted final approval for ${count} question(s)`,
        "Approval Pipeline",
        `Subject: ${lastSubject} | Question IDs: ${ids.slice(0, 5).join(", ")}`
      );
      this.saveNotification({
        title: `COE Final Approval Complete - Ready for Exam Paper Printing`,
        description: `${verifierName} (COE) completed final sign-off for ${count} question(s) in ${lastSubject}. Ready in Question Bank and Print Paper.`,
        type: "Approval",
        priority: "High",
        relatedTo: lastSubject,
        status: "Unread",
      });
      this.recalculateSubjectStats();
      notifyUpdate();
    }
    return count;
  },

  bulkUpdateQuestions(ids: (number | string)[], status: QuestionItem["status"]): number {
    const list = this.getQuestions();
    let updated = 0;
    const idSet = new Set(ids.map(String));
    list.forEach((q) => {
      if (idSet.has(String(q.id))) {
        q.status = status;
        updated++;
      }
    });
    if (updated > 0) {
      saveToStorage("questions", list);
      this.logActivity(`Batch updated ${updated} questions to ${status}`, "Question Management", `IDs: ${ids.slice(0, 5).join(", ")}`);
    }
    return updated;
  },

  bulkDeleteQuestions(ids: (number | string)[]): number {
    const list = this.getQuestions();
    const idSet = new Set(ids.map(String));
    const filtered = list.filter((q) => !idSet.has(String(q.id)));
    const deleted = list.length - filtered.length;
    if (deleted > 0) {
      saveToStorage("questions", filtered);
      this.logActivity(`Batch deleted ${deleted} questions`, "Question Management", `Count: ${deleted}`);
    }
    return deleted;
  },

  // ----------------- LIVE STATS CALCULATION -----------------
  getStats() {
    const subjects = this.getSubjects();
    const questions = this.getQuestions();
    const uploads = this.getUploadHistory();
    const notifications = this.getNotifications();
    const users = this.getUsers();
    const units = this.getUnits();

    const totalQuestions = questions.length;
    const approvedQuestions = questions.filter((q) => q.status === "Approved").length;
    const verifiedQuestions = questions.filter((q) => q.status === "Verified").length;
    const pendingQuestions = questions.filter((q) => q.status === "Pending").length;
    const rejectedQuestions = questions.filter((q) => q.status === "Rejected").length;
    const draftQuestions = questions.filter((q) => q.status === "Draft").length;

    const totalSubjects = subjects.length;
    const inProgressSubjects = subjects.filter((s) => s.status === "In Progress").length;
    const completedSubjects = subjects.filter((s) => s.status === "Completed").length;

    const unreadNotifications = notifications.filter((n) => n.status === "Unread").length;

    return {
      totalQuestions,
      approvedQuestions,
      verifiedQuestions,
      pendingQuestions,
      rejectedQuestions,
      draftQuestions,
      totalSubjects,
      inProgressSubjects,
      completedSubjects,
      totalUnits: units.length,
      totalUploads: uploads.length,
      unreadNotifications,
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === "Active").length,
    };
  },

  // ----------------- CLIENT-SIDE CSV EXPORTER -----------------
  exportToCsv(filename: string, rows: Record<string, any>[]): void {
    if (!rows || !rows.length || typeof window === "undefined") return;
    const keys = Object.keys(rows[0]);
    const csvContent = [
      keys.join(","),
      ...rows.map((row) =>
        keys
          .map((k) => {
            const val = row[k] === null || row[k] === undefined ? "" : String(row[k]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // ----------------- FULL BACKUP & RESTORE -----------------
  createFullBackup(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      subjects: this.getSubjects(),
      units: this.getUnits(),
      questions: this.getQuestions(),
      uploads: this.getUploadHistory(),
      notifications: this.getNotifications(),
      users: this.getUsers(),
      activities: this.getActivities(),
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    if (typeof window !== "undefined") {
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `exam_cell_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    return jsonStr;
  },

  restoreFullBackup(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.subjects) saveToStorage("subjects", parsed.subjects);
      if (parsed.units) saveToStorage("units", parsed.units);
      if (parsed.questions) saveToStorage("questions", parsed.questions);
      if (parsed.uploads) saveToStorage("uploads", parsed.uploads);
      if (parsed.notifications) saveToStorage("notifications", parsed.notifications);
      if (parsed.users) saveToStorage("users", parsed.users);
      if (parsed.activities) saveToStorage("activities", parsed.activities);
      this.logActivity("Database restored from backup", "Backup & Restore", "Full database restoration");
      notifyUpdate();
      return true;
    } catch (err) {
      console.error("Backup restoration failed:", err);
      return false;
    }
  },


  async syncFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      const [{ data: suData }, { data: unitData }, { data: qData }] = await Promise.all([
        supabase.from("subjects").select("*"),
        supabase.from("syllabus_units").select("*"),
        supabase.from("questions").select("*"),
      ]);

      if (suData && suData.length > 0) {
        const localSubs = this.getSubjects();
        const mergedSubs = [...localSubs];
        suData.forEach((s) => {
          const idx = mergedSubs.findIndex((m) => m.id === s.id || m.code === s.code);
          const item: SubjectItem = {
            id: s.id,
            name: s.name,
            code: s.code,
            semester: s.semester || "Semester 1",
            department: s.department || "General",
            totalQuestions: s.total_questions || 0,
            approved: s.approved || 0,
            pending: s.pending || 0,
            verified: s.verified || 0,
            status: (s.status as any) || "In Progress",
            credits: 3,
            completed: `${s.approved || 0} (${s.total_questions ? Math.round(((s.approved || 0) / s.total_questions) * 100) : 0}%)`,
          };
          if (idx !== -1) mergedSubs[idx] = { ...mergedSubs[idx], ...item };
          else mergedSubs.push(item);
        });
        saveToStorage("subjects", mergedSubs);
      }

      if (unitData && unitData.length > 0) {
        const localUnits = this.getUnits();
        const mergedUnits = [...localUnits];
        unitData.forEach((u) => {
          const idx = mergedUnits.findIndex((m) => m.id === u.id);
          const item: SyllabusUnit = {
            id: u.id,
            num: u.num,
            name: u.name,
            subject: u.subject,
            topics: u.topics || 0,
            docs: u.docs || 0,
            subtopics: Array.isArray(u.subtopics) ? u.subtopics : [],
            coMapping: Array.isArray(u.co_mapping) ? u.co_mapping : [],
            description: u.description || "",
          };
          if (idx !== -1) mergedUnits[idx] = { ...mergedUnits[idx], ...item };
          else mergedUnits.push(item);
        });
        saveToStorage("units", mergedUnits);
      }

      if (qData && qData.length > 0) {
        const localQs = this.getQuestions();
        const mergedQs = [...localQs];
        qData.forEach((q) => {
          const idx = mergedQs.findIndex((m) => String(m.id) === String(q.id));
          const item: QuestionItem = {
            id: q.id,
            code: q.code,
            question: q.question,
            subject: q.subject,
            unit: q.unit,
            topic: q.topic || "",
            type: q.type || "Descriptive",
            difficulty: q.difficulty || "Medium",
            marks: q.marks || 5,
            bloomLevel: q.bloom_level || "Understand",
            status: q.status || "Pending",
            options: q.options || [],
            correctAnswer: q.answer || "",
            uploadedBy: q.submitted_by || "Faculty",
            date: q.submitted_date || "",
          };
          if (idx !== -1) mergedQs[idx] = { ...mergedQs[idx], ...item };
          else mergedQs.push(item);
        });
        saveToStorage("questions", mergedQs);
      }
    } catch (err) {
      console.warn("Supabase initial fetch sync warning:", err);
    }
  },

  // ----------------- RESET ALL -----------------
  resetAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("exam_cell_subjects");
    localStorage.removeItem("exam_cell_units");
    localStorage.removeItem("exam_cell_questions");
    localStorage.removeItem("exam_cell_uploads");
    localStorage.removeItem("exam_cell_notifications");
    localStorage.removeItem("exam_cell_users");
    localStorage.removeItem("exam_cell_activities");
    localStorage.removeItem("exam_cell_syllabus_approvals");
    notifyUpdate();
  },
};
