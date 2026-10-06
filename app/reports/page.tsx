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
  Settings,
  Briefcase,
  Printer,
  Shield,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Headphones,
  Info,
  School,
  SlidersHorizontal,
  Clock,
  ThumbsUp,
  RefreshCw,
  XCircle,
  Users,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  File,
  User,
  Layers,
  Plus,
  Trash2,
  Building2,
  Archive,
  LayoutGrid,
  ListFilter,
} from "lucide-react";
import { examStore, SubjectItem } from "../lib/examStore";
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
import Pagination from "../components/Pagination";

export default function ReportsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("reports");
  const STORAGE_KEY = "exam_cell_reports_filters";

  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [trendView, setTrendView] = useState("Day");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  // Date Range state
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString("default", { month: "short" });
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    return `01 ${month} ${year} - ${lastDay} ${month} ${year}`;
  };

  const getTodayFormatted = () => {
    const now = new Date();
    return now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const [dateRange, setDateRange] = useState<string>(() => getCurrentMonthRange());
  const [showManualPicker, setShowManualPicker] = useState(false);
  const [manualStartDate, setManualStartDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [manualEndDate, setManualEndDate] = useState<string>(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  });

  // Restore saved filters from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.subject !== undefined) setSelectedSubject(parsed.subject);
          if (parsed.unit !== undefined) setSelectedUnit(parsed.unit);
          if (parsed.type !== undefined) setSelectedType(parsed.type);
          if (parsed.status !== undefined) setSelectedStatus(parsed.status);
          if (parsed.dateRange !== undefined) setDateRange(parsed.dateRange);
        }
      } catch (e) {
        console.error("Failed to load saved report filters:", e);
      } finally {
        setFiltersLoaded(true);
      }
    }
  }, []);

  // Save filters to localStorage whenever user changes them
  useEffect(() => {
    if (!filtersLoaded) return;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            subject: selectedSubject,
            unit: selectedUnit,
            type: selectedType,
            status: selectedStatus,
            dateRange: dateRange,
          })
        );
      } catch (e) {
        // ignore
      }
    }
  }, [selectedSubject, selectedUnit, selectedType, selectedStatus, dateRange, filtersLoaded]);

  // CRUD & Store state
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState(examStore.getStats());
  const [viewingSubject, setViewingSubject] = useState<SubjectItem | null>(null);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectItem | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => examStore.getLastUpdated());

  useEffect(() => {
    const loadAll = () => {
      setSubjects(examStore.getSubjects());
      setQuestions(examStore.getQuestions());
      setUsers(examStore.getUsers());
      setStats(examStore.getStats());
      setLastUpdatedTime(examStore.getLastUpdated());
    };
    loadAll();
    window.addEventListener("exam-cell-store-update", loadAll);
    return () => window.removeEventListener("exam-cell-store-update", loadAll);
  }, []);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(subjects.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedSubjects = subjects.slice(startIndex, startIndex + itemsPerPage);

  const handleExportSummary = () => {
    const summaryData = [
      { Metric: "Total Questions", Value: stats.totalQuestions },
      { Metric: "Approved Questions", Value: stats.approvedQuestions },
      { Metric: "Pending Questions", Value: stats.pendingQuestions },
      { Metric: "Verified Questions", Value: stats.verifiedQuestions },
      { Metric: "Total Subjects", Value: stats.totalSubjects },
      { Metric: "Total Units", Value: stats.totalUnits },
      { Metric: "Total Users", Value: stats.totalUsers },
    ];
    examStore.exportToCsv("exam_summary_report.csv", summaryData);
    triggerToast("Questions Summary Report downloaded as CSV!", "success");
  };

  const handleExportDetailedQuestions = () => {
    const rows = questions.map((q) => ({
      ID: q.id,
      Question: q.question,
      Subject: q.subject,
      Unit: q.unit,
      Topic: q.topic,
      Type: q.type,
      Difficulty: q.difficulty,
      Marks: q.marks,
      Status: q.status,
    }));
    examStore.exportToCsv("questions_detailed_report.csv", rows);
    triggerToast("Questions Detailed Report downloaded as CSV!", "success");
  };

  const handleExportSubjectWise = () => {
    const rows = subjects.map((s) => ({
      ID: s.id,
      SubjectName: s.name,
      Code: s.code,
      Semester: s.semester,
      TotalQuestions: s.totalQuestions,
      Approved: s.approved,
      Pending: s.pending,
      Status: s.status,
    }));
    examStore.exportToCsv("subject_wise_report.csv", rows);
    triggerToast("Subject Wise Report downloaded as CSV!", "success");
  };

  const handleExportUserActivity = () => {
    const rows = users.map((u) => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Department: u.dept,
      Status: u.status,
    }));
    examStore.exportToCsv("user_activity_report.csv", rows);
    triggerToast("User Activity Report downloaded as CSV!", "success");
  };

  // Auth User State
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => authStore.getCurrentUser());

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

  const handleReset = () => {
    setSelectedSubject("all");
    setSelectedUnit("all");
    setSelectedType("all");
    setSelectedStatus("all");
    setDateRange(getCurrentMonthRange());
    setShowManualPicker(false);
  };

  const reportSubjectFields: FormFieldDef[] = [
    { name: "name", label: "Subject Name", type: "text", required: true },
    { name: "code", label: "Subject Code", type: "text", required: true },
    { name: "totalQuestions", label: "Target Total Questions", type: "number", required: true },
    { name: "approved", label: "Approved Target", type: "number", required: true },
    { name: "pending", label: "Pending Allowed", type: "number", required: true },
    {
      name: "status",
      label: "Audit Status",
      type: "select",
      options: ["In Progress", "Completed", "Pending", "Archived"],
      required: true,
    },
  ];

  return (
    <RoleGuard route="/reports">
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
          <div style={{ padding: "6px 10px 24px 10px" }}>
            <img
              src="/images/rgu-logo.png"
              alt="Rathinam Global (Deemed to be University)"
              style={{ maxHeight: "38px", width: "auto", objectFit: "contain" }}
            />
          </div>

          {/* Navigation Items */}
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
                    if (item.route) router.push(item.route);
                  }}
                  className={`sidebar-btn-3d ${isActive ? "sidebar-btn-active" : "sidebar-btn-inactive"}`}
                >
                  <IconComp
                    size={18}
                    className="nav-icon-3d"
                    style={{
                      filter: isActive
                        ? "drop-shadow(0 0 6px rgba(255,255,255,0.8))"
                        : "none",
                      transition: "filter 0.2s ease",
                    }}
                  />
                  <span style={{ flex: 1, letterSpacing: "0.2px" }}>{item.label}</span>

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
            <Shield
              size={19}
              style={{
                filter: "drop-shadow(0 0 6px rgba(96, 165, 250, 0.8))",
              }}
            />
          </div>
          <strong
            style={{
              display: "block",
              color: "#ffffff",
              fontSize: "13.5px",
              marginBottom: "4px",
              fontWeight: 700,
            }}
          >
            Need Help?
          </strong>
          <p
            style={{
              fontSize: "11.5px",
              color: "#94a3b8",
              lineHeight: 1.4,
              margin: "0 0 14px 0",
            }}
          >
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
              border: "1px solid rgba(255, 255, 255, 0.14)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.16)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
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
        <PortalHeader activeRoute="reports" />


        {/* Scrollable Main Content */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", overflowX: "hidden", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          {/* Header & University Badge */}
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
                  fontSize: "25px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "0 0 6px 0",
                  letterSpacing: "-0.4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>Reports</span>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
                    color: "#ffffff",
                    animation: "float3D 4s infinite ease-in-out",
                  }}
                >
                  <BarChart2 size={19} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9)) drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))" }} />
                </div>
              </h1>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                View detailed analytics and insights about questions and exam activities.
              </p>
            </div>

          </div>

          {/* ================= Top 4 Metric Cards (Matching Bulk Upload 3D Glow) ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "18px",
              marginBottom: "28px",
            }}
          >
            {/* Metric 1: Total Questions - 3D Blue with Floating Glow FileText */}
            <div className="stat-card-3d stat-card-blue">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div className="stat-icon-3d-box glow-blue">
                  <FileText
                    size={23}
                    color="#ffffff"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(59, 130, 246, 0.8))",
                    }}
                  />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={14} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "4px", fontWeight: 500 }}>
                Total Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {stats.totalQuestions}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Across All Subjects</div>
            </div>

            {/* Metric 2: Approved Questions - 3D Cyan with Floating Glow ThumbsUp */}
            <div className="stat-card-3d stat-card-cyan">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div className="stat-icon-3d-box glow-cyan">
                  <ThumbsUp
                    size={23}
                    color="#ffffff"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(6, 182, 212, 0.8))",
                    }}
                  />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={14} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "4px", fontWeight: 500 }}>
                Approved Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {stats.approvedQuestions}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({stats.totalQuestions > 0 ? ((stats.approvedQuestions / stats.totalQuestions) * 100).toFixed(1) : "0"}%)
              </div>
            </div>

            {/* Metric 3: Total Subjects - 3D Emerald with Floating Glow BookOpen */}
            <div className="stat-card-3d stat-card-emerald">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div className="stat-icon-3d-box glow-emerald">
                  <BookOpen
                    size={23}
                    color="#ffffff"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(52, 211, 153, 0.8))",
                    }}
                  />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={14} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "4px", fontWeight: 500 }}>
                Total Subjects
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {stats.totalSubjects}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Active Curriculum Subjects</div>
            </div>

            {/* Metric 4: Total Users - 3D Orange with Floating Glow Users */}
            <div className="stat-card-3d stat-card-orange">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div className="stat-icon-3d-box glow-orange">
                  <Users
                    size={23}
                    color="#ffffff"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(251, 146, 60, 0.8))",
                    }}
                  />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={14} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "4px", fontWeight: 500 }}>
                Total Users
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {stats.totalUsers}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Active Portal Staff</div>
            </div>
          </div>

          {/* ================= Main Content Container (Full Width) ================= */}
          <div style={{ width: "100%" }}>
            {/* ================= LEFT WIDE COLUMN: Filters, 2 Charts, Table ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Card 1: Report Filters */}
              <div
                className="widget-card-3d"
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  border: "1px solid #e2e8f0",
                  padding: "22px 24px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div className="action-mini-icon-blue" style={{ width: "34px", height: "34px" }}>
                    <Filter size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                      Report Filters
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Filter exam metrics across date range, subjects, unit, and verification status
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.9fr 1fr 1fr 1fr 1fr auto auto",
                    gap: "10px",
                    alignItems: "flex-end",
                  }}
                >
                  {/* Date Range with Manual Edit & Current Date */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <label style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>
                        Date Range
                      </label>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            const today = getTodayFormatted();
                            setDateRange(`${today} - ${today}`);
                            triggerToast(`Updated to Current Date: ${today}`, "success");
                          }}
                          title="Click to set Current Date"
                          style={{
                            fontSize: "10px",
                            padding: "2px 7px",
                            borderRadius: "5px",
                            border: "1px solid #3b82f6",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          ⚡ Current Date
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const m = getCurrentMonthRange();
                            setDateRange(m);
                            triggerToast(`Updated to Current Month: ${m}`, "success");
                          }}
                          title="Click to set Current Month"
                          style={{
                            fontSize: "10px",
                            padding: "2px 7px",
                            borderRadius: "5px",
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#475569",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          Current Month
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowManualPicker(!showManualPicker)}
                          title="Pick date range manually"
                          style={{
                            fontSize: "10px",
                            padding: "2px 7px",
                            borderRadius: "5px",
                            border: showManualPicker ? "1px solid #10b981" : "1px solid #cbd5e1",
                            background: showManualPicker ? "#ecfdf5" : "#ffffff",
                            color: showManualPicker ? "#047857" : "#475569",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          ✏️ Manual
                        </button>
                      </div>
                    </div>

                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        placeholder="e.g. 01 Aug 2024 - 31 Aug 2024"
                        style={{
                          width: "100%",
                          padding: "7px 32px 7px 10px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          fontSize: "11.5px",
                          color: "#0f172a",
                          fontWeight: 600,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowManualPicker(!showManualPicker)}
                        style={{
                          position: "absolute",
                          right: "6px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "3px",
                          display: "flex",
                          alignItems: "center",
                          color: "#64748b",
                        }}
                        title="Click to pick dates manually"
                      >
                        <Calendar size={14} />
                      </button>
                    </div>

                    {showManualPicker && (
                      <div
                        style={{
                          marginTop: "6px",
                          padding: "8px 10px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                          <span style={{ fontSize: "9.5px", color: "#64748b", fontWeight: 700 }}>From:</span>
                          <input
                            type="date"
                            value={manualStartDate}
                            onChange={(e) => setManualStartDate(e.target.value)}
                            style={{
                              padding: "4px 6px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "11px",
                              color: "#0f172a",
                              background: "#ffffff",
                              width: "100%",
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                          <span style={{ fontSize: "9.5px", color: "#64748b", fontWeight: 700 }}>To:</span>
                          <input
                            type="date"
                            value={manualEndDate}
                            onChange={(e) => setManualEndDate(e.target.value)}
                            style={{
                              padding: "4px 6px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "11px",
                              color: "#0f172a",
                              background: "#ffffff",
                              width: "100%",
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (manualStartDate && manualEndDate) {
                              const f1 = new Date(manualStartDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                              const f2 = new Date(manualEndDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                              const formatted = `${f1} - ${f2}`;
                              setDateRange(formatted);
                              setShowManualPicker(false);
                              triggerToast(`Date updated: ${formatted}`, "success");
                            }
                          }}
                          style={{
                            marginTop: "14px",
                            padding: "5px 10px",
                            background: "#2563eb",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                      Subject
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 22px 7px 8px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "11.5px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                        }}
                      >
                        <option value="all">All Subjects</option>
                        <option value="vfx">Viscom & VFX</option>
                      </select>
                      <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  {/* Unit */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                      Unit
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 22px 7px 8px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "11.5px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                        }}
                      >
                        <option value="all">All Units</option>
                        <option value="u1">Unit I</option>
                        <option value="u2">Unit II</option>
                      </select>
                      <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  {/* Question Type */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                      Question Type
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 22px 7px 8px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "11.5px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                        }}
                      >
                        <option value="all">All Types</option>
                        <option value="mcq">MCQ</option>
                        <option value="desc">Descriptive</option>
                      </select>
                      <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                      Status
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 22px 7px 8px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "11.5px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                        }}
                      >
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                      </select>
                      <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="filter-btn-3d"
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#475569",
                        cursor: "pointer",
                      }}
                    >
                      Reset
                    </button>
                  </div>

                  {/* Apply Filters Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => triggerToast("Report filters applied successfully!", "success")}
                      className="filter-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 6px 16px rgba(79, 70, 229, 0.35)",
                      }}
                    >
                      <Filter size={13} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }} />
                      <span>Apply Filters</span>
                    </button>
                  </div>

                  {/* Add Subject Target Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsAddingSubject(true)}
                      className="filter-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 6px 16px rgba(16, 185, 129, 0.35)",
                      }}
                    >
                      <Plus size={13} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }} />
                      <span>Add Target Report</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Two Charts (Questions Trend & Questions by Status) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1.15fr",
                  gap: "20px",
                }}
              >
                {/* Chart 1: Questions Trend */}
                <div
                  className="widget-card-3d"
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    border: "1px solid #e2e8f0",
                    padding: "20px 22px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-purple" style={{ width: "32px", height: "32px" }}>
                        <BarChart2 size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                          Questions Trend
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>Daily question creation & verification flow</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>View by:</span>
                      <div style={{ position: "relative" }}>
                        <select
                          value={trendView}
                          onChange={(e) => setTrendView(e.target.value)}
                          style={{
                            padding: "4px 22px 4px 8px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "#ffffff",
                            fontSize: "11.5px",
                            color: "#334155",
                            appearance: "none",
                            outline: "none",
                          }}
                        >
                          <option value="Day">Day</option>
                          <option value="Week">Week</option>
                          <option value="Month">Month</option>
                        </select>
                        <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                    </div>
                  </div>

                  {/* Chart Legend */}
                  <div style={{ display: "flex", gap: "16px", marginBottom: "14px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 8px rgba(99, 102, 241, 0.6)" }} />
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Total Questions</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)" }} />
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Approved</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)" }} />
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Rejected</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#f97316", boxShadow: "0 0 8px rgba(249, 115, 22, 0.6)" }} />
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Returned for Edit</span>
                    </div>
                  </div>

                  {/* SVG Multi-Line Chart with glowing drop-shadows */}
                  <div style={{ width: "100%", height: "200px" }}>
                    <svg viewBox="0 0 460 200" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                      <defs>
                        <filter id="glow-purple-line" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.45" />
                        </filter>
                        <filter id="glow-green-line" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.45" />
                        </filter>
                      </defs>

                      {/* Horizontal Grid lines and Y labels */}
                      <line x1="30" y1="20" x2="450" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <text x="20" y="24" fontSize="10" fill="#94a3b8" textAnchor="end">100</text>

                      <line x1="30" y1="55" x2="450" y2="55" stroke="#f1f5f9" strokeWidth="1" />
                      <text x="20" y="59" fontSize="10" fill="#94a3b8" textAnchor="end">80</text>

                      <line x1="30" y1="90" x2="450" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                      <text x="20" y="94" fontSize="10" fill="#94a3b8" textAnchor="end">60</text>

                      <line x1="30" y1="125" x2="450" y2="125" stroke="#f1f5f9" strokeWidth="1" />
                      <text x="20" y="129" fontSize="10" fill="#94a3b8" textAnchor="end">40</text>

                      <line x1="30" y1="160" x2="450" y2="160" stroke="#f1f5f9" strokeWidth="1" />
                      <text x="20" y="164" fontSize="10" fill="#94a3b8" textAnchor="end">20</text>

                      <line x1="30" y1="180" x2="450" y2="180" stroke="#e2e8f0" strokeWidth="1" />
                      <text x="20" y="184" fontSize="10" fill="#94a3b8" textAnchor="end">0</text>

                      {/* X labels */}
                      <text x="40" y="196" fontSize="9.5" fill="#94a3b8" textAnchor="middle">01 Aug</text>
                      <text x="105" y="196" fontSize="9.5" fill="#94a3b8" textAnchor="middle">06 Aug</text>
                      <text x="170" y="196" fontSize="9.5" fill="#94a3b8" textAnchor="middle">11 Aug</text>
                      <text x="235" y="196" fontSize="9.5" fill="#94a3b8" textAnchor="middle">16 Aug</text>
                      <text x="300" y="196" fontSize="9.5" fill="#94a3b8" textAnchor="middle">21 Aug</text>
                      <text x="365" y="196" fontSize="9.5" fill="#94a3b8" textAnchor="middle">26 Aug</text>
                      <text x="430" y="196" fontSize="9.5" fill="#94a3b8" textAnchor="middle">31 Aug</text>

                      {/* Purple Line: Total Questions */}
                      <path
                        d="M 40 145 Q 72 110, 105 112 T 170 85 T 235 55 T 300 95 T 365 110 T 430 40"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2.8"
                        filter="url(#glow-purple-line)"
                      />
                      {[
                        [40, 145], [105, 112], [170, 85], [235, 55], [300, 95], [365, 110], [430, 40]
                      ].map(([cx, cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r="3.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                      ))}

                      {/* Green Line: Approved */}
                      <path
                        d="M 40 162 Q 72 142, 105 130 T 170 115 T 235 90 T 300 118 T 365 125 T 430 75"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.2"
                        filter="url(#glow-green-line)"
                      />
                      {[
                        [40, 162], [105, 130], [170, 115], [235, 90], [300, 118], [365, 125], [430, 75]
                      ].map(([cx, cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r="3" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                      ))}

                      {/* Orange Line: Returned for Edit */}
                      <path
                        d="M 40 172 Q 72 165, 105 160 T 170 150 T 235 142 T 300 160 T 365 155 T 430 135"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                      />
                      {[
                        [40, 172], [105, 160], [170, 150], [235, 142], [300, 160], [365, 155], [430, 135]
                      ].map(([cx, cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#f97316" />
                      ))}

                      {/* Red Line: Rejected */}
                      <path
                        d="M 40 178 Q 72 176, 105 174 T 170 172 T 235 174 T 300 176 T 365 175 T 430 174"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                      />
                      {[
                        [40, 178], [105, 174], [170, 172], [235, 174], [300, 176], [365, 175], [430, 174]
                      ].map(([cx, cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#ef4444" />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Chart 2: Questions by Status (Donut) */}
                <div
                  className="widget-card-3d"
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    border: "1px solid #e2e8f0",
                    padding: "20px 22px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <div className="action-mini-icon-green" style={{ width: "32px", height: "32px" }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                        Questions by Status
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Current verification breakdown</div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    {/* SVG Donut */}
                    <div style={{ position: "relative", width: "135px", height: "135px", flexShrink: 0 }}>
                      <svg width="135" height="135" viewBox="0 0 135 135" style={{ transform: "rotate(-90deg)", filter: "drop-shadow(0 4px 12px rgba(16, 185, 129, 0.15))" }}>
                        {/* Background */}
                        <circle cx="67.5" cy="67.5" r="48" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
                        {/* Green Approved: 62.4% (188 of 301.6) */}
                        <circle
                          cx="67.5"
                          cy="67.5"
                          r="48"
                          fill="transparent"
                          stroke="#10b981"
                          strokeWidth="18"
                          strokeDasharray="188 301.6"
                          strokeDashoffset="0"
                        />
                        {/* Orange Pending: 33.3% (100.5 of 301.6) */}
                        <circle
                          cx="67.5"
                          cy="67.5"
                          r="48"
                          fill="transparent"
                          stroke="#f97316"
                          strokeWidth="18"
                          strokeDasharray="100.5 301.6"
                          strokeDashoffset="-188"
                        />
                        {/* Blue Returned: 3.5% (10.5 of 301.6) */}
                        <circle
                          cx="67.5"
                          cy="67.5"
                          r="48"
                          fill="transparent"
                          stroke="#0284c7"
                          strokeWidth="18"
                          strokeDasharray="10.5 301.6"
                          strokeDashoffset="-288.5"
                        />
                        {/* Red Rejected: 0.7% (2.5 of 301.6) */}
                        <circle
                          cx="67.5"
                          cy="67.5"
                          r="48"
                          fill="transparent"
                          stroke="#ef4444"
                          strokeWidth="18"
                          strokeDasharray="2.5 301.6"
                          strokeDashoffset="-299"
                        />
                      </svg>

                      {/* Donut Center */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "radial-gradient(circle, #ffffff 60%, rgba(248, 250, 252, 0.8) 100%)",
                          borderRadius: "50%",
                          width: "74px",
                          height: "74px",
                          margin: "auto",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                      >
                        <span style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                          282
                        </span>
                        <span style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                          Total
                        </span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px rgba(16, 185, 129, 0.5)" }} />
                          <span style={{ fontSize: "11px", color: "#334155" }}>Approved</span>
                        </div>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>176 (62.41%)</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316", boxShadow: "0 0 6px rgba(249, 115, 22, 0.5)" }} />
                          <span style={{ fontSize: "11px", color: "#334155" }}>Pending Approval</span>
                        </div>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>94 (33.33%)</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0284c7", boxShadow: "0 0 6px rgba(2, 132, 199, 0.5)" }} />
                          <span style={{ fontSize: "11px", color: "#334155" }}>Returned for Edit</span>
                        </div>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>10 (3.55%)</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px rgba(239, 68, 68, 0.5)" }} />
                          <span style={{ fontSize: "11px", color: "#334155" }}>Rejected</span>
                        </div>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>2 (0.71%)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: "10.5px", color: "#94a3b8", textAlign: "right", marginTop: "10px" }}>
                    Updated on {lastUpdatedTime || "Just now"}
                  </div>
                </div>
              </div>

              {/* Card 3: Subject Wise Report Table */}
              <div
                className="widget-card-3d"
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  border: "1px solid #e2e8f0",
                  padding: "20px 24px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="action-mini-icon-cyan" style={{ width: "32px", height: "32px" }}>
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                      Subject Wise Report
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Detailed subject breakdown and approval percentages</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={handleExportSubjectWise}
                      className="filter-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 16px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        cursor: "pointer",
                      }}
                    >
                      <Download size={13} />
                      <span>Export</span>
                    </button>

                    {/* View Mode Switcher Pill */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "3px",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
                        flexShrink: 0,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setViewMode("cards")}
                        title="Grid / Cards View"
                        style={{
                          padding: "6px 9px",
                          borderRadius: "7px",
                          border: "none",
                          background: viewMode === "cards" ? "#eff6ff" : "transparent",
                          color: viewMode === "cards" ? "#4f46e5" : "#94a3b8",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <LayoutGrid size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("table")}
                        title="List / Table View"
                        style={{
                          padding: "6px 9px",
                          borderRadius: "7px",
                          border: "none",
                          background: viewMode === "table" ? "#eff6ff" : "transparent",
                          color: viewMode === "table" ? "#4f46e5" : "#94a3b8",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <ListFilter size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table or Cards View */}
                {viewMode === "table" ? (
                  <div className="no-scrollbar" style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                            Subject
                          </th>
                          <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                            Total Questions
                          </th>
                          <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                            Approved
                          </th>
                          <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                            Pending Approval
                          </th>
                          <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                            Returned for Edit
                          </th>
                          <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                            Rejected
                          </th>
                          <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                            Approval %
                          </th>
                          <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSubjects.map((s) => {
                          const total = s.totalQuestions || 100;
                          const app = Number(s.approved || 0);
                          const pct = total > 0 ? ((app / total) * 100).toFixed(1) : "0.0";
                          const pctNum = Math.min(100, Math.max(0, parseFloat(pct)));

                          return (
                            <tr key={s.id} className="table-row-3d" style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "14px 10px", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.dotColor || "#6366f1" }} />
                                  <span>{s.name}</span>
                                </div>
                                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>{s.code}</span>
                              </td>
                              <td style={{ padding: "14px 10px", fontSize: "13px", fontWeight: 600, color: "#334155", textAlign: "center" }}>
                                {total}
                              </td>
                              <td style={{ padding: "14px 10px", fontSize: "13px", fontWeight: 600, color: "#334155", textAlign: "center" }}>
                                {app}
                              </td>
                              <td style={{ padding: "14px 10px", fontSize: "13px", fontWeight: 600, color: "#334155", textAlign: "center" }}>
                                {s.pending || 8}
                              </td>
                              <td style={{ padding: "14px 10px", fontSize: "13px", fontWeight: 600, color: "#334155", textAlign: "center" }}>
                                05
                              </td>
                              <td style={{ padding: "14px 10px", fontSize: "13px", fontWeight: 600, color: "#334155", textAlign: "center" }}>
                                01
                              </td>
                              <td style={{ padding: "14px 10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden", minWidth: "60px" }}>
                                    <div
                                      style={{
                                        height: "100%",
                                        width: `${pctNum}%`,
                                        background: "linear-gradient(90deg, #10b981, #059669)",
                                        borderRadius: "3px",
                                      }}
                                    />
                                  </div>
                                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#10b981", minWidth: "40px" }}>
                                    {pct}%
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: "14px 10px", textAlign: "center" }}>
                                <div style={{ display: "inline-flex", justifyContent: "center" }}>
                                  <CrudActionButtons
                                    onView={() => setViewingSubject(s)}
                                    onEdit={() => setEditingSubject(s)}
                                    onDelete={() => setDeletingSubject(s)}
                                    viewTitle="View Detailed Report"
                                    editTitle="Edit Subject Targets"
                                    deleteTitle="Delete from Report"
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {paginatedSubjects.map((s) => {
                      const total = s.totalQuestions || 100;
                      const app = Number(s.approved || 0);
                      const pending = s.pending || 8;
                      const returned = 5;
                      const rejected = 1;
                      const pct = total > 0 ? ((app / total) * 100).toFixed(1) : "0.0";
                      const pctNum = Math.min(100, Math.max(0, parseFloat(pct)));

                      return (
                        <div
                          key={s.id}
                          className="widget-card-3d"
                          style={{
                            background: "#ffffff",
                            borderRadius: "16px",
                            border: "1px solid #e2e8f0",
                            padding: "18px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "14px",
                            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.03)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div>
                            {/* Subject Header */}
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: s.dotColor || "#6366f1", flexShrink: 0 }} />
                                <div>
                                  <h4 style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                    {s.name}
                                  </h4>
                                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                                    {s.code}
                                  </span>
                                </div>
                              </div>
                              <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", background: "#f1f5f9", color: "#475569" }}>
                                {total} Qs
                              </span>
                            </div>

                            {/* Approval Progress Bar */}
                            <div style={{ margin: "10px 0" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Approval Rate</span>
                                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#10b981" }}>{pct}%</span>
                              </div>
                              <div style={{ height: "6px", width: "100%", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${pctNum}%`,
                                    background: "linear-gradient(90deg, #10b981, #059669)",
                                    borderRadius: "4px",
                                    transition: "width 0.4s ease",
                                  }}
                                />
                              </div>
                            </div>

                            {/* Stat Breakdown Chips */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginTop: "12px" }}>
                              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "6px 8px" }}>
                                <div style={{ fontSize: "10px", color: "#166534", fontWeight: 600 }}>Approved</div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#15803d" }}>{app}</div>
                              </div>
                              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "6px 8px" }}>
                                <div style={{ fontSize: "10px", color: "#9a3412", fontWeight: 600 }}>Pending</div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#ea580c" }}>{pending}</div>
                              </div>
                              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "6px 8px" }}>
                                <div style={{ fontSize: "10px", color: "#0369a1", fontWeight: 600 }}>Returned</div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0284c7" }}>{returned}</div>
                              </div>
                              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "6px 8px" }}>
                                <div style={{ fontSize: "10px", color: "#991b1b", fontWeight: 600 }}>Rejected</div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626" }}>{rejected}</div>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer with CrudActionButtons */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              paddingTop: "10px",
                              borderTop: "1px solid #f1f5f9",
                            }}
                          >
                            <CrudActionButtons
                              onView={() => setViewingSubject(s)}
                              onEdit={() => setEditingSubject(s)}
                              onDelete={() => setDeletingSubject(s)}
                              viewTitle="View Detailed Report"
                              editTitle="Edit Subject Targets"
                              deleteTitle="Delete from Report"
                              size={30}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Pagination
                  currentPage={safeCurrentPage}
                  totalItems={subjects.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(p) => setCurrentPage(p)}
                  itemName="subjects"
                />
              </div>
            </div>
          </div>

          {/* Support Banner & Footer */}
          <PortalFooter />
        </main>
      </div>

      {/* ================= CRUD MODALS ================= */}
      <ViewModal
        isOpen={!!viewingSubject}
        onClose={() => setViewingSubject(null)}
        title="Subject Metrics & Report Details"
        subtitle={`Code: ${viewingSubject?.code} • Status: ${viewingSubject?.status}`}
        badge={viewingSubject?.status || "In Progress"}
        badgeColor={viewingSubject?.status === "Completed" ? "green" : "blue"}
        data={
          viewingSubject
            ? [
                { label: "Subject Name", value: viewingSubject.name },
                { label: "Subject Code", value: viewingSubject.code },
                { label: "Total Questions Target", value: viewingSubject.totalQuestions },
                { label: "Approved Questions", value: viewingSubject.approved || 0 },
                { label: "Verified Questions", value: viewingSubject.verified || 0 },
                { label: "Pending Verification", value: viewingSubject.pending || 0 },
                {
                  label: "Completion Rate",
                  value:
                    viewingSubject.totalQuestions > 0
                      ? `${(((Number(viewingSubject.approved || 0)) / viewingSubject.totalQuestions) * 100).toFixed(1)}%`
                      : "0%",
                },
                { label: "Department", value: viewingSubject.department || "Visual Communication" },
                { label: "Semester", value: viewingSubject.semester || "Semester 3" },
                { label: "Credits", value: viewingSubject.credits || 4 },
              ]
            : []
        }
      />

      <FormModal
        isOpen={isAddingSubject || !!editingSubject}
        onClose={() => {
          setIsAddingSubject(false);
          setEditingSubject(null);
        }}
        title={editingSubject ? "Edit Subject Targets" : "Add Subject Audit Target"}
        subtitle={editingSubject ? `Updating targets for ${editingSubject.name}` : "Configure question targets and audit parameters"}
        fields={reportSubjectFields}
        initialData={
          editingSubject || {
            name: "",
            code: "",
            totalQuestions: 100,
            approved: 80,
            pending: 10,
            status: "In Progress",
          }
        }
        submitLabel={editingSubject ? "Update Target" : "Add Report Record"}
        onSubmit={(data) => {
          if (editingSubject) {
            examStore.saveSubject({ ...editingSubject, ...data });
            triggerToast("Subject audit targets updated successfully!", "success");
          } else {
            examStore.saveSubject(data);
            triggerToast("New subject report targets created!", "success");
          }
          setIsAddingSubject(false);
          setEditingSubject(null);
        }}
      />

      <DeleteModal
        isOpen={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        title="Delete Subject from Report"
        message="Are you sure you want to remove this subject from the reports audit? All target progress data will be reset."
        itemName={deletingSubject ? `${deletingSubject.name} (${deletingSubject.code})` : undefined}
        onConfirm={() => {
          if (deletingSubject) {
            examStore.deleteSubject(deletingSubject.id);
            triggerToast("Subject report record deleted.", "info");
            setDeletingSubject(null);
          }
        }}
      />

      <ToastNotification
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
    </RoleGuard>
  );
}
