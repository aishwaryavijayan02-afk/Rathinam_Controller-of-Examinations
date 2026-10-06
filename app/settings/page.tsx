"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { examStore, ActivityItem, UserItem } from "../lib/examStore";
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
  Calendar,
  Filter,
  Check,
  Archive,
  Trash2,
  Clock,
  XCircle,
  Eye,
  Plus,
  RotateCcw,
  FileSpreadsheet,
  Award,
  Sliders,
  ChevronLeft,
  MoreVertical,
  HelpCircle,
  Lock,
  Link as LinkIcon,
  Download,
  Users,
  Database,
  Cloud,
  Layers,
  Wrench,
  Mail,
  RefreshCw,
  SlidersHorizontal,
  FileCheck,
  Building2,
} from "lucide-react";
import Pagination from "../components/Pagination";

export default function SettingsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("settings");
  const [currentPage, setCurrentPage] = useState(1);

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

  const categories = [
    {
      id: "general",
      title: "General Settings",
      description: "Configure general system settings, site details and preferences.",
      icon: Settings,
      iconBg: "#f5f3ff",
      iconColor: "#7c3aed",
    },
    {
      id: "users",
      title: "User Management",
      description: "Add, edit and manage system users and their roles.",
      icon: Users,
      iconBg: "#eff6ff",
      iconColor: "#2563eb",
    },
    {
      id: "roles",
      title: "Roles & Permissions",
      description: "Manage user roles and set permissions for system modules.",
      icon: Shield,
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
    },
    {
      id: "question-settings",
      title: "Question Settings",
      description: "Configure default settings for questions, difficulty, marks and types.",
      icon: HelpCircle,
      iconBg: "#fff7ed",
      iconColor: "#ea580c",
    },
    {
      id: "exam",
      title: "Exam Settings",
      description: "Manage exam related settings, time limits, and other configurations.",
      icon: FileText,
      iconBg: "#fdf2f8",
      iconColor: "#ec4899",
    },
    {
      id: "notification-settings",
      title: "Notification Settings",
      description: "Configure email, in-app and SMS notification preferences.",
      icon: Bell,
      iconBg: "#eff6ff",
      iconColor: "#4f46e5",
    },
    {
      id: "preferences",
      title: "System Preferences",
      description: "Customize system preferences and display options.",
      icon: SlidersHorizontal,
      iconBg: "#f0f9ff",
      iconColor: "#0284c7",
    },
    {
      id: "backup",
      title: "Backup & Restore",
      description: "Create backup and restore system data when needed.",
      icon: Cloud,
      iconBg: "#f0fdfa",
      iconColor: "#0d9488",
    },
    {
      id: "security",
      title: "Security Settings",
      description: "Manage password policies, session timeouts and security configurations.",
      icon: Lock,
      iconBg: "#fef2f2",
      iconColor: "#ef4444",
    },
    {
      id: "integrations",
      title: "Integration Settings",
      description: "Configure third-party integrations and API settings.",
      icon: LinkIcon,
      iconBg: "#faf5ff",
      iconColor: "#9333ea",
    },
    {
      id: "import-export",
      title: "Import / Export Settings",
      description: "Configure import and export options for data and questions.",
      icon: Download,
      iconBg: "#fffbeb",
      iconColor: "#d97706",
    },
    {
      id: "audit-logs",
      title: "Audit Log Settings",
      description: "Manage audit log settings and activity tracking.",
      icon: FileCheck,
      iconBg: "#f0fdfa",
      iconColor: "#0f766e",
    },
  ];

  const [storeActivities, setStoreActivities] = useState<ActivityItem[]>([]);
  const [storeUsers, setStoreUsers] = useState<UserItem[]>([]);
  const [categoriesList, setCategoriesList] = useState(categories);
  const [viewingActivity, setViewingActivity] = useState<ActivityItem | null>(null);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<ActivityItem | null>(null);
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  // User Management Modal State
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Backup & Restore Modal State
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Category Configuration Modal
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [viewingCategory, setViewingCategory] = useState<any | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<any | null>(null);

  // Reset confirmation
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => examStore.getLastUpdated());

  useEffect(() => {
    const loadData = () => {
      setStoreActivities(examStore.getActivities());
      setStoreUsers(examStore.getUsers());
      setLastUpdatedTime(examStore.getLastUpdated());
    };
    loadData();
    window.addEventListener("exam-cell-store-update", loadData);
    return () => window.removeEventListener("exam-cell-store-update", loadData);
  }, []);

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(storeActivities.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedActivities = storeActivities.slice(startIndex, startIndex + itemsPerPage);

  const activityFormFields: FormFieldDef[] = [
    { name: "activity", label: "Activity / Action", type: "text", required: true },
    {
      name: "module",
      label: "Module / Category",
      type: "select",
      options: [
        { label: "General Settings", value: "General Settings" },
        { label: "User Management", value: "User Management" },
        { label: "Roles & Permissions", value: "Roles & Permissions" },
        { label: "Backup & Restore", value: "Backup & Restore" },
        { label: "System Preferences", value: "System Preferences" },
        { label: "Security Settings", value: "Security Settings" },
        { label: "Question Settings", value: "Question Settings" },
        { label: "Exam Settings", value: "Exam Settings" },
      ],
      required: true,
    },
    { name: "performedBy", label: "Performed By", type: "text", required: true },
    { name: "details", label: "Details & Notes", type: "textarea", required: true },
  ];

  const categoryFormFields: FormFieldDef[] = [
    { name: "title", label: "Module / Category Title", type: "text", required: true },
    { name: "description", label: "Configuration Summary", type: "textarea", required: true },
  ];

  const userFormFields: FormFieldDef[] = [
    { name: "name", label: "Staff / User Full Name", type: "text", required: true },
    { name: "email", label: "Email Address", type: "text", required: true },
    {
      name: "role",
      label: "System Role",
      type: "select",
      options: [
        { label: "Administrator", value: "Administrator" },
        { label: "Faculty", value: "Faculty" },
        { label: "Verifier", value: "Verifier" },
        { label: "HOD", value: "HOD" },
        { label: "Exam Cell Staff", value: "Exam Cell Staff" },
      ],
      required: true,
    },
    { name: "department", label: "Department / Section", type: "text", required: true },
    {
      name: "status",
      label: "Account Status",
      type: "select",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
      required: true,
    },
  ];

  const handleSaveUser = (data: Partial<UserItem>) => {
    if (editingUser) {
      examStore.saveUser({ ...editingUser, ...data });
      setToast("User account updated successfully!");
      setEditingUser(null);
    } else {
      examStore.saveUser(data);
      setToast("New user created successfully!");
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = () => {
    if (deletingUser) {
      examStore.deleteUser(deletingUser.id);
      setToast("User removed from system.");
      setDeletingUser(null);
    }
  };

  const handleDownloadBackup = () => {
    examStore.createFullBackup();
    examStore.logActivity("Downloaded full database backup JSON", "Backup & Restore", "Full database backup file created");
    setToast("Full database backup downloaded as JSON!");
  };

  const handleRestoreFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = examStore.restoreFullBackup(content);
      if (success) {
        setToast("Database restored successfully from backup JSON!");
        setIsBackupModalOpen(false);
      } else {
        setToast("Failed to restore database. Invalid backup format.");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveActivity = (data: Partial<ActivityItem>) => {
    if (editingActivity) {
      examStore.updateActivity(editingActivity.id, data);
      setToast("Audit log entry updated.");
      setEditingActivity(null);
    } else {
      examStore.logActivity(
        data.module || "General Settings",
        data.activity || "Admin Setting Update",
        data.performedBy || "Vignesh",
        data.details || "Updated via settings panel"
      );
      setToast("New audit log entry created.");
      setIsAddingActivity(false);
    }
  };

  const handleDeleteActivity = () => {
    if (deletingActivity) {
      examStore.deleteActivity(deletingActivity.id);
      setToast("Audit log entry deleted.");
      setDeletingActivity(null);
    }
  };

  const handleSaveCategory = (data: any) => {
    if (editingCategory) {
      setCategoriesList((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...c, ...data } : c))
      );
      examStore.logActivity(
        editingCategory.title,
        `Updated ${editingCategory.title} configuration`,
        "Vignesh",
        data.description || "Updated parameters"
      );
      setToast(`${data.title || editingCategory.title} configuration saved!`);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = () => {
    if (deletingCategory) {
      setCategoriesList((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      examStore.logActivity(
        "Settings",
        `Removed ${deletingCategory.title} module`,
        "Vignesh",
        "Module removed from settings dashboard"
      );
      setToast(`${deletingCategory.title} removed.`);
      setDeletingCategory(null);
    }
  };

  const handleResetSystem = () => {
    examStore.resetAll();
    setIsResetConfirmOpen(false);
    setToast("System data has been reset to factory defaults with fresh sample records!");
  };

  return (
    <RoleGuard route="/settings">
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
      <style>{`
        @keyframes float3D {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(1.5deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes radarPing {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.35); opacity: 0.2; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .stat-card-3d {
          position: relative;
          border-radius: 20px;
          padding: 24px;
          color: #ffffff;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }
        .stat-card-3d:hover {
          transform: translateY(-6px) scale(1.015);
        }
        .stat-card-blue {
          background: linear-gradient(135deg, #4338ca 0%, #3b82f6 50%, #6366f1 100%);
          box-shadow: 0 14px 30px -5px rgba(79, 70, 229, 0.4);
        }
        .stat-card-cyan {
          background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%);
          box-shadow: 0 14px 30px -5px rgba(14, 165, 233, 0.4);
        }
        .stat-card-emerald {
          background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
          box-shadow: 0 14px 30px -5px rgba(16, 185, 129, 0.4);
        }
        .stat-card-orange {
          background: linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%);
          box-shadow: 0 14px 30px -5px rgba(249, 115, 22, 0.4);
        }

        .stat-icon-3d-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.3);
          transition: transform 0.3s ease;
        }
        .stat-card-3d:hover .stat-icon-3d-box {
          transform: scale(1.1) rotate(5deg);
        }

        .glow-blue {
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4);
        }
        .glow-cyan {
          box-shadow: 0 0 20px rgba(14, 165, 233, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4);
        }
        .glow-emerald {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4);
        }
        .glow-orange {
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4);
        }

        .stat-arrow-btn-3d {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }
        .stat-card-3d:hover .stat-arrow-btn-3d {
          transform: translateX(4px);
          background: rgba(255, 255, 255, 0.3);
        }

        .widget-card-3d {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .widget-card-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
        }

        .filter-btn-3d {
          transition: all 0.2s ease;
        }
        .filter-btn-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }

        .primary-btn-3d {
          transition: all 0.25s ease;
        }
        .primary-btn-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
        }

        .action-mini-icon-blue {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
          transition: all 0.2s ease;
        }
        .action-mini-icon-blue:hover {
          transform: scale(1.1);
          background: #dbeafe;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .action-mini-icon-purple {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #f5f3ff;
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.15);
          transition: all 0.2s ease;
        }
        .action-mini-icon-purple:hover {
          transform: scale(1.1);
          background: #ede9fe;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .action-mini-icon-cyan {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #f0f9ff;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(2, 132, 199, 0.15);
          transition: all 0.2s ease;
        }
        .action-mini-icon-cyan:hover {
          transform: scale(1.1);
          background: #e0f2fe;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
        }

        .action-mini-icon-emerald {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #ecfdf5;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(5, 150, 105, 0.15);
          transition: all 0.2s ease;
        }
        .action-mini-icon-emerald:hover {
          transform: scale(1.1);
          background: #d1fae5;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .action-mini-icon-orange {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #fff7ed;
          color: #ea580c;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(234, 88, 12, 0.15);
          transition: all 0.2s ease;
        }
        .action-mini-icon-orange:hover {
          transform: scale(1.1);
          background: #ffedd5;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
        }

        .action-mini-icon-rose {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #fff1f2;
          color: #e11d48;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(225, 29, 72, 0.15);
          transition: all 0.2s ease;
        }
        .action-mini-icon-rose:hover {
          transform: scale(1.1);
          background: #ffe4e6;
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
        }

        .activity-row-3d {
          transition: all 0.2s ease;
          border-radius: 12px;
        }
        .activity-row-3d:hover {
          background: #f8fafc;
          transform: translateX(4px);
        }

        .category-card-3d {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .category-card-3d:hover {
          transform: translateY(-4px);
          border-color: #c7d2fe !important;
          box-shadow: 0 10px 24px rgba(99, 102, 241, 0.12) !important;
        }

        .table-row-3d {
          transition: all 0.2s ease;
        }
        .table-row-3d:hover {
          background: #f8fafc;
        }
      `}</style>

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
          <nav style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
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
                  className={`sidebar-btn-3d ${isActive ? "sidebar-btn-active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#ffffff" : "#94a3b8",
                    background: isActive
                      ? "linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)"
                      : "transparent",
                    boxShadow: isActive
                      ? "0 4px 18px rgba(99, 102, 241, 0.45)"
                      : "none",
                    transition: "all 0.25s ease",
                    textAlign: "left",
                    position: "relative",
                  }}
                >
                  <div className={isActive ? "nav-icon-3d" : ""}>
                    <IconComp size={18} />
                  </div>
                  <span style={{ flex: 1 }}>{item.label}</span>

                  {item.badge && (
                    <span
                      className="badge-neon-3d"
                      style={{
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        color: "#ffffff",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.hasArrow && <ChevronRight size={16} color="#ffffff" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Need Help Box */}
        <div
          className="support-card-3d"
          style={{
            background: "linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "16px",
            marginTop: "20px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            className="shield-icon-3d"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
              color: "#60a5fa",
              boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
            }}
          >
            <Shield size={18} />
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
              padding: "8px 12px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
          >
            <span>Contact Support</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </aside>

      {/* ================================= MAIN CONTENT ================================= */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        {/* Top Header */}
        <PortalHeader activeRoute="settings" />


        {/* Scrollable Main Content */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", overflowX: "hidden", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          {/* Header & University Badge */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "26px",
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
                <span>Settings</span>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    boxShadow: "0 4px 14px rgba(124, 58, 237, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
                    color: "#ffffff",
                    animation: "float3D 4s infinite ease-in-out",
                  }}
                >
                  <Settings
                    size={18}
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9)) drop-shadow(0 0 10px rgba(124, 58, 237, 0.8))",
                      animation: "spinSlow 12s linear infinite",
                    }}
                  />
                </div>
              </h1>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                Configure system preferences, user roles, security, and account settings.
              </p>
            </div>

          </div>

          {/* ================= Top 4 Metric Cards (Matching 3D Glow) ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "18px",
              marginBottom: "28px",
            }}
          >
            {/* Metric 1: System Settings */}
            <div
              className="stat-card-3d stat-card-purple"
              onClick={() => {
                const el = document.getElementById("settings-categories-card");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "18px",
                }}
              >
                <div className="stat-icon-3d-box glow-purple">
                  <Settings size={23} color="#ffffff" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(124, 58, 237, 0.8))" }} />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={15} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 500, opacity: 0.95, marginBottom: "4px" }}>
                System Settings
              </div>
              <div style={{ fontSize: "34px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", letterSpacing: "-0.5px" }}>
                {categoriesList.length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Configurations</div>
            </div>

            {/* Metric 2: User Management */}
            <div
              className="stat-card-3d stat-card-cyan"
              onClick={() => setIsUserManagementOpen(true)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "18px",
                }}
              >
                <div className="stat-icon-3d-box glow-cyan">
                  <Users size={23} color="#ffffff" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(6, 182, 212, 0.8))" }} />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={15} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 500, opacity: 0.95, marginBottom: "4px" }}>
                User Management
              </div>
              <div style={{ fontSize: "34px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", letterSpacing: "-0.5px" }}>
                {storeUsers.length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Active Staff & Admins</div>
            </div>

            {/* Metric 3: Roles & Permissions */}
            <div
              className="stat-card-3d stat-card-emerald"
              onClick={() => setToast("System Roles: Administrator, Faculty, Verifier, HOD, Exam Cell Staff")}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "18px",
                }}
              >
                <div className="stat-icon-3d-box glow-emerald">
                  <Shield size={23} color="#ffffff" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(52, 211, 153, 0.8))" }} />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={15} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 500, opacity: 0.95, marginBottom: "4px" }}>
                Roles & Permissions
              </div>
              <div style={{ fontSize: "34px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", letterSpacing: "-0.5px" }}>
                5
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Configured Roles</div>
            </div>

            {/* Metric 4: Backup & Restore */}
            <div
              className="stat-card-3d stat-card-orange"
              onClick={() => setIsBackupModalOpen(true)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "18px",
                }}
              >
                <div className="stat-icon-3d-box glow-orange">
                  <Database size={23} color="#ffffff" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(251, 146, 60, 0.8))" }} />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={15} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 500, opacity: 0.95, marginBottom: "4px" }}>
                Backup & Restore
              </div>
              <div style={{ fontSize: "34px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", letterSpacing: "-0.5px" }}>
                Ready
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Instant JSON Sync</div>
            </div>
          </div>

          {/* ================= Main Content Container (Full Width) ================= */}
          <div style={{ width: "100%" }}>
            {/* ================= LEFT COLUMN: Settings Categories & Recent Activities ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Card 1: Settings Categories */}
              <div
                id="settings-categories-card"
                className="widget-card-3d"
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(226, 232, 240, 0.9)",
                  padding: "24px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div className="action-mini-icon-purple">
                    <Settings size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
                      Settings Categories
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      Manage configuration modules and preferences
                    </div>
                  </div>
                </div>

                {/* 2-Column Grid of Categories */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  {categoriesList.map((cat) => {
                    const CatIcon = cat.icon;
                    
                    return (
                      <div
                        key={cat.id}
                        className="category-card-3d"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "16px",
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                        }}
                      >
                        <div
                          onClick={() => {
                            if (cat.id === "backup") {
                              setIsBackupModalOpen(true);
                            } else if (cat.id === "users") {
                              setIsUserManagementOpen(true);
                            } else {
                              setViewingCategory(cat);
                            }
                          }}
                          style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1 }}
                        >
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "12px",
                              background: cat.iconBg,
                              color: cat.iconColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              boxShadow: `0 4px 12px ${cat.iconColor}25`,
                              transition: "transform 0.2s ease",
                            }}
                          >
                            <CatIcon size={20} />
                          </div>
                          <div>
                            <strong style={{ display: "block", fontSize: "13.5px", color: "#0f172a", marginBottom: "3px", fontWeight: 700 }}>
                              {cat.title}
                            </strong>
                            <p style={{ margin: 0, fontSize: "11.5px", color: "#64748b", lineHeight: 1.4, maxWidth: "230px" }}>
                              {cat.description}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                          <CrudActionButtons
                            onView={() => setViewingCategory(cat)}
                            onEdit={() => setEditingCategory(cat)}
                            onDelete={() => setDeletingCategory(cat)}
                            viewTitle="View Setting"
                            editTitle="Configure Setting"
                            deleteTitle="Remove Module"
                            size={30}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: Recent Activities */}
              <div
                
                className="widget-card-3d"
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(226, 232, 240, 0.9)",
                  padding: "24px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="action-mini-icon-blue">
                      <Clock size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
                        Recent Activities
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        Audit trail of system administrative actions
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                      Total: <strong style={{ color: "#4f46e5" }}>{storeActivities.length}</strong> logged actions
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingActivity(true)}
                      className="primary-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.35)",
                      }}
                    >
                      <Plus size={14} />
                      <span>Add Audit Entry</span>
                    </button>
                  </div>
                </div>

                <div id="recent-activities-table" className="no-scrollbar" style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0", background: "rgba(248, 250, 252, 0.6)" }}>
                        <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em", borderRadius: "8px 0 0 8px" }}>
                          ACTIVITY
                        </th>
                        <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em" }}>
                          MODULE
                        </th>
                        <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em" }}>
                          PERFORMED BY
                        </th>
                        <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em" }}>
                          DATE & TIME
                        </th>
                        <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em", borderRadius: "0 8px 8px 0" }}>
                          DETAILS & ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedActivities.map((row) => (
                        <tr
                          key={row.id}
                          className="table-row-3d"
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            transition: "background 0.15s ease",
                          }}
                        >
                          <td style={{ padding: "14px 12px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                            {row.activity}
                          </td>
                          <td style={{ padding: "14px 12px", fontSize: "12.5px", color: "#334155" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 9px",
                                borderRadius: "6px",
                                background: "#f1f5f9",
                                fontSize: "11.5px",
                                fontWeight: 500,
                              }}
                            >
                              {row.module}
                            </span>
                          </td>
                          <td style={{ padding: "14px 12px", fontSize: "12.5px", color: "#334155" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div
                                style={{
                                  width: "22px",
                                  height: "22px",
                                  borderRadius: "50%",
                                  background: row.performedBy === "System" ? "#e0e7ff" : "#dbeafe",
                                  color: row.performedBy === "System" ? "#4f46e5" : "#2563eb",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {row.performedBy.charAt(0)}
                              </div>
                              <span>{row.performedBy}</span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 12px", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
                            {row.dateTime}
                          </td>
                          <td style={{ padding: "14px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                              <span style={{ fontSize: "12px", color: "#475569" }}>
                                {row.details}
                              </span>
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <CrudActionButtons
                                  onView={() => setViewingActivity(row)}
                                  onEdit={() => setEditingActivity(row)}
                                  onDelete={() => setDeletingActivity(row)}
                                  viewTitle="View Details"
                                  editTitle="Edit Entry"
                                  deleteTitle="Delete Entry"
                                  size={30}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {/* Pagination */}
                <Pagination
                  currentPage={safeCurrentPage}
                  totalItems={storeActivities.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(p) => setCurrentPage(p)}
                  itemName="logged activities"
                />
              </div>
            </div>
          </div>

          {/* Support Banner & Footer */}
          <PortalFooter />
        </main>
      </div>

      {/* ================= Modals & Notifications ================= */}
      {/* View Activity */}
      <ViewModal
        isOpen={!!viewingActivity}
        onClose={() => setViewingActivity(null)}
        title={viewingActivity ? `Audit Activity: ${viewingActivity.activity}` : ""}
        data={viewingActivity || {}}
      />

      {/* View Category */}
      <ViewModal
        isOpen={!!viewingCategory}
        onClose={() => setViewingCategory(null)}
        title={viewingCategory ? `Configuration: ${viewingCategory.title}` : ""}
        data={viewingCategory ? {
          "Module ID": viewingCategory.id,
          "Setting Title": viewingCategory.title,
          "Description": viewingCategory.description,
          "Status": "Active & Enabled",
          "Last Verified": "Today"
        } : {}}
      />

      {/* Edit Activity */}
      <FormModal
        isOpen={!!editingActivity}
        onClose={() => setEditingActivity(null)}
        onSubmit={handleSaveActivity}
        title="Edit Audit Log Entry"
        fields={activityFormFields}
        initialData={editingActivity || {}}
        submitLabel="Save Changes"
      />

      {/* Add Activity */}
      <FormModal
        isOpen={isAddingActivity}
        onClose={() => setIsAddingActivity(false)}
        onSubmit={handleSaveActivity}
        title="Log System Action"
        fields={activityFormFields}
        initialData={{
          activity: "Configured system settings",
          module: "General Settings",
          performedBy: "Vignesh",
          details: "Updated preferences",
        }}
        submitLabel="Create Log"
      />

      {/* Edit Category */}
      <FormModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleSaveCategory}
        title={editingCategory ? `Configure ${editingCategory.title}` : "Configure Setting"}
        fields={categoryFormFields}
        initialData={editingCategory ? {
          title: editingCategory.title,
          description: editingCategory.description,
        } : {}}
        submitLabel="Save Setting"
      />

      {/* Delete Activity Modal */}
      <DeleteModal
        isOpen={!!deletingActivity}
        onClose={() => setDeletingActivity(null)}
        onConfirm={handleDeleteActivity}
        title="Delete Audit Entry"
        message="Are you sure you want to permanently delete this audit log record? This will remove it from the historical audit trail."
        itemName={deletingActivity ? deletingActivity.activity : undefined}
      />

      {/* Delete Category Modal */}
      <DeleteModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Remove Settings Module"
        message="Are you sure you want to remove this settings module from your dashboard?"
        itemName={deletingCategory ? deletingCategory.title : undefined}
      />

      {/* Factory Reset Confirmation Modal */}
      <DeleteModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetSystem}
        title="Reset All System Data?"
        message="This will reset all subjects, syllabus units, question banks, uploads, approvals, notifications, and settings back to their default demo states. Are you sure you want to proceed?"
        itemName="All Portal Data & Local Storage"
      />

      {/* ================= USER MANAGEMENT MODAL ================= */}
      {isUserManagementOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
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
              borderRadius: "20px",
              width: "100%",
              maxWidth: "860px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="action-mini-icon-cyan" style={{ width: "36px", height: "36px" }}>
                  <Users size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                    User Management & Access Control
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Manage portal staff, examiners, and administrative roles
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsAddingUser(true)}
                  className="primary-btn-3d"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} />
                  <span>Add New User</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUserManagementOpen(false)}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="no-scrollbar" style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                    <th style={{ padding: "10px 12px", fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>NAME & EMAIL</th>
                    <th style={{ padding: "10px 12px", fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>ROLE</th>
                    <th style={{ padding: "10px 12px", fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>DEPARTMENT</th>
                    <th style={{ padding: "10px 12px", fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>STATUS</th>
                    <th style={{ padding: "10px 12px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textAlign: "center" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {storeUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px" }}>
                        <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>{u.name}</strong>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{u.email}</span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: u.role === "Administrator" ? "#ede9fe" : "#eff6ff",
                            color: u.role === "Administrator" ? "#7c3aed" : "#2563eb",
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px", fontSize: "12px", color: "#334155" }}>
                        {u.department}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: u.status === "Active" ? "#dcfce7" : "#fee2e2",
                            color: u.status === "Active" ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <CrudActionButtons
                            onEdit={() => setEditingUser(u)}
                            onDelete={() => setDeletingUser(u)}
                            editTitle="Edit User"
                            deleteTitle="Delete User"
                            size={28}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit User Form Modal */}
      <FormModal
        isOpen={isAddingUser || !!editingUser}
        onClose={() => {
          setIsAddingUser(false);
          setEditingUser(null);
        }}
        onSubmit={handleSaveUser}
        title={editingUser ? `Edit User: ${editingUser.name}` : "Create New User Account"}
        fields={userFormFields}
        initialData={
          editingUser || {
            name: "",
            email: "",
            role: "Faculty",
            department: "Visual Communication",
            status: "Active",
          }
        }
        submitLabel={editingUser ? "Save User" : "Create Account"}
      />

      {/* Delete User Modal */}
      <DeleteModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message="Are you sure you want to permanently delete this user account from the exam system?"
        itemName={deletingUser ? `${deletingUser.name} (${deletingUser.email})` : undefined}
      />

      {/* ================= BACKUP & RESTORE MODAL ================= */}
      {isBackupModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
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
              borderRadius: "20px",
              width: "100%",
              maxWidth: "600px",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="action-mini-icon-orange" style={{ width: "36px", height: "36px" }}>
                  <Cloud size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                    Database Backup & Recovery
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Snapshot database state or restore from previously saved files
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBackupModalOpen(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Option 1: Full JSON Backup */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px",
                  background: "#f8fafc",
                }}
              >
                <strong style={{ display: "block", fontSize: "13.5px", color: "#0f172a", marginBottom: "4px" }}>
                  1. Export Complete Database Backup
                </strong>
                <p style={{ fontSize: "11.5px", color: "#64748b", margin: "0 0 12px 0" }}>
                  Download a complete snapshot containing all subjects, syllabus units, question banks, uploads, notifications, users, and audit logs.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="primary-btn-3d"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    color: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Download size={14} />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              {/* Option 2: Restore from JSON */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px",
                  background: "#f8fafc",
                }}
              >
                <strong style={{ display: "block", fontSize: "13.5px", color: "#0f172a", marginBottom: "4px" }}>
                  2. Restore Database from JSON
                </strong>
                <p style={{ fontSize: "11.5px", color: "#64748b", margin: "0 0 12px 0" }}>
                  Select a previously downloaded `.json` backup file to restore system data.
                </p>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#0f172a",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Upload size={14} color="#0284c7" />
                  <span>Choose JSON Backup File</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleRestoreFromFile}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* Option 3: Factory Reset */}
              <div
                style={{
                  border: "1px solid #fecaca",
                  borderRadius: "14px",
                  padding: "16px",
                  background: "#fff5f5",
                }}
              >
                <strong style={{ display: "block", fontSize: "13.5px", color: "#dc2626", marginBottom: "4px" }}>
                  3. Reset Database to Default Data
                </strong>
                <p style={{ fontSize: "11.5px", color: "#64748b", margin: "0 0 12px 0" }}>
                  Clear current local changes and reload factory default sample data across all modules.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsBackupModalOpen(false);
                    setIsResetConfirmOpen(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#ef4444",
                    color: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Reset All Data to Defaults</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <ToastNotification message={toast} onClose={() => setToast(null)} />
    </div>
    </RoleGuard>
  );
}
