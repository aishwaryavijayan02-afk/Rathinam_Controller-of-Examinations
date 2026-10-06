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
  Settings,
  Printer,
  Shield,
  ArrowRight,
  ChevronRight,
  School,
  Clock,
  XCircle,
  Users,
  Briefcase,
  Check,
  AlertCircle,
  RefreshCw,
  Send,
  Lock,
  Award,
  Building2,
  Archive,
  Filter,
  Eye,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { examStore, QuestionItem, SubjectItem, SyllabusApprovalItem } from "../lib/examStore";
import { authStore, AuthUser, hasPermission } from "../lib/auth";
import RoleGuard from "../components/RoleGuard";
import { ToastNotification } from "../components/CrudModal";
import PortalFooter from "../components/PortalFooter";
import PortalHeader from "../components/PortalHeader";

type ApprovalRole = "staff" | "hod" | "dean" | "coe";

export default function NotificationsApprovalPage() {
  const router = useRouter();

  // Auth User State
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => authStore.getCurrentUser());

  // 4 Option Role Selector (Auto-selects user role)
  const [selectedRole, setSelectedRole] = useState<ApprovalRole>(() => {
    const u = authStore.getCurrentUser();
    if (u.role === "HOD") return "hod";
    if (u.role === "DEAN") return "dean";
    if (u.role === "COE") return "coe";
    return "staff";
  });

  useEffect(() => {
    const handleAuth = () => {
      const u = authStore.getCurrentUser();
      setCurrentUser(u);
      if (u.role === "STAFF") setSelectedRole("staff");
      else if (u.role === "HOD") setSelectedRole("hod");
      else if (u.role === "DEAN") setSelectedRole("dean");
      else if (u.role === "COE") setSelectedRole("coe");
    };
    window.addEventListener("exam-cell-auth-update", handleAuth);
    return () => window.removeEventListener("exam-cell-auth-update", handleAuth);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected Item for Inspection Modal
  const [inspectedItem, setInspectedItem] = useState<SyllabusApprovalItem | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; isOpen: boolean; type?: "success" | "danger" }>({
    message: "",
    isOpen: false,
  });

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, isOpen: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isOpen: false })), 3000);
  };

  // Raw menu items
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

  // Store data
  const [subjects, setSubjects] = useState<SubjectItem[]>(() => examStore.getSubjects());
  const [questions, setQuestions] = useState<QuestionItem[]>(() => examStore.getQuestions());

  useEffect(() => {
    const loadData = () => {
      setSubjects(examStore.getSubjects());
      setQuestions(examStore.getQuestions());
    };
    loadData();
    window.addEventListener("exam-cell-store-update", loadData);
    return () => window.removeEventListener("exam-cell-store-update", loadData);
  }, []);

  // Dynamic syllabus approval workflow items from examStore
  const [approvalList, setApprovalList] = useState<SyllabusApprovalItem[]>(() => examStore.getSyllabusApprovals());

  useEffect(() => {
    const loadData = () => {
      setSubjects(examStore.getSubjects());
      setQuestions(examStore.getQuestions());
      setApprovalList(examStore.getSyllabusApprovals());
    };
    loadData();
    window.addEventListener("exam-cell-store-update", loadData);
    return () => window.removeEventListener("exam-cell-store-update", loadData);
  }, []);

  // Assigned subjects & syllabi for the logged-in staff member
  const staffSubjectInfo = useMemo(() => {
    return examStore.getStaffAssignedSubjects(currentUser.email, currentUser.name);
  }, [currentUser]);

  // Syllabi visible to current user (Staff ONLY sees their own assigned/uploaded subjects)
  const userSyllabi = useMemo(() => {
    // If logged in as STAFF: STRICTLY filter to ONLY the subjects this staff member teaches and uploaded!
    if (currentUser.role === "STAFF") {
      const cleanUserEmail = (currentUser.email || "").toLowerCase().trim();
      const cleanUserName = (currentUser.name || "")
        .toLowerCase()
        .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s*/gi, "")
        .trim();

      return approvalList.filter((item) => {
        const itemEmail = (item.submitterEmail || "").toLowerCase().trim();
        const itemSubmitter = (item.submittedBy || "")
          .toLowerCase()
          .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s*/gi, "")
          .trim();

        // 1. Direct email match
        const emailMatches = Boolean(
          cleanUserEmail &&
            itemEmail &&
            (cleanUserEmail === itemEmail ||
              cleanUserEmail.startsWith(itemEmail.split("@")[0]) ||
              itemEmail.startsWith(cleanUserEmail.split("@")[0]))
        );

        // 2. Direct name match
        const nameMatches = Boolean(
          cleanUserName &&
            itemSubmitter &&
            (cleanUserName === itemSubmitter ||
              cleanUserName.includes(itemSubmitter) ||
              itemSubmitter.includes(cleanUserName))
        );

        // 3. Subject taught by this staff member
        const subjectMatches =
          staffSubjectInfo.subjects.some((subj) => {
            const sLower = subj.toLowerCase().trim();
            const cName = (item.courseName || "").toLowerCase().trim();
            const cCode = (item.courseCode || "").toLowerCase().trim();
            return cName.includes(sLower) || sLower.includes(cName) || cCode.includes(sLower);
          }) ||
          staffSubjectInfo.syllabi.some((syl) => {
            const sylLower = syl.toLowerCase().trim();
            const cName = (item.courseName || "").toLowerCase().trim();
            return cName.includes(sylLower) || sylLower.includes(cName);
          });

        return emailMatches || nameMatches || subjectMatches;
      });
    }

    // For HOD / Dean / COE: show all syllabi in department / institutional pipeline
    return approvalList;
  }, [approvalList, currentUser, staffSubjectInfo]);

  // Statistics calculation for all 4 roles based on user's visible syllabus scope
  const stats = useMemo(() => {
    // 1. Staff: Processing = in workflow pipeline, Approved = locked in vault
    const staffApproved = userSyllabi.filter((a) => a.coeStatus === "Approved").length;
    const staffProcessing = userSyllabi.filter((a) => a.coeStatus !== "Approved").length;

    // 2. HOD: Processing = awaiting HOD audit, Approved = verified by HOD
    const hodProcessing = userSyllabi.filter((a) => a.hodStatus === "Pending").length;
    const hodApproved = userSyllabi.filter((a) => a.hodStatus === "Approved").length;

    // 3. Dean: Processing = awaiting Dean check, Approved = endorsed by Dean
    const deanProcessing = userSyllabi.filter((a) => a.deanStatus === "Pending").length;
    const deanApproved = userSyllabi.filter((a) => a.deanStatus === "Approved").length;

    // 4. COE: Processing = awaiting final COE seal, Approved = locked in Vault
    const coeProcessing = userSyllabi.filter((a) => a.coeStatus === "Pending").length;
    const coeApproved = userSyllabi.filter((a) => a.coeStatus === "Approved").length;

    return {
      staff: { processing: staffProcessing, approved: staffApproved },
      hod: { processing: hodProcessing, approved: hodApproved },
      dean: { processing: deanProcessing, approved: deanApproved },
      coe: { processing: coeProcessing, approved: coeApproved },
    };
  }, [userSyllabi]);

  // Filtered items based on active role option, search, and status filter
  const filteredList = useMemo(() => {
    return userSyllabi.filter((item) => {
      // Role-specific filtering
      if (selectedRole === "staff") {
        // Staff view shows all items submitted by staff
      } else if (selectedRole === "hod") {
        // HOD view prioritizes items in HOD stage or approved by HOD
      } else if (selectedRole === "dean") {
        // Dean view prioritizes items that passed HOD or in Dean stage
      } else if (selectedRole === "coe") {
        // COE view prioritizes items forwarded for final COE seal
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.courseCode.toLowerCase().includes(q) ||
          item.courseName.toLowerCase().includes(q) ||
          item.submittedBy.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Status
      if (statusFilter !== "all") {
        if (selectedRole === "staff") {
          if (statusFilter === "pending" && item.hodStatus !== "Pending") return false;
          if (statusFilter === "approved" && item.coeStatus !== "Approved") return false;
          if (statusFilter === "revision" && item.status !== "Revision_Requested") return false;
        } else if (selectedRole === "hod") {
          if (statusFilter === "pending" && item.hodStatus !== "Pending") return false;
          if (statusFilter === "approved" && item.hodStatus !== "Approved") return false;
        } else if (selectedRole === "dean") {
          if (statusFilter === "pending" && item.deanStatus !== "Pending") return false;
          if (statusFilter === "approved" && item.deanStatus !== "Approved") return false;
        } else if (selectedRole === "coe") {
          if (statusFilter === "pending" && item.coeStatus !== "Pending") return false;
          if (statusFilter === "approved" && item.coeStatus !== "Approved") return false;
        }
      }

      return true;
    });
  }, [userSyllabi, selectedRole, searchQuery, statusFilter]);

  // Quick Action: Advance / Approve stage
  const handleQuickApprove = (item: SyllabusApprovalItem) => {
    let updates: Partial<SyllabusApprovalItem> = {};
    if (selectedRole === "hod") {
      updates = {
        hodStatus: "Approved",
        hodName: currentUser.name || "HOD",
        hodDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        stage: "dean",
        deanStatus: "Pending",
      };
    } else if (selectedRole === "dean") {
      updates = {
        deanStatus: "Approved",
        deanName: currentUser.name || "Dean Academics",
        deanDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        stage: "coe",
        coeStatus: "Pending",
      };
    } else if (selectedRole === "coe") {
      updates = {
        coeStatus: "Approved",
        coeName: currentUser.name || "COE Controller",
        coeDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        status: "Approved",
      };
    }

    examStore.updateSyllabusApproval(item.id, updates);
    setApprovalList(examStore.getSyllabusApprovals());
    showToast(`Approved ${item.courseCode} syllabus for next tier!`);
  };

  const getRoleTheme = (role: ApprovalRole) => {
    switch (role) {
      case "staff":
        return {
          title: "Staff / Faculty",
          label: "Question Authoring & Initial Upload",
          icon: Users,
          gradient: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
          accentColor: "#6366f1",
          lightBg: "#eef2ff",
          borderColor: "#c7d2fe",
          textColor: "#4338ca",
        };
      case "hod":
        return {
          title: "HOD Review",
          label: "Head of Dept Verification & Quality Audit",
          icon: Building2,
          gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          accentColor: "#10b981",
          lightBg: "#ecfdf5",
          borderColor: "#a7f3d0",
          textColor: "#065f46",
        };
      case "dean":
        return {
          title: "Dean Endorsement",
          label: "Dean Academic Compliance & Syllabus Check",
          icon: School,
          gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
          accentColor: "#f59e0b",
          lightBg: "#fffbeb",
          borderColor: "#fde68a",
          textColor: "#92400e",
        };
      case "coe":
        return {
          title: "COE Final Approval",
          label: "Controller of Exams Institutional Seal & Lock",
          icon: Award,
          gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
          accentColor: "#0284c7",
          lightBg: "#f0f9ff",
          borderColor: "#bae6fd",
          textColor: "#075985",
        };
    }
  };

  const currentTheme = getRoleTheme(selectedRole);

  return (
    <RoleGuard route="/notifications">
      <div
        style={{
          display: "flex",
          height: "100vh",
          maxHeight: "100vh",
          background: "#080d1a",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: "#f8fafc",
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
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ padding: "6px 10px 24px 10px" }}>
              <img
                src="/images/rgu-logo.png"
                alt="Rathinam Global (Deemed to be University)"
                style={{
                  maxHeight: "38px",
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 12px rgba(99, 102, 241, 0.35))",
                }}
              />
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {menuItems.map((item) => {
                const IconComp = item.icon;
                const isActive = item.id === "notifications";

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
              Approval Support
            </strong>
            <p style={{ fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.4, margin: "0 0 14px 0" }}>
              Track multi-level approval pipeline across Staff, HOD, Dean & COE.
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
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <span>Contact Cell</span>
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
            height: "100vh",
            maxHeight: "100vh",
            overflow: "hidden",
            background: "#f4f6fa",
            color: "#0f172a",
          }}
        >
          <PortalHeader activeRoute="/notifications" />

          {/* Main Content Area */}
          <main
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* ========================================================================= */}
            {/* CENTERED WORKFLOW PIPELINE FLOW (STAFF ➔ HOD ➔ DEAN ➔ COE)                */}
            {/* ========================================================================= */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                padding: "2px 0 6px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  background: "#ffffff",
                  borderRadius: "18px",
                  padding: "10px 22px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 20px -3px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0,0,0,0.02)",
                  maxWidth: "960px",
                  width: "100%",
                  flexWrap: "wrap",
                }}
              >
                {/* 1. Staff Node */}
                <div
                  onClick={() => setSelectedRole("staff")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    background: selectedRole === "staff" ? "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)" : "#f8fafc",
                    color: selectedRole === "staff" ? "#ffffff" : "#334155",
                    border: selectedRole === "staff" ? "2px solid #818cf8" : "1px solid #e2e8f0",
                    boxShadow: selectedRole === "staff" ? "0 4px 14px rgba(79, 70, 229, 0.35)" : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    transform: selectedRole === "staff" ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background: selectedRole === "staff" ? "rgba(255,255,255,0.22)" : "#eef2ff",
                      color: selectedRole === "staff" ? "#ffffff" : "#4f46e5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    <Users size={16} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, opacity: selectedRole === "staff" ? 0.9 : 0.6, letterSpacing: "0.04em" }}>01</span>
                      <span style={{ fontSize: "13.5px", fontWeight: 800 }}>Staff</span>
                    </div>
                    <div style={{ fontSize: "10.5px", opacity: selectedRole === "staff" ? 0.9 : 0.65 }}>
                      Authoring
                    </div>
                  </div>
                </div>

                {/* Arrow Connector 1 -> 2 */}
                <div style={{ display: "flex", alignItems: "center", color: selectedRole === "staff" ? "#4f46e5" : "#94a3b8" }}>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </div>

                {/* 2. HOD Node */}
                <div
                  onClick={() => setSelectedRole("hod")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    background: selectedRole === "hod" ? "linear-gradient(135deg, #059669 0%, #047857 100%)" : "#f8fafc",
                    color: selectedRole === "hod" ? "#ffffff" : "#334155",
                    border: selectedRole === "hod" ? "2px solid #34d399" : "1px solid #e2e8f0",
                    boxShadow: selectedRole === "hod" ? "0 4px 14px rgba(5, 150, 105, 0.35)" : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    transform: selectedRole === "hod" ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background: selectedRole === "hod" ? "rgba(255,255,255,0.22)" : "#ecfdf5",
                      color: selectedRole === "hod" ? "#ffffff" : "#059669",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    <Building2 size={16} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, opacity: selectedRole === "hod" ? 0.9 : 0.6, letterSpacing: "0.04em" }}>02</span>
                      <span style={{ fontSize: "13.5px", fontWeight: 800 }}>HOD</span>
                    </div>
                    <div style={{ fontSize: "10.5px", opacity: selectedRole === "hod" ? 0.9 : 0.65 }}>
                      Verification
                    </div>
                  </div>
                </div>

                {/* Arrow Connector 2 -> 3 */}
                <div style={{ display: "flex", alignItems: "center", color: selectedRole === "hod" ? "#059669" : "#94a3b8" }}>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </div>

                {/* 3. Dean Node */}
                <div
                  onClick={() => setSelectedRole("dean")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    background: selectedRole === "dean" ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)" : "#f8fafc",
                    color: selectedRole === "dean" ? "#ffffff" : "#334155",
                    border: selectedRole === "dean" ? "2px solid #fbbf24" : "1px solid #e2e8f0",
                    boxShadow: selectedRole === "dean" ? "0 4px 14px rgba(217, 119, 6, 0.35)" : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    transform: selectedRole === "dean" ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background: selectedRole === "dean" ? "rgba(255,255,255,0.22)" : "#fffbeb",
                      color: selectedRole === "dean" ? "#ffffff" : "#d97706",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    <School size={16} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, opacity: selectedRole === "dean" ? 0.9 : 0.6, letterSpacing: "0.04em" }}>03</span>
                      <span style={{ fontSize: "13.5px", fontWeight: 800 }}>Dean</span>
                    </div>
                    <div style={{ fontSize: "10.5px", opacity: selectedRole === "dean" ? 0.9 : 0.65 }}>
                      Endorsement
                    </div>
                  </div>
                </div>

                {/* Arrow Connector 3 -> 4 */}
                <div style={{ display: "flex", alignItems: "center", color: selectedRole === "dean" ? "#d97706" : "#94a3b8" }}>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </div>

                {/* 4. COE Node */}
                <div
                  onClick={() => setSelectedRole("coe")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    background: selectedRole === "coe" ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" : "#f8fafc",
                    color: selectedRole === "coe" ? "#ffffff" : "#334155",
                    border: selectedRole === "coe" ? "2px solid #38bdf8" : "1px solid #e2e8f0",
                    boxShadow: selectedRole === "coe" ? "0 4px 14px rgba(2, 132, 199, 0.35)" : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    transform: selectedRole === "coe" ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background: selectedRole === "coe" ? "rgba(255,255,255,0.22)" : "#f0f9ff",
                      color: selectedRole === "coe" ? "#ffffff" : "#0284c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    <Award size={16} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, opacity: selectedRole === "coe" ? 0.9 : 0.6, letterSpacing: "0.04em" }}>04</span>
                      <span style={{ fontSize: "13.5px", fontWeight: 800 }}>COE</span>
                    </div>
                    <div style={{ fontSize: "10.5px", opacity: selectedRole === "coe" ? 0.9 : 0.65 }}>
                      Final Seal 🔒
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 4 OPTION ROLE SELECTOR CARDS (STAFF | HOD | DEAN | COE)                   */}
            {/* ========================================================================= */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "14px",
              }}
            >
              {/* 1. Staff Option */}
              <div
                onClick={() => setSelectedRole("staff")}
                style={{
                  background: selectedRole === "staff" ? "linear-gradient(135deg, #4338ca 0%, #3730a3 100%)" : "#ffffff",
                  color: selectedRole === "staff" ? "#ffffff" : "#1e293b",
                  borderRadius: "14px",
                  padding: "16px",
                  border: selectedRole === "staff" ? "2px solid #818cf8" : "1px solid #e2e8f0",
                  boxShadow: selectedRole === "staff" ? "0 8px 20px rgba(67, 56, 202, 0.25)" : "0 1px 3px rgba(0,0,0,0.02)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: selectedRole === "staff" ? "translateY(-2px)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: selectedRole === "staff" ? "rgba(255,255,255,0.2)" : "#eef2ff",
                      color: selectedRole === "staff" ? "#ffffff" : "#4f46e5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Users size={18} />
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: selectedRole === "staff" ? "rgba(255,255,255,0.25)" : "#eef2ff",
                      color: selectedRole === "staff" ? "#ffffff" : "#4338ca",
                    }}
                  >
                    Tier 1
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800 }}>1. Staff / Faculty</div>
                  <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "2px" }}>
                    Authoring & Submissions
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "6px",
                    borderTop: selectedRole === "staff" ? "1px solid rgba(255,255,255,0.2)" : "1px solid #f1f5f9",
                    paddingTop: "10px",
                    marginTop: "2px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: selectedRole === "staff" ? "rgba(255, 255, 255, 0.18)" : "#fef3c7",
                      color: selectedRole === "staff" ? "#ffffff" : "#b45309",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: selectedRole === "staff" ? "1px solid rgba(255,255,255,0.25)" : "1px solid #fde68a",
                    }}
                  >
                    <Clock size={12} style={{ flexShrink: 0 }} />
                    <span>Processing: {stats.staff.processing}</span>
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: selectedRole === "staff" ? "rgba(255, 255, 255, 0.22)" : "#dcfce7",
                      color: selectedRole === "staff" ? "#ffffff" : "#15803d",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: selectedRole === "staff" ? "1px solid rgba(255,255,255,0.35)" : "1px solid #bbf7d0",
                    }}
                  >
                    <CheckCircle2 size={12} style={{ flexShrink: 0 }} />
                    <span>Approved: {stats.staff.approved}</span>
                  </div>
                </div>
              </div>

              {/* 2. HOD Option */}
              <div
                onClick={() => setSelectedRole("hod")}
                style={{
                  background: selectedRole === "hod" ? "linear-gradient(135deg, #059669 0%, #047857 100%)" : "#ffffff",
                  color: selectedRole === "hod" ? "#ffffff" : "#1e293b",
                  borderRadius: "14px",
                  padding: "16px",
                  border: selectedRole === "hod" ? "2px solid #34d399" : "1px solid #e2e8f0",
                  boxShadow: selectedRole === "hod" ? "0 8px 20px rgba(5, 150, 105, 0.25)" : "0 1px 3px rgba(0,0,0,0.02)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: selectedRole === "hod" ? "translateY(-2px)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: selectedRole === "hod" ? "rgba(255,255,255,0.2)" : "#ecfdf5",
                      color: selectedRole === "hod" ? "#ffffff" : "#059669",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Building2 size={18} />
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: selectedRole === "hod" ? "rgba(255,255,255,0.25)" : "#ecfdf5",
                      color: selectedRole === "hod" ? "#ffffff" : "#047857",
                    }}
                  >
                    Tier 2
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800 }}>2. HOD Verification</div>
                  <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "2px" }}>
                    Department Quality Audit
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "6px",
                    borderTop: selectedRole === "hod" ? "1px solid rgba(255,255,255,0.2)" : "1px solid #f1f5f9",
                    paddingTop: "10px",
                    marginTop: "2px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: selectedRole === "hod" ? "rgba(255, 255, 255, 0.18)" : "#fef3c7",
                      color: selectedRole === "hod" ? "#ffffff" : "#b45309",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: selectedRole === "hod" ? "1px solid rgba(255,255,255,0.25)" : "1px solid #fde68a",
                    }}
                  >
                    <Clock size={12} style={{ flexShrink: 0 }} />
                    <span>Processing: {stats.hod.processing}</span>
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: selectedRole === "hod" ? "rgba(255, 255, 255, 0.22)" : "#dcfce7",
                      color: selectedRole === "hod" ? "#ffffff" : "#15803d",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: selectedRole === "hod" ? "1px solid rgba(255,255,255,0.35)" : "1px solid #bbf7d0",
                    }}
                  >
                    <CheckCircle2 size={12} style={{ flexShrink: 0 }} />
                    <span>Approved: {stats.hod.approved}</span>
                  </div>
                </div>
              </div>

              {/* 3. Dean Option */}
              <div
                onClick={() => setSelectedRole("dean")}
                style={{
                  background: selectedRole === "dean" ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)" : "#ffffff",
                  color: selectedRole === "dean" ? "#ffffff" : "#1e293b",
                  borderRadius: "14px",
                  padding: "16px",
                  border: selectedRole === "dean" ? "2px solid #fbbf24" : "1px solid #e2e8f0",
                  boxShadow: selectedRole === "dean" ? "0 8px 20px rgba(217, 119, 6, 0.25)" : "0 1px 3px rgba(0,0,0,0.02)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: selectedRole === "dean" ? "translateY(-2px)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: selectedRole === "dean" ? "rgba(255,255,255,0.2)" : "#fffbeb",
                      color: selectedRole === "dean" ? "#ffffff" : "#d97706",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <School size={18} />
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: selectedRole === "dean" ? "rgba(255,255,255,0.25)" : "#fffbeb",
                      color: selectedRole === "dean" ? "#ffffff" : "#b45309",
                    }}
                  >
                    Tier 3
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800 }}>3. Dean Endorsement</div>
                  <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "2px" }}>
                    Academic Compliance Check
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "6px",
                    borderTop: selectedRole === "dean" ? "1px solid rgba(255,255,255,0.2)" : "1px solid #f1f5f9",
                    paddingTop: "10px",
                    marginTop: "2px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: selectedRole === "dean" ? "rgba(255, 255, 255, 0.18)" : "#fef3c7",
                      color: selectedRole === "dean" ? "#ffffff" : "#b45309",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: selectedRole === "dean" ? "1px solid rgba(255,255,255,0.25)" : "1px solid #fde68a",
                    }}
                  >
                    <Clock size={12} style={{ flexShrink: 0 }} />
                    <span>Processing: {stats.dean.processing}</span>
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: selectedRole === "dean" ? "rgba(255, 255, 255, 0.22)" : "#dcfce7",
                      color: selectedRole === "dean" ? "#ffffff" : "#15803d",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: selectedRole === "dean" ? "1px solid rgba(255,255,255,0.35)" : "1px solid #bbf7d0",
                    }}
                  >
                    <CheckCircle2 size={12} style={{ flexShrink: 0 }} />
                    <span>Approved: {stats.dean.approved}</span>
                  </div>
                </div>
              </div>

              {/* 4. COE Option */}
              <div
                onClick={() => setSelectedRole("coe")}
                style={{
                  background: selectedRole === "coe" ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" : "#ffffff",
                  color: selectedRole === "coe" ? "#ffffff" : "#1e293b",
                  borderRadius: "14px",
                  padding: "16px",
                  border: selectedRole === "coe" ? "2px solid #38bdf8" : "1px solid #e2e8f0",
                  boxShadow: selectedRole === "coe" ? "0 8px 20px rgba(2, 132, 199, 0.25)" : "0 1px 3px rgba(0,0,0,0.02)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: selectedRole === "coe" ? "translateY(-2px)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: selectedRole === "coe" ? "rgba(255,255,255,0.2)" : "#f0f9ff",
                      color: selectedRole === "coe" ? "#ffffff" : "#0284c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Award size={18} />
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: selectedRole === "coe" ? "rgba(255,255,255,0.25)" : "#f0f9ff",
                      color: selectedRole === "coe" ? "#ffffff" : "#0369a1",
                    }}
                  >
                    Tier 4
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800 }}>4. COE Final Approval</div>
                  <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "2px" }}>
                    Exam Seal & Vault Locking
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "6px",
                    borderTop: selectedRole === "coe" ? "1px solid rgba(255,255,255,0.2)" : "1px solid #f1f5f9",
                    paddingTop: "10px",
                    marginTop: "2px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: selectedRole === "coe" ? "rgba(255, 255, 255, 0.18)" : "#fef3c7",
                      color: selectedRole === "coe" ? "#ffffff" : "#b45309",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: selectedRole === "coe" ? "1px solid rgba(255,255,255,0.25)" : "1px solid #fde68a",
                    }}
                  >
                    <Clock size={12} style={{ flexShrink: 0 }} />
                    <span>Processing: {stats.coe.processing}</span>
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: selectedRole === "coe" ? "rgba(255, 255, 255, 0.22)" : "#dcfce7",
                      color: selectedRole === "coe" ? "#ffffff" : "#15803d",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: selectedRole === "coe" ? "1px solid rgba(255,255,255,0.35)" : "1px solid #bbf7d0",
                    }}
                  >
                    <CheckCircle2 size={12} style={{ flexShrink: 0 }} />
                    <span>Approved: {stats.coe.approved}</span>
                  </div>
                </div>
              </div>
            </div>


            {/* ========================================================================= */}
            {/* SEARCH & FILTERS BAR                                                      */}
            {/* ========================================================================= */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "260px" }}>
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder={
                    currentUser.role === "STAFF"
                      ? "Search your assigned syllabus by Subject or Course Code..."
                      : `Search in ${currentTheme.title} by Course, Code, Faculty...`
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "12.5px",
                    width: "100%",
                    color: "#0f172a",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                    background: "#ffffff",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Action</option>
                  <option value="approved">Approved & Advanced</option>
                  {selectedRole === "staff" && <option value="revision">Revision Requested</option>}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    showToast("Filters reset to default.");
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>

                {approvalList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to remove all syllabus submissions from the board?")) {
                        examStore.clearAllSyllabusApprovals();
                        setApprovalList([]);
                        showToast("All syllabus records removed.");
                      }
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #fecaca",
                      background: "#fef2f2",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#dc2626",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* APPROVAL ITEMS LIST / CARDS                                               */}
            {/* ========================================================================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredList.length === 0 ? (
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    padding: "40px 20px",
                    textAlign: "center",
                    border: "1px dashed #cbd5e1",
                    color: "#94a3b8",
                  }}
                >
                  <AlertCircle size={32} style={{ margin: "0 auto 10px auto", color: "#94a3b8" }} />
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#475569" }}>
                    No syllabus items match the criteria.
                  </div>
                  <div style={{ fontSize: "12px", marginTop: "4px" }}>
                    {currentUser.role === "STAFF"
                      ? `Only syllabus packs uploaded for subjects taught by ${currentUser.name} appear here.`
                      : "Items will appear here as they progress through Staff, HOD, Dean, and COE workflows."}
                  </div>
                </div>
              ) : (
                filteredList.map((item) => {
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: "#ffffff",
                        borderRadius: "14px",
                        padding: "16px 20px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {/* Top Header Row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 800,
                              color: "#2563eb",
                              background: "#eff6ff",
                              border: "1px solid #bfdbfe",
                              padding: "3px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            {item.courseCode}
                          </span>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                              {item.courseName}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                              {item.department} &bull; {item.semester} &bull; Submitted by <strong>{item.submittedBy}</strong> ({item.submittedAt})
                            </div>
                          </div>
                        </div>

                        {/* Status Pills */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "11.5px",
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: "6px",
                              background:
                                item.coeStatus === "Approved"
                                  ? "#ecfdf5"
                                  : item.status === "Revision_Requested"
                                  ? "#fef2f2"
                                  : "#eff6ff",
                              color:
                                item.coeStatus === "Approved"
                                  ? "#059669"
                                  : item.status === "Revision_Requested"
                                  ? "#dc2626"
                                  : "#2563eb",
                              border:
                                item.coeStatus === "Approved"
                                  ? "1px solid #a7f3d0"
                                  : item.status === "Revision_Requested"
                                  ? "1px solid #fecaca"
                                  : "1px solid #bfdbfe",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {item.coeStatus === "Approved" ? (
                              <>
                                <CheckCircle2 size={13} />
                                <span>COE Sealed & Approved</span>
                              </>
                            ) : item.status === "Revision_Requested" ? (
                              <>
                                <XCircle size={13} />
                                <span>Revision Requested</span>
                              </>
                            ) : (
                              <>
                                <Clock size={13} />
                                <span>
                                  {item.stage === "hod"
                                    ? "Awaiting HOD Review"
                                    : item.stage === "dean"
                                    ? "Awaiting Dean Endorsement"
                                    : "Awaiting COE Final Seal"}
                                </span>
                              </>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => setInspectedItem(item)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "6px 12px",
                              borderRadius: "7px",
                              border: "1px solid #cbd5e1",
                              background: "#f8fafc",
                              color: "#334155",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>

                          {/* Quick Action Button based on active view and user role */}
                          {currentUser.role === "HOD" && selectedRole === "hod" && item.hodStatus === "Pending" && (
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(item)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "6px 14px",
                                borderRadius: "7px",
                                border: "none",
                                background: "linear-gradient(135deg, #059669, #047857)",
                                color: "#ffffff",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              <Check size={13} />
                              <span>HOD Approve</span>
                            </button>
                          )}

                          {currentUser.role === "DEAN" && selectedRole === "dean" && item.deanStatus === "Pending" && (
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(item)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "6px 14px",
                                borderRadius: "7px",
                                border: "none",
                                background: "linear-gradient(135deg, #d97706, #b45309)",
                                color: "#ffffff",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              <Check size={13} />
                              <span>Dean Endorse</span>
                            </button>
                          )}

                          {currentUser.role === "COE" && selectedRole === "coe" && item.coeStatus === "Pending" && (
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(item)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "6px 14px",
                                borderRadius: "7px",
                                border: "none",
                                background: "linear-gradient(135deg, #0284c7, #0369a1)",
                                color: "#ffffff",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              <Lock size={13} />
                              <span>COE Seal</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove syllabus submission for "${item.courseName}"?`)) {
                                examStore.deleteSyllabusApproval(item.id);
                                setApprovalList(examStore.getSyllabusApprovals());
                                showToast(`Removed syllabus for ${item.courseName}`);
                              }
                            }}
                            title="Delete this submission"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 10px",
                              borderRadius: "7px",
                              border: "1px solid #fecaca",
                              background: "#fef2f2",
                              color: "#dc2626",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>

          <PortalFooter />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INSPECTION MODAL                                                          */}
      {/* ========================================================================= */}
      {inspectedItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: "5px" }}>
                  {inspectedItem.courseCode}
                </span>
                <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                  {inspectedItem.courseName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12.5px" }}>
              <div><strong>Department:</strong> {inspectedItem.department} ({inspectedItem.semester})</div>
              <div><strong>Submitted By:</strong> {inspectedItem.submittedBy} &bull; {inspectedItem.submitterEmail}</div>
              <div><strong>Submission Timestamp:</strong> {inspectedItem.submittedAt}</div>
              <div><strong>Syllabus Scope:</strong> {inspectedItem.totalUnits || 5} Units • {inspectedItem.totalTopics || 20} Topics (OBE Curriculum Mapping)</div>

              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 800, marginBottom: "6px", color: "#1e293b" }}>4-Tier Verification Trail:</div>
                <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <li><strong>Staff Submission:</strong> {inspectedItem.submittedBy} &mdash; ✓ Completed</li>
                  <li><strong>HOD Status:</strong> {inspectedItem.hodName || "Pending"} &mdash; {inspectedItem.hodStatus} ({inspectedItem.hodDate || "Awaiting"})</li>
                  <li><strong>Dean Status:</strong> {inspectedItem.deanName || "Pending"} &mdash; {inspectedItem.deanStatus} ({inspectedItem.deanDate || "Awaiting"})</li>
                  <li><strong>COE Status:</strong> {inspectedItem.coeName || "Pending"} &mdash; {inspectedItem.coeStatus} ({inspectedItem.coeDate || "Awaiting"})</li>
                </ul>
              </div>

              {inspectedItem.remarks && (
                <div>
                  <strong>Audit Notes:</strong>
                  <p style={{ margin: "4px 0 0 0", background: "#f1f5f9", padding: "8px 10px", borderRadius: "6px" }}>
                    {inspectedItem.remarks}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "7px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        isOpen={toast.isOpen}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </RoleGuard>
  );
}
