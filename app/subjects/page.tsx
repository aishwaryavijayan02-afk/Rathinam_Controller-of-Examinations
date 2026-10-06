"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  FileText,
  CheckSquare,
  Upload,
  Search,
  BarChart2,
  Bell,
  Edit3,
  Users,
  Settings,
  Printer,
  Shield,
  ArrowRight,
  School,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Building2,
  X,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Layers,
  Filter,
  Mail,
  Phone,
  Award,
  Briefcase,
  UserCheck,
  Cpu,
  Activity,
  Leaf,
  Sprout,
  Palette,
  ShieldCheck,
  EyeOff,
  Clock,
  Tag,
  BadgeCheck,
  Archive,
} from "lucide-react";
import { examStore, StaffFacultyItem, defaultStaffFaculty } from "../lib/examStore";
import { authStore, AuthUser, hasPermission } from "../lib/auth";
import RoleGuard from "../components/RoleGuard";
import { ToastNotification } from "../components/CrudModal";
import PortalFooter from "../components/PortalFooter";
import PortalHeader from "../components/PortalHeader";

export interface DepartmentItem {
  id: string;
  name: string;
  fullName: string;
  code: string;
  school: string;
}

const DEFAULT_SCHOOLS: DepartmentItem[] = [
  {
    id: "viscom",
    name: "Viscom",
    fullName: "Department of Visual Communication",
    code: "DEPT-VISCOM",
    school: "School of Fashion Design, Media and Performing Arts",
  },
];

export interface ProgrammeGroup {
  number: number;
  title: string;
  items: string[];
}

export interface SchoolShowcaseItem {
  id: string;
  name: string;
  programmes: string;
  icon: React.ElementType;
  gradient: string;
  glow: string;
  tags: string[];
  departmentMatch: string[];
  programmeGroups?: ProgrammeGroup[];
}

export const RATHINAM_SCHOOLS: SchoolShowcaseItem[] = [
  {
    id: "quantum-ai",
    name: "Quantum Science, Computing & AI",
    programmes: "13 Programmes",
    icon: Cpu,
    gradient: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
    glow: "rgba(124, 58, 237, 0.4)",
    tags: ["Machine Learning", "Data Science"],
    departmentMatch: ["computer", "ai", "quantum", "it"],
    programmeGroups: [
      {
        number: 1,
        title: "B.SC PROGRAMMES",
        items: [
          "B.Sc Artificial Intelligence and Machine Learning",
          "B.Sc Computer Science",
          "B.Sc Computer Science (AI & Data Science)",
          "B.Sc Computer Science (Artificial Intelligence)",
          "B.Sc Computer Science (Cyber Security)",
          "B.Sc Computer Technology (Generative AI)",
          "B.Sc Digital and Cyber Forensics Science",
          "B.Sc Information Technology"
        ]
      },
      {
        number: 2,
        title: "BCA PROGRAMMES",
        items: [
          "BCA",
          "BCA (Artificial Intelligence)"
        ]
      },
      {
        number: 3,
        title: "POSTGRADUATE PROGRAMMES",
        items: [
          "M.Sc Artificial Intelligence and Data Science",
          "M.Sc Computer Science",
          "M.Sc Data Science and Business Analytics"
        ]
      }
    ]
  },
  {
    id: "business-commerce",
    name: "Business & Commerce",
    programmes: "24 Programmes",
    icon: Briefcase,
    gradient: "linear-gradient(135deg, #65a30d 0%, #84cc16 100%)",
    glow: "rgba(101, 163, 13, 0.4)",
    tags: ["Finance", "Marketing"],
    departmentMatch: ["business", "commerce", "management"],
    programmeGroups: [
      {
        number: 1,
        title: "BBA PROGRAMMES",
        items: [
          "BBA General",
          "BBA Aviation Management",
          "BBA Computer Applications",
          "BBA Logistics"
        ]
      },
      {
        number: 2,
        title: "B.COM PROGRAMMES",
        items: [
          "B.Com Accounting & Finance",
          "B.Com Banking & Insurance",
          "B.Com Business Process Services",
          "B.Com Corporate Secretorship",
          "B.Com Financial Services",
          "B.Com Information Technology",
          "B.Com International Business",
          "B.Com Professional Accounting",
          "B.Com Professional Accounting (CA Training)"
        ]
      },
      {
        number: 3,
        title: "B.COM — AI & PROFESSIONAL SPECIALIZATIONS",
        items: [
          "B.Com Computer Applications (Business Intelligence & AI)",
          "B.Com Computer Applications (AI-Ready Accountant)",
          "B.Com Financial Services (AI-Ready Account Analyst)",
          "B.Com Financial Services (Public Accountant)",
          "B.Com IT (Accounting Analytics)",
          "B.Com International Business (AI-Ready Business Analyst)",
          "B.Com Professional Accounting (Chartered Accountant)",
          "B.Com (AI-Ready Accountant)",
          "B.Com (ACCA)"
        ]
      },
      {
        number: 4,
        title: "M.COM PROGRAMMES",
        items: [
          "M.Com Computer Applications (AI-Ready Accountant)",
          "M.Com General (Guaranteed Internship)"
        ]
      }
    ]
  },
  {
    id: "sports-health",
    name: "Sports & Health Sciences",
    programmes: "4 Programmes",
    icon: Activity,
    gradient: "linear-gradient(135deg, #9333ea 0%, #c026d3 100%)",
    glow: "rgba(168, 85, 247, 0.4)",
    tags: ["Psychology", "Clinical"],
    departmentMatch: ["health", "sports", "science"],
    programmeGroups: [
      {
        number: 1,
        title: "B.SC PROGRAMMES",
        items: [
          "B.Sc Psychology",
          "B.Sc MicroBiology with GIP"
        ]
      },
      {
        number: 2,
        title: "POSTGRADUATE PROGRAMMES",
        items: [
          "M.Sc Applied Psychology",
          "M.Sc Clinical Psychology"
        ]
      }
    ]
  },
  {
    id: "media-performing",
    name: "School of Fashion Design, Media and Performing Arts",
    programmes: "9 Programmes",
    icon: Palette,
    gradient: "linear-gradient(135deg, #db2777 0%, #f43f5e 100%)",
    glow: "rgba(219, 39, 119, 0.4)",
    tags: ["Fashion Design", "Visual Arts", "VFX & Media"],
    departmentMatch: ["media", "viscom", "arts", "performing", "fashion", "design"],
    programmeGroups: [
      {
        number: 1,
        title: "UNDERGRADUATE PROGRAMMES",
        items: [
          "B.Sc Visual Communication",
          "B.Sc Animation & VFX",
          "B.Sc Digital Media Production",
          "B.Sc Fashion Apparel Design",
          "B.Sc Costume Design & Fashion",
          "B.Sc Textile Science"
        ]
      },
      {
        number: 2,
        title: "POSTGRADUATE PROGRAMMES",
        items: [
          "M.Sc Visual Communication",
          "M.Sc Costume Design & Fashion",
          "M.Sc Fashion Technology"
        ]
      }
    ]
  },
  {
    id: "liberal-arts",
    name: "Liberal Arts & Science",
    programmes: "11 Programmes",
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
    glow: "rgba(234, 88, 12, 0.4)",
    tags: ["Humanities", "Literature"],
    departmentMatch: ["liberal", "arts", "science"],
    programmeGroups: [
      {
        number: 1,
        title: "B.SC PROGRAMMES",
        items: [
          "B.Sc Mathematics",
          "B.Sc Physics",
          "B.Sc Psychology"
        ]
      },
      {
        number: 2,
        title: "B.A PROGRAMMES",
        items: [
          "B.A English Literature"
        ]
      },
      {
        number: 3,
        title: "POSTGRADUATE PROGRAMMES",
        items: [
          "M.A English Literature",
          "M.A Public Administration",
          "M.Sc Mathematics",
          "M.Sc Applied Psychology",
          "M.Sc Clinical Psychology",
          "M.Sc Counselling Psychology",
          "Post Graduate Diploma in Counselling"
        ]
      }
    ]
  },
  {
    id: "applied-bio",
    name: "Applied Biosciences / Food / Agritech",
    programmes: "5 Programmes",
    icon: Leaf,
    gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    glow: "rgba(168, 185, 129, 0.4)",
    tags: ["Biotechnology", "Food Tech"],
    departmentMatch: ["bio", "food", "agritech"],
    programmeGroups: [
      {
        number: 1,
        title: "B.TECH PROGRAMMES",
        items: [
          "B.Tech BioTechnology"
        ]
      },
      {
        number: 2,
        title: "B.SC PROGRAMMES",
        items: [
          "B.Sc Biotechnology",
          "B.Sc Microbiology"
        ]
      },
      {
        number: 3,
        title: "POSTGRADUATE PROGRAMMES",
        items: [
          "M.Sc Microbiology",
          "M.Sc BioTechnology"
        ]
      }
    ]
  },
  {
    id: "sustainability",
    name: "Sustainability & Climate Studies",
    programmes: "2 Programmes",
    icon: Sprout,
    gradient: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
    glow: "rgba(6, 182, 212, 0.4)",
    tags: ["Environment", "Climate Policy"],
    departmentMatch: ["sustainability", "climate", "environment"],
    programmeGroups: [
      {
        number: 1,
        title: "B.SC PROGRAMMES",
        items: [
          "B.Sc Environmental Science & Sustainability"
        ]
      },
      {
        number: 2,
        title: "POSTGRADUATE PROGRAMMES",
        items: [
          "M.Sc Climate Change & Policy"
        ]
      }
    ]
  },
];

const DEFAULT_VISCOM_FACULTY: StaffFacultyItem[] = defaultStaffFaculty;

export interface MediaStaffItem {
  id: string;
  name: string;
  designation: string;
  employeeId: string;
  department: string;
  school: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  reportingOfficerName: string;
  assignedSubjects: string[];
  assignedSyllabus: string[];
  status: string;
  avatarBg: string;
}

const INITIAL_MEDIA_STAFF: MediaStaffItem[] = [
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
    reportingOfficerName: "Dr. T.J RAJU (HOD)",
    assignedSubjects: ["Augmented Reality & VFX (VIS-301)"],
    assignedSyllabus: ["Unit 1: Tracking Fundamentals & Feature Solvers","Unit 2: Planar & Rotoscopy Spline Workflows","Unit 3: Chroma Green/Blue Screen Keying","Unit 4: Matchmoving & 3D Camera Tracking","Unit 5: Vuforia AR SDK & Unity Pipeline"],
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
    reportingOfficerName: "Dr. T.J RAJU (HOD)",
    assignedSubjects: ["Digital Cinematography & Lighting (VIS-302)"],
    assignedSyllabus: ["Unit 1: Sensor & Camera Tech","Unit 2: Three-Point Lighting Design","Unit 3: Color Grading & Anamorphic Optics","Unit 4: Production Visual Storyboarding","Unit 5: Post Master Export Formats"],
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
    reportingOfficerName: "Dr. T.J RAJU (HOD)",
    assignedSubjects: ["3D Character Modeling & Rigging (VIS-303)"],
    assignedSyllabus: ["Unit 1: Polygon & NURBS Modeling","Unit 2: UV Unwrapping & Texturing","Unit 3: Skeletal Rigging Systems","Unit 4: Animation Curves & Weight Painting","Unit 5: Character Export Pipeline"],
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
    reportingOfficerName: "Dr. T.J RAJU (HOD)",
    assignedSubjects: ["Media & Communication Studies (VIS-304)"],
    assignedSyllabus: ["Unit 1: Media Theory & History","Unit 2: Print & Broadcast Journalism","Unit 3: Digital Media Landscape","Unit 4: Communication Ethics","Unit 5: Research Methods in Media"],
    status: "Active",
    avatarBg: "linear-gradient(135deg, #db2777, #f472b6)",
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
    reportingOfficerName: "Dr. T.J RAJU (HOD)",
    assignedSubjects: ["Photography & Visual Storytelling (VIS-305)"],
    assignedSyllabus: ["Unit 1: Composition & Lighting","Unit 2: Studio Photography","Unit 3: Photo Editing Workflow","Unit 4: Documentary Photography","Unit 5: Photo Essay & Exhibition"],
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
    reportingOfficerName: "Dr. T.J RAJU (HOD)",
    assignedSubjects: ["Multimedia Production & Web Design (VIS-306)"],
    assignedSyllabus: ["Unit 1: HTML/CSS Foundations","Unit 2: UI/UX Design Principles","Unit 3: Motion Graphics","Unit 4: Interactive Media","Unit 5: Portfolio Development"],
    status: "Active",
    avatarBg: "linear-gradient(135deg, #7c3aed, #a855f7)",
  },
];

export default function DepartmentManagementPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("school");
  const [searchQuery, setSearchQuery] = useState("");
  const [designationFilter, setDesignationFilter] = useState("All");

  // Auth User State
  const [currentUser, setCurrentUser] = useState<AuthUser>(() =>
    authStore.getCurrentUser()
  );

  // Staff profile edit permissions (Strictly hidden for HOD; visible for Staff, COE & Dean)
  const canEditStaff = currentUser.role !== "HOD";
  const canDeleteStaff = currentUser.role === "COE";

  useEffect(() => {
    const handleAuth = () => {
      setCurrentUser(authStore.getCurrentUser());
    };
    handleAuth();
    window.addEventListener("exam-cell-auth-update", handleAuth);
    return () => window.removeEventListener("exam-cell-auth-update", handleAuth);
  }, []);

  const rawMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, route: "/dashboard" },
    { id: "school", label: "School", icon: School, route: "/subjects" },
    { id: "staff-work-status", label: "Staff Work Status", icon: Briefcase, route: "/staff-work-status" },
    { id: "academic-vault", label: "Academic Vault", icon: Archive, route: "/academic-vault" },
    { id: "verify-questions", label: "Verify Questions", icon: Search, route: "/verify-questions" },
    { id: "approval", label: "Approval", icon: CheckSquare, route: "/approval" },
    { id: "reports", label: "Reports", icon: BarChart2, route: "/reports" },
    { id: "notifications", label: "Notifications", icon: Bell, route: "/notifications" },
    { id: "manual-questions", label: "Manual Questions", icon: Edit3, badge: "New", route: "/manual-questions" },
    { id: "print-paper", label: "Print Question Paper", icon: Printer, badge: "Print", route: "/print-paper" },
    { id: "settings", label: "Settings", icon: Settings, hasArrow: true, route: "/settings" },
  ];

  const menuItems = rawMenuItems.filter((item) =>
    hasPermission(currentUser.role, item.route, currentUser.isSubjectFaculty)
  );

  // School State
  const [departments, setDepartments] = useState<DepartmentItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("exam_cell_schools_clean_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_SCHOOLS;
  });

  const [activeDept, setActiveDept] = useState("Viscom");
  const [isDeptExpanded, setIsDeptExpanded] = useState(true);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [newDeptQuickName, setNewDeptQuickName] = useState("");
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [showStaffProfiles, setShowStaffProfiles] = useState(false);
  const [mediaStaffList, setMediaStaffList] = useState<MediaStaffItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("rathinam_media_staff_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_MEDIA_STAFF;
  });
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<MediaStaffItem | null>(null);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileEditDraft, setProfileEditDraft] = useState<Partial<MediaStaffItem>>({});

  const isCurrentUserProfile = (staff: { name: string; email?: string; id?: string }) => {
    if (!currentUser) return false;
    const cleanCurrent = (currentUser.name || "").toLowerCase().replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s*/i, "").trim();
    const cleanStaff = (staff.name || "").toLowerCase().replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s*/i, "").trim();
    if (cleanCurrent && cleanStaff && (cleanCurrent === cleanStaff || cleanCurrent.includes(cleanStaff) || cleanStaff.includes(cleanCurrent))) {
      return true;
    }
    if (currentUser.email && staff.email && currentUser.email.toLowerCase().trim() === staff.email.toLowerCase().trim()) {
      return true;
    }
    if (currentUser.id && staff.id && currentUser.id === staff.id) {
      return true;
    }
    return false;
  };

  const handleSaveProfile = () => {
    if (!selectedStaffProfile) return;
    const updated: MediaStaffItem = {
      ...selectedStaffProfile,
      ...profileEditDraft as any,
    };
    setMediaStaffList((prev) => {
      const next = prev.map((s) => (s.id === updated.id ? updated : s));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("rathinam_media_staff_v2", JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
    setSelectedStaffProfile(updated);
    setProfileEditMode(false);
  };

  // Staff Faculty List state
  const [staffList, setStaffList] = useState<StaffFacultyItem[]>([]);

  const formatStaffEmail = (name: string, dept: string = "viscom") => {
    const cleanFirst = name
      .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s*/gi, "")
      .trim()
      .split(" ")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const cleanDept = dept.toLowerCase().includes("viscom") || dept.toLowerCase().includes("visual")
      ? "viscom"
      : dept.toLowerCase().includes("fashion")
      ? "fashion"
      : "viscom";

    return `${cleanFirst || "faculty"}.${cleanDept}@rathinam.in`;
  };

  useEffect(() => {
    const loadStaff = () => {
      const SIX_FACULTY_VERSION = "exam_cell_staff_6_viscom_v9_no_dummy";
      if (typeof window !== "undefined" && !localStorage.getItem(SIX_FACULTY_VERSION)) {
        examStore.setStaffFacultyList(defaultStaffFaculty, false);
        setStaffList(defaultStaffFaculty);
        localStorage.setItem(SIX_FACULTY_VERSION, "true");
        return;
      }

      const stored = examStore.getAllStaffFaculty();
      if (stored && stored.length > 0) {
        setStaffList(stored);
      } else {
        setStaffList(defaultStaffFaculty);
      }
    };
    loadStaff();
    window.addEventListener("exam-cell-store-update", loadStaff);
    return () => window.removeEventListener("exam-cell-store-update", loadStaff);
  }, []);

  // Modals for Staff Profile
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffFacultyItem | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffFacultyItem | null>(null);

  // Form State for Staff Profile
  const [staffFormName, setStaffFormName] = useState("");
  const [staffFormDesignation, setStaffFormDesignation] = useState("Assistant Professor");
  const [staffFormEmpId, setStaffFormEmpId] = useState("");
  const [staffFormDepartment, setStaffFormDepartment] = useState("Department of Visual Communication");
  const [staffFormSchool, setStaffFormSchool] = useState("School of Fashion Design, Media and Performing Arts");
  const [staffFormEmail, setStaffFormEmail] = useState("");
  const [staffFormPhone, setStaffFormPhone] = useState("");
  const [staffFormQualification, setStaffFormQualification] = useState("");
  const [staffFormExperience, setStaffFormExperience] = useState("");
  const [staffFormReportingOfficer, setStaffFormReportingOfficer] = useState("Head of Department");
  const [staffFormSubjects, setStaffFormSubjects] = useState("");
  const [staffFormSyllabusCount, setStaffFormSyllabusCount] = useState<number | "">("");
  const [staffFormSyllabusNames, setStaffFormSyllabusNames] = useState("");
  const [staffFormStatus, setStaffFormStatus] = useState<"Active" | "On Leave" | "On Duty">("Active");

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    isOpen: boolean;
    type?: "success" | "danger";
  }>({
    message: "",
    isOpen: false,
  });

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, isOpen: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isOpen: false })), 3000);
  };

  const saveDepartments = (updated: DepartmentItem[]) => {
    setDepartments(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("exam_cell_schools_clean_v1", JSON.stringify(updated));
    }
  };

  // Quick Add school from sidebar
  const handleQuickAddDepartment = () => {
    const trimmed = newDeptQuickName.trim();
    if (!trimmed) return;
    if (departments.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`School "${trimmed}" already exists!`, "danger");
      return;
    }
    const newDept: DepartmentItem = {
      id: trimmed.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: trimmed,
      fullName: trimmed.startsWith("School") ? trimmed : `School of ${trimmed}`,
      code: `SCH-${trimmed.toUpperCase().slice(0, 4)}`,
      school: trimmed,
    };
    const updated = [...departments, newDept];
    saveDepartments(updated);
    setActiveDept(trimmed);
    setNewDeptQuickName("");
    setIsAddDeptOpen(false);
    showToast(`School "${trimmed}" added! Now add staff profiles for it.`);
  };

  const handleOpenAddStaffModal = () => {
    setEditingStaff(null);
    setStaffFormName("");
    setStaffFormDesignation("Assistant Professor");
    setStaffFormEmpId("");
    setStaffFormDepartment(activeDept === "Viscom" ? "Department of Visual Communication" : activeDept);
    setStaffFormSchool("School of Fashion Design, Media and Performing Arts");
    setStaffFormEmail("");
    setStaffFormPhone("");
    setStaffFormQualification("");
    setStaffFormExperience("");
    setStaffFormReportingOfficer("Head of Department");
    setStaffFormSubjects("");
    setStaffFormSyllabusCount("");
    setStaffFormSyllabusNames("");
    setStaffFormStatus("Active");
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaffModal = (staff: StaffFacultyItem) => {
    if (!canEditStaff) return;
    setEditingStaff(staff);
    setStaffFormName(staff.name || "");
    setStaffFormDesignation(staff.designation || "Assistant Professor");
    setStaffFormEmpId(staff.employeeId || "");
    setStaffFormDepartment(staff.department || "Department of Visual Communication");
    setStaffFormSchool(staff.school || "School of Fashion Design, Media and Performing Arts");
    setStaffFormEmail(staff.email || "");
    setStaffFormPhone(staff.phone || "");
    setStaffFormQualification(staff.qualification || "");
    setStaffFormExperience(staff.experience || "");
    setStaffFormReportingOfficer(staff.reportingOfficerName || "Head of Department");
    setStaffFormSubjects(staff.assignedSubjects?.join(", ") || "");
    setStaffFormSyllabusCount(staff.syllabusCount || staff.assignedSyllabus?.length || "");
    setStaffFormSyllabusNames(
      (staff.assignedSyllabus && staff.assignedSyllabus.length > 0
        ? staff.assignedSyllabus
        : staff.assignedSubjects
      )?.join(", ") || ""
    );
    setStaffFormStatus(staff.status || "Active");
    setIsStaffModalOpen(true);
  };

  const handleSaveStaffProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = staffFormName.trim();
    if (!trimmedName) {
      showToast("Please enter the staff member name.", "danger");
      return;
    }

    const assignedSubjects = staffFormSubjects
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const assignedSyllabus = staffFormSyllabusNames
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const syllabusCount = (typeof staffFormSyllabusCount === "number" && staffFormSyllabusCount > 0)
      ? staffFormSyllabusCount
      : (assignedSyllabus.length > 0 ? assignedSyllabus.length : 1);

    const gradients = [
      "linear-gradient(135deg, #4f46e5, #7c3aed)",
      "linear-gradient(135deg, #059669, #10b981)",
      "linear-gradient(135deg, #ea580c, #f97316)",
      "linear-gradient(135deg, #0284c7, #38bdf8)",
      "linear-gradient(135deg, #db2777, #f472b6)",
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const staffData: StaffFacultyItem = {
      id: editingStaff ? editingStaff.id : `fac-${Date.now()}`,
      name: trimmedName,
      designation: staffFormDesignation,
      employeeId: staffFormEmpId.trim() || editingStaff?.employeeId || "",
      department: staffFormDepartment.trim() || editingStaff?.department || (activeDept === "Viscom" ? "Department of Visual Communication" : activeDept),
      school: staffFormSchool.trim() || editingStaff?.school || "Rathinam Global University",
      email: staffFormEmail.trim() || (editingStaff?.email || formatStaffEmail(trimmedName, activeDept)),
      phone: staffFormPhone.trim() || (editingStaff?.phone || ""),
      qualification: staffFormQualification.trim() || (editingStaff?.qualification || ""),
      experience: staffFormExperience.trim() || (editingStaff?.experience || ""),
      reportingTo: editingStaff?.reportingTo || "HOD",
      reportingOfficerName: staffFormReportingOfficer.trim() || editingStaff?.reportingOfficerName || "Head of Department (HOD)",
      assignedSubjects: assignedSubjects.length > 0 ? assignedSubjects : (editingStaff?.assignedSubjects || []),
      syllabusCount: syllabusCount,
      assignedSyllabus: assignedSyllabus.length > 0 ? assignedSyllabus : (editingStaff?.assignedSyllabus || []),
      questionsContributed: editingStaff?.questionsContributed || 0,
      pendingReviews: editingStaff?.pendingReviews ?? 0,
      status: staffFormStatus,
      avatarBg: editingStaff?.avatarBg || randomGradient,
    };

    examStore.saveStaffFaculty(staffData);

    setStaffList((prev) => {
      if (editingStaff) {
        return prev.map((s) => (s.id === editingStaff.id ? { ...s, ...staffData } : s));
      }
      return [staffData, ...prev];
    });

    // Sync auth user if editing own profile
    if (
      currentUser.role === "STAFF" ||
      (editingStaff && (editingStaff.id === currentUser.id || editingStaff.email.toLowerCase() === currentUser.email?.toLowerCase()))
    ) {
      const updatedUser: AuthUser = {
        ...currentUser,
        name: trimmedName,
        email: staffData.email,
        roleTitle: staffFormDesignation,
        department: staffData.department,
      };
      authStore.setCurrentUser(updatedUser);
      setCurrentUser(updatedUser);
    }

    setIsStaffModalOpen(false);
    showToast(editingStaff ? `Staff profile "${trimmedName}" updated successfully!` : `Staff profile "${trimmedName}" added to ${activeDept}!`);
  };

  const handleConfirmDeleteStaff = () => {
    if (!staffToDelete) return;
    examStore.deleteStaffFaculty(staffToDelete.id);
    setStaffList((prev) => prev.filter((s) => s.id !== staffToDelete.id));
    showToast(`Staff profile "${staffToDelete.name}" removed successfully.`, "danger");
    setStaffToDelete(null);
  }; // Filter staff by activeDept, search query, and user role
  const departmentStaff = React.useMemo(() => {
    const currentDept = activeDept.toLowerCase().trim();
    // School of Media encompasses Viscom, Visual Arts, Media, Fashion, and Performing Arts
    const isMediaSchoolOrDept =
      activeDept === "Viscom" ||
      currentDept.includes("viscom") ||
      currentDept.includes("visual") ||
      currentDept.includes("media") ||
      currentDept.includes("performing") ||
      currentDept.includes("fashion") ||
      currentDept.includes("arts") ||
      expandedSchoolId === "media-performing" ||
      (activeDept === "All" && !expandedSchoolId);

    // 1. If logged in as STAFF:
    if (currentUser.role === "STAFF") {
      // Strictly ONLY display faculty profile in School of Media / Viscom!
      // In all other schools (Quantum Science, Business, Health, Liberal Arts, etc.), REMOVE it!
      if (!isMediaSchoolOrDept) {
        return [];
      }

      const userEmail = (currentUser.email || "").toLowerCase().trim();
      const cleanUserName = (currentUser.name || "")
        .toLowerCase()
        .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s*/gi, "")
        .trim();

      const staffTokens = ["gayathiri", "gayathri", "vignesh", "vishal", "athreya", "saravanan", "kailash"];
      const userMatchedToken = staffTokens.find((tok) => userEmail.includes(tok) || cleanUserName.includes(tok));

      const matched = staffList.filter((staff) => {
        const staffEmail = (staff.email || "").toLowerCase().trim();
        const cleanStaffName = (staff.name || "")
          .toLowerCase()
          .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s*/gi, "")
          .trim();

        const emailMatches =
          staffEmail === userEmail ||
          (userEmail && staffEmail && (userEmail.startsWith(staffEmail.split("@")[0]) || staffEmail.startsWith(userEmail.split("@")[0])));

        const nameMatches =
          cleanStaffName === cleanUserName ||
          (cleanUserName && cleanStaffName && (cleanStaffName.includes(cleanUserName) || cleanUserName.includes(cleanStaffName))) ||
          (Boolean(userMatchedToken) && (staffEmail.includes(userMatchedToken!) || cleanStaffName.includes(userMatchedToken!)));

        return emailMatches || nameMatches;
      });

      if (matched.length > 0) {
        return [matched[0]]; // Strictly only the single matching profile
      }

      // If user profile not found in current seed, synthesize their profile directly
      return [
        {
          id: currentUser.id || `fac-${userEmail.replace(/[^a-z0-9]/g, "-")}`,
          name: currentUser.name || "Faculty Member",
          designation: currentUser.roleTitle || "Assistant Professor",
          employeeId: "",
          department: currentUser.department || activeDept || "Department of Visual Communication",
          school: "School of Fashion Design, Media and Performing Arts",
          email: currentUser.email || "faculty@rathinam.in",
          phone: "",
          qualification: "",
          experience: "",
          reportingTo: "HOD" as const,
          reportingOfficerName: "Head of Department (HOD)",
          assignedSubjects: [],
          syllabusCount: 0,
          assignedSyllabus: [],
          questionsContributed: 0,
          pendingReviews: 0,
          status: "Active" as const,
          avatarBg: currentUser.avatarBg || "linear-gradient(135deg, #db2777, #f472b6)",
        },
      ];
    }

    // 2. For Admin / Leadership roles (COE, HOD, DEAN): list department staff
    return staffList.filter((staff) => {
      const sDept = (staff.department || "").toLowerCase().trim();
      const sSchool = (staff.school || "").toLowerCase().trim();

      // If viewing another school (not media/performing), do not include media faculty
      const isMediaStaff =
        sDept.includes("viscom") ||
        sDept.includes("visual") ||
        sDept.includes("communication") ||
        sDept.includes("media") ||
        sDept.includes("design") ||
        sSchool.includes("media") ||
        sSchool.includes("fashion") ||
        sSchool.includes("performing");

      if (!isMediaSchoolOrDept && isMediaStaff) {
        return false;
      }

      const currentSchoolObj = RATHINAM_SCHOOLS.find(
        (s) => s.name.toLowerCase() === currentDept || s.id.toLowerCase() === currentDept
      );

      const isViscomGroup =
        (currentDept.includes("viscom") || currentDept.includes("visual") || currentDept.includes("media") || currentDept.includes("performing") || currentDept.includes("fashion")) &&
        (sDept.includes("viscom") || sDept.includes("visual") || sDept.includes("communication") || sDept.includes("media") || sDept.includes("design"));

      const matchesDept =
        (activeDept === "All" && !expandedSchoolId) ||
        sDept === currentDept ||
        sDept.includes(currentDept) ||
        currentDept.includes(sDept) ||
        Boolean(currentSchoolObj && currentSchoolObj.departmentMatch.some((m) => sDept.includes(m) || sSchool.includes(m))) ||
        Boolean(sSchool && (sSchool.includes(currentDept) || currentDept.includes(sSchool))) ||
        isViscomGroup;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        staff.name.toLowerCase().includes(q) ||
        (staff.designation || "").toLowerCase().includes(q) ||
        (staff.employeeId || "").toLowerCase().includes(q) ||
        (staff.email || "").toLowerCase().includes(q) ||
        ((staff.school || "").toLowerCase().includes(q)) ||
        ((staff.department || "").toLowerCase().includes(q)) ||
        ((staff.qualification || "").toLowerCase().includes(q)) ||
        ((staff.assignedSubjects || []).some((sub) => sub.toLowerCase().includes(q) || q.includes(sub.toLowerCase())));

      const matchesDesignation =
        designationFilter === "All" || (staff.designation || "").toLowerCase().includes(designationFilter.toLowerCase());

      return matchesDept && matchesSearch && matchesDesignation;
    });
  }, [staffList, currentUser, activeDept, expandedSchoolId, searchQuery, designationFilter]);

  const getInitials = (name: string) => {
    const parts = name.replace(/Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.|Ph\.D\./gi, "").trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const filteredSchools = RATHINAM_SCHOOLS.filter((school) => {
    const q = schoolSearchQuery.toLowerCase();
    return (
      school.name.toLowerCase().includes(q) ||
      school.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <RoleGuard route="/subjects">
      <div
        style={{
          display: "flex",
          height: "100vh",
          maxHeight: "100vh",
          background: "#f4f6fb",
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: "#0f172a",
          width: "100%",
          maxWidth: "100vw",
          overflow: "hidden",
        }}
      >
        {/* ================================= SIDEBAR ================================= */}
        <aside
          style={{
            width: "260px",
            background: "linear-gradient(180deg, #090e1f 0%, #060914 100%)",
            color: "#94a3b8",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            borderRight: "1px solid rgba(255, 255, 255, 0.06)",
            padding: "20px 14px",
            justifyContent: "space-between",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <div>
            {/* RGU Logo */}
            <div style={{ padding: "6px 10px 24px 10px", position: "relative" }}>
              <img
                src="/images/rgu-logo.png"
                alt="Rathinam Global (Deemed to be University)"
                style={{
                  maxHeight: "38px",
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 12px rgba(99, 102, 241, 0.35))",
                  transition: "filter 0.3s ease",
                }}
              />
            </div>

            {/* Navigation Items */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {/* Standard Menu Items */}
              {menuItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeMenu === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveMenu(item.id);
                      if (item.route) router.push(item.route);
                    }}
                    className={`sidebar-btn-3d ${
                      isActive ? "sidebar-btn-active" : "sidebar-btn-inactive"
                    }`}
                  >
                    <span
                      className="nav-icon-3d"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <IconComp size={18} />
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span className="badge-neon-3d">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Need Help Box */}
          <div className="support-card-3d">
            <div className="shield-icon-3d">
              <Shield size={20} />
            </div>
            <strong style={{ display: "block", color: "#ffffff", fontSize: "13.5px", marginBottom: "4px" }}>
              Need Help?
            </strong>
            <p style={{ fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.4, margin: "0 0 14px 0" }}>
              Our support team is ready to assist you.
            </p>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-exam-support-modal"));
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "9px 12px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <span>Contact Support</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </aside>

        {/* ================================= MAIN CONTENT ================================= */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* Top Header */}
          <PortalHeader activeRoute="subjects" />

          {/* Scrollable Main Content */}
          <main
            style={{
              flex: 1,
              padding: "28px 32px",
              overflowY: "auto",
              overflowX: "hidden",
              minWidth: 0,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* University Crest Badge - Centered with RGU Logo */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              {/* University Crest Card */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "10px 22px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "14px",
                  boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "6px 12px",
                  }}
                >
                  <img
                    src="/images/rgu-logo.png"
                    alt="RGU Logo"
                    style={{
                      height: "34px",
                      width: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
                <div style={{ width: "1px", height: "30px", background: "#e2e8f0" }} />
                <div style={{ flexShrink: 0 }}>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "13.5px",
                      color: "#0f172a",
                      fontWeight: 700,
                      letterSpacing: "-0.2px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Rathinam Global (Deemed to be University)
                  </strong>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#10b981",
                        display: "inline-block",
                      }}
                    />
                    Coimbatore, Tamil Nadu
                  </span>
                </div>
              </div>
            </div>

            {/* ================= RATHINAM UNIVERSITY SCHOOLS SHOWCASE (MATCHING PHOTO) ================= */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "24px",
                border: "1px solid #e2e8f0",
                padding: "24px 28px",
                marginBottom: "26px",
                boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
              }}
            >
              {/* Showcase Header & Centered Pill Search Bar matching photo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        background: "rgba(99, 102, 241, 0.12)",
                        color: "#4f46e5",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: "20px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      University Schools
                    </span>
                    {activeDept !== "All" && activeDept !== "Viscom" && (
                      <button
                        type="button"
                        onClick={() => { setActiveDept("All"); setExpandedSchoolId(null); }}
                        style={{
                          background: "#f1f5f9",
                          border: "none",
                          borderRadius: "20px",
                          padding: "3px 10px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#64748b",
                          cursor: "pointer",
                        }}
                      >
                        Reset Filter ✕
                      </button>
                    )}
                  </div>
                  <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    Academic Schools & Programmes 🎓
                  </h2>
                </div>

                {/* Exact Pill Search Bar from photo */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "380px",
                  }}
                >
                  <Search
                    size={16}
                    color="#94a3b8"
                    style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    type="text"
                    value={schoolSearchQuery}
                    onChange={(e) => setSchoolSearchQuery(e.target.value)}
                    placeholder="Search programmes, schools..."
                    style={{
                      width: "100%",
                      padding: "10px 18px 10px 42px",
                      borderRadius: "30px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      fontSize: "13px",
                      color: "#0f172a",
                      outline: "none",
                      boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.03)",
                      transition: "all 0.2s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = "#6366f1";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(0, 0, 0, 0.03)";
                    }}
                  />
                </div>
              </div>

              {/* Schools Cards Grid matching the photo pattern */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "18px",
                }}
              >
                {filteredSchools.map((school) => {
                  const Icon = school.icon;
                  const isSelected =
                    expandedSchoolId === school.id ||
                    activeDept.toLowerCase() === school.name.toLowerCase() ||
                    (school.id === "media-performing" && (activeDept.toLowerCase() === "viscom" || activeDept.toLowerCase().includes("fashion") || activeDept.toLowerCase().includes("media") || activeDept.toLowerCase().includes("performing")));

                  return (
                    <div key={school.id} style={{ display: "flex", flexDirection: "column" }}>
                      <div
                        onClick={() => {
                          setExpandedSchoolId(school.id);
                          setActiveDept(school.name);
                        }}
                        style={{
                          background: school.gradient,
                          borderRadius: "22px",
                          padding: "20px 22px",
                          color: "#ffffff",
                          cursor: "pointer",
                          minHeight: "155px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          transition: "all 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
                          boxShadow: isSelected
                            ? `0 16px 36px -4px ${school.glow}, 0 0 0 3px #ffffff, 0 0 0 6px #4f46e5`
                            : `0 10px 24px -4px ${school.glow}`,
                          transform: isSelected ? "translateY(-4px) scale(1.02)" : "translateY(0)",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.boxShadow = `0 16px 32px -4px ${school.glow}`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = `0 10px 24px -4px ${school.glow}`;
                          }
                        }}
                      >
                        {/* Top row: Icon + Programmes Badge */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "11px",
                              background: "rgba(255, 255, 255, 0.22)",
                              backdropFilter: "blur(8px)",
                              border: "1px solid rgba(255, 255, 255, 0.35)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                            }}
                          >
                            <Icon size={19} />
                          </div>

                          <span
                            style={{
                              background: "rgba(255, 255, 255, 0.22)",
                              backdropFilter: "blur(6px)",
                              border: "1px solid rgba(255, 255, 255, 0.35)",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#ffffff",
                              letterSpacing: "0.2px",
                            }}
                          >
                            {school.programmes}
                          </span>
                        </div>

                        {/* Title */}
                        <div
                          style={{
                            fontSize: "16.5px",
                            fontWeight: 800,
                            color: "#ffffff",
                            lineHeight: 1.25,
                            marginTop: "16px",
                            marginBottom: "12px",
                            letterSpacing: "-0.2px",
                          }}
                        >
                          {school.name}
                        </div>

                        {/* View Programmes / View Staff Profiles button */}
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedSchoolId(school.id);
                              setActiveDept(school.name);
                            }}
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#ffffff",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "rgba(255, 255, 255, 0.2)",
                              padding: "6px 12px",
                              borderRadius: "10px",
                              backdropFilter: "blur(6px)",
                              border: "1px solid rgba(255, 255, 255, 0.35)",
                              width: "fit-content",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(255, 255, 255, 0.35)";
                              e.currentTarget.style.transform = "translateX(2px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                              e.currentTarget.style.transform = "translateX(0)";
                            }}
                          >
                            <BookOpen size={13} color="#ffffff" />
                            <span>View Programmes</span>
                          </div>
                          {school.id === "media-performing" && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowStaffProfiles((prev) => {
                                  const opening = !prev;
                                  if (opening) {
                                    setExpandedSchoolId(school.id);
                                    setActiveDept(school.name);
                                    setTimeout(() => {
                                      document.getElementById("staff-profiles-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }, 120);
                                  }
                                  return opening;
                                });
                              }}
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#ffffff",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: showStaffProfiles ? "rgba(0,0,0,0.28)" : "rgba(255, 255, 255, 0.2)",
                                padding: "6px 12px",
                                borderRadius: "10px",
                                backdropFilter: "blur(6px)",
                                border: "1px solid rgba(255, 255, 255, 0.35)",
                                width: "fit-content",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.35)";
                                e.currentTarget.style.transform = "translateX(2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = showStaffProfiles ? "rgba(0,0,0,0.28)" : "rgba(255, 255, 255, 0.2)";
                                e.currentTarget.style.transform = "translateX(0)";
                              }}
                            >
                              <Users size={13} color="#ffffff" />
                              <span>{showStaffProfiles ? "Hide Staff Profiles" : "View Staff Profiles"}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pill Tags under each card (exact photo match) */}
                      {school.tags && school.tags.length > 0 && (
                        <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap", paddingLeft: "4px" }}>
                          {school.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              style={{
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                padding: "3px 9px",
                                borderRadius: "14px",
                                fontSize: "10.5px",
                                fontWeight: 600,
                                color: "#64748b",
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>


                        {/* ================= Staff Profiles Section (School of Media Only) ================= */}
            {showStaffProfiles && (
              <div
                id="staff-profiles-section"
                style={{
                  width: "100%",
                  marginBottom: "32px",
                  scrollMarginTop: "24px",
                }}
              >
                {/* Staff Profiles Toolbar */}
                <div style={{ width: "100%", marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span
                          style={{
                            background: "rgba(219, 39, 119, 0.12)",
                            color: "#db2777",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: "20px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Faculty Directory
                        </span>
                        <span
                          style={{
                            background: "#fce7f3",
                            color: "#9d174d",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "10px",
                          }}
                        >
                          {mediaStaffList.length} Faculty Profiles
                        </span>
                        {currentUser && (
                          <span
                            style={{
                              background: "#e0e7ff",
                              color: "#4338ca",
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "2px 10px",
                              borderRadius: "10px",
                            }}
                          >
                            Logged in as: {currentUser.name}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        School of Fashion Design, Media and Performing Arts â€” Faculty Profiles
                      </h3>
                      <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#64748b" }}>
                        Click on any faculty card to view full profile details. Edit option is available for the logged-in user.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowStaffProfiles(false)}
                      className="faculty-toolbar-hide-btn"
                      title="Hide Faculty Profiles"
                    >
                      <EyeOff size={14} />
                      <span>Hide Profiles</span>
                    </button>
                  </div>
                </div>

                {/* Staff Profiles Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                    gap: "20px",
                    marginBottom: "36px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  {mediaStaffList.map((staff) => {
                    const initials = staff.name
                      .replace(/Dr\.|Prof\.|Mr\.|Mrs\.|Ms\./gi, "")
                      .trim()
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p: string) => p[0].toUpperCase())
                      .join("");
                    const isMyProfile = isCurrentUserProfile(staff);

                    return (
                      <div
                        key={staff.id}
                        onClick={() => {
                          setSelectedStaffProfile(staff);
                          setProfileEditMode(false);
                          setProfileEditDraft(staff);
                        }}
                        style={{
                          background: "#ffffff",
                          borderRadius: "20px",
                          border: isMyProfile ? "2px solid #6366f1" : "1.5px solid #f1f5f9",
                          padding: "24px",
                          boxShadow: isMyProfile
                            ? "0 8px 24px rgba(99, 102, 241, 0.18)"
                            : "0 4px 20px rgba(15, 23, 42, 0.06)",
                          transition: "all 0.22s ease",
                          position: "relative",
                          overflow: "hidden",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = isMyProfile
                            ? "0 14px 34px rgba(99, 102, 241, 0.24)"
                            : "0 12px 32px rgba(15, 23, 42, 0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = isMyProfile
                            ? "0 8px 24px rgba(99, 102, 241, 0.18)"
                            : "0 4px 20px rgba(15, 23, 42, 0.06)";
                        }}
                      >
                        {/* Top gradient accent */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background: staff.avatarBg,
                            borderRadius: "20px 20px 0 0",
                          }}
                        />

                        {/* Top Content */}
                        <div>
                          {/* Header row */}
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
                            <div
                              style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "16px",
                                background: staff.avatarBg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ffffff",
                                fontWeight: 800,
                                fontSize: "18px",
                                flexShrink: 0,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              }}
                            >
                              {initials}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "15.5px", fontWeight: 800, color: "#0f172a" }}>
                                  {staff.name}
                                </span>
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    background: "#dcfce7",
                                    color: "#16a34a",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    padding: "2px 7px",
                                    borderRadius: "8px",
                                  }}
                                >
                                  <CheckCircle2 size={9} /> Verified
                                </span>
                                {isMyProfile && (
                                  <span
                                    style={{
                                      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                      color: "#ffffff",
                                      fontSize: "10px",
                                      fontWeight: 800,
                                      padding: "2px 8px",
                                      borderRadius: "8px",
                                      boxShadow: "0 2px 6px rgba(79, 70, 229, 0.3)",
                                    }}
                                  >
                                    âœ¨ You (Logged In)
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600, marginTop: "2px" }}>
                                {staff.designation}
                              </div>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                {staff.department}
                              </div>
                            </div>
                            <span
                              style={{
                                background: "#dcfce7",
                                color: "#16a34a",
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "4px 10px",
                                borderRadius: "20px",
                                border: "1px solid #bbf7d0",
                                flexShrink: 0,
                              }}
                            >
                              â— Active
                            </span>
                          </div>

                          <div style={{ height: "1px", background: "#f1f5f9", marginBottom: "14px" }} />

                          {/* Academic & Contact Details */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                            <div>
                              <div
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  color: "#94a3b8",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  marginBottom: "8px",
                                }}
                              >
                                Academic & Contact
                              </div>
                              <div style={{ fontSize: "12px", color: "#334155", marginBottom: "5px" }}>
                                ðŸŽ“ {staff.qualification}
                              </div>
                              <div style={{ fontSize: "12px", color: "#6366f1", marginBottom: "5px" }}>
                                âœ‰ {staff.email}
                              </div>
                              <div style={{ fontSize: "12px", color: "#334155", marginBottom: "5px" }}>
                                ðŸ“ž {staff.phone}
                              </div>
                              <div style={{ fontSize: "12px", color: "#334155", marginBottom: "5px" }}>
                                ðŸ« {staff.school}
                              </div>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>
                                Reporting: <span style={{ fontWeight: 600 }}>{staff.reportingOfficerName}</span>
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  color: "#94a3b8",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  marginBottom: "8px",
                                }}
                              >
                                Syllabi & Subjects
                              </div>
                              {staff.assignedSubjects.map((sub, i) => (
                                <div
                                  key={i}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    background: "rgba(99,102,241,0.08)",
                                    color: "#4f46e5",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    padding: "4px 10px",
                                    borderRadius: "8px",
                                    marginBottom: "6px",
                                    marginRight: "4px",
                                  }}
                                >
                                  ðŸ”¬ {sub}
                                </div>
                              ))}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                                {staff.assignedSyllabus.slice(0, 3).map((unit, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      background: "#f1f5f9",
                                      color: "#475569",
                                      fontSize: "10px",
                                      padding: "2px 7px",
                                      borderRadius: "6px",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {unit}
                                  </span>
                                ))}
                                {staff.assignedSyllabus.length > 3 && (
                                  <span
                                    style={{
                                      background: "#f1f5f9",
                                      color: "#475569",
                                      fontSize: "10px",
                                      padding: "2px 7px",
                                      borderRadius: "6px",
                                      fontWeight: 500,
                                    }}
                                  >
                                    +{staff.assignedSyllabus.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Buttons (Bottom) */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            paddingTop: "12px",
                            borderTop: "1px solid #f1f5f9",
                            marginTop: "8px",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStaffProfile(staff);
                              setProfileEditMode(false);
                              setProfileEditDraft(staff);
                            }}
                            style={{
                              flex: 1,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              background: "#f8fafc",
                              color: "#334155",
                              border: "1.5px solid #e2e8f0",
                              borderRadius: "10px",
                              padding: "7px 12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.18s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#e2e8f0";
                              e.currentTarget.style.color = "#0f172a";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#f8fafc";
                              e.currentTarget.style.color = "#334155";
                            }}
                          >
                            <span>ðŸ‘ View Profile</span>
                          </button>

                          {/* EDIT OPTION: ONLY FOR LOGGED IN USER */}
                          {isMyProfile && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStaffProfile(staff);
                                setProfileEditMode(true);
                                setProfileEditDraft(staff);
                              }}
                              style={{
                                flex: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "10px",
                                padding: "7px 12px",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                                transition: "all 0.18s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.35)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(79, 70, 229, 0.25)";
                              }}
                            >
                              <span>âœ Edit Profile</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= Profile Detail Modal ================= */}
            {selectedStaffProfile && (
              <div
                onClick={() => {
                  setSelectedStaffProfile(null);
                  setProfileEditMode(false);
                }}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(15, 23, 42, 0.72)",
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 99999,
                  padding: "16px",
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "#ffffff",
                    borderRadius: "24px",
                    width: "100%",
                    maxWidth: "640px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 32px 80px rgba(15, 23, 42, 0.32)",
                    position: "relative",
                  }}
                >
                  {/* Top gradient banner */}
                  <div
                    style={{
                      background: selectedStaffProfile.avatarBg,
                      borderRadius: "24px 24px 0 0",
                      padding: "28px 28px 22px",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                          style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "20px",
                            background: "rgba(255,255,255,0.25)",
                            border: "2px solid rgba(255,255,255,0.45)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontWeight: 900,
                            fontSize: "26px",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                          }}
                        >
                          {selectedStaffProfile.name
                            .replace(/Dr\.|Prof\.|Mr\.|Mrs\.|Ms\./gi, "")
                            .trim()
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((p: string) => p[0].toUpperCase())
                            .join("")}
                        </div>
                        <div>
                          <div style={{ color: "#ffffff", fontWeight: 800, fontSize: "21px", display: "flex", alignItems: "center", gap: "8px" }}>
                            {selectedStaffProfile.name}
                            {isCurrentUserProfile(selectedStaffProfile) && (
                              <span
                                style={{
                                  background: "#ffffff",
                                  color: "#4f46e5",
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                }}
                              >
                                Logged In
                              </span>
                            )}
                          </div>
                          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: 600, marginTop: "2px" }}>
                            {selectedStaffProfile.designation}
                          </div>
                          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", marginTop: "2px" }}>
                            {selectedStaffProfile.department}
                          </div>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {/* EDIT BUTTON: ONLY SHOWN IF LOGGED IN USER MATCHES THIS PROFILE */}
                        {isCurrentUserProfile(selectedStaffProfile) && (
                          profileEditMode ? (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                type="button"
                                onClick={handleSaveProfile}
                                style={{
                                  background: "#16a34a",
                                  border: "none",
                                  borderRadius: "10px",
                                  color: "#ffffff",
                                  padding: "6px 14px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)",
                                }}
                              >
                                âœ“ Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={() => setProfileEditMode(false)}
                                style={{
                                  background: "rgba(255,255,255,0.2)",
                                  border: "1px solid rgba(255,255,255,0.35)",
                                  borderRadius: "10px",
                                  color: "#ffffff",
                                  padding: "6px 10px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setProfileEditDraft(selectedStaffProfile);
                                setProfileEditMode(true);
                              }}
                              style={{
                                background: "#ffffff",
                                color: "#4f46e5",
                                border: "none",
                                borderRadius: "10px",
                                padding: "6px 14px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              }}
                            >
                              <span>âœ Edit Profile</span>
                            </button>
                          )
                        )}

                        {/* If not current user, show Read-only badge */}
                        {!isCurrentUserProfile(selectedStaffProfile) && (
                          <span
                            style={{
                              background: "rgba(255, 255, 255, 0.18)",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              borderRadius: "10px",
                              color: "#ffffff",
                              padding: "4px 10px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            ðŸ”’ View Only
                          </span>
                        )}

                        {/* Close button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStaffProfile(null);
                            setProfileEditMode(false);
                          }}
                          style={{
                            background: "rgba(255,255,255,0.2)",
                            border: "1px solid rgba(255,255,255,0.35)",
                            borderRadius: "10px",
                            color: "#ffffff",
                            padding: "6px 12px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 700,
                          }}
                        >
                          âœ•
                        </button>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          border: "1px solid rgba(255,255,255,0.3)",
                          color: "#ffffff",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "20px",
                        }}
                      >
                        ðŸªª {selectedStaffProfile.employeeId}
                      </span>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#16a34a",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "20px",
                        }}
                      >
                        â— Active Faculty
                      </span>
                      <span
                        style={{
                          background: "rgba(255,255,255,0.15)",
                          color: "#ffffff",
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: "20px",
                        }}
                      >
                        ðŸ› {selectedStaffProfile.school}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: "26px 28px 30px" }}>
                    {profileEditMode && isCurrentUserProfile(selectedStaffProfile) ? (
                      /* ===== EDIT FORM MODE ===== */
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div
                          style={{
                            background: "#eff6ff",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            border: "1px solid #bfdbfe",
                            fontSize: "12.5px",
                            color: "#1e40af",
                            fontWeight: 600,
                          }}
                        >
                          âœ Editing your profile details. Changes will be saved immediately to your account.
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "5px" }}>
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profileEditDraft.name || ""}
                              onChange={(e) => setProfileEditDraft((prev) => ({ ...prev, name: e.target.value }))}
                              style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "5px" }}>
                              Designation
                            </label>
                            <input
                              type="text"
                              value={profileEditDraft.designation || ""}
                              onChange={(e) => setProfileEditDraft((prev) => ({ ...prev, designation: e.target.value }))}
                              style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "5px" }}>
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={profileEditDraft.email || ""}
                              onChange={(e) => setProfileEditDraft((prev) => ({ ...prev, email: e.target.value }))}
                              style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "5px" }}>
                              Phone Number
                            </label>
                            <input
                              type="text"
                              value={profileEditDraft.phone || ""}
                              onChange={(e) => setProfileEditDraft((prev) => ({ ...prev, phone: e.target.value }))}
                              style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "5px" }}>
                              Qualification
                            </label>
                            <input
                              type="text"
                              value={profileEditDraft.qualification || ""}
                              onChange={(e) => setProfileEditDraft((prev) => ({ ...prev, qualification: e.target.value }))}
                              style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "5px" }}>
                              Teaching Experience
                            </label>
                            <input
                              type="text"
                              value={profileEditDraft.experience || ""}
                              onChange={(e) => setProfileEditDraft((prev) => ({ ...prev, experience: e.target.value }))}
                              style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}
                            />
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
                          <button
                            type="button"
                            onClick={() => setProfileEditMode(false)}
                            style={{
                              padding: "9px 18px",
                              borderRadius: "10px",
                              background: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              color: "#475569",
                              fontSize: "13px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveProfile}
                            style={{
                              padding: "9px 22px",
                              borderRadius: "10px",
                              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                              border: "none",
                              color: "#ffffff",
                              fontSize: "13px",
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                            }}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ===== VIEW MODE ===== */
                      <>
                        {/* Contact & Academic */}
                        <div style={{ marginBottom: "20px" }}>
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              letterSpacing: "0.6px",
                              marginBottom: "12px",
                            }}
                          >
                            Contact & Academic Information
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px 14px", border: "1.5px solid #f1f5f9" }}>
                              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>
                                âœ‰ Email Address
                              </div>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: "#4f46e5", wordBreak: "break-word" }}>
                                {selectedStaffProfile.email}
                              </div>
                            </div>
                            <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px 14px", border: "1.5px solid #f1f5f9" }}>
                              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>
                                ðŸ“ž Contact Phone
                              </div>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                                {selectedStaffProfile.phone}
                              </div>
                            </div>
                            <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px 14px", border: "1.5px solid #f1f5f9" }}>
                              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>
                                ðŸŽ“ Qualification
                              </div>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                                {selectedStaffProfile.qualification}
                              </div>
                            </div>
                            <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px 14px", border: "1.5px solid #f1f5f9" }}>
                              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>
                                â± Experience
                              </div>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                                {selectedStaffProfile.experience}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reporting Officer */}
                        <div
                          style={{
                            background: "#fdf4ff",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            border: "1.5px solid #f3e8ff",
                            marginBottom: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              background: "#9333ea",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                              fontSize: "16px",
                            }}
                          >
                            ðŸ‘¤
                          </div>
                          <div>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "#9333ea", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Reporting Officer
                            </div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                              {selectedStaffProfile.reportingOfficerName}
                            </div>
                          </div>
                        </div>

                        {/* Assigned Subjects */}
                        <div style={{ marginBottom: "20px" }}>
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              letterSpacing: "0.6px",
                              marginBottom: "10px",
                            }}
                          >
                            Assigned Courses & Subjects
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {selectedStaffProfile.assignedSubjects.map((sub, i) => (
                              <span
                                key={i}
                                style={{
                                  background: "rgba(99,102,241,0.08)",
                                  color: "#4f46e5",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  padding: "6px 12px",
                                  borderRadius: "10px",
                                  border: "1px solid rgba(99,102,241,0.15)",
                                }}
                              >
                                ðŸ”¬ {sub}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Course Syllabus */}
                        <div>
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              letterSpacing: "0.6px",
                              marginBottom: "10px",
                            }}
                          >
                            Course Syllabus Units
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {selectedStaffProfile.assignedSyllabus.map((unit, i) => (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "10px",
                                  background: "#f8fafc",
                                  borderRadius: "10px",
                                  padding: "10px 12px",
                                  border: "1px solid #f1f5f9",
                                }}
                              >
                                <span
                                  style={{
                                    background: "#e0e7ff",
                                    color: "#4f46e5",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    padding: "2px 7px",
                                    borderRadius: "6px",
                                    flexShrink: 0,
                                  }}
                                >
                                  U{i + 1}
                                </span>
                                <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                                  {unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <PortalFooter />
          </main>
        </div>

        {/* ================= ADD / EDIT STAFF PROFILE MODAL ================= */}
        {isStaffModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "16px",
            }}
          >
            <div className="staff-modal-dialog">
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                      flexShrink: 0,
                    }}
                  >
                    <Users size={17} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
                      {editingStaff ? "Edit Staff Profile" : `Add Staff Profile (${activeDept})`}
                    </h2>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "1px 0 0 0" }}>
                      {editingStaff ? "Update faculty profile details" : `Register staff member for ${activeDept}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "7px",
                    width: "28px",
                    height: "28px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e2e8f0";
                    e.currentTarget.style.color = "#0f172a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f1f5f9";
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveStaffProfile} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Row 1: Full Name (1.3fr) + Employee ID (0.9fr) */}
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.9fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                      Staff Full Name *
                    </label>
                    <input
                      type="text"
                      className="staff-modal-input"
                      value={staffFormName}
                      onChange={(e) => setStaffFormName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                      Employee ID
                    </label>
                    <input
                      type="text"
                      className="staff-modal-input"
                      value={staffFormEmpId}
                      onChange={(e) => setStaffFormEmpId(e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 2: Designation (1.2fr) + Status (0.8fr) */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                      Designation *
                    </label>
                    <select
                      className="staff-modal-input"
                      value={staffFormDesignation}
                      onChange={(e) => setStaffFormDesignation(e.target.value)}
                    >
                      <option value="Head of Department & Professor">Head of Department (HOD)</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Lab Instructor">Lab Instructor</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                      Status
                    </label>
                    <select
                      className="staff-modal-input"
                      value={staffFormStatus}
                      onChange={(e) => setStaffFormStatus(e.target.value as any)}
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="On Duty">On Duty</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Email Address (1.2fr) + Phone Number (1fr) */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="staff-modal-input"
                      value={staffFormEmail}
                      onChange={(e) => setStaffFormEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="staff-modal-input"
                      value={staffFormPhone}
                      onChange={(e) => setStaffFormPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 4: Qualification (1.2fr) + Experience (1fr) */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                      Qualification
                    </label>
                    <input
                      type="text"
                      className="staff-modal-input"
                      value={staffFormQualification}
                      onChange={(e) => setStaffFormQualification(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                      Experience
                    </label>
                    <input
                      type="text"
                      className="staff-modal-input"
                      value={staffFormExperience}
                      onChange={(e) => setStaffFormExperience(e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 5: Number of Syllabi Handled (0.8fr) + Syllabus Names (1.4fr) */}
                <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.4fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                      Syllabi Handled *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      className="staff-modal-input"
                      value={staffFormSyllabusCount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStaffFormSyllabusCount(val === "" ? "" : parseInt(val) || "");
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                      Syllabus Name(s) (Comma separated) *
                    </label>
                    <input
                      type="text"
                      className="staff-modal-input"
                      value={staffFormSyllabusNames}
                      onChange={(e) => {
                        setStaffFormSyllabusNames(e.target.value);
                        const count = e.target.value.split(",").map((s) => s.trim()).filter(Boolean).length;
                        if (count > 0) setStaffFormSyllabusCount(count);
                      }}
                    />
                  </div>
                </div>

                {/* Row 6: Department (1.2fr) + Reporting Officer (1fr) */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                      Department
                    </label>
                    <input
                      type="text"
                      className="staff-modal-input"
                      value={staffFormDepartment}
                      onChange={(e) => setStaffFormDepartment(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                      Reporting Officer
                    </label>
                    <input
                      type="text"
                      className="staff-modal-input"
                      value={staffFormReportingOfficer}
                      onChange={(e) => setStaffFormReportingOfficer(e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 7: Specialization / Assigned Subjects */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                    Specialization / Subjects (Comma separated)
                  </label>
                  <input
                    type="text"
                    className="staff-modal-input"
                    value={staffFormSubjects}
                    onChange={(e) => setStaffFormSubjects(e.target.value)}
                  />
                </div>

                {/* Modal Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "4px",
                    paddingTop: "10px",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsStaffModalOpen(false)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "7px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f1f5f9";
                      e.currentTarget.style.color = "#0f172a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.color = "#475569";
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "7px 18px",
                      borderRadius: "7px",
                      border: "none",
                      background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(79, 70, 229, 0.35)",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.45)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(79, 70, 229, 0.35)";
                    }}
                  >
                    {editingStaff ? "Save Changes" : "Save Staff Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= DELETE CONFIRMATION MODAL ================= */}
        {staffToDelete && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                width: "100%",
                maxWidth: "440px",
                padding: "24px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#fef2f2",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                }}
              >
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
                Delete Staff Profile?
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5, margin: "0 0 20px 0" }}>
                Are you sure you want to delete <strong style={{ color: "#0f172a" }}>{staffToDelete.name}</strong> from {staffToDelete.department}?
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setStaffToDelete(null)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteStaff}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#ef4444",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= COMPACT DEPARTMENTS / PROGRAMMES MODAL POPUP ================= */}
        {expandedSchoolId && (() => {
          const selectedSchoolData = RATHINAM_SCHOOLS.find((s) => s.id === expandedSchoolId);
          if (!selectedSchoolData) return null;

          return (
            <div
              onClick={() => setExpandedSchoolId(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.6)",
                backdropFilter: "blur(5px)",
                zIndex: 99999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "18px",
                animation: "fadeIn 0.18s ease-out",
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "#ffffff",
                  borderRadius: "22px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                  width: "100%",
                  maxWidth: "520px",
                  maxHeight: "85vh",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Modal Header */}
                <div
                  style={{
                    padding: "18px 22px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#ffffff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: selectedSchoolData.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        boxShadow: `0 4px 14px ${selectedSchoolData.glow}`,
                        flexShrink: 0,
                      }}
                    >
                      <selectedSchoolData.icon size={20} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "16.5px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                          {selectedSchoolData.name}
                        </h3>
                      </div>
                      <span
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 600,
                          color: "#64748b",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          marginTop: "2px",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "#10b981",
                          }}
                        />
                        {selectedSchoolData.programmes} • Departments
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedSchoolId(null)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#f1f5f9",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e2e8f0";
                      e.currentTarget.style.color = "#0f172a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f1f5f9";
                      e.currentTarget.style.color = "#64748b";
                    }}
                    title="Close popup"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Modal Body - Compact Departments List */}
                <div
                  style={{
                    padding: "18px 22px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {selectedSchoolData.programmeGroups?.map((group) => (
                    <div
                      key={group.number}
                      style={{
                        background: "#f8fafc",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        padding: "14px 16px",
                      }}
                    >
                      {/* Category Title with Purple Badge */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        <span
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: "#8b5cf6",
                            color: "#ffffff",
                            fontSize: "11px",
                            fontWeight: 800,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {group.number}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 800,
                            color: "#1e293b",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {group.title}
                        </span>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "11px",
                            color: "#64748b",
                            fontWeight: 600,
                          }}
                        >
                          {group.items.length} {group.items.length === 1 ? "course" : "courses"}
                        </span>
                      </div>

                      {/* Programme Items */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {group.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            onClick={() => {
                              setSearchQuery(item);
                              showToast(`Filter applied for: ${item}`);
                              setExpandedSchoolId(null);
                              setTimeout(() => {
                                const el = document.getElementById("staff-profiles-section");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                              }, 100);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "6px 10px",
                              borderRadius: "8px",
                              background: "#ffffff",
                              border: "1px solid #edf2f7",
                              color: "#334155",
                              fontSize: "13px",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#7c3aed";
                              e.currentTarget.style.borderColor = "#c4b5fd";
                              e.currentTarget.style.background = "#faf5ff";
                              e.currentTarget.style.transform = "translateX(3px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#334155";
                              e.currentTarget.style.borderColor = "#edf2f7";
                              e.currentTarget.style.background = "#ffffff";
                              e.currentTarget.style.transform = "translateX(0)";
                            }}
                            title={`Click to filter: ${item}`}
                          >
                            <span style={{ color: "#8b5cf6", fontWeight: 700, fontSize: "13px" }}>→</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal Footer */}
                <div
                  style={{
                    padding: "12px 22px",
                    borderTop: "1px solid #f1f5f9",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                    💡 Click any department to filter records
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedSchoolId(null);
                        setTimeout(() => {
                          // scrolled
                        }, 100);
                      }}
                      style={{
                        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 14px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                      }}
                    >
                      <Users size={14} />
                      <span>View Staff Profiles</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedSchoolId(null)}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "6px 16px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "#334155",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Toast Notification */}
        <ToastNotification
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </RoleGuard>
  );
}
