"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Headphones,
  Info,
  Layers,
  School,
  ChevronDown,
  Eye,
  Trash2,
  Plus,
  Users,
  GraduationCap,
  Award,
  Mail,
  Phone,
  Building,
  Briefcase,
  BookCheck,
  Building2,
  Archive,
  Check,
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Send,
  AlertTriangle,
} from "lucide-react";
import { examStore, SubjectItem, StaffFacultyItem, SyllabusApprovalItem } from "../lib/examStore";
import { authStore, AuthUser, hasPermission } from "../lib/auth";
import RoleGuard from "../components/RoleGuard";
import {
  ViewModal,
  FormModal,
  DeleteModal,
  ToastNotification,
  FormFieldDef,
  CrudActionButtons,
} from "../components/CrudModal";
import PortalFooter from "../components/PortalFooter";
import PortalHeader from "../components/PortalHeader";

export default function DashboardPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("dashboard");


  // Store state
  const [subjectsData, setSubjectsData] = useState<SubjectItem[]>([]);
  const [facultyData, setFacultyData] = useState<StaffFacultyItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const u = authStore.getCurrentUser();
    return (u.role === "HOD" || u.role === "DEAN" || u.role === "COE") ? "staff-work-status" : "overview";
  });
  const [selectedFaculty, setSelectedFaculty] = useState<StaffFacultyItem | null>(null);
  const [facultySearch, setFacultySearch] = useState("");
  const [facultyDesigFilter, setFacultyDesigFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [shakeRowId, setShakeRowId] = useState<string | null>(null);

  const triggerRowShake = (id: string) => {
    setShakeRowId(id);
    setTimeout(() => setShakeRowId(null), 650);
  };
  const [viewSubject, setViewSubject] = useState<SubjectItem | null>(null);
  const [editSubject, setEditSubject] = useState<SubjectItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteSubject, setDeleteSubject] = useState<SubjectItem | null>(null);
  const [toast, setToast] = useState<{ message: string; isOpen: boolean; type?: "success" | "danger" }>({
    message: "",
    isOpen: false,
  });

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, isOpen: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isOpen: false })), 3000);
  };

  // Auth User State
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => authStore.getCurrentUser());
  const [syllabusApprovals, setSyllabusApprovals] = useState<SyllabusApprovalItem[]>([]);

  useEffect(() => {
    const handleAuth = () => {
      const u = authStore.getCurrentUser();
      setCurrentUser(u);
      setFacultyData(examStore.getStaffFaculty(u.role));
      setSyllabusApprovals(examStore.getSyllabusApprovals());
      if (u.role === "HOD" || u.role === "DEAN" || u.role === "COE") {
        setActiveTab("staff-work-status");
      }
    };
    handleAuth();
    window.addEventListener("exam-cell-auth-update", handleAuth);
    return () => window.removeEventListener("exam-cell-auth-update", handleAuth);
  }, []);

  useEffect(() => {
    const loadData = () => {
      setSubjectsData(examStore.getSubjects());
      setFacultyData(examStore.getStaffFaculty(currentUser.role));
      setSyllabusApprovals(examStore.getSyllabusApprovals());
    };
    loadData();
    window.addEventListener("exam-cell-store-update", loadData);
    return () => window.removeEventListener("exam-cell-store-update", loadData);
  }, [currentUser.role]);

  // Assigned subjects & syllabi for the logged-in staff member
  const staffSubjectInfo = useMemo(() => {
    return examStore.getStaffAssignedSubjects(currentUser.email, currentUser.name);
  }, [currentUser]);

  // Dynamic syllabus approval workflow items submitted by or related to logged-in user
  const userSyllabusList = useMemo(() => {
    const email = (currentUser.email || "").toLowerCase().trim();
    const name = (currentUser.name || "")
      .toLowerCase()
      .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s*/gi, "")
      .trim();

    return syllabusApprovals.filter((appr) => {
      const aEmail = (appr.submitterEmail || "").toLowerCase().trim();
      const aName = (appr.submittedBy || "")
        .toLowerCase()
        .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s*/gi, "")
        .trim();
      return (
        (email && aEmail === email) ||
        (name && (aName.includes(name) || name.includes(aName)))
      );
    });
  }, [syllabusApprovals, currentUser]);

  const activeApproval = userSyllabusList[0] || syllabusApprovals[0] || null;



  const handleCreateSubject = (values: Record<string, any>) => {
    examStore.saveSubject({
      name: values.name,
      code: values.code,
      credits: values.credits !== undefined ? Number(values.credits) : 3,
      totalQuestions: values.totalQuestions !== undefined ? Number(values.totalQuestions) : 0,
      status: values.status || "In Progress",
      school: values.school || "School of Media & Arts",
      department: values.department || "General",
      semester: values.semester || "Semester 1",
    });
    showToast(`Subject "${values.name}" created successfully!`);
    setIsAddOpen(false);
  };

  const handleUpdateSubject = (values: Record<string, any>) => {
    if (!editSubject) return;
    examStore.saveSubject({
      id: editSubject.id,
      name: values.name,
      code: values.code,
      credits: values.credits !== undefined ? Number(values.credits) : editSubject.credits,
      totalQuestions: values.totalQuestions !== undefined ? Number(values.totalQuestions) : editSubject.totalQuestions,
      approved: Number(values.approved || editSubject.approved || 0),
      verified: Number(values.verified || editSubject.verified || 0),
      pending: Number(values.pending || editSubject.pending || 0),
      status: values.status || editSubject.status,
      school: values.school || editSubject.school || "School of Media & Arts",
      department: values.department || editSubject.department,
      semester: values.semester || editSubject.semester,
    });
    showToast(`Subject "${values.name}" updated successfully!`);
    setEditSubject(null);
  };

  const handleDeleteSubject = () => {
    if (!deleteSubject) return;
    examStore.deleteSubject(deleteSubject.id);
    showToast(`Subject "${deleteSubject.name}" deleted permanently.`, "danger");
    setDeleteSubject(null);
  };

  const subjectFormFields: FormFieldDef[] = [
    {
      key: "school",
      label: "School / Faculty",
      type: "select",
      options: [
        { value: "School of Media & Arts", label: "School of Media & Arts" },
        { value: "School of Computer Science & IT", label: "School of Computer Science & IT" },
        { value: "School of Engineering", label: "School of Engineering" },
        { value: "School of Management & Commerce", label: "School of Management & Commerce" },
        { value: "School of Sciences & Humanities", label: "School of Sciences & Humanities" },
      ],
    },
    {
      key: "department",
      label: "Department",
      type: "select",
      options: [
        { value: "General", label: "General" },
        { value: "Visual Communication", label: "Visual Communication" },
        { value: "Viscom", label: "Viscom" },
        { value: "Visual Arts & VFX", label: "Visual Arts & VFX" },
        { value: "Film & Media", label: "Film & Media" },
        { value: "Computer Science", label: "Computer Science" },
        { value: "Information Technology", label: "Information Technology" },
        { value: "Electrical & Electronics", label: "Electrical & Electronics" },
        { value: "Mechanical Engineering", label: "Mechanical Engineering" },
        { value: "Management Studies", label: "Management Studies" },
      ],
    },
    {
      key: "semester",
      label: "Semester",
      type: "select",
      options: [
        { value: "Semester 0", label: "Semester 0" },
        { value: "Semester 1", label: "Semester 1" },
        { value: "Semester 2", label: "Semester 2" },
        { value: "Semester 3", label: "Semester 3" },
        { value: "Semester 4", label: "Semester 4" },
        { value: "Semester 5", label: "Semester 5" },
        { value: "Semester 6", label: "Semester 6" },
        { value: "Semester 7", label: "Semester 7" },
        { value: "Semester 8", label: "Semester 8" },
      ],
    },
    { key: "name", label: "Subject Name", placeholder: "e.g. Visual Communication", required: true, spanFull: true },
    { key: "code", label: "Subject Code", placeholder: "e.g. 24VFX101", required: true },
    { key: "credits", label: "Credits", type: "number", placeholder: "e.g. 4" },
    { key: "totalQuestions", label: "Total Questions", type: "number", placeholder: "e.g. 50" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "In Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
        { value: "Pending", label: "Pending" },
        { value: "Not Started", label: "Not Started" },
      ],
    },
  ];

  const totalQuestions = subjectsData.reduce((acc, s) => acc + Number(s.totalQuestions || s.total || 0), 0);
  const totalPending = subjectsData.reduce((acc, s) => acc + Number(s.pending || 0), 0);
  const totalApproved = subjectsData.reduce((acc, s) => acc + Number(s.approved || 0), 0);
  const totalVerified = subjectsData.reduce((acc, s) => acc + Number(s.verified || 0), 0);

  const getDesignationBadge = (desig: string) => {
    if (desig.toLowerCase().includes("head") || desig.toLowerCase().includes("hod")) {
      return {
        bg: "linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(99, 102, 241, 0.2) 100%)",
        border: "1px solid rgba(79, 70, 229, 0.35)",
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

  const totalFacultyCount = facultyData.length;
  const completedFacultyCount = facultyData.filter(
    (f) => getFacultyWorkStatus(f).overallStatus.label === "Completed"
  ).length;
  const progressingFacultyCount = facultyData.filter(
    (f) => getFacultyWorkStatus(f).overallStatus.label === "In Progress"
  ).length;
  const incompletedFacultyCount = facultyData.filter(
    (f) => getFacultyWorkStatus(f).overallStatus.label === "Action Needed"
  ).length;

  const filteredFacultyList = facultyData.filter((fac) => {
    const q = facultySearch.toLowerCase();
    const work = getFacultyWorkStatus(fac);

    const matchesSearch =
      fac.name.toLowerCase().includes(q) ||
      fac.designation.toLowerCase().includes(q) ||
      (fac.department || "").toLowerCase().includes(q) ||
      (fac.employeeId || "").toLowerCase().includes(q) ||
      (fac.email || "").toLowerCase().includes(q) ||
      (fac.assignedSubjects || []).some((s) => s.toLowerCase().includes(q));

    const matchesDesig =
      facultyDesigFilter === "All" ||
      fac.designation.toLowerCase().includes(facultyDesigFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      work.overallStatus.label.toLowerCase() === statusFilter.toLowerCase() ||
      work.syllabusStatus.state.toLowerCase() === statusFilter.toLowerCase() ||
      work.qbStatus.state.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDesig && matchesStatus;
  });

  const rawMenuItems: Array<{
    id: string;
    label: string;
    icon: any;
    route: string;
    badge?: string;
    hasArrow?: boolean;
  }> = [
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

  return (
    <RoleGuard route="/dashboard">
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
          {/* RGU Logo with 3D ambient glow */}
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

          {/* Navigation Items with 3D Glow Icons and Animations */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveMenu(item.id);
                    if (item.id === "staff-work-status" || item.id === "staff-faculty") {
                      setActiveTab("staff-work-status");
                    } else if (item.id === "dashboard") {
                      setActiveTab("overview");
                    } else if (item.route) {
                      router.push(item.route);
                    }
                  }}
                  className={`sidebar-btn-3d ${isActive ? "sidebar-btn-active" : "sidebar-btn-inactive"}`}
                >
                  <span className="nav-icon-3d" style={{ display: "flex", alignItems: "center" }}>
                    <IconComp size={18} />
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>

                  {item.badge && (
                    <span className="badge-neon-3d">
                      {item.badge}
                    </span>
                  )}

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

        {/* 3D Need Help Box with Floating Glowing Shield */}
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
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.25)";
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(99, 102, 241, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
            }}
          >
            <span>Contact Support</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </aside>

      {/* ================================= MAIN CONTENT ================================= */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        {/* Top Header */}
        <PortalHeader activeRoute="dashboard" />


        {/* Scrollable Dashboard Body */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", overflowX: "hidden", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          {/* Welcome Banner Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "0 0 6px 0",
                  letterSpacing: "-0.4px",
                }}
              >
                {(() => {
                  const hr = new Date().getHours();
                  const greeting = hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening";
                  const cleanName = (currentUser.name || "").replace(/^Mr\.\/Ms\.\s*/i, "");
                  return `${greeting}, ${cleanName} 👋`;
                })()}
              </h1>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                Logged in as <strong>{currentUser.roleTitle}</strong> ({currentUser.role}). Here&apos;s your workspace.
              </p>
            </div>

          </div>


          
{/* ================= 2. Central 4-Tier Verification & Approval Flow ================= */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "24px 28px",
              marginBottom: "24px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "22px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>Autonomous 4-Tier Verification & Approval Flow</span>
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                  Mandatory institutional progression protocol for syllabus validation and autonomous question paper release.
                </p>
              </div>

              {activeApproval ? (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#4338ca",
                    background: "#eef2ff",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    border: "1px solid #c7d2fe",
                  }}
                >
                  Active Tracking: {activeApproval.courseCode} ({activeApproval.courseName})
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    background: "#f1f5f9",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  Autonomous Clearance Protocol
                </span>
              )}
            </div>

            {/* 4-Tier Flow Nodes (Staff -> HOD -> Dean -> COE) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                padding: "10px 0 20px 0",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              {[
                {
                  id: "staff",
                  label: "Staff",
                  sublabel: "Course Faculty",
                  icon: FileText,
                  bg: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  shadow: "rgba(79, 70, 229, 0.35)",
                  isApproved: Boolean(activeApproval?.staffStatus === "Submitted" || (activeApproval && activeApproval.stage !== "staff")),
                },
                {
                  id: "hod",
                  label: "HOD",
                  sublabel: "Dept. Scrutiny",
                  icon: CheckCircle2,
                  bg: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                  shadow: "rgba(2, 132, 199, 0.35)",
                  isApproved: Boolean(activeApproval?.hodStatus === "Approved"),
                },
                {
                  id: "dean",
                  label: "Dean",
                  sublabel: "Academic Clearance",
                  icon: GraduationCap,
                  bg: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  shadow: "rgba(124, 58, 237, 0.35)",
                  isApproved: Boolean(activeApproval?.deanStatus === "Approved"),
                },
                {
                  id: "coe",
                  label: "COE",
                  sublabel: "Confidential Lock",
                  icon: Shield,
                  bg: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  shadow: "rgba(5, 150, 105, 0.35)",
                  isApproved: Boolean(activeApproval?.coeStatus === "Approved"),
                },
              ].map((tier, idx, arr) => {
                const Icon = tier.icon;
                return (
                  <React.Fragment key={tier.id}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minWidth: "130px",
                        flex: "1 1 0",
                        padding: "16px 12px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: tier.bg,
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "10px",
                          boxShadow: `0 4px 12px ${tier.shadow}`,
                        }}
                      >
                        <Icon size={22} />
                      </div>

                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>
                        {tier.label}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px", fontWeight: 500 }}>
                        {tier.sublabel}
                      </div>

                      {/* User Rule: strictly Approved with symbol OR Processing with symbol */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          background: tier.isApproved ? "#ecfdf5" : "#fffbeb",
                          color: tier.isApproved ? "#059669" : "#d97706",
                          border: tier.isApproved ? "1px solid #a7f3d0" : "1px solid #fde68a",
                        }}
                      >
                        <span>{tier.isApproved ? "Approved" : "Processing"}</span>
                        <span>{tier.isApproved ? "✓" : "⏳"}</span>
                      </div>
                    </div>

                    {idx < arr.length - 1 && (
                      <div
                        style={{
                          flex: "0 0 32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#94a3b8",
                        }}
                      >
                        <ArrowRight size={20} color="#94a3b8" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Strict Two-Item Legend (Approved / Processing) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px",
                paddingTop: "14px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  color: "#059669",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  padding: "4px 12px",
                  borderRadius: "16px",
                }}
              >
                <span>Approved</span>
                <span>✓</span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  color: "#d97706",
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  padding: "4px 12px",
                  borderRadius: "16px",
                }}
              >
                <span>Processing</span>
                <span>⏳</span>
              </div>
            </div>
          </div>

          {/* ================= Executive Metric Cards ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "18px",
              marginBottom: "24px",
            }}
          >
            {/* Card 1: Total Courses */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "20px 22px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                  color: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BookOpen size={24} />
              </div>
              <div>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Active Subjects
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1.2, margin: "2px 0" }}>
                  {subjectsData.length}
                </div>
                <div style={{ fontSize: "11.5px", color: "#16a34a", fontWeight: 600 }}>
                  Curriculum Units Loaded
                </div>
              </div>
            </div>

            {/* Card 2: Faculty Pool */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "20px 22px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Teaching Faculty
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1.2, margin: "2px 0" }}>
                  {totalFacultyCount}
                </div>
                <div style={{ fontSize: "11.5px", color: "#4f46e5", fontWeight: 600 }}>
                  {completedFacultyCount} Deliverables Cleared
                </div>
              </div>
            </div>

            {/* Card 3: Question Bank Pool */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "20px 22px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Database size={24} />
              </div>
              <div>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Question Bank Pool
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1.2, margin: "2px 0" }}>
                  {totalQuestions}
                </div>
                <div style={{ fontSize: "11.5px", color: "#0284c7", fontWeight: 600 }}>
                  {totalVerified} Verified for Paper Release
                </div>
              </div>
            </div>

            {/* Card 4: Approvals */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "20px 22px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #fdf4ff 0%, #f5d0fe 100%)",
                  color: "#a855f7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Clearance Pipeline
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1.2, margin: "2px 0" }}>
                  {syllabusApprovals.length}
                </div>
                <div style={{ fontSize: "11.5px", color: "#7c3aed", fontWeight: 600 }}>
                  4-Tier Autonomous Tracking
                </div>
              </div>
            </div>
          </div>

          {/* ================= Core Navigation & Action Hub ================= */}
          <div style={{ marginBottom: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Institutional Operations & Portals
                </h3>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0 0" }}>
                  Direct access to specialized departmental modules and scrutiny boards.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px",
              }}
            >
              {/* Portal 1: Staff Work Status (Dedicated) */}
              {(currentUser.role === "COE" || currentUser.role === "HOD" || currentUser.role === "DEAN") && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
                    border: "1.5px solid #c7d2fe",
                    borderRadius: "18px",
                    padding: "24px",
                    boxShadow: "0 4px 18px rgba(99, 102, 241, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: "-15px",
                      top: "-15px",
                      width: "80px",
                      height: "80px",
                      background: "rgba(99, 102, 241, 0.06)",
                      borderRadius: "50%",
                    }}
                  />
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                        }}
                      >
                        <Briefcase size={22} />
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#4338ca",
                          background: "#e0e7ff",
                          padding: "3px 10px",
                          borderRadius: "12px",
                        }}
                      >
                        {totalFacultyCount} Staff Monitored
                      </span>
                    </div>

                    <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                      Staff Work Status
                    </h4>
                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 18px 0", lineHeight: 1.45 }}>
                      Comprehensive roster tracking syllabus units completion (5/5), question bank upload progress (25/25), and faculty dossier review.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/staff-work-status")}
                    style={{
                      width: "100%",
                      padding: "11px 16px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    <span>Open Staff Work Status Roster</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* Portal 2: Verify Questions */}
              {(currentUser.role === "COE" || currentUser.role === "HOD" || currentUser.role === "DEAN") && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    padding: "24px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
                        }}
                      >
                        <Search size={22} />
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#0369a1",
                          background: "#e0f2fe",
                          padding: "3px 10px",
                          borderRadius: "12px",
                        }}
                      >
                        Scrutiny Protocol
                      </span>
                    </div>

                    <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                      Verify Questions
                    </h4>
                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 18px 0", lineHeight: 1.45 }}>
                      Review and scrutinize questions submitted by teaching faculty, verify Bloom&apos;s taxonomy weights, and approve for paper generation.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/verify-questions")}
                    style={{
                      width: "100%",
                      padding: "11px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      color: "#1e293b",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#0284c7";
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.borderColor = "#0284c7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.color = "#1e293b";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }}
                  >
                    <span>Review Questions</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* Portal 3: Academic Vault */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "24px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
                      }}
                    >
                      <Archive size={22} />
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#6d28d9",
                        background: "#ede9fe",
                        padding: "3px 10px",
                        borderRadius: "12px",
                      }}
                    >
                      Blueprints
                    </span>
                  </div>

                  <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                    Academic Vault
                  </h4>
                  <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 18px 0", lineHeight: 1.45 }}>
                    Central institutional repository for course syllabi, unit breakdowns, and question blueprints.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/academic-vault")}
                  style={{
                    width: "100%",
                    padding: "11px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    color: "#1e293b",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#7c3aed";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = "#7c3aed";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.color = "#1e293b";
                    e.currentTarget.style.borderColor = "#cbd5e1";
                  }}
                >
                  <span>Open Vault</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Portal 4: Approvals */}
              {(currentUser.role === "COE" || currentUser.role === "HOD" || currentUser.role === "DEAN") && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    padding: "24px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                        }}
                      >
                        <CheckSquare size={22} />
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#047857",
                          background: "#d1fae5",
                          padding: "3px 10px",
                          borderRadius: "12px",
                        }}
                      >
                        Approval Matrix
                      </span>
                    </div>

                    <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                      Clearance & Approvals
                    </h4>
                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 18px 0", lineHeight: 1.45 }}>
                      Departmental sign-offs, Dean academic clearance, and COE confidential lock protocols.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/approval")}
                    style={{
                      width: "100%",
                      padding: "11px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      color: "#1e293b",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#059669";
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.borderColor = "#059669";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.color = "#1e293b";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }}
                  >
                    <span>View Approvals</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================= Active Academic Deliverables Table ================= */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "24px 28px",
              marginBottom: "32px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>Academic Course Registry & Verification Deliverables</span>
                </h3>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: "3px 0 0 0" }}>
                  Active subjects undergoing autonomous 4-tier validation and question pool certification.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/subjects")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#334155",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
              >
                <span>View All Courses</span>
                <ChevronRight size={15} />
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Course Code & Subject
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Department / Semester
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>
                      Credits
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Questions Progress
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>
                      Status
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subjectsData.slice(0, 6).map((sub) => {
                    const isCompleted = sub.status === "Completed";
                    const isProgress = sub.status === "In Progress";
                    return (
                      <tr
                        key={sub.id}
                        style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fbfcfe")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 800,
                                background: "#eff6ff",
                                color: "#2563eb",
                                border: "1px solid #bfdbfe",
                                padding: "3px 7px",
                                borderRadius: "6px",
                                fontFamily: "monospace",
                              }}
                            >
                              {sub.code}
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                              {sub.name || (sub as any).subject}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "12.5px", color: "#475569" }}>
                          <div>{sub.department || "Visual Communication"}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{sub.semester || "Semester 3"}</div>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center", fontSize: "12.5px", fontWeight: 700, color: "#334155" }}>
                          {sub.credits || 3}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ minWidth: "140px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                              <span>{sub.verified || 0} / {sub.totalQuestions || 25} Verified</span>
                              <span style={{ fontWeight: 700 }}>
                                {Math.min(100, Math.round(((sub.verified || 0) / (sub.totalQuestions || 25)) * 100))}%
                              </span>
                            </div>
                            <div style={{ width: "100%", height: "6px", borderRadius: "999px", background: "#f1f5f9", overflow: "hidden" }}>
                              <div
                                style={{
                                  width: `${Math.min(100, Math.round(((sub.verified || 0) / (sub.totalQuestions || 25)) * 100))}%`,
                                  height: "100%",
                                  borderRadius: "999px",
                                  background: isCompleted ? "#10b981" : "#3b82f6",
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 10px",
                              borderRadius: "16px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: isCompleted ? "#ecfdf5" : isProgress ? "#eff6ff" : "#fffbeb",
                              color: isCompleted ? "#059669" : isProgress ? "#2563eb" : "#d97706",
                              border: isCompleted ? "1px solid #a7f3d0" : isProgress ? "1px solid #bfdbfe" : "1px solid #fde68a",
                            }}
                          >
                            <span>{sub.status}</span>
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => setViewSubject(sub)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: "7px",
                              border: "1px solid #e0e7ff",
                              background: "#eef2ff",
                              color: "#4f46e5",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Eye size={12} />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Support Banner & Footer */}
          <PortalFooter />
        </main>
      </div>

      {/* View Modal */}
      {viewSubject && (
        <ViewModal
          isOpen={!!viewSubject}
          onClose={() => setViewSubject(null)}
          title={viewSubject.name || (viewSubject as any).subject}
          subtitle={`Subject Code: ${viewSubject.code}`}
          badge={{
            label: viewSubject.status,
            bg: viewSubject.status === "Completed" ? "#dcfce7" : "#e0e7ff",
            color: viewSubject.status === "Completed" ? "#16a34a" : "#4338ca",
          }}
          fields={[
            { label: "Subject Name", value: viewSubject.name || (viewSubject as any).subject, spanFull: true },
            { label: "Subject Code", value: viewSubject.code },
            { label: "Credits", value: `${viewSubject.credits || 3} Credits` },
            { label: "Total Questions", value: viewSubject.totalQuestions ?? (viewSubject as any).total ?? 0 },
            { label: "Verified Questions", value: viewSubject.verified ?? 0 },
            { label: "Approved Questions", value: viewSubject.approved ?? 0 },
            { label: "Pending Questions", value: viewSubject.pending ?? 0 },
            { label: "Department", value: viewSubject.department || "Visual Communication" },
            { label: "Semester", value: viewSubject.semester || "Semester 3" },
          ]}
          onEdit={() => {
            setEditSubject(viewSubject);
            setViewSubject(null);
          }}
          onDelete={() => {
            setDeleteSubject(viewSubject);
            setViewSubject(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {editSubject && (
        <FormModal
          isOpen={!!editSubject}
          onClose={() => setEditSubject(null)}
          title="Edit Subject"
          subtitle={`Modifying details for ${editSubject.code}`}
          fields={subjectFormFields}
          initialValues={{
            name: editSubject.name || (editSubject as any).subject,
            code: editSubject.code,
            credits: editSubject.credits || 3,
            totalQuestions: editSubject.totalQuestions || "",
            status: editSubject.status,
            department: editSubject.department || "Visual Communication",
            semester: editSubject.semester || "Semester 3",
          }}
          onSubmit={handleUpdateSubject}
          submitLabel="Save Changes"
        />
      )}

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Subject"
        subtitle="Create a new subject in the Exam Cell registry"
        fields={subjectFormFields}
        initialValues={{
          name: "",
          code: "",
          credits: 4,
          totalQuestions: "",
          status: "In Progress",
          department: "Visual Communication",
          semester: "Semester 3",
        }}
        onSubmit={handleCreateSubject}
        submitLabel="Create Subject"
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteSubject}
        onClose={() => setDeleteSubject(null)}
        title="Delete Subject"
        itemName={deleteSubject ? `${deleteSubject.name || (deleteSubject as any).subject} (${deleteSubject.code})` : ""}
        onConfirm={handleDeleteSubject}
      />

      {/* Toast Notification */}
      <ToastNotification
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Staff / Faculty Dossier View Modal */}
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
    </div>
    </RoleGuard>
  );
}

