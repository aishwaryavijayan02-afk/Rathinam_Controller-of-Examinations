"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookCheck,
  Search,
  Plus,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Building2,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  UserCheck,
  Tag,
  ArrowUpDown,
  BookOpen,
  LayoutGrid,
  List,
} from "lucide-react";
import { examStore, SubjectAllocationItem, INSTITUTIONAL_SUBJECTS } from "../lib/examStore";
import { authStore, AuthUser } from "../lib/auth";
import RoleGuard from "../components/RoleGuard";
import PortalHeader from "../components/PortalHeader";
import PortalFooter from "../components/PortalFooter";
import {
  ViewModal,
  FormModal,
  DeleteModal,
  ToastNotification,
  FormFieldDef,
  ViewField,
} from "../components/CrudModal";

export default function SubjectAllocationPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => authStore.getCurrentUser());
  const [allocations, setAllocations] = useState<SubjectAllocationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [semFilter, setSemFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals state
  const [selectedAllocation, setSelectedAllocation] = useState<SubjectAllocationItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SubjectAllocationItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubjectAllocationItem | null>(null);
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

  const loadData = () => {
    setAllocations(examStore.getSubjectAllocations());
  };

  useEffect(() => {
    loadData();
    window.addEventListener("exam-cell-store-update", loadData);
    return () => window.removeEventListener("exam-cell-store-update", loadData);
  }, []);

  // Filtered allocations
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allocations.filter((item) => {
      // Search matches subject code, name, department, semester, academic year, faculty
      const matchesSearch =
        !q ||
        item.subjectCode.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.semester.toLowerCase().includes(q) ||
        item.academicYear.toLowerCase().includes(q) ||
        (item.facultyName && item.facultyName.toLowerCase().includes(q));

      const matchesDept = deptFilter === "All" || item.department.toLowerCase() === deptFilter.toLowerCase();
      const matchesSem = semFilter === "All" || item.semester.toLowerCase() === semFilter.toLowerCase();
      const matchesYear = yearFilter === "All" || item.academicYear === yearFilter;
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesDept && matchesSem && matchesYear && matchesStatus;
    });
  }, [allocations, searchQuery, deptFilter, semFilter, yearFilter, statusFilter]);

  // Unique options for filters
  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(allocations.map((a) => a.department))).filter(Boolean);
    if (!depts.includes("Visual Communication")) depts.unshift("Visual Communication");
    if (!depts.includes("Computer Science")) depts.push("Computer Science");
    if (!depts.includes("Commerce & Management")) depts.push("Commerce & Management");
    return depts;
  }, [allocations]);

  const academicYearOptions = useMemo(() => {
    const years = Array.from(new Set(allocations.map((a) => a.academicYear))).filter(Boolean);
    if (!years.includes("2024-2025")) years.unshift("2024-2025");
    if (!years.includes("2025-2026")) years.push("2025-2026");
    return years.sort().reverse();
  }, [allocations]);

  const semesterOptions = [
    "Semester 1",
    "Semester 2",
    "Semester 3",
    "Semester 4",
    "Semester 5",
    "Semester 6",
    "Semester 7",
    "Semester 8",
  ];

  // Catalog Options for Subject Selection Dropdowns
  const subjectNameOptions = useMemo(() => {
    const list: { label: string; value: string; code: string; dept: string; credits: number; sem?: string }[] = [];
    const seenNames = new Set<string>();

    INSTITUTIONAL_SUBJECTS.forEach((s) => {
      if (!seenNames.has(s.name)) {
        seenNames.add(s.name);
        const deptShort = s.department.replace("Department of ", "");
        list.push({
          label: `${s.name} (${s.code}) — ${deptShort}`,
          value: s.name,
          code: s.code,
          dept: deptShort,
          credits: s.credits,
          sem: s.semester,
        });
      }
    });

    allocations.forEach((a) => {
      if (a.subjectName && !seenNames.has(a.subjectName)) {
        seenNames.add(a.subjectName);
        list.push({
          label: `${a.subjectName} (${a.subjectCode}) — ${a.department}`,
          value: a.subjectName,
          code: a.subjectCode,
          dept: a.department,
          credits: a.credits || 3,
          sem: a.semester,
        });
      }
    });

    return list;
  }, [allocations]);

  const subjectCodeOptions = useMemo(() => {
    const list: { label: string; value: string; name: string; dept: string; credits: number; sem?: string }[] = [];
    const seenCodes = new Set<string>();

    INSTITUTIONAL_SUBJECTS.forEach((s) => {
      if (!seenCodes.has(s.code)) {
        seenCodes.add(s.code);
        const deptShort = s.department.replace("Department of ", "");
        list.push({
          label: `${s.code} — ${s.name}`,
          value: s.code,
          name: s.name,
          dept: deptShort,
          credits: s.credits,
          sem: s.semester,
        });
      }
    });

    allocations.forEach((a) => {
      if (a.subjectCode && !seenCodes.has(a.subjectCode)) {
        seenCodes.add(a.subjectCode);
        list.push({
          label: `${a.subjectCode} — ${a.subjectName}`,
          value: a.subjectCode,
          name: a.subjectName,
          dept: a.department,
          credits: a.credits || 3,
          sem: a.semester,
        });
      }
    });

    return list;
  }, [allocations]);

  const facultyOptions = useMemo(() => {
    const allFaculty = examStore.getAllStaffFaculty();
    const opts = allFaculty.map((f) => ({
      label: `${f.name} (${f.designation}) — ${f.department}`,
      value: f.name,
    }));
    return [
      { label: "-- Select Faculty (Optional) --", value: "" },
      ...opts,
    ];
  }, []);

  // Form Fields Definition for Create & Edit (100% Dropdown Selection)
  const formFields: FormFieldDef[] = [
    {
      key: "subjectName",
      name: "subjectName",
      label: "Subject Name (Select from Curriculum)",
      type: "select",
      options: [
        { label: "-- Choose Subject from Dropdown --", value: "" },
        ...subjectNameOptions.map((s) => ({ label: s.label, value: s.value })),
      ],
      required: true,
      spanFull: true,
    },
    {
      key: "subjectCode",
      name: "subjectCode",
      label: "Subject Code",
      type: "select",
      options: [
        { label: "-- Select Subject Code --", value: "" },
        ...subjectCodeOptions.map((s) => ({ label: s.label, value: s.value })),
      ],
      required: true,
    },
    {
      key: "department",
      name: "department",
      label: "Department",
      type: "select",
      options: departmentOptions.map((d) => ({ label: d, value: d })),
      required: true,
    },
    {
      key: "semester",
      name: "semester",
      label: "Semester",
      type: "select",
      options: semesterOptions.map((s) => ({ label: s, value: s })),
      required: true,
    },
    {
      key: "academicYear",
      name: "academicYear",
      label: "Academic Year",
      type: "select",
      options: academicYearOptions.map((y) => ({ label: y, value: y })),
      required: true,
    },
    {
      key: "facultyName",
      name: "facultyName",
      label: "Allocated Faculty (Optional)",
      type: "select",
      options: facultyOptions,
    },
    {
      key: "credits",
      name: "credits",
      label: "Credits",
      type: "number",
      placeholder: "e.g. 4",
    },
    {
      key: "status",
      name: "status",
      label: "Allocation Status",
      type: "select",
      options: [
        { label: "Allocated", value: "Allocated" },
        { label: "Active", value: "Active" },
        { label: "Pending", value: "Pending" },
      ],
    },
  ];

  // Dynamic cross-field sync handler when user changes a dropdown
  const handleFormFieldChange = (key: string, val: any, currentValues: Record<string, any>) => {
    if (key === "subjectName") {
      const matched = subjectNameOptions.find((s) => s.value === val);
      if (matched) {
        return {
          subjectCode: matched.code,
          department: matched.dept || currentValues.department,
          credits: matched.credits || currentValues.credits || 4,
          semester: matched.sem || currentValues.semester,
        };
      }
    } else if (key === "subjectCode") {
      const matched = subjectCodeOptions.find((s) => s.value.toUpperCase() === (val || "").toUpperCase());
      if (matched) {
        return {
          subjectName: matched.name,
          department: matched.dept || currentValues.department,
          credits: matched.credits || currentValues.credits || 4,
          semester: matched.sem || currentValues.semester,
        };
      }
    }
    return undefined;
  };

  // Validation & Submit Handler for Add
  const handleCreateSubmit = (values: Record<string, any>) => {
    let code = (values.subjectCode || "").trim().toUpperCase();
    let name = (values.subjectName || "").trim();
    let dept = (values.department || "").trim();
    const sem = (values.semester || "").trim();
    const year = (values.academicYear || "").trim();

    // Auto-resolve code or name if only one was selected
    if (!code && name) {
      const match = subjectNameOptions.find((s) => s.value === name);
      if (match) code = match.code.toUpperCase();
    }
    if (!name && code) {
      const match = subjectCodeOptions.find((s) => s.value.toUpperCase() === code);
      if (match) name = match.name;
    }
    if (!dept && (name || code)) {
      const match = subjectNameOptions.find((s) => s.value === name) || subjectCodeOptions.find((s) => s.value === code);
      if (match) dept = match.dept;
    }

    // Field-level validation
    if (!code) {
      showToast("Please select a Subject Code.", "danger");
      return;
    }
    if (!name) {
      showToast("Please select a Subject Name.", "danger");
      return;
    }
    if (!dept) {
      showToast("Please select a Department.", "danger");
      return;
    }
    if (!sem) {
      showToast("Please select a Semester.", "danger");
      return;
    }
    if (!year) {
      showToast("Please select an Academic Year.", "danger");
      return;
    }

    // Duplicate check
    const isDuplicate = allocations.some(
      (a) =>
        a.subjectCode.toUpperCase() === code &&
        a.academicYear === year &&
        a.semester.toLowerCase() === sem.toLowerCase() &&
        a.department.toLowerCase() === dept.toLowerCase()
    );

    if (isDuplicate) {
      showToast(
        `Duplicate Allocation: ${code} is already allocated for ${dept} in ${sem} (${year}).`,
        "danger"
      );
      return;
    }

    try {
      examStore.saveSubjectAllocation({
        subjectCode: code,
        subjectName: name,
        department: dept,
        semester: sem,
        academicYear: year,
        facultyName: values.facultyName,
        credits: values.credits ? Number(values.credits) : 3,
        status: values.status || "Allocated",
      });
      setIsAddOpen(false);
      showToast(`Subject ${code} - "${name}" successfully allocated!`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to save subject allocation.", "danger");
    }
  };

  // Validation & Submit Handler for Edit
  const handleEditSubmit = (values: Record<string, any>) => {
    if (!editTarget) return;

    let code = (values.subjectCode || "").trim().toUpperCase();
    let name = (values.subjectName || "").trim();
    let dept = (values.department || "").trim();
    const sem = (values.semester || "").trim();
    const year = (values.academicYear || "").trim();

    if (!code && name) {
      const match = subjectNameOptions.find((s) => s.value === name);
      if (match) code = match.code.toUpperCase();
    }
    if (!name && code) {
      const match = subjectCodeOptions.find((s) => s.value.toUpperCase() === code);
      if (match) name = match.name;
    }
    if (!dept && (name || code)) {
      const match = subjectNameOptions.find((s) => s.value === name) || subjectCodeOptions.find((s) => s.value === code);
      if (match) dept = match.dept;
    }

    if (!code || !name || !dept || !sem || !year) {
      showToast("Please fill in all mandatory fields.", "danger");
      return;
    }

    // Duplicate check excluding self
    const isDuplicate = allocations.some(
      (a) =>
        a.id !== editTarget.id &&
        a.subjectCode.toUpperCase() === code &&
        a.academicYear === year &&
        a.semester.toLowerCase() === sem.toLowerCase() &&
        a.department.toLowerCase() === dept.toLowerCase()
    );

    if (isDuplicate) {
      showToast(
        `Another record exists with ${code} for ${dept} in ${sem} (${year}).`,
        "danger"
      );
      return;
    }

    try {
      examStore.saveSubjectAllocation({
        id: editTarget.id,
        subjectCode: code,
        subjectName: name,
        department: dept,
        semester: sem,
        academicYear: year,
        facultyName: values.facultyName,
        credits: values.credits ? Number(values.credits) : editTarget.credits,
        status: values.status || editTarget.status,
      });
      setEditTarget(null);
      showToast(`Allocation for ${code} updated successfully.`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to update allocation.", "danger");
    }
  };

  // Confirm Delete Handler
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    try {
      examStore.deleteSubjectAllocation(deleteTarget.id);
      showToast(`Allocation for "${deleteTarget.subjectCode}" removed.`, "success");
      setDeleteTarget(null);
    } catch (err: any) {
      showToast("Failed to delete subject allocation.", "danger");
    }
  };

  // Formatted fields for View Details modal
  const viewDetailsFields: ViewField[] = useMemo(() => {
    if (!selectedAllocation) return [];
    return [
      { label: "Subject Code", value: <strong>{selectedAllocation.subjectCode}</strong> },
      { label: "Subject Name", value: selectedAllocation.subjectName },
      { label: "Department", value: selectedAllocation.department },
      { label: "Semester", value: selectedAllocation.semester },
      { label: "Academic Year", value: selectedAllocation.academicYear },
      {
        label: "Assigned Faculty",
        value: selectedAllocation.facultyName || "Not Assigned",
      },
      {
        label: "Credits",
        value: selectedAllocation.credits ? `${selectedAllocation.credits} Credits` : "3 Credits",
      },
      {
        label: "Allocation Status",
        value: (
          <span
            style={{
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 700,
              background:
                selectedAllocation.status === "Active"
                  ? "#dcfce7"
                  : selectedAllocation.status === "Allocated"
                  ? "#e0e7ff"
                  : "#fef3c7",
              color:
                selectedAllocation.status === "Active"
                  ? "#15803d"
                  : selectedAllocation.status === "Allocated"
                  ? "#4338ca"
                  : "#b45309",
            }}
          >
            {selectedAllocation.status}
          </span>
        ),
      },
      { label: "Allocated Date", value: selectedAllocation.createdAt || "Recent" },
      { label: "Last Updated", value: selectedAllocation.updatedAt || "N/A" },
    ];
  }, [selectedAllocation]);

  // Statistics KPIs
  const totalAllocations = allocations.length;
  const uniqueDepartments = new Set(allocations.map((a) => a.department)).size;
  const activeAllocations = allocations.filter((a) => a.status === "Active" || a.status === "Allocated").length;
  const pendingAllocations = allocations.filter((a) => a.status === "Pending").length;

  return (
    <RoleGuard route="/subject-allocation">
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
        <PortalHeader activeRoute="/subject-allocation" />

        <main style={{ flex: 1, padding: "28px 32px", maxWidth: "1480px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
          {/* Header Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                  }}
                >
                  <BookCheck size={22} color="#ffffff" />
                </div>
                <div>
                  <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                    School Allocation
                  </h1>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                    Manage school curriculum mapping by Subject Code, Department, Semester, and Academic Year
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {/* View Mode Toggle */}
              <div
                style={{
                  display: "flex",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "3px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: viewMode === "table" ? "#f1f5f9" : "transparent",
                    color: viewMode === "table" ? "#0f172a" : "#64748b",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <List size={14} />
                  <span>Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: viewMode === "grid" ? "#f1f5f9" : "transparent",
                    color: viewMode === "grid" ? "#0f172a" : "#64748b",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <LayoutGrid size={14} />
                  <span>Cards</span>
                </button>
              </div>

              {/* Add Allocation Button */}
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)",
                  transition: "all 0.15s ease",
                }}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Allocate Subject</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "18px 20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#e0e7ff",
                  color: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={20} />
              </div>
              <div>
                <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                  Total Allocations
                </span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>{totalAllocations}</div>
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "18px 20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#dcfce7",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                  Active & Allocated
                </span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#16a34a" }}>{activeAllocations}</div>
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "18px 20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Building2 size={20} />
              </div>
              <div>
                <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                  Departments Covered
                </span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#2563eb" }}>{uniqueDepartments}</div>
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "18px 20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#fef3c7",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Clock size={20} />
              </div>
              <div>
                <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                  Pending Review
                </span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#d97706" }}>{pendingAllocations}</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "16px 20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
              marginBottom: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Search Input */}
            <div
              style={{
                position: "relative",
                flex: "1 1 280px",
                minWidth: "240px",
              }}
            >
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search subject code, name, department, semester, academic year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 38px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13.5px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Filters */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Dept:</span>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    color: "#0f172a",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="All">All Departments</option>
                  {departmentOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Sem:</span>
                <select
                  value={semFilter}
                  onChange={(e) => setSemFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    color: "#0f172a",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="All">All Semesters</option>
                  {semesterOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Year:</span>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    color: "#0f172a",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="All">All Years</option>
                  {academicYearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    color: "#0f172a",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="All">All Status</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {(searchQuery || deptFilter !== "All" || semFilter !== "All" || yearFilter !== "All" || statusFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDeptFilter("All");
                    setSemFilter("All");
                    setYearFilter("All");
                    setStatusFilter("All");
                  }}
                  style={{
                    padding: "7px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "#f1f5f9",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Allocation Content (Table or Grid) */}
          {filteredList.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "60px 24px",
                textAlign: "center",
                border: "1px dashed #cbd5e1",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "#f1f5f9",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                }}
              >
                <BookCheck size={28} />
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" }}>
                No subject allocations found
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 18px 0" }}>
                {searchQuery || deptFilter !== "All" || semFilter !== "All"
                  ? "Try adjusting your search criteria or filter options."
                  : "Start by allocating your first curriculum subject."}
              </p>
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#4f46e5",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Allocate Subject Now
              </button>
            </div>
          ) : viewMode === "table" ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                overflow: "hidden",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "14px 20px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                        Subject Code
                      </th>
                      <th style={{ padding: "14px 20px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                        Subject Name
                      </th>
                      <th style={{ padding: "14px 20px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                        Department
                      </th>
                      <th style={{ padding: "14px 20px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                        Semester
                      </th>
                      <th style={{ padding: "14px 20px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                        Academic Year
                      </th>
                      <th style={{ padding: "14px 20px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                        Faculty
                      </th>
                      <th style={{ padding: "14px 20px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                        Status
                      </th>
                      <th style={{ padding: "14px 20px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", textAlign: "right" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: idx === filteredList.length - 1 ? "none" : "1px solid #f1f5f9",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#4f46e5" }}>
                          {item.subjectCode}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13.5px", fontWeight: 600, color: "#0f172a" }}>
                          {item.subjectName}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#475569" }}>
                          {item.department}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#475569" }}>
                          <span style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px", fontWeight: 600 }}>
                            {item.semester}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#475569" }}>
                          {item.academicYear}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#334155", fontWeight: 500 }}>
                          {item.facultyName ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                              <UserCheck size={14} color="#16a34a" />
                              {item.facultyName}
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 10px",
                              borderRadius: "20px",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              background:
                                item.status === "Active"
                                  ? "#dcfce7"
                                  : item.status === "Allocated"
                                  ? "#e0e7ff"
                                  : "#fef3c7",
                              color:
                                item.status === "Active"
                                  ? "#15803d"
                                  : item.status === "Allocated"
                                  ? "#4338ca"
                                  : "#b45309",
                              border:
                                item.status === "Active"
                                  ? "1px solid #bbf7d0"
                                  : item.status === "Allocated"
                                  ? "1px solid #c7d2fe"
                                  : "1px solid #fde68a",
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                            {/* View */}
                            <button
                              type="button"
                              onClick={() => setSelectedAllocation(item)}
                              title="View Details"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                background: "#ffffff",
                                color: "#475569",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Eye size={15} />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => setEditTarget(item)}
                              title="Edit Allocation"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                border: "1px solid #e0e7ff",
                                background: "#eff6ff",
                                color: "#2563eb",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Edit3 size={15} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              title="Delete Allocation"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                border: "1px solid #fee2e2",
                                background: "#fff1f2",
                                color: "#e11d48",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Card Grid View */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "18px",
              }}
            >
              {filteredList.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    border: "1px solid #e2e8f0",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                    position: "relative",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: "#e0e7ff",
                          color: "#4338ca",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {item.subjectCode}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "12px",
                          background:
                            item.status === "Active"
                              ? "#dcfce7"
                              : item.status === "Allocated"
                              ? "#e0e7ff"
                              : "#fef3c7",
                          color:
                            item.status === "Active"
                              ? "#15803d"
                              : item.status === "Allocated"
                              ? "#4338ca"
                              : "#b45309",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
                      {item.subjectName}
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: "#64748b" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Building2 size={14} color="#94a3b8" />
                        <span>{item.department}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <GraduationCap size={14} color="#94a3b8" />
                        <span>
                          {item.semester} • {item.academicYear}
                        </span>
                      </div>
                      {item.facultyName && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#334155" }}>
                          <UserCheck size={14} color="#16a34a" />
                          <strong>{item.facultyName}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {item.credits ? `${item.credits} Credits` : "3 Credits"}
                    </span>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedAllocation(item)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          color: "#475569",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditTarget(item)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "6px",
                          border: "1px solid #e0e7ff",
                          background: "#eff6ff",
                          color: "#2563eb",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "6px",
                          border: "1px solid #fee2e2",
                          background: "#fff1f2",
                          color: "#e11d48",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <PortalFooter />

        {/* View Modal */}
        <ViewModal
          isOpen={Boolean(selectedAllocation)}
          onClose={() => setSelectedAllocation(null)}
          title={selectedAllocation ? `${selectedAllocation.subjectCode} — Allocation Details` : "Allocation Details"}
          subtitle="Complete record of subject department, semester, and academic year mapping."
          badge={selectedAllocation?.status}
          fields={viewDetailsFields}
          onEdit={() => {
            if (selectedAllocation) {
              setEditTarget(selectedAllocation);
              setSelectedAllocation(null);
            }
          }}
          onDelete={() => {
            if (selectedAllocation) {
              setDeleteTarget(selectedAllocation);
              setSelectedAllocation(null);
            }
          }}
        />

        {/* Add Modal */}
        <FormModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Allocate New Subject"
          subtitle="Assign subject code, name, department, semester, and academic year."
          fields={formFields}
          onFieldChange={handleFormFieldChange}
          initialValues={{
            subjectName: subjectNameOptions[0]?.value || "Augmented Reality & VFX",
            subjectCode: subjectNameOptions[0]?.code || "VIS-301",
            department: subjectNameOptions[0]?.dept || "Visual Communication",
            semester: subjectNameOptions[0]?.sem || "Semester 5",
            academicYear: "2024-2025",
            status: "Allocated",
            credits: subjectNameOptions[0]?.credits || 4,
          }}
          onSubmit={handleCreateSubmit}
          submitLabel="Create Allocation"
        />

        {/* Edit Modal */}
        <FormModal
          isOpen={Boolean(editTarget)}
          onClose={() => setEditTarget(null)}
          title={editTarget ? `Edit Allocation — ${editTarget.subjectCode}` : "Edit Allocation"}
          subtitle="Update subject code, department, semester, or academic year."
          fields={formFields}
          onFieldChange={handleFormFieldChange}
          initialValues={editTarget || {}}
          onSubmit={handleEditSubmit}
          submitLabel="Update Allocation"
        />

        {/* Delete Modal */}
        <DeleteModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Subject Allocation"
          itemName={deleteTarget ? `${deleteTarget.subjectCode} (${deleteTarget.subjectName})` : ""}
          message={
            deleteTarget
              ? `Are you sure you want to remove the subject allocation for "${deleteTarget.subjectCode} - ${deleteTarget.subjectName}" in ${deleteTarget.department}?`
              : "Are you sure you want to delete this allocation?"
          }
          onConfirm={handleDeleteConfirm}
        />

        {/* Toast Notification */}
        <ToastNotification
          message={toast.message}
          isOpen={toast.isOpen}
          onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
          type={toast.type}
        />
      </div>
    </RoleGuard>
  );
}
