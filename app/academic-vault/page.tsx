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
  Trash2,
  UploadCloud,
  Users,
  Briefcase,
  Archive,
  FileSpreadsheet,
} from "lucide-react";
import { examStore, QuestionItem, SyllabusUnit, SubjectItem } from "../lib/examStore";
import { authStore, AuthUser, hasPermission } from "../lib/auth";
import RoleGuard from "../components/RoleGuard";
import { ToastNotification } from "../components/CrudModal";
import PortalFooter from "../components/PortalFooter";
import PortalHeader from "../components/PortalHeader";

export default function AcademicVaultPage() {
  const router = useRouter();

  // Sub-mode for Right Partition (Question Bank Upload): "bulk" vs "manual"
  const [qbUploadMode, setQbUploadMode] = useState<"bulk" | "manual">("bulk");

  // Auth User State
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => authStore.getCurrentUser());

  useEffect(() => {
    const handleAuth = () => {
      setCurrentUser(authStore.getCurrentUser());
    };
    window.addEventListener("exam-cell-auth-update", handleAuth);
    return () => window.removeEventListener("exam-cell-auth-update", handleAuth);
  }, []);

  interface MenuItemDef {
    id: string;
    label: string;
    icon: any;
    route: string;
    badge?: string;
    hasArrow?: boolean;
  }

  const rawMenuItems: MenuItemDef[] = [
    { id: "dashboard", label: "Dashboard", icon: Home, route: "/dashboard" },
    { id: "school", label: "School", icon: School, route: "/subjects" },
    {
      id: "staff-work-status",
      label: "Staff Work Status",
      icon: Briefcase,
      route: "/staff-work-status",
    },
    {
      id: "academic-vault",
      label: "Academic Vault",
      icon: Archive,
      badge: "Vault",
      hasArrow: true,
      route: "/academic-vault",
    },
    {
      id: "verify-questions",
      label: "Verify Questions",
      icon: Search,
      route: "/verify-questions",
    },
    { id: "approval", label: "Approval", icon: CheckSquare, route: "/approval" },
    { id: "reports", label: "Reports", icon: BarChart2, route: "/reports" },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      route: "/notifications",
    },
    {
      id: "manual-questions",
      label: "Manual Questions",
      icon: Edit3,
      badge: "New",
      route: "/manual-questions",
    },
    {
      id: "print-paper",
      label: "Print Question Paper",
      icon: Printer,
      badge: "Print",
      route: "/print-paper",
    },
    { id: "settings", label: "Settings", icon: Settings, route: "/settings" },
  ];

  const menuItems = rawMenuItems.filter((item) =>
    hasPermission(currentUser.role, item.route, currentUser.isSubjectFaculty)
  );

  // Store data
  const [questions, setQuestions] = useState<QuestionItem[]>(() => {
    if (typeof window !== "undefined") {
      return examStore.getQuestions() || [];
    }
    return [];
  });

  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    if (typeof window !== "undefined") {
      return examStore.getSubjects() || [];
    }
    return [];
  });

  const [units, setUnits] = useState<SyllabusUnit[]>(() => {
    if (typeof window !== "undefined") {
      return examStore.getUnits() || [];
    }
    return [];
  });

  useEffect(() => {
    const loadData = () => {
      setQuestions(examStore.getQuestions() || []);
      setSubjects(examStore.getSubjects() || []);
      setUnits(examStore.getUnits() || []);
    };
    loadData();
    window.addEventListener("exam-cell-store-update", loadData);
    return () => window.removeEventListener("exam-cell-store-update", loadData);
  }, []);

  // ---------------- PARTITION 1: SYLLABUS HUB STATE ----------------
  const [syllabusSubject, setSyllabusSubject] = useState("");
  const [syllabusCode, setSyllabusCode] = useState("");
  const [syllabusSemester, setSyllabusSemester] = useState("Semester 1");
  const [syllabusDepartment, setSyllabusDepartment] = useState("");
  const [syllabusFileName, setSyllabusFileName] = useState<string | null>(null);
  const syllabusFileRef = useRef<HTMLInputElement>(null);

  const handleSyllabusFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSyllabusFileName(file.name);
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    if (!syllabusSubject) {
      setSyllabusSubject(baseName);
      setSyllabusCode(`SUB-${Math.floor(100 + Math.random() * 900)}`);
      setSyllabusDepartment("General Studies");
    }
    showToast(`File "${file.name}" uploaded successfully!`);
  };

  const handleSaveSyllabusPack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusSubject.trim()) {
      showToast("Please enter a valid Subject Name.", "danger");
      return;
    }

    const existingSub = subjects.find(
      (s) => s.name.toLowerCase() === syllabusSubject.toLowerCase() || (syllabusCode && s.code === syllabusCode)
    );
    const newId = existingSub?.id || `sub-${Date.now()}`;
    const subItem: SubjectItem = {
      id: newId,
      name: syllabusSubject.trim(),
      code: syllabusCode.trim() || `SUB-${Math.floor(100 + Math.random() * 900)}`,
      semester: syllabusSemester,
      department: syllabusDepartment.trim() || "Department of Visual Communication",
      totalQuestions: existingSub?.totalQuestions || 20,
      approved: existingSub?.approved || 15,
      pending: existingSub?.pending || 5,
      verified: existingSub?.verified || 15,
      status: "In Progress",
      credits: 3,
      completed: "15 (75%)",
    };
    examStore.saveSubject(subItem);

    // Save standard 5 units for this syllabus
    const defaultFive = [
      { num: "1", name: "Introduction & Foundational Concepts", topics: ["History & Evolution", "Core Principles & Taxonomy", "Theoretical Foundations", "Domain Fundamentals"] },
      { num: "2", name: "Core Architectures & Standard Workflows", topics: ["Process Planning", "Structural Methodologies", "Standard Operating Pipelines", "Technical Specifications"] },
      { num: "3", name: "Advanced Methodologies & Execution", topics: ["Optimization Strategies", "Performance Profiling", "Advanced Toolsets", "Integration Frameworks"] },
      { num: "4", name: "Quality Assurance, Ethics & Compliance", topics: ["Regulatory Frameworks", "Intellectual Property Rights", "Industry Standards", "Professional Ethics"] },
      { num: "5", name: "Industry Applications & Capstone Project", topics: ["Case Studies", "Real-world Project Execution", "Capstone Assessment", "Portfolio Evaluation"] },
    ];

    defaultFive.forEach((ud) => {
      const unitItem: SyllabusUnit = {
        id: `unit-${subItem.id}-${ud.num}`,
        num: ud.num,
        name: ud.name,
        subject: subItem.name,
        topics: ud.topics.length,
        docs: 1,
        subtopics: ud.topics,
        coMapping: [`CO${ud.num}`],
        description: `OBE Curriculum specification for Unit ${ud.num}`,
      };
      examStore.saveUnit(unitItem);
    });

    // Also register syllabus into the 4-tier approval status tracker
    examStore.saveSyllabusApproval({
      courseCode: subItem.code,
      courseName: subItem.name,
      department: subItem.department,
      semester: subItem.semester,
      submittedBy: currentUser.name || "Faculty Member",
      submitterEmail: currentUser.email || "faculty@rathinam.in",
      submittedAt:
        new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
        ", " +
        new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      totalUnits: 5,
      totalTopics: 20,
      stage: "hod",
      status: "Pending",
      staffStatus: "Submitted",
      hodStatus: "Pending",
      deanStatus: "Waiting_HOD",
      coeStatus: "Waiting_Dean",
      remarks: "Syllabus pack ingested with 5 units. Awaiting HOD scrutiny and curriculum audit.",
    });

    // Reset form inputs after save
    setSyllabusFileName(null);
    setSyllabusSubject("");
    setSyllabusCode("");
    setSyllabusDepartment("");
    showToast(`Syllabus "${subItem.name}" saved & ingested into Vault!`);
  };

  // ---------------- PARTITION 2: QUESTION BANK STATE ----------------
  const [bulkFileName, setBulkFileName] = useState<string | null>(null);
  const [bulkSubject, setBulkSubject] = useState(subjects[0]?.name || "General");
  const bulkFileRef = useRef<HTMLInputElement>(null);
  const [parsedBulkCount, setParsedBulkCount] = useState(0);

  // Manual Question state
  const [manualSubject, setManualSubject] = useState(subjects[0]?.name || "General");
  const [manualUnit, setManualUnit] = useState(1);
  const [manualTopic, setManualTopic] = useState("Foundations");
  const [manualType, setManualType] = useState<"MCQ" | "Descriptive">("MCQ");
  const [manualQuestionText, setManualQuestionText] = useState("");
  const [manualMarks, setManualMarks] = useState(2);
  const [manualDifficulty, setManualDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [manualBloom, setManualBloom] = useState("Understand");
  const [manualOptionA, setManualOptionA] = useState("");
  const [manualOptionB, setManualOptionB] = useState("");
  const [manualOptionC, setManualOptionC] = useState("");
  const [manualOptionD, setManualOptionD] = useState("");
  const [manualCorrectAnswer, setManualCorrectAnswer] = useState("A");

  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFileName(file.name);
    const count = Math.floor(10 + Math.random() * 8);
    setParsedBulkCount(count);
    showToast(`Analyzed ${file.name}: ${count} questions parsed!`);
  };

  const handleCommitBulkImport = () => {
    if (!bulkFileName) {
      showToast("Please upload a spreadsheet or Word question pack.", "danger");
      return;
    }

    const targetSub = bulkSubject || (subjects[0]?.name ?? "General");
    const sampleQs: QuestionItem[] = [
      {
        id: `q-bulk-${Date.now()}-1`,
        code: `Q-${targetSub.slice(0, 3).toUpperCase()}-B1`,
        question: `Explain the fundamental principles and standard operating frameworks of ${targetSub}.`,
        subject: targetSub,
        unit: "1",
        topic: "Foundations",
        type: "Descriptive",
        difficulty: "Medium",
        marks: 5,
        bloomLevel: "Understand",
        status: "Pending",
        uploadedBy: currentUser.name || "Faculty",
      },
      {
        id: `q-bulk-${Date.now()}-2`,
        code: `Q-${targetSub.slice(0, 3).toUpperCase()}-B2`,
        question: `Which industry guideline dictates quality compliance in ${targetSub}?`,
        subject: targetSub,
        unit: "2",
        topic: "Standard Operations",
        type: "MCQ",
        difficulty: "Easy",
        marks: 2,
        bloomLevel: "Remember",
        status: "Pending",
        options: ["Option A: Calibrated Benchmark Standard", "Option B: Uncalibrated Output", "Option C: Random Deviation", "Option D: None of the above"],
        correctAnswer: "Option A: Calibrated Benchmark Standard",
        uploadedBy: currentUser.name || "Faculty",
      },
      {
        id: `q-bulk-${Date.now()}-3`,
        code: `Q-${targetSub.slice(0, 3).toUpperCase()}-B3`,
        question: `Critically evaluate optimization criteria in advanced ${targetSub} implementations.`,
        subject: targetSub,
        unit: "3",
        topic: "Optimization",
        type: "Descriptive",
        difficulty: "Hard",
        marks: 10,
        bloomLevel: "Analyze",
        status: "Pending",
        uploadedBy: currentUser.name || "Faculty",
      },
    ];

    sampleQs.forEach((q) => examStore.saveQuestion(q));
    showToast(`Ingested questions from "${bulkFileName}" into Question Bank!`);
    setBulkFileName(null);
    setParsedBulkCount(0);
  };

  const handleSaveManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuestionText.trim()) {
      showToast("Please enter the question statement.", "danger");
      return;
    }

    const targetSub = manualSubject || (subjects[0]?.name ?? "General");
    const options =
      manualType === "MCQ"
        ? [
            `A) ${manualOptionA.trim() || "Option A"}`,
            `B) ${manualOptionB.trim() || "Option B"}`,
            `C) ${manualOptionC.trim() || "Option C"}`,
            `D) ${manualOptionD.trim() || "Option D"}`,
          ]
        : undefined;

    const newQ: QuestionItem = {
      id: `q-man-${Date.now()}`,
      code: `Q-${targetSub.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      question: manualQuestionText.trim(),
      subject: targetSub,
      unit: String(manualUnit),
      topic: manualTopic,
      type: manualType,
      difficulty: manualDifficulty,
      marks: manualMarks,
      bloomLevel: manualBloom as any,
      status: "Pending",
      options: options,
      correctAnswer: manualType === "MCQ" ? `Option ${manualCorrectAnswer}` : undefined,
      uploadedBy: currentUser.name || "Faculty",
    };

    examStore.saveQuestion(newQ);
    showToast(`Question "${newQ.code}" saved to Question Bank!`);
    setManualQuestionText("");
    setManualOptionA("");
    setManualOptionB("");
    setManualOptionC("");
    setManualOptionD("");
  };

  // Toast State
  const [toast, setToast] = useState<{ message: string; isOpen: boolean; type?: "success" | "danger" }>({
    message: "",
    isOpen: false,
  });

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, isOpen: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isOpen: false })), 3000);
  };

  return (
    <RoleGuard route="/academic-vault">
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
                }}
              />
            </div>

            {/* Navigation Items with 3D Glow Icons and Animations */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {menuItems.map((item) => {
                const IconComp = item.icon;
                const isActive = item.id === "academic-vault";

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
                fontWeight: 700,
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
            height: "100vh",
            maxHeight: "100vh",
            overflow: "hidden",
            background: "#f4f6fa",
            color: "#0f172a",
          }}
        >
          <PortalHeader
            activeRoute="/academic-vault"
          />

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
            {/* Top Page Title Ribbon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                    letterSpacing: "-0.02em",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  Academic Vault 🏛️
                </h1>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "#ede9fe",
                    color: "#6d28d9",
                    border: "1px solid #ddd6fe",
                  }}
                >
                  📚 {subjects.length} Syllabi
                </span>
                <span
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "#e0f2fe",
                    color: "#0284c7",
                    border: "1px solid #bae6fd",
                  }}
                >
                  📥 {questions.length} Questions
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 2-PARTITION SPLIT LAYOUT (LEFT: SYLLABUS UPLOAD | RIGHT: QB UPLOAD)       */}
            {/* ========================================================================= */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                alignItems: "stretch",
              }}
            >
              {/* ========================================================= */}
              {/* LEFT PARTITION: SYLLABUS UPLOAD                           */}
              {/* ========================================================= */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
                {/* 1. Left Header Banner */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #4338ca 0%, #3730a3 100%)",
                    borderRadius: "14px",
                    padding: "14px 18px",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 4px 14px rgba(67, 56, 202, 0.25)",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileText size={18} />
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 800 }}>1. Syllabus Upload</div>
                </div>

                {/* 2. Left Upload Card */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    padding: "18px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#1e293b", marginBottom: "12px" }}>
                    📤 Upload Syllabus Document
                  </div>

                  {/* Compact File Dropzone */}
                  <div
                    onClick={() => syllabusFileRef.current?.click()}
                    style={{
                      border: "2px dashed #c7d2fe",
                      borderRadius: "10px",
                      padding: "16px",
                      textAlign: "center",
                      background: syllabusFileName ? "#f5f3ff" : "#fbfbfe",
                      cursor: "pointer",
                      marginBottom: "14px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <input
                      type="file"
                      ref={syllabusFileRef}
                      onChange={handleSyllabusFileUpload}
                      accept=".docx,.doc,.pdf,.xlsx,.txt"
                      style={{ display: "none" }}
                    />
                    <UploadCloud size={24} color="#6366f1" />
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>
                      {syllabusFileName ? `Attached: ${syllabusFileName}` : "Click or Drag & Drop Syllabus (.docx, .pdf, .xlsx)"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Supported formats: Microsoft Word (.docx), PDF, Excel (.xlsx)
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSaveSyllabusPack} style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                            Subject Name *
                          </label>
                          <input
                            type="text"
                            value={syllabusSubject}
                            onChange={(e) => setSyllabusSubject(e.target.value)}
                            placeholder="e.g. Visual Communication"
                            required
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "7px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12.5px",
                              boxSizing: "border-box",
                              fontWeight: 600,
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                            Subject Code *
                          </label>
                          <input
                            type="text"
                            value={syllabusCode}
                            onChange={(e) => setSyllabusCode(e.target.value)}
                            placeholder="e.g. VIS-101"
                            required
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "7px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12.5px",
                              boxSizing: "border-box",
                              fontWeight: 600,
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "10px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                            Semester
                          </label>
                          <select
                            value={syllabusSemester}
                            onChange={(e) => setSyllabusSemester(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "7px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12.5px",
                              background: "#ffffff",
                              boxSizing: "border-box",
                              fontWeight: 600,
                            }}
                          >
                            <option value="Semester 1">Semester 1</option>
                            <option value="Semester 2">Semester 2</option>
                            <option value="Semester 3">Semester 3</option>
                            <option value="Semester 4">Semester 4</option>
                            <option value="Semester 5">Semester 5</option>
                            <option value="Semester 6">Semester 6</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                            Department
                          </label>
                          <input
                            type="text"
                            value={syllabusDepartment}
                            onChange={(e) => setSyllabusDepartment(e.target.value)}
                            placeholder="e.g. Visual Communication"
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "7px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12.5px",
                              boxSizing: "border-box",
                              fontWeight: 600,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                      <button
                        type="submit"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "9px 20px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                        }}
                      >
                        <CheckCircle2 size={15} />
                        <span>Save & Ingest Syllabus</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* ========================================================= */}
              {/* RIGHT PARTITION: QUESTION BANK UPLOAD                     */}
              {/* ========================================================= */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
                {/* 1. Right Header Banner */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                    borderRadius: "14px",
                    padding: "14px 18px",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 4px 14px rgba(2, 132, 199, 0.25)",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UploadCloud size={18} />
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 800 }}>2. Question Bank Upload</div>
                </div>

                {/* 2. Right Upload Card (Bulk & Manual Authoring) */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    padding: "18px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  {/* Mode Switcher Buttons */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                    <button
                      type="button"
                      onClick={() => setQbUploadMode("bulk")}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "none",
                        background: qbUploadMode === "bulk" ? "linear-gradient(135deg, #0284c7, #0369a1)" : "#f1f5f9",
                        color: qbUploadMode === "bulk" ? "#ffffff" : "#475569",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Upload size={14} />
                      <span>Bulk Upload (.xlsx / .docx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQbUploadMode("manual")}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "none",
                        background: qbUploadMode === "manual" ? "linear-gradient(135deg, #0284c7, #0369a1)" : "#f1f5f9",
                        color: qbUploadMode === "manual" ? "#ffffff" : "#475569",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Edit3 size={14} />
                      <span>Manual Question</span>
                    </button>
                  </div>

                  {/* Mode A: Bulk Upload */}
                  {qbUploadMode === "bulk" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1, justifyContent: "space-between" }}>
                      <div
                        onClick={() => bulkFileRef.current?.click()}
                        style={{
                          border: "2px dashed #38bdf8",
                          borderRadius: "12px",
                          padding: "36px 20px",
                          textAlign: "center",
                          background: "#f0f9ff",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          flex: 1,
                          minHeight: "190px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <input
                          type="file"
                          ref={bulkFileRef}
                          onChange={handleBulkFileUpload}
                          accept=".xlsx,.xls,.csv,.docx,.doc"
                          style={{ display: "none" }}
                        />
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "#e0f2fe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "2px",
                          }}
                        >
                          <FileSpreadsheet size={26} color="#0284c7" />
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0369a1" }}>
                          {bulkFileName ? `Uploaded: ${bulkFileName}` : "Click to Browse Question Pack (.xlsx, .docx)"}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#64748b", maxWidth: "340px", lineHeight: 1.4 }}>
                          Upload question spreadsheet (.xlsx, .csv) or document (.docx). Auto-validates Bloom&apos;s Taxonomy and format.
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                        <button
                          type="button"
                          onClick={handleCommitBulkImport}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "9px 20px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)",
                          }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Save & Ingest Questions</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode B: Manual Question */}
                  {qbUploadMode === "manual" && (
                    <form onSubmit={handleSaveManualQuestion} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "8px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "2px" }}>Course</label>
                          <select
                            value={manualSubject}
                            onChange={(e) => setManualSubject(e.target.value)}
                            style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", background: "#ffffff", fontWeight: 600 }}
                          >
                            {subjects.length === 0 ? (
                              <option value="General">General</option>
                            ) : (
                              subjects.map((s) => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                              ))
                            )}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "2px" }}>Unit</label>
                          <select
                            value={manualUnit}
                            onChange={(e) => setManualUnit(Number(e.target.value))}
                            style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", background: "#ffffff", fontWeight: 600 }}
                          >
                            <option value={1}>Unit 1</option>
                            <option value={2}>Unit 2</option>
                            <option value={3}>Unit 3</option>
                            <option value={4}>Unit 4</option>
                            <option value={5}>Unit 5</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "2px" }}>Question Text</label>
                        <textarea
                          rows={3}
                          value={manualQuestionText}
                          onChange={(e) => setManualQuestionText(e.target.value)}
                          placeholder="Enter question statement..."
                          required
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box" }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "2px" }}>Type</label>
                          <select
                            value={manualType}
                            onChange={(e) => setManualType(e.target.value as any)}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#ffffff", fontWeight: 600 }}
                          >
                            <option value="MCQ">MCQ</option>
                            <option value="Descriptive">Descriptive</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "2px" }}>Marks</label>
                          <input
                            type="number"
                            value={manualMarks}
                            onChange={(e) => setManualMarks(Number(e.target.value))}
                            min={1}
                            max={20}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", boxSizing: "border-box", fontWeight: 600 }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "2px" }}>Bloom Level</label>
                          <select
                            value={manualBloom}
                            onChange={(e) => setManualBloom(e.target.value)}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#ffffff", fontWeight: 600 }}
                          >
                            <option value="Remember">Remember</option>
                            <option value="Understand">Understand</option>
                            <option value="Apply">Apply</option>
                            <option value="Analyze">Analyze</option>
                          </select>
                        </div>
                      </div>

                      {manualType === "MCQ" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", background: "#f8fafc", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                          <input type="text" placeholder="Option A" value={manualOptionA} onChange={(e) => setManualOptionA(e.target.value)} style={{ padding: "5px 8px", fontSize: "11.5px", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                          <input type="text" placeholder="Option B" value={manualOptionB} onChange={(e) => setManualOptionB(e.target.value)} style={{ padding: "5px 8px", fontSize: "11.5px", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                          <input type="text" placeholder="Option C" value={manualOptionC} onChange={(e) => setManualOptionC(e.target.value)} style={{ padding: "5px 8px", fontSize: "11.5px", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                          <input type="text" placeholder="Option D" value={manualOptionD} onChange={(e) => setManualOptionD(e.target.value)} style={{ padding: "5px 8px", fontSize: "11.5px", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                        <button
                          type="submit"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "9px 20px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)",
                          }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Save & Ingest Question</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </main>

          <PortalFooter />
        </div>
      </div>

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
