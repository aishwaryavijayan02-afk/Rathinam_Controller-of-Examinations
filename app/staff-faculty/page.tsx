"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  FileText,
  CheckSquare,
  Upload,
  Search,
  CheckCircle2,
  BarChart2,
  Bell,
  Edit3,
  Printer,
  Settings,
  Shield,
  ArrowRight,
  Database,
  Hourglass,
  ChevronRight,
  Users,
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  Award,
  Filter,
  Plus,
  Eye,
  Trash2,
  School,
  Sparkles,
  Layers,
  Check,
  UserCheck,
  BookCheck,
  Building,
  Building2,
  Archive,
  AlertCircle,
  Clock,
  Send,
  AlertTriangle,
  FileCheck2,
  FileSpreadsheet,
  Lock,
  RefreshCw,
  X,
  ArrowRightCircle,
  HelpCircle,
} from "lucide-react";
import {
  examStore,
  StaffFacultyItem,
  INSTITUTIONAL_HIERARCHY,
  INSTITUTIONAL_SUBJECTS,
  InstitutionalSchool,
  InstitutionalDepartment,
  FacultyAllocationHierarchyResult,
} from "../lib/examStore";
import { authStore, AuthUser, hasPermission } from "../lib/auth";
import RoleGuard from "../components/RoleGuard";
import PortalHeader from "../components/PortalHeader";
import PortalFooter from "../components/PortalFooter";
import {
  ViewModal,
  FormModal,
  DeleteModal,
  ToastNotification,
  FormFieldDef,
} from "../components/CrudModal";

export default function StaffFacultyPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => authStore.getCurrentUser());
  const [facultyList, setFacultyList] = useState<StaffFacultyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [designationFilter, setDesignationFilter] = useState("All");
  const [schoolFilter, setSchoolFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [shakeRowId, setShakeRowId] = useState<string | null>(null);

  const triggerRowShake = (id: string) => {
    setShakeRowId(id);
    setTimeout(() => setShakeRowId(null), 650);
  };

  // Modals state
  const [selectedFaculty, setSelectedFaculty] = useState<StaffFacultyItem | null>(null);
  const [editTarget, setEditTarget] = useState<StaffFacultyItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffFacultyItem | null>(null);
  const [toast, setToast] = useState<{ message: string; isOpen: boolean; type?: "success" | "danger" }>({
    message: "",
    isOpen: false,
  });

  // COE Faculty Allocation Modal State
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [allocFacultyId, setAllocFacultyId] = useState<string>("");
  const [allocSchool, setAllocSchool] = useState<string>(INSTITUTIONAL_HIERARCHY[0].name);
  const [allocDean, setAllocDean] = useState<{ name: string; email: string; roleTitle?: string }>({
    name: INSTITUTIONAL_HIERARCHY[0].deanName,
    email: INSTITUTIONAL_HIERARCHY[0].deanEmail,
    roleTitle: INSTITUTIONAL_HIERARCHY[0].deanRoleTitle,
  });
  const [allocDept, setAllocDept] = useState<string>(INSTITUTIONAL_HIERARCHY[0].departments[0].name);
  const [allocHod, setAllocHod] = useState<{ name: string; email: string; roleTitle?: string }>({
    name: INSTITUTIONAL_HIERARCHY[0].departments[0].hodName,
    email: INSTITUTIONAL_HIERARCHY[0].departments[0].hodEmail,
    roleTitle: INSTITUTIONAL_HIERARCHY[0].departments[0].hodRoleTitle,
  });
  const [allocSubjects, setAllocSubjects] = useState<string>("");
  const [allocErrors, setAllocErrors] = useState<string[]>([]);

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, isOpen: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isOpen: false })), 3000);
  };

  useEffect(() => {
    const handleAuth = () => {
      setCurrentUser(authStore.getCurrentUser());
    };
    handleAuth();
    window.addEventListener("exam-cell-auth-update", handleAuth);
    return () => window.removeEventListener("exam-cell-auth-update", handleAuth);
  }, []);

  const loadFaculty = () => {
    const list = examStore.getStaffFaculty(currentUser.role);
    // The HOD directory is currently scoped to the Fashion Design, Media and
    // Performing Arts school. Do not show seeded profiles from other schools.
    if (currentUser.role === "HOD") {
      const fashionSchool = "school of fashion design, media and performing arts";
      setFacultyList(list.filter((fac) => (fac.school || "").toLowerCase().trim() === fashionSchool));
      return;
    }
    setFacultyList(list);
  };

  useEffect(() => {
    loadFaculty();
    window.addEventListener("exam-cell-store-update", loadFaculty);
    return () => window.removeEventListener("exam-cell-store-update", loadFaculty);
  }, [currentUser.role]);

  // Sidebar Menu
  const rawMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, route: "/dashboard" },
    { id: "school", label: "School", icon: School, route: "/subjects" },
    { id: "staff-work-status", label: "Staff Work Status", icon: Briefcase, route: "/staff-work-status" },
    { id: "academic-vault", label: "Academic Vault", icon: Archive, route: "/academic-vault" },
    { id: "verify-approval", label: "Verify & Approval", icon: CheckSquare, route: "/approval" },
    { id: "reports", label: "Reports", icon: BarChart2, route: "/reports" },
    { id: "notifications", label: "Notifications", icon: Bell, route: "/notifications" },
    { id: "manual-questions", label: "Manual Questions", icon: Edit3, badge: "New", route: "/manual-questions" },
    { id: "print-paper", label: "Print Question Paper", icon: Printer, badge: "Print", route: "/print-paper" },
    { id: "settings", label: "Settings", icon: Settings, hasArrow: true, route: "/settings" },
  ];

  const menuItems = rawMenuItems.filter((item) =>
    hasPermission(currentUser.role, item.route, currentUser.isSubjectFaculty)
  );

  // Real-time Work Status helper for Faculty Member
  const getFacultyWorkStatus = (fac: StaffFacultyItem) => {
    const allUnits = examStore.getUnits();
    const allQuestions = examStore.getQuestions();

    const subMatches = (subName: string) => {
      if (!subName) return false;
      return (fac.assignedSubjects || []).some((as) => {
        const cleanAs = as.toLowerCase().replace(/\s*\([a-z0-9-]+\)\s*/gi, "").trim();
        const cleanSub = subName.toLowerCase().replace(/\s*\([a-z0-9-]+\)\s*/gi, "").trim();
        return cleanAs === cleanSub || cleanAs.includes(cleanSub) || cleanSub.includes(cleanAs);
      });
    };

    const liveUnits = allUnits.filter((u) => subMatches(u.subject));
    const syllabusUnits = liveUnits.length;
    const expectedUnits = 5;
    const syllabusPct = Math.min(100, Math.round((syllabusUnits / expectedUnits) * 100));

    const liveQuestions = allQuestions.filter((q) => subMatches(q.subject));
    const questionsCount = liveQuestions.length;
    const expectedQuestions = 25;
    const questionsPct = Math.min(100, Math.round((questionsCount / expectedQuestions) * 100));

    const verifiedCount = liveQuestions.filter((q) => q.status === "Approved" || q.status === "Verified").length;

    // Syllabus Status configuration
    let syllabusStatus: {
      label: string;
      subtext: string;
      badgeBg: string;
      badgeColor: string;
      badgeBorder: string;
      progressColor: string;
      state: "Completed" | "In Progress" | "Pending";
    };

    if (syllabusUnits >= 5) {
      syllabusStatus = {
        label: "5/5 Units Completed",
        subtext: "Uploaded & Approved",
        badgeBg: "#ecfdf5",
        badgeColor: "#059669",
        badgeBorder: "1px solid #a7f3d0",
        progressColor: "linear-gradient(90deg, #10b981, #059669)",
        state: "Completed",
      };
    } else if (syllabusUnits > 0) {
      syllabusStatus = {
        label: `${syllabusUnits}/5 Units Uploaded`,
        subtext: "In Progress (Partial)",
        badgeBg: "#eff6ff",
        badgeColor: "#2563eb",
        badgeBorder: "1px solid #bfdbfe",
        progressColor: "linear-gradient(90deg, #3b82f6, #2563eb)",
        state: "In Progress",
      };
    } else {
      syllabusStatus = {
        label: "0/5 Units Uploaded",
        subtext: "Pending Submission",
        badgeBg: "#fff1f2",
        badgeColor: "#e11d48",
        badgeBorder: "1px solid #fecdd3",
        progressColor: "#f43f5e",
        state: "Pending",
      };
    }

    // Question Bank Status configuration
    let qbStatus: {
      label: string;
      subtext: string;
      badgeBg: string;
      badgeColor: string;
      badgeBorder: string;
      progressColor: string;
      state: "Completed" | "In Progress" | "Pending";
    };

    if (questionsCount >= 25 && (fac.pendingReviews === 0 || verifiedCount >= 20)) {
      qbStatus = {
        label: "25/25 Qs Uploaded",
        subtext: "Verified by HOD",
        badgeBg: "#ecfdf5",
        badgeColor: "#059669",
        badgeBorder: "1px solid #a7f3d0",
        progressColor: "linear-gradient(90deg, #10b981, #059669)",
        state: "Completed",
      };
    } else if (questionsCount >= 20) {
      qbStatus = {
        label: `${questionsCount}/25 Qs Uploaded`,
        subtext: `${fac.pendingReviews || 5} Questions in Review`,
        badgeBg: "#fefce8",
        badgeColor: "#ca8a04",
        badgeBorder: "1px solid #fef08a",
        progressColor: "linear-gradient(90deg, #eab308, #ca8a04)",
        state: "In Progress",
      };
    } else if (questionsCount > 0) {
      qbStatus = {
        label: `${questionsCount}/25 Qs Uploaded`,
        subtext: "Draft Submissions",
        badgeBg: "#eff6ff",
        badgeColor: "#2563eb",
        badgeBorder: "1px solid #bfdbfe",
        progressColor: "linear-gradient(90deg, #60a5fa, #3b82f6)",
        state: "In Progress",
      };
    } else {
      qbStatus = {
        label: "0/25 Qs Uploaded",
        subtext: "Pending Question Bank",
        badgeBg: "#fff1f2",
        badgeColor: "#e11d48",
        badgeBorder: "1px solid #fecdd3",
        progressColor: "#f43f5e",
        state: "Pending",
      };
    }

    // Overall Status
    let overallStatus: {
      label: string;
      bg: string;
      color: string;
      border: string;
    };

    if (syllabusStatus.state === "Completed" && qbStatus.state === "Completed") {
      overallStatus = {
        label: "Completed",
        bg: "#dcfce7",
        color: "#15803d",
        border: "1px solid #86efac",
      };
    } else if (syllabusStatus.state !== "Pending" || qbStatus.state !== "Pending") {
      overallStatus = {
        label: "In Progress",
        bg: "#fef3c7",
        color: "#b45309",
        border: "1px solid #fde68a",
      };
    } else {
      overallStatus = {
        label: "Action Needed",
        bg: "#fee2e2",
        color: "#b91c1c",
        border: "1px solid #fca5a5",
      };
    }

    return {
      syllabusUnits,
      expectedUnits,
      syllabusPct,
      syllabusStatus,
      questionsCount,
      expectedQuestions,
      questionsPct,
      verifiedCount,
      qbStatus,
      overallStatus,
    };
  };

  // Filtered List
  const filteredList = facultyList.filter((fac) => {
    const q = searchQuery.toLowerCase();
    const work = getFacultyWorkStatus(fac);

    const matchesSearch =
      fac.name.toLowerCase().includes(q) ||
      fac.designation.toLowerCase().includes(q) ||
      (fac.department || "").toLowerCase().includes(q) ||
      (fac.school || "").toLowerCase().includes(q) ||
      (fac.deanName || "").toLowerCase().includes(q) ||
      (fac.hodName || "").toLowerCase().includes(q) ||
      (fac.employeeId || "").toLowerCase().includes(q) ||
      (fac.email || "").toLowerCase().includes(q) ||
      (fac.assignedSubjects || []).some((s) => s.toLowerCase().includes(q));

    const matchesDesignation =
      designationFilter === "All" ||
      fac.designation.toLowerCase().includes(designationFilter.toLowerCase());

    const matchesSchool =
      schoolFilter === "All" ||
      fac.school === schoolFilter ||
      examStore.getSchoolByNameOrId(fac.department || "")?.name === schoolFilter ||
      examStore.getSchoolByNameOrId(fac.school || "")?.name === schoolFilter;

    const matchesDept = deptFilter === "All" || fac.department === deptFilter;

    const matchesStatus =
      statusFilter === "All" ||
      work.overallStatus.label.toLowerCase() === statusFilter.toLowerCase() ||
      work.syllabusStatus.state.toLowerCase() === statusFilter.toLowerCase() ||
      work.qbStatus.state.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDesignation && matchesSchool && matchesDept && matchesStatus;
  });

  // Extract unique departments for filter (scoped to selected School if specified)
  const availableDepartments =
    schoolFilter === "All"
      ? Array.from(new Set(facultyList.map((f) => f.department).filter(Boolean)))
      : (examStore.getSchoolByNameOrId(schoolFilter)?.departments.map((d) => d.name) || []);

  // Designation helper badge styling
  const getDesignationBadge = (desig: string) => {
    if (desig.toLowerCase().includes("head") || desig.toLowerCase().includes("hod")) {
      return {
        bg: "linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(99, 102, 241, 0.25) 100%)",
        border: "1px solid rgba(79, 70, 229, 0.4)",
        color: "#4338ca",
        label: "🏛️ " + desig,
      };
    }
    if (desig.toLowerCase().includes("associate professor")) {
      return {
        bg: "linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(168, 85, 247, 0.2) 100%)",
        border: "1px solid rgba(147, 51, 234, 0.35)",
        color: "#7e22ce",
        label: "🌟 " + desig,
      };
    }
    if (desig.toLowerCase().includes("assistant professor")) {
      return {
        bg: "linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(56, 189, 248, 0.2) 100%)",
        border: "1px solid rgba(2, 132, 199, 0.35)",
        color: "#0369a1",
        label: "🎓 " + desig,
      };
    }
    return {
      bg: "linear-gradient(135deg, rgba(217, 119, 6, 0.12) 0%, rgba(245, 158, 11, 0.2) 100%)",
      border: "1px solid rgba(217, 119, 6, 0.35)",
      color: "#b45309",
      label: "🛠️ " + desig,
    };
  };

  // Add Faculty Form Fields
  const addFacultyFields: FormFieldDef[] = [
    { key: "name", label: "Staff / Faculty Name", placeholder: "e.g. Dr. A. Suresh", required: true },
    {
      key: "designation",
      label: "Designation",
      type: "select",
      required: true,
      options: [
        { value: "Assistant Professor", label: "Assistant Professor" },
        { value: "Assistant Professor (Senior Grade)", label: "Assistant Professor (Senior Grade)" },
        { value: "Associate Professor", label: "Associate Professor" },
        { value: "Professor", label: "Professor" },
        { value: "Head of Department (HOD)", label: "Head of Department (HOD)" },
        { value: "Technical Lab Instructor / Staff", label: "Technical Lab Instructor / Staff" },
      ],
    },
    { key: "employeeId", label: "Employee ID / Code", placeholder: "e.g. RGU-FAC-109", required: true },
    {
      key: "school",
      label: "Institutional School",
      type: "select",
      required: true,
      options: INSTITUTIONAL_HIERARCHY.map((s) => ({ value: s.name, label: `${s.code} — ${s.name}` })),
    },
    { key: "department", label: "Department", placeholder: "e.g. Visual Communication", required: true },
    { key: "email", label: "Email Address", placeholder: "e.g. faculty@rathinam.in", required: true },
    { key: "phone", label: "Phone Number", placeholder: "e.g. +91 98765 00000" },
    { key: "qualification", label: "Qualification", placeholder: "e.g. M.Sc., Ph.D., UGC-NET" },
    { key: "experience", label: "Experience", placeholder: "e.g. 5 Years" },
    {
      key: "assignedSubjects",
      label: "Assigned Subject",
      type: "select",
      required: true,
      options: INSTITUTIONAL_SUBJECTS.map((s) => ({
        value: `${s.name} (${s.code})`,
        label: `${s.name} (${s.code}) — ${s.department.replace("Department of ", "")}`,
      })),
      spanFull: true,
    },
  ];

  const handleCreateFaculty = (values: Record<string, any>) => {
    const subjectsArray = values.assignedSubjects
      ? String(values.assignedSubjects).split(",").map((s) => s.trim()).filter(Boolean)
      : ["Visual Communication"];

    const deptName = values.department || "Department of Visual Communication";
    const scName = values.school || examStore.getSchoolByNameOrId(deptName)?.name || INSTITUTIONAL_HIERARCHY[0].name;
    const scObj = examStore.getSchoolByNameOrId(scName) || INSTITUTIONAL_HIERARCHY[0];
    const deptObj = examStore.getDepartmentByNameOrId(deptName, scName) || scObj.departments[0];
    const deanObj = examStore.getDeanForSchool(scName) || { name: scObj.deanName, email: scObj.deanEmail };
    const hodObj = examStore.getHodForDepartment(deptName) || { name: deptObj.hodName, email: deptObj.hodEmail };

    examStore.saveStaffFaculty({
      name: values.name,
      designation: values.designation,
      employeeId: values.employeeId,
      school: scObj.name,
      deanName: deanObj.name,
      deanEmail: deanObj.email,
      department: deptObj.name,
      hodName: hodObj.name,
      hodEmail: hodObj.email,
      email: values.email,
      phone: values.phone || "+91 98765 00000",
      qualification: values.qualification || "Postgraduate",
      experience: values.experience || "3 Years",
      assignedSubjects: subjectsArray,
      reportingTo: currentUser.role === "HOD" ? "HOD" : "DEAN",
      reportingOfficerName: `${hodObj.name} (HOD)`,
      status: "Active",
      avatarBg: "linear-gradient(135deg, #4f46e5, #3b82f6)",
      questionsContributed: 0,
      pendingReviews: 0,
    });

    showToast(`Staff "${values.name}" added and mapped to ${scObj.code} → ${deptObj.name} successfully!`);
    setIsAddOpen(false);
  };

  const handleEditFaculty = (values: Record<string, any>) => {
    if (!editTarget) return;

    const subjectsArray = values.assignedSubjects
      ? String(values.assignedSubjects).split(",").map((s) => s.trim()).filter(Boolean)
      : editTarget.assignedSubjects;
    const deptName = values.department || editTarget.department;
    const schoolName = values.school || editTarget.school;
    const school = examStore.getSchoolByNameOrId(schoolName) || examStore.getSchoolByNameOrId(deptName);
    const department = examStore.getDepartmentByNameOrId(deptName, school?.name);
    const dean = examStore.getDeanForSchool(school?.name || schoolName);
    const hod = examStore.getHodForDepartment(department?.name || deptName);

    examStore.saveStaffFaculty({
      ...editTarget,
      id: editTarget.id,
      name: values.name,
      designation: values.designation,
      employeeId: values.employeeId,
      school: school?.name || schoolName,
      deanName: dean?.name || editTarget.deanName,
      deanEmail: dean?.email || editTarget.deanEmail,
      department: department?.name || deptName,
      hodName: hod?.name || editTarget.hodName,
      hodEmail: hod?.email || editTarget.hodEmail,
      email: values.email,
      phone: values.phone,
      qualification: values.qualification,
      experience: values.experience,
      assignedSubjects: subjectsArray,
    });

    showToast(`Staff "${values.name}" profile updated successfully!`);
    setEditTarget(null);
    setIsEditOpen(false);
  };

  // COE Faculty Allocation Handlers
  const runAllocationValidation = (
    fId: string,
    scName: string,
    deptName: string,
    dName: string,
    hName: string
  ): boolean => {
    const res = examStore.validateFacultyAllocation({
      facultyId: fId,
      schoolName: scName,
      departmentName: deptName,
      deanName: dName,
      hodName: hName,
    });
    setAllocErrors(res.errors);
    return res.isValid;
  };

  const handleOpenAllocation = (fac?: StaffFacultyItem) => {
    const targetFaculty = fac || facultyList[0];
    if (!targetFaculty) {
      showToast("No faculty members available for allocation.", "danger");
      return;
    }

    setAllocFacultyId(targetFaculty.id);
    const resolved = examStore.resolveFacultyHierarchy(targetFaculty.id);

    const schoolName = resolved.school?.name || targetFaculty.school || INSTITUTIONAL_HIERARCHY[0].name;
    const schoolObj = examStore.getSchoolByNameOrId(schoolName) || INSTITUTIONAL_HIERARCHY[0];
    const deanObj = resolved.dean || {
      name: schoolObj.deanName,
      email: schoolObj.deanEmail,
      roleTitle: schoolObj.deanRoleTitle,
    };

    const deptName = resolved.department?.name || targetFaculty.department || schoolObj.departments[0]?.name || "";
    const deptObj = examStore.getDepartmentByNameOrId(deptName, schoolName) || schoolObj.departments[0];
    const hodObj = resolved.hod || {
      name: deptObj.hodName,
      email: deptObj.hodEmail,
      roleTitle: deptObj.hodRoleTitle,
    };

    setAllocSchool(schoolObj.name);
    setAllocDean(deanObj);
    setAllocDept(deptObj.name);
    setAllocHod(hodObj);
    setAllocSubjects((targetFaculty.assignedSubjects || []).join(", "));
    setAllocErrors([]);

    setIsAllocateOpen(true);
  };

  const handleAllocFacultyChange = (newFacId: string) => {
    setAllocFacultyId(newFacId);
    const fac = facultyList.find((f) => f.id === newFacId);
    if (!fac) return;

    // Step 1: Select/identify Faculty
    // Step 2: Automatically identify Faculty's School
    // Step 3: Automatically identify corresponding School Dean
    // Step 4: Identify Faculty's Department within that School
    // Step 5: Automatically identify corresponding Department HOD
    const resolved = examStore.resolveFacultyHierarchy(newFacId);
    const sc = resolved.school || INSTITUTIONAL_HIERARCHY[0];
    const dn = resolved.dean || { name: sc.deanName, email: sc.deanEmail, roleTitle: sc.deanRoleTitle };
    const dp = resolved.department || sc.departments[0];
    const hd = resolved.hod || { name: dp.hodName, email: dp.hodEmail, roleTitle: dp.hodRoleTitle };

    setAllocSchool(sc.name);
    setAllocDean(dn);
    setAllocDept(dp.name);
    setAllocHod(hd);
    setAllocSubjects((fac.assignedSubjects || []).join(", "));
    runAllocationValidation(newFacId, sc.name, dp.name, dn.name, hd.name);
  };

  const handleAllocSchoolChange = (newSchoolName: string) => {
    setAllocSchool(newSchoolName);
    const sc = examStore.getSchoolByNameOrId(newSchoolName);
    if (!sc) return;

    // Step 2: Automatically identify Dean mapped only to this School
    const dn = { name: sc.deanName, email: sc.deanEmail, roleTitle: sc.deanRoleTitle };
    setAllocDean(dn);

    // Step 4: Departments must belong only to their respective School
    const firstDept = sc.departments[0];
    if (firstDept) {
      setAllocDept(firstDept.name);
      // Step 5: Automatically identify HOD mapped only to this Department
      const hd = { name: firstDept.hodName, email: firstDept.hodEmail, roleTitle: firstDept.hodRoleTitle };
      setAllocHod(hd);
      runAllocationValidation(allocFacultyId, sc.name, firstDept.name, dn.name, hd.name);
    }
  };

  const handleAllocDeptChange = (newDeptName: string) => {
    setAllocDept(newDeptName);
    const dept = examStore.getDepartmentByNameOrId(newDeptName, allocSchool);
    if (!dept) return;

    // Step 5: Automatically identify HOD mapped only to this Department
    const hd = { name: dept.hodName, email: dept.hodEmail, roleTitle: dept.hodRoleTitle };
    setAllocHod(hd);
    runAllocationValidation(allocFacultyId, allocSchool, newDeptName, allocDean.name, hd.name);
  };

  const handleConfirmAllocation = () => {
    const isValid = runAllocationValidation(allocFacultyId, allocSchool, allocDept, allocDean.name, allocHod.name);
    if (!isValid) {
      showToast("Allocation failed: Please check validation requirements.", "danger");
      return;
    }

    try {
      const subjectsList = allocSubjects
        ? allocSubjects.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

      const allocated = examStore.allocateFacultyWithHierarchy({
        facultyId: allocFacultyId,
        schoolName: allocSchool,
        departmentName: allocDept,
        deanName: allocDean.name,
        hodName: allocHod.name,
        assignedSubjects: subjectsList,
        actorRole: currentUser.role,
        actorName: currentUser.name,
      });

      showToast(
        `Faculty "${allocated.name}" successfully allocated: ${allocated.school} → ${allocated.deanName} → ${allocated.department} → ${allocated.hodName}`
      );
      setIsAllocateOpen(false);
      loadFaculty();
    } catch (err: any) {
      showToast(err.message || "Failed to complete allocation.", "danger");
    }
  };

  const handleDeleteFaculty = () => {
    if (!deleteTarget) return;
    examStore.deleteStaffFaculty(deleteTarget.id);
    showToast(`Staff "${deleteTarget.name}" removed from directory.`, "danger");
    setDeleteTarget(null);
  };

  const handleSendNotice = (fac: StaffFacultyItem) => {
    const sub = fac.assignedSubjects[0] || "General";
    examStore.saveNotification({
      title: `Submission Reminder: ${sub}`,
      description: `Official review notice dispatched to ${fac.name} (${fac.designation}) regarding syllabus and question bank deadlines.`,
      type: "Broadcast",
      priority: "High",
      relatedTo: sub,
      status: "Unread",
    });
    showToast(`Notice sent successfully to ${fac.name}!`);
  };

  // Live Stats calculation
  const totalCount = facultyList.length;
  const completedCount = facultyList.filter(
    (f) => getFacultyWorkStatus(f).overallStatus.label === "Completed"
  ).length;
  const progressingCount = facultyList.filter(
    (f) => getFacultyWorkStatus(f).overallStatus.label === "In Progress"
  ).length;
  const incompletedCount = facultyList.filter(
    (f) => getFacultyWorkStatus(f).overallStatus.label === "Action Needed"
  ).length;

  return (
    <RoleGuard route="/staff-faculty">
      <div
        style={{
          display: "flex",
          height: "100vh",
          maxHeight: "100vh",
          background: "#f4f6fb",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: "#0f172a",
          width: "100%",
          maxWidth: "100vw",
          overflow: "hidden",
        }}
      >
        {/* ================= SIDEBAR ================= */}
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
                alt="Rathinam Global University"
                style={{
                  maxHeight: "38px",
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 12px rgba(99, 102, 241, 0.35))",
                }}
              />
            </div>

            {/* Navigation Items */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {menuItems.map((item) => {
                const IconComp = item.icon;
                const isActive = item.id === "staff-work-status" || item.id === "staff-faculty";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.route) router.push(item.route);
                    }}
                    className={`sidebar-btn-3d ${isActive ? "sidebar-btn-active" : "sidebar-btn-inactive"}`}
                  >
                    <span className="nav-icon-3d" style={{ display: "flex", alignItems: "center" }}>
                      <IconComp size={18} />
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>

                    {item.badge && <span className="badge-neon-3d">{item.badge}</span>}

                    {item.hasArrow && (
                      <ChevronRight
                        size={16}
                        color="#ffffff"
                        style={{
                          transition: "transform 0.2s ease",
                          filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))",
                        }}
                      />
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
              Academic faculty & reporting assistance desk.
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

        {/* ================= MAIN CONTENT ================= */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
          {/* Header */}
          <PortalHeader activeRoute="staff-faculty" />

          {/* Body */}
          <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", overflowX: "hidden", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
            {/* ================= Filters & Search Bar ================= */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "16px 20px",
                marginBottom: "20px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
              }}
            >
              {/* Search input */}
              <div style={{ position: "relative", flex: "1 1 260px", maxWidth: "360px" }}>
                <Search
                  size={17}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search staff name, ID, subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#6366f1";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Status Quick Filter Tabs */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                {[
                  { id: "All", label: `All Staff (${totalCount})` },
                  { id: "Completed", label: `Completed (${completedCount})` },
                  { id: "In Progress", label: `In Progress (${progressingCount})` },
                  { id: "Action Needed", label: `Pending (${incompletedCount})` },
                ].map((tab) => {
                  const isActive = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "8px",
                        border: isActive ? "1px solid #4f46e5" : "1px solid #e2e8f0",
                        background: isActive ? "#4f46e5" : "#ffffff",
                        color: isActive ? "#ffffff" : "#475569",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: isActive ? "0 2px 8px rgba(79, 70, 229, 0.3)" : "none",
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Right Controls: School + Dept + Designation + Action Buttons + View Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {/* School Dropdown */}
                <select
                  value={schoolFilter}
                  onChange={(e) => {
                    setSchoolFilter(e.target.value);
                    setDeptFilter("All");
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  title="Filter by Rathinam School"
                >
                  <option value="All">All Schools</option>
                  {INSTITUTIONAL_HIERARCHY.map((sc) => (
                    <option key={sc.id} value={sc.name}>
                      {sc.code} — {sc.name.replace("School of ", "")}
                    </option>
                  ))}
                </select>

                {/* Department Dropdown */}
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  title="Filter by Department"
                >
                  <option value="All">All Departments</option>
                  {availableDepartments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Designation Dropdown */}
                <select
                  value={designationFilter}
                  onChange={(e) => setDesignationFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="All">All Designations</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Head of Department">Head of Department (HOD)</option>
                  <option value="Staff">Technical Staff</option>
                </select>

                {/* Allocate Faculty Action Button */}
                <button
                  type="button"
                  onClick={() => handleOpenAllocation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    color: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                    transition: "all 0.15s ease",
                  }}
                  title="Allocate Faculty to Institutional Hierarchy"
                >
                  <Layers size={14} />
                  <span>Allocate Faculty</span>
                </button>

                {/* Add Staff Button */}
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 13px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#1e293b",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    transition: "all 0.15s ease",
                  }}
                  title="Add New Faculty to Directory"
                >
                  <Plus size={14} />
                  <span>Add Staff</span>
                </button>

                {/* View Mode Toggle */}
                <div style={{ display: "flex", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      background: viewMode === "table" ? "#ffffff" : "transparent",
                      color: viewMode === "table" ? "#0f172a" : "#64748b",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: viewMode === "table" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    Table View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      background: viewMode === "grid" ? "#ffffff" : "transparent",
                      color: viewMode === "grid" ? "#0f172a" : "#64748b",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: viewMode === "grid" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    Cards View
                  </button>
                </div>
              </div>
            </div>

            {/* ================= Faculty Directory Content ================= */}
            {filteredList.length === 0 ? (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "60px 20px",
                  textAlign: "center",
                  border: "1px dashed #cbd5e1",
                }}
              >
                <Users size={48} color="#94a3b8" style={{ marginBottom: "12px", opacity: 0.7 }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" }}>
                  No reporting staff found
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
                  Try adjusting your search criteria or add new faculty members.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDesignationFilter("All");
                    setDeptFilter("All");
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* ================= GRID VIEW ================= */
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                  gap: "20px",
                  marginBottom: "32px",
                }}
              >
                {filteredList.map((fac) => {
                  const badge = getDesignationBadge(fac.designation);
                  return (
                    <div
                      key={fac.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "18px",
                        padding: "22px",
                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.03)",
                        transition: "all 0.25s ease",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = "0 10px 24px rgba(0, 0, 0, 0.08)";
                        e.currentTarget.style.borderColor = "#cbd5e1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.03)";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                      }}
                    >
                      <div>
                        {/* Top Row: Avatar + Name + Employee ID */}
                        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "14px" }}>
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "14px",
                              background: fac.avatarBg || "linear-gradient(135deg, #6366f1, #818cf8)",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "18px",
                              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                              flexShrink: 0,
                            }}
                          >
                            {fac.name.replace(/^(Mr\.|Mrs\.|Dr\.|Ms\.)\s*/i, "").charAt(0)}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                              <h3
                                style={{
                                  fontSize: "15.5px",
                                  fontWeight: 800,
                                  color: "#0f172a",
                                  margin: 0,
                                  letterSpacing: "-0.2px",
                                }}
                              >
                                {fac.name}
                              </h3>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color: "#16a34a",
                                  background: "#f0fdf4",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  border: "1px solid #bbf7d0",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                ● {fac.status}
                              </span>
                            </div>

                            <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>
                              {fac.employeeId} • {fac.department}
                            </span>
                          </div>
                        </div>

                        {/* Prominent Designation Pill */}
                        <div style={{ marginBottom: "14px" }}>
                          <div
                            style={{
                              display: "inline-block",
                              background: badge.bg,
                              border: badge.border,
                              color: badge.color,
                              padding: "5px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 700,
                              letterSpacing: "0.2px",
                            }}
                          >
                            {badge.label}
                          </div>
                        </div>

                        {/* Reporting Hierarchy info */}
                        <div
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #edf2f7",
                            borderRadius: "10px",
                            padding: "8px 12px",
                            fontSize: "11.5px",
                            color: "#475569",
                            marginBottom: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Building size={14} color="#6366f1" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            Reports to: <strong>{fac.reportingOfficerName}</strong>
                          </span>
                        </div>

                        {/* Assigned Subjects */}
                        <div style={{ marginBottom: "14px" }}>
                          <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: 600, marginBottom: "6px" }}>
                            ASSIGNED SUBJECTS:
                          </span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {fac.assignedSubjects.map((sub, idx) => (
                              <span
                                key={idx}
                                style={{
                                  background: "#eff6ff",
                                  color: "#2563eb",
                                  border: "1px solid #dbeafe",
                                  borderRadius: "6px",
                                  padding: "3px 8px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                }}
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Qualifications & Questions Contribution */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "10px",
                            background: "#fdfdfd",
                            border: "1px solid #f1f5f9",
                            borderRadius: "10px",
                            padding: "10px 12px",
                            marginBottom: "16px",
                          }}
                        >
                          <div>
                            <span style={{ fontSize: "10.5px", color: "#64748b", display: "block" }}>Experience:</span>
                            <strong style={{ fontSize: "12px", color: "#1e293b" }}>{fac.experience}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: "10.5px", color: "#64748b", display: "block" }}>Questions Added:</span>
                            <strong style={{ fontSize: "12px", color: "#4f46e5" }}>
                              {fac.questionsContributed} Questions
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedFaculty(fac)}
                          style={{
                            flex: 1,
                            minWidth: "100px",
                            padding: "8px 12px",
                            borderRadius: "9px",
                            border: "1px solid #e2e8f0",
                            background: "#ffffff",
                            color: "#1e293b",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f8fafc";
                            e.currentTarget.style.borderColor = "#cbd5e1";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#ffffff";
                            e.currentTarget.style.borderColor = "#e2e8f0";
                          }}
                        >
                          <Eye size={14} color="#6366f1" />
                          <span>View Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenAllocation(fac)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "9px",
                            border: "1px solid #c7d2fe",
                            background: "#eef2ff",
                            color: "#4338ca",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "all 0.2s ease",
                          }}
                          title="Allocate School, Dean, Department, HOD"
                        >
                          <Layers size={13} />
                          <span>Allocate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = `mailto:${fac.email}?subject=Exam Cell Academic Coordination`;
                          }}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "9px",
                            border: "1px solid #e2e8f0",
                            background: "#ffffff",
                            color: "#2563eb",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          title={`Email ${fac.name}`}
                        >
                          <Mail size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(fac)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "9px",
                            border: "1px solid #fee2e2",
                            background: "#fff5f5",
                            color: "#ef4444",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Remove Faculty"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ================= PRIMARY TABLE VIEW (ORDER-WISE STATUS) ================= */
              <>
                <style>{`
                  .row-clicked {
                    background: #f1f5f9 !important;
                    box-shadow: inset 4px 0 0 #4f46e5;
                    transition: all 0.2s ease;
                  }
                `}</style>
                <div
                  style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                  marginBottom: "32px",
                }}
              >
                {/* Board Top Header Strip */}
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #e2e8f0",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#10b981",
                          display: "inline-block",
                        }}
                      />
                      <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        Faculty Work Completion & Deliverables Status Roster
                      </h2>
                    </div>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "3px 0 0 16px" }}>
                      Staff listed in order with syllabus units progress and question bank upload verification status.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#059669",
                        background: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        padding: "3px 10px",
                        borderRadius: "12px",
                      }}
                    >
                      ● {completedCount} Fully Verified
                    </span>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#d97706",
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        padding: "3px 10px",
                        borderRadius: "12px",
                      }}
                    >
                      ● {progressingCount} In Progress
                    </span>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#e11d48",
                        background: "#fff1f2",
                        border: "1px solid #fecdd3",
                        padding: "3px 10px",
                        borderRadius: "12px",
                      }}
                    >
                      ● {incompletedCount} Pending
                    </span>
                  </div>
                </div>

                {/* The Responsive Table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <th
                          style={{
                            padding: "14px 16px",
                            width: "48px",
                            textAlign: "center",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          #
                        </th>
                        <th
                          style={{
                            padding: "14px 20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            minWidth: "260px",
                          }}
                        >
                          Staff / Faculty Member
                        </th>
                        <th
                          style={{
                            padding: "14px 18px",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            minWidth: "210px",
                          }}
                        >
                          Assigned Subject
                        </th>
                        <th
                          style={{
                            padding: "14px 18px",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            minWidth: "240px",
                          }}
                        >
                          Syllabus Complete & Upload Status
                        </th>
                        <th
                          style={{
                            padding: "14px 18px",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            minWidth: "250px",
                          }}
                        >
                          Question Bank Upload Status
                        </th>
                        <th
                          style={{
                            padding: "14px 16px",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            textAlign: "center",
                            minWidth: "120px",
                          }}
                        >
                          Overall Status
                        </th>
                        <th
                          style={{
                            padding: "14px 18px",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            textAlign: "center",
                            minWidth: "140px",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.map((fac, index) => {
                        const work = getFacultyWorkStatus(fac);
                        const badge = getDesignationBadge(fac.designation);

                        return (
                          <tr
                            key={fac.id}
                            className={shakeRowId === fac.id ? "row-clicked" : ""}
                            onClick={() => triggerRowShake(fac.id)}
                            style={{
                              borderBottom: "1px solid #f1f5f9",
                              transition: "background 0.15s ease",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              if (shakeRowId !== fac.id) e.currentTarget.style.background = "#fbfcfe";
                            }}
                            onMouseLeave={(e) => {
                              if (shakeRowId !== fac.id) e.currentTarget.style.background = "transparent";
                            }}
                          >
                            {/* Column 1: Order Number */}
                            <td style={{ padding: "16px 14px", textAlign: "center" }}>
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "8px",
                                  background: "#f1f5f9",
                                  color: "#475569",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                  fontWeight: 800,
                                  margin: "0 auto",
                                }}
                              >
                                {String(index + 1).padStart(2, "0")}
                              </div>
                            </td>

                            {/* Column 2: Staff / Faculty Member */}
                            <td style={{ padding: "16px 20px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div
                                  style={{
                                    width: "42px",
                                    height: "42px",
                                    borderRadius: "12px",
                                    background: fac.avatarBg || "linear-gradient(135deg, #6366f1, #818cf8)",
                                    color: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 800,
                                    fontSize: "15px",
                                    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)",
                                    flexShrink: 0,
                                  }}
                                >
                                  {fac.name.replace(/^(Mr\.|Mrs\.|Dr\.|Ms\.|Prof\.)\s*/i, "").charAt(0)}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                                      {fac.name}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "10.5px",
                                        padding: "1px 6px",
                                        borderRadius: "4px",
                                        background: "#f1f5f9",
                                        color: "#475569",
                                        fontWeight: 700,
                                        fontFamily: "monospace",
                                      }}
                                    >
                                      {fac.employeeId}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      marginTop: "4px",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        padding: "2px 7px",
                                        borderRadius: "4px",
                                        background: badge.bg,
                                        border: badge.border,
                                        color: badge.color,
                                      }}
                                    >
                                      {fac.designation}
                                    </span>
                                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                                      • {fac.email}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Column 3: Assigned Subject & Hierarchy */}
                            <td style={{ padding: "16px 18px" }}>
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
                                  {fac.assignedSubjects[0] || "General Subject"}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "3px" }}>
                                  <span
                                    style={{
                                      fontSize: "10.5px",
                                      background: "#eff6ff",
                                      color: "#2563eb",
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                      fontWeight: 700,
                                      border: "1px solid #bfdbfe",
                                    }}
                                  >
                                    {fac.assignedSubjects[0]?.match(/\(([^)]+)\)/)?.[1] || "VIS-301"}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      background: "#f1f5f9",
                                      color: "#475569",
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                      border: "1px solid #e2e8f0",
                                    }}
                                    title={fac.school || "SFDMP"}
                                  >
                                    🏛️ {fac.school ? examStore.getSchoolByNameOrId(fac.school)?.code || fac.school : "SFDMP"}
                                  </span>
                                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                                    {fac.department}
                                  </span>
                                </div>
                                <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                                  Dean: {fac.deanName || "Dr. V Rajlakshmi"} • HOD: {fac.hodName || "Dr. T.J RAJU"}
                                </div>
                              </div>
                            </td>

                            {/* Column 4: Syllabus Complete & Upload Status */}
                            <td style={{ padding: "16px 18px" }}>
                              <div style={{ minWidth: "210px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
                                    {work.syllabusStatus.label}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "11.5px",
                                      fontWeight: 800,
                                      color: work.syllabusStatus.badgeColor,
                                    }}
                                  >
                                    {work.syllabusPct}%
                                  </span>
                                </div>

                                {/* Progress Bar */}
                                <div
                                  style={{
                                    width: "100%",
                                    height: "6px",
                                    borderRadius: "999px",
                                    background: "#f1f5f9",
                                    overflow: "hidden",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${work.syllabusPct}%`,
                                      height: "100%",
                                      borderRadius: "999px",
                                      background: work.syllabusStatus.progressColor,
                                      transition: "width 0.3s ease",
                                    }}
                                  />
                                </div>

                                {/* Status Pill */}
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    background: work.syllabusStatus.badgeBg,
                                    color: work.syllabusStatus.badgeColor,
                                    border: work.syllabusStatus.badgeBorder,
                                  }}
                                >
                                  {work.syllabusStatus.state === "Completed" ? (
                                    <CheckCircle2 size={12} />
                                  ) : work.syllabusStatus.state === "In Progress" ? (
                                    <Clock size={12} />
                                  ) : (
                                    <AlertCircle size={12} />
                                  )}
                                  {work.syllabusStatus.subtext}
                                </span>
                              </div>
                            </td>

                            {/* Column 5: Question Bank Upload Status */}
                            <td style={{ padding: "16px 18px" }}>
                              <div style={{ minWidth: "220px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
                                    {work.qbStatus.label}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "11.5px",
                                      fontWeight: 800,
                                      color: work.qbStatus.badgeColor,
                                    }}
                                  >
                                    {work.questionsPct}%
                                  </span>
                                </div>

                                {/* Progress Bar */}
                                <div
                                  style={{
                                    width: "100%",
                                    height: "6px",
                                    borderRadius: "999px",
                                    background: "#f1f5f9",
                                    overflow: "hidden",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${work.questionsPct}%`,
                                      height: "100%",
                                      borderRadius: "999px",
                                      background: work.qbStatus.progressColor,
                                      transition: "width 0.3s ease",
                                    }}
                                  />
                                </div>

                                {/* Status Pill */}
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    background: work.qbStatus.badgeBg,
                                    color: work.qbStatus.badgeColor,
                                    border: work.qbStatus.badgeBorder,
                                  }}
                                >
                                  {work.qbStatus.state === "Completed" ? (
                                    <Shield size={12} />
                                  ) : work.qbStatus.state === "In Progress" ? (
                                    <Edit3 size={12} />
                                  ) : (
                                    <AlertTriangle size={12} />
                                  )}
                                  {work.qbStatus.subtext}
                                </span>
                              </div>
                            </td>

                            {/* Column 6: Overall Status */}
                            <td style={{ padding: "16px 16px", textAlign: "center" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "5px 12px",
                                  borderRadius: "20px",
                                  fontSize: "11.5px",
                                  fontWeight: 800,
                                  background: work.overallStatus.bg,
                                  color: work.overallStatus.color,
                                  border: work.overallStatus.border,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {work.overallStatus.label === "Completed" ? (
                                  <CheckCircle2 size={12} />
                                ) : work.overallStatus.label === "In Progress" ? (
                                  <Clock size={12} />
                                ) : (
                                  <AlertTriangle size={12} />
                                )}
                                {work.overallStatus.label}
                              </span>
                            </td>

                            {/* Column 7: Actions */}
                            <td style={{ padding: "16px 18px", textAlign: "center" }}>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  justifyContent: "center",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => setSelectedFaculty(fac)}
                                  title="View Academic Dossier"
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    border: "1px solid #e0e7ff",
                                    background: "#eef2ff",
                                    color: "#4f46e5",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    transition: "all 0.15s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#4f46e5";
                                    e.currentTarget.style.color = "#ffffff";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#eef2ff";
                                    e.currentTarget.style.color = "#4f46e5";
                                  }}
                                >
                                  <Eye size={13} />
                                  <span>View</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenAllocation(fac)}
                                  title="Allocate Faculty Hierarchy (School → Dean → Department → HOD)"
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "8px",
                                    border: "1px solid #c7d2fe",
                                    background: "#eef2ff",
                                    color: "#4338ca",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    transition: "all 0.15s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#4338ca";
                                    e.currentTarget.style.color = "#ffffff";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#eef2ff";
                                    e.currentTarget.style.color = "#4338ca";
                                  }}
                                >
                                  <Layers size={12} />
                                  <span>Allocate</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSendNotice(fac)}
                                  title="Send Notice / Reminder"
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "8px",
                                    border: "1px solid #fef3c7",
                                    background: "#fffbeb",
                                    color: "#d97706",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    transition: "all 0.15s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#d97706";
                                    e.currentTarget.style.color = "#ffffff";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#fffbeb";
                                    e.currentTarget.style.color = "#d97706";
                                  }}
                                >
                                  <Send size={12} />
                                  <span>Notice</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(fac)}
                                  title="Remove Staff"
                                  style={{
                                    padding: "6px 8px",
                                    borderRadius: "8px",
                                    border: "1px solid #fee2e2",
                                    background: "#fff5f5",
                                    color: "#ef4444",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          </main>

          <PortalFooter />
        </div>

        {/* ================= MODAL: VIEW FACULTY PROFILE ================= */}
        {selectedFaculty && (
          <ViewModal
            isOpen={Boolean(selectedFaculty)}
            onClose={() => setSelectedFaculty(null)}
            onEdit={() => {
              if (!selectedFaculty) return;
              setEditTarget(selectedFaculty);
              setIsEditOpen(true);
            }}
            title="Staff / Faculty Academic Dossier"
            subtitle={`${selectedFaculty.name} — ${selectedFaculty.designation}`}
            data={{
              "Full Name": selectedFaculty.name,
              "Official Designation": selectedFaculty.designation,
              "Employee ID / Code": selectedFaculty.employeeId,
              "Institutional School": selectedFaculty.school || examStore.getSchoolByNameOrId(selectedFaculty.department)?.name || "School of Fashion Design, Media and Performing Arts",
              "School Dean": `${selectedFaculty.deanName || examStore.getDeanForSchool(selectedFaculty.school || selectedFaculty.department)?.name || "Dr. V Rajlakshmi"} (${selectedFaculty.deanEmail || "dean@rathinam.in"})`,
              "Academic Department": selectedFaculty.department,
              "Department HOD": `${selectedFaculty.hodName || examStore.getHodForDepartment(selectedFaculty.department)?.name || "Dr. T.J RAJU"} (${selectedFaculty.hodEmail || "hod@rathinam.in"})`,
              "Reporting Officer": selectedFaculty.reportingOfficerName,
              "Hierarchy Chain": `${selectedFaculty.school || "SFDMP"} → ${selectedFaculty.deanName || "Dr. V Rajlakshmi"} → ${selectedFaculty.department} → ${selectedFaculty.hodName || "Dr. T.J RAJU"} → ${selectedFaculty.name}`,
              "Email Address": selectedFaculty.email,
              "Contact Number": selectedFaculty.phone,
              "Academic Qualifications": selectedFaculty.qualification,
              "Teaching Experience": selectedFaculty.experience,
              "Assigned Subjects": selectedFaculty.assignedSubjects.join(", "),
              "Questions Contributed": `${selectedFaculty.questionsContributed} Questions`,
              "Pending Question Reviews": `${selectedFaculty.pendingReviews} Questions`,
              "Account Status": selectedFaculty.status,
            }}
          />
        )}

        {/* ================= MODAL: ADD FACULTY ================= */}
        <FormModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Staff / Faculty Member"
          fields={addFacultyFields}
          onSubmit={handleCreateFaculty}
          submitLabel="Add to Directory"
        />

        {/* ================= MODAL: EDIT FACULTY PROFILE ================= */}
        <FormModal
          isOpen={isEditOpen && Boolean(editTarget)}
          onClose={() => {
            setIsEditOpen(false);
            setEditTarget(null);
          }}
          title="Edit Staff / Faculty Profile"
          subtitle={editTarget ? `Update ${editTarget.name}'s directory details` : undefined}
          fields={addFacultyFields}
          initialValues={
            editTarget
              ? {
                  name: editTarget.name,
                  designation: editTarget.designation,
                  employeeId: editTarget.employeeId,
                  school: editTarget.school,
                  department: editTarget.department,
                  email: editTarget.email,
                  phone: editTarget.phone,
                  qualification: editTarget.qualification,
                  experience: editTarget.experience,
                  assignedSubjects: editTarget.assignedSubjects.join(", "),
                }
              : undefined
          }
          onSubmit={handleEditFaculty}
          submitLabel="Save Profile"
        />

        {/* ================= MODAL: COE FACULTY HIERARCHICAL ALLOCATION ================= */}
        {isAllocateOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
              padding: "16px",
            }}
            onClick={() => setIsAllocateOpen(false)}
          >
            <div
              className="crud-modal-box"
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                width: "100%",
                maxWidth: "840px",
                maxHeight: "92vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
                    }}
                  >
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16.5px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      COE Faculty Institutional Allocation
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0 0" }}>
                      Hierarchy: School → School Dean → School Department → Department HOD → Faculty
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAllocateOpen(false)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    color: "#64748b",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fee2e2";
                    e.currentTarget.style.color = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Visual Institutional Hierarchy Trail Ribbon */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                    borderRadius: "14px",
                    padding: "16px 18px",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.15)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles size={15} color="#a5b4fc" />
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#e0e7ff", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                        Active Institutional Allocation Chain
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: allocErrors.length === 0 ? "#86efac" : "#fca5a5",
                        background: allocErrors.length === 0 ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        border: allocErrors.length === 0 ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {allocErrors.length === 0 ? "● Valid Hierarchy" : "● Conflict Detected"}
                    </span>
                  </div>

                  {/* 5-Step Ribbon */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "6px",
                      overflowX: "auto",
                      paddingBottom: "2px",
                    }}
                  >
                    {/* Node 1: School */}
                    <div style={{ flex: 1, minWidth: "120px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "10px", padding: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "3px" }}>
                        1. School
                      </div>
                      <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={allocSchool}>
                        {examStore.getSchoolByNameOrId(allocSchool)?.code || allocSchool}
                      </div>
                    </div>

                    <ChevronRight size={16} color="#818cf8" style={{ flexShrink: 0 }} />

                    {/* Node 2: Dean */}
                    <div style={{ flex: 1, minWidth: "120px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "10px", padding: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "3px" }}>
                        2. School Dean
                      </div>
                      <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#38bdf8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={allocDean.name}>
                        {allocDean.name}
                      </div>
                    </div>

                    <ChevronRight size={16} color="#818cf8" style={{ flexShrink: 0 }} />

                    {/* Node 3: Department */}
                    <div style={{ flex: 1, minWidth: "130px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "10px", padding: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "3px" }}>
                        3. Department
                      </div>
                      <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={allocDept}>
                        {allocDept.replace("Department of ", "")}
                      </div>
                    </div>

                    <ChevronRight size={16} color="#818cf8" style={{ flexShrink: 0 }} />

                    {/* Node 4: HOD */}
                    <div style={{ flex: 1, minWidth: "120px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "10px", padding: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "3px" }}>
                        4. Dept HOD
                      </div>
                      <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#34d399", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={allocHod.name}>
                        {allocHod.name}
                      </div>
                    </div>

                    <ChevronRight size={16} color="#818cf8" style={{ flexShrink: 0 }} />

                    {/* Node 5: Faculty */}
                    <div style={{ flex: 1, minWidth: "130px", background: "rgba(99, 102, 241, 0.2)", borderRadius: "10px", padding: "10px", border: "1px solid rgba(129, 140, 248, 0.4)" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#c7d2fe", textTransform: "uppercase", marginBottom: "3px" }}>
                        5. Allocated Faculty
                      </div>
                      <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {facultyList.find((f) => f.id === allocFacultyId)?.name || "Select Faculty"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 1: Select Faculty Member */}
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Step 1: Select Faculty Member <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={allocFacultyId}
                    onChange={(e) => handleAllocFacultyChange(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.employeeId}) — {f.designation} [{f.department}]
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: "11.5px", color: "#64748b", margin: "6px 0 0 0" }}>
                    Selecting a faculty member automatically identifies their institutional School, Dean, Department, and Department HOD.
                  </p>
                </div>

                {/* Step 2 & 3: School and School Dean */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Step 2: School Selection */}
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                      Step 2: Institutional School <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      value={allocSchool}
                      onChange={(e) => handleAllocSchoolChange(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#0f172a",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      {INSTITUTIONAL_HIERARCHY.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.code} — {s.name}
                        </option>
                      ))}
                    </select>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "6px 0 0 0" }}>
                      Each faculty member belongs to a specific School.
                    </p>
                  </div>

                  {/* Step 3: School Dean (Auto-Identified) */}
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b" }}>
                        Step 3: School Dean
                      </label>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "#059669", background: "#ecfdf5", padding: "2px 7px", borderRadius: "4px", border: "1px solid #a7f3d0" }}>
                        🔒 Auto-Identified
                      </span>
                    </div>
                    <div
                      style={{
                        padding: "9px 12px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                          {allocDean.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          {allocDean.roleTitle || "Dean Academic Affairs"} • {allocDean.email}
                        </div>
                      </div>
                      <Lock size={14} color="#64748b" />
                    </div>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "6px 0 0 0" }}>
                      The Dean is strictly associated with their designated School.
                    </p>
                  </div>
                </div>

                {/* Step 4 & 5: Department and Department HOD */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Step 4: Department Selection */}
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                      Step 4: School Department <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      value={allocDept}
                      onChange={(e) => handleAllocDeptChange(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#0f172a",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      {(examStore.getSchoolByNameOrId(allocSchool)?.departments || []).map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "6px 0 0 0" }}>
                      Only departments belonging to {examStore.getSchoolByNameOrId(allocSchool)?.code || "selected School"} are selectable. Cross-school mapping is prevented.
                    </p>
                  </div>

                  {/* Step 5: Department HOD (Auto-Identified) */}
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b" }}>
                        Step 5: Department HOD
                      </label>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "#059669", background: "#ecfdf5", padding: "2px 7px", borderRadius: "4px", border: "1px solid #a7f3d0" }}>
                        🔒 Auto-Identified
                      </span>
                    </div>
                    <div
                      style={{
                        padding: "9px 12px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                          {allocHod.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          {allocHod.roleTitle || "Professor & Head"} • {allocHod.email}
                        </div>
                      </div>
                      <Lock size={14} color="#64748b" />
                    </div>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "6px 0 0 0" }}>
                      The HOD is mapped exclusively to their designated Department.
                    </p>
                  </div>
                </div>

                {/* Step 6: Assigned Subject(s) - Dropdown Selection */}
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <label style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                      Step 6: Select Assigned Subject(s) / Exam Papers <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "2px 8px", borderRadius: "6px", border: "1px solid #c7d2fe" }}>
                      Dropdown Selection
                    </span>
                  </div>

                  {/* Dropdown Select */}
                  <select
                    value=""
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (!selected) return;
                      const currentList = allocSubjects
                        ? allocSubjects.split(",").map((s) => s.trim()).filter(Boolean)
                        : [];
                      if (!currentList.includes(selected)) {
                        const nextList = [...currentList, selected];
                        setAllocSubjects(nextList.join(", "));
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">-- Choose Subject from Dropdown to Allocate --</option>
                    {/* Department Specific Subjects */}
                    {examStore.getDepartmentSubjects(allocDept).map((s) => (
                      <option key={s.code} value={`${s.name} (${s.code})`}>
                        📘 {s.name} ({s.code})
                      </option>
                    ))}
                    {/* All Curriculum Subjects */}
                    <optgroup label="All Institutional Curriculum Papers">
                      {INSTITUTIONAL_SUBJECTS.map((s) => (
                        <option key={s.code} value={`${s.name} (${s.code})`}>
                          {s.name} ({s.code}) — {s.department.replace("Department of ", "")}
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  {/* Active Selected Subject Chips */}
                  {allocSubjects && allocSubjects.trim().length > 0 ? (
                    <div style={{ marginTop: "12px" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                        Selected Paper(s) for this Allocation:
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {allocSubjects
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((sub, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "#eff6ff",
                                color: "#1e40af",
                                border: "1px solid #bfdbfe",
                                borderRadius: "8px",
                                padding: "5px 10px",
                                fontSize: "12px",
                                fontWeight: 700,
                                boxShadow: "0 1px 3px rgba(37, 99, 235, 0.1)",
                              }}
                            >
                              <BookOpen size={13} color="#2563eb" />
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentList = allocSubjects
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  const nextList = currentList.filter((_, i) => i !== idx);
                                  setAllocSubjects(nextList.join(", "));
                                }}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "#ef4444",
                                  cursor: "pointer",
                                  padding: "0 2px",
                                  fontSize: "13px",
                                  fontWeight: 800,
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                title="Remove paper"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: "11.5px", color: "#64748b", margin: "8px 0 0 0" }}>
                      Select one or more subjects from the dropdown above (no typing required).
                    </p>
                  )}
                </div>

                {/* Validation Status Banner */}
                {allocErrors.length > 0 ? (
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: "12px",
                      background: "#fff1f2",
                      border: "1px solid #fecdd3",
                      color: "#be123c",
                      fontSize: "12.5px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong style={{ display: "block", marginBottom: "3px" }}>Allocation Validation Failed:</strong>
                      <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                        {allocErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      color: "#047857",
                      fontSize: "12.5px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Institutional Hierarchy Verified:</strong> {examStore.getSchoolByNameOrId(allocSchool)?.code || allocSchool} → {allocDean.name} → {allocDept} → {allocHod.name} → {facultyList.find((f) => f.id === allocFacultyId)?.name}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "10px",
                  background: "#ffffff",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsAllocateOpen(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAllocation}
                  disabled={allocErrors.length > 0}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 22px",
                    borderRadius: "10px",
                    border: "none",
                    background: allocErrors.length > 0 ? "#cbd5e1" : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: allocErrors.length > 0 ? "not-allowed" : "pointer",
                    boxShadow: allocErrors.length > 0 ? "none" : "0 4px 14px rgba(79, 70, 229, 0.35)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <UserCheck size={16} />
                  <span>Confirm & Allocate Faculty</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: DELETE CONFIRMATION ================= */}
        <DeleteModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteFaculty}
          itemName={deleteTarget?.name || "Staff Member"}
        />

        {/* Toast */}
        <ToastNotification
          message={toast.message}
          isOpen={toast.isOpen}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </RoleGuard>
  );
}
