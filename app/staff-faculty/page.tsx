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
} from "lucide-react";
import { examStore, StaffFacultyItem } from "../lib/examStore";
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffFacultyItem | null>(null);
  const [toast, setToast] = useState<{ message: string; isOpen: boolean; type?: "success" | "danger" }>({
    message: "",
    isOpen: false,
  });

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
    const syllabusUnits =
      liveUnits.length > 0
        ? liveUnits.length
        : typeof fac.syllabusCount === "number"
        ? fac.syllabusCount
        : fac.assignedSyllabus && fac.assignedSyllabus.length > 0
        ? fac.assignedSyllabus.length
        : 5;
    const expectedUnits = 5;
    const syllabusPct = Math.min(100, Math.round((syllabusUnits / expectedUnits) * 100));

    const liveQuestions = allQuestions.filter((q) => subMatches(q.subject));
    const questionsCount =
      liveQuestions.length > 0
        ? liveQuestions.length
        : typeof fac.questionsContributed === "number"
        ? fac.questionsContributed
        : 0;
    const expectedQuestions = 25;
    const questionsPct = Math.min(100, Math.round((questionsCount / expectedQuestions) * 100));

    const verifiedCount =
      liveQuestions.length > 0
        ? liveQuestions.filter((q) => q.status === "Approved" || q.status === "Verified").length
        : (fac.pendingReviews === 0 && questionsCount >= 25)
        ? 25
        : Math.max(0, questionsCount - (fac.pendingReviews || 0));

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
      (fac.employeeId || "").toLowerCase().includes(q) ||
      (fac.email || "").toLowerCase().includes(q) ||
      (fac.assignedSubjects || []).some((s) => s.toLowerCase().includes(q));

    const matchesDesignation =
      designationFilter === "All" ||
      fac.designation.toLowerCase().includes(designationFilter.toLowerCase());

    const matchesDept = deptFilter === "All" || fac.department === deptFilter;

    const matchesStatus =
      statusFilter === "All" ||
      work.overallStatus.label.toLowerCase() === statusFilter.toLowerCase() ||
      work.syllabusStatus.state.toLowerCase() === statusFilter.toLowerCase() ||
      work.qbStatus.state.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDesignation && matchesDept && matchesStatus;
  });

  // Extract unique departments for filter
  const departments = Array.from(new Set(facultyList.map((f) => f.department)));

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
    { key: "department", label: "Department", placeholder: "e.g. Visual Communication & VFX", required: true },
    { key: "email", label: "Email Address", placeholder: "e.g. faculty@rathinam.in", required: true },
    { key: "phone", label: "Phone Number", placeholder: "e.g. +91 98765 00000" },
    { key: "qualification", label: "Qualification", placeholder: "e.g. M.Sc., Ph.D., UGC-NET" },
    { key: "experience", label: "Experience", placeholder: "e.g. 5 Years" },
    { key: "assignedSubjects", label: "Assigned Subjects (comma-separated)", placeholder: "e.g. 3D Modeling, Color Theory", spanFull: true },
  ];

  const handleCreateFaculty = (values: Record<string, any>) => {
    const subjectsArray = values.assignedSubjects
      ? String(values.assignedSubjects).split(",").map((s) => s.trim()).filter(Boolean)
      : ["Visual Communication"];

    examStore.saveStaffFaculty({
      name: values.name,
      designation: values.designation,
      employeeId: values.employeeId,
      department: values.department,
      email: values.email,
      phone: values.phone || "+91 98765 00000",
      qualification: values.qualification || "Postgraduate",
      experience: values.experience || "3 Years",
      assignedSubjects: subjectsArray,
      reportingTo: currentUser.role === "HOD" ? "HOD" : "DEAN",
      reportingOfficerName: `${currentUser.name} (${currentUser.roleTitle})`,
      status: "Active",
      avatarBg: "linear-gradient(135deg, #4f46e5, #3b82f6)",
      questionsContributed: 0,
      pendingReviews: 0,
    });

    showToast(`Staff "${values.name}" added successfully!`);
    setIsAddOpen(false);
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

              {/* Right Controls: Designation + View Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
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
                      <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedFaculty(fac)}
                          style={{
                            flex: 1,
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

                            {/* Column 3: Assigned Subject */}
                            <td style={{ padding: "16px 18px" }}>
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
                                  {fac.assignedSubjects[0] || "General Subject"}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
                                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                                    {fac.department}
                                  </span>
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
            title="Staff / Faculty Academic Dossier"
            subtitle={`${selectedFaculty.name} — ${selectedFaculty.designation}`}
            data={{
              "Full Name": selectedFaculty.name,
              "Official Designation": selectedFaculty.designation,
              "Employee ID / Code": selectedFaculty.employeeId,
              Department: selectedFaculty.department,
              "Reporting Officer": selectedFaculty.reportingOfficerName,
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
