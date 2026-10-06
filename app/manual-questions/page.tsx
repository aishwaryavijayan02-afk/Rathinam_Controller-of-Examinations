"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { examStore, QuestionItem } from "../lib/examStore";
import { authStore, AuthUser, hasPermission } from "../lib/auth";
import RoleGuard from "../components/RoleGuard";
import {
  ViewModal,
  FormModal,
  DeleteModal,
  ToastNotification,
  VerificationResultModal,
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
  Shield,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Headphones,
  Info,
  School,
  Briefcase,
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
  Layers,
  LayoutGrid,
  ListFilter,
  Sparkles,
  ShieldCheck,
  Printer,
  Building2,
} from "lucide-react";
import Pagination from "../components/Pagination";

interface ManualQuestionItem {
  id: string;
  question: string;
  subject: string;
  unit: string;
  topic: string;
  type: string;
  typeBg: string;
  typeColor: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  status: "Published" | "Draft" | "Archived";
  createdDate: string;
  createdTime: string;
}

export default function ManualQuestionsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("manual-questions");
  const STORAGE_KEY = "exam_cell_manual_questions_filters";

  const getSavedFilters = () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  };

  const initialFilters = typeof window !== "undefined" ? getSavedFilters() : null;

  const [selectedSubject, setSelectedSubject] = useState<string>(() => initialFilters?.subject || "all");
  const [selectedUnit, setSelectedUnit] = useState<string>(() => initialFilters?.unit || "all");
  const [selectedTopic, setSelectedTopic] = useState<string>(() => initialFilters?.topic || "all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(() => initialFilters?.difficulty || "all");
  const [selectedType, setSelectedType] = useState<string>(() => initialFilters?.type || "all");
  const [selectedStatus, setSelectedStatus] = useState<string>(() => initialFilters?.status || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [currentPage, setCurrentPage] = useState(1);

  // Sync filters to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            subject: selectedSubject,
            unit: selectedUnit,
            topic: selectedTopic,
            difficulty: selectedDifficulty,
            type: selectedType,
            status: selectedStatus,
          })
        );
      } catch (e) {}
    }
  }, [selectedSubject, selectedUnit, selectedTopic, selectedDifficulty, selectedType, selectedStatus]);

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

  const [storeQuestions, setStoreQuestions] = useState<QuestionItem[]>(() => examStore.getQuestions());
  const [viewingQuestion, setViewingQuestion] = useState<QuestionItem | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionItem | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // AI Verification State
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiScanStep, setAiScanStep] = useState(0);
  const [selectedAiFilter, setSelectedAiFilter] = useState("all");

  const [verifyModalItem, setVerifyModalItem] = useState<{
    isOpen: boolean;
    name: string;
    totalQuestions: number;
    score: number;
    remarks?: string;
  }>({
    isOpen: false,
    name: "",
    totalQuestions: 0,
    score: 98,
  });

  const handleAiVerify = (targetIds?: (string | number)[]) => {
    setIsAiScanning(true);
    setAiScanStep(1);
    setTimeout(() => setAiScanStep(2), 400);
    setTimeout(() => setAiScanStep(3), 850);
    setTimeout(() => {
      const res = examStore.runAiVerification(targetIds);
      setIsAiScanning(false);
      setVerifyModalItem({
        isOpen: true,
        name: targetIds && targetIds.length === 1 ? `Question #${targetIds[0]}` : "Selected Questions",
        totalQuestions: res.verifiedCount,
        score: Math.floor(Math.random() * 6) + 94,
        remarks: "Questions syntax clear, Bloom taxonomy validated, distractor coverage complete.",
      });
    }, 1300);
  };

  // SOP Question Paper Generator State
  const [isSopConfigModalOpen, setIsSopConfigModalOpen] = useState(false);
  const [isSopPaperPreviewOpen, setIsSopPaperPreviewOpen] = useState(false);

  // Subject Meta Database for Auto Code & QP Code Mapping
  const SUBJECT_DATABASE = [
    {
      subjectName: "ENGINEERING GRAPHICS",
      subjectCode: "23BEG101",
      qpCode: "252S099",
      department: "B.SC VISUAL COMMUNICATION & E-MEDIA",
      semester: "SEMESTER - I",
      semesterType: "ODD",
    },
    {
      subjectName: "AUGMENTED REALITY THEORY",
      subjectCode: "23BSV6CA",
      qpCode: "252S037",
      department: "B.SC VISUAL COMMUNICATION & E-MEDIA",
      semester: "SEMESTER - VI",
      semesterType: "EVEN",
    },
    {
      subjectName: "VISUAL EFFECTS THEORY",
      subjectCode: "23BSV6CB",
      qpCode: "252S038",
      department: "B.SC VISUAL COMMUNICATION & E-MEDIA",
      semester: "SEMESTER - VI",
      semesterType: "EVEN",
    },
    {
      subjectName: "3D MODELING AND ANIMATION",
      subjectCode: "23BSV5CA",
      qpCode: "252S035",
      department: "B.SC VISUAL COMMUNICATION & E-MEDIA",
      semester: "SEMESTER - V",
      semesterType: "ODD",
    },
    {
      subjectName: "DIGITAL MEDIA & ADVERTISING",
      subjectCode: "23BSV4CA",
      qpCode: "252S029",
      department: "B.SC VISUAL COMMUNICATION & E-MEDIA",
      semester: "SEMESTER - IV",
      semesterType: "EVEN",
    },
    {
      subjectName: "PYTHON PROGRAMMING & AI",
      subjectCode: "23BCS5CA",
      qpCode: "252S050",
      department: "B.SC COMPUTER SCIENCE",
      semester: "SEMESTER - V",
      semesterType: "ODD",
    },
    {
      subjectName: "DATA STRUCTURES & ALGORITHMS",
      subjectCode: "23BCS3CA",
      qpCode: "252S021",
      department: "B.SC COMPUTER SCIENCE",
      semester: "SEMESTER - III",
      semesterType: "ODD",
    },
  ];

  // Dynamically filter ONLY subjects that have uploaded & approved questions
  const availableApprovedSubjects = useMemo(() => {
    const approvedQs = storeQuestions.filter(
      (q) => q.status === "Approved" || q.status === "Verified" || q.status === "Published"
    );

    const approvedSubMap = new Map<string, typeof SUBJECT_DATABASE[0]>();

    approvedQs.forEach((q) => {
      if (!q.subject || !q.subject.trim()) return;
      const subNameClean = q.subject.trim().toUpperCase();
      if (!approvedSubMap.has(subNameClean)) {
        const dbMeta = SUBJECT_DATABASE.find(
          (s) => s.subjectName.toLowerCase() === subNameClean.toLowerCase()
        );
        if (dbMeta) {
          approvedSubMap.set(subNameClean, dbMeta);
        } else {
          approvedSubMap.set(subNameClean, {
            subjectName: subNameClean,
            subjectCode: `23BSV${subNameClean.slice(0, 3)}`,
            qpCode: `252S0${Math.floor(Math.random() * 80 + 10)}`,
            department: "B.SC VISUAL COMMUNICATION & E-MEDIA",
            semester: "SEMESTER - VI",
            semesterType: "EVEN",
          });
        }
      }
    });

    if (approvedSubMap.size === 0) {
      const defaultMeta = SUBJECT_DATABASE[0];
      approvedSubMap.set(defaultMeta.subjectName, defaultMeta);
    }

    return Array.from(approvedSubMap.values());
  }, [storeQuestions]);

  const [sopConfig, setSopConfig] = useState({
    department: "B.SC VISUAL COMMUNICATION & E-MEDIA",
    subjectName: "ENGINEERING GRAPHICS",
    subjectCode: "23BEG101",
    qpCode: "252S099",
    semester: "SEMESTER - I",
    semesterType: "ODD", // "EVEN" or "ODD"
    examMonthYear: "JULY - 2026",
    examType: "SUPPLEMENTARY EXAMINATIONS",
    timeHours: "3 Hours",
    maxMarks: "100 Marks",
    selectedPaperSet: "Set A",
  });

  const handleSelectSubject = (selectedName: string) => {
    const meta = availableApprovedSubjects.find(
      (s) => s.subjectName.toLowerCase() === selectedName.toLowerCase()
    );
    if (meta) {
      setSopConfig((prev) => ({
        ...prev,
        subjectName: meta.subjectName,
        subjectCode: meta.subjectCode,
        qpCode: meta.qpCode,
        department: meta.department,
        semester: meta.semester,
        semesterType: meta.semesterType,
      }));
    } else {
      setSopConfig((prev) => ({
        ...prev,
        subjectName: selectedName,
      }));
    }
  };

  const [sopQuestionPairs, setSopQuestionPairs] = useState<{
    num: number;
    qA: QuestionItem;
    qB: QuestionItem;
  }[]>([]);

  const defaultARFallbackQuestions: QuestionItem[] = [
    { id: "f1", question: "List and explain the main components of the Unity interface for AR development.", subject: "AUGMENTED REALITY THEORY", unit: "Unit I", topic: "Unity", type: "Descriptive", difficulty: "Medium", status: "Approved", marks: 10 },
    { id: "f2", question: "Explain the process of downloading, installing, and setting up Unity for AR development.", subject: "AUGMENTED REALITY THEORY", unit: "Unit I", topic: "Setup", type: "Descriptive", difficulty: "Medium", status: "Approved", marks: 10 },
    { id: "f3", question: "Analyze the importance of file formats and asset import settings for Unity performance.", subject: "AUGMENTED REALITY THEORY", unit: "Unit II", topic: "Asset Import", type: "Descriptive", difficulty: "Hard", status: "Approved", marks: 10 },
    { id: "f4", question: "List the different types of AR toolkits used in AR application development.", subject: "AUGMENTED REALITY THEORY", unit: "Unit II", topic: "Toolkits", type: "Descriptive", difficulty: "Medium", status: "Approved", marks: 10 },
    { id: "f5", question: "Apply AR concepts to explain how sensors are used for tracking in AR systems.", subject: "AUGMENTED REALITY THEORY", unit: "Unit III", topic: "Sensors", type: "Descriptive", difficulty: "Hard", status: "Approved", marks: 10 },
    { id: "f6", question: "Explain the role of tracking technologies in AR applications.", subject: "AUGMENTED REALITY THEORY", unit: "Unit III", topic: "Tracking", type: "Descriptive", difficulty: "Medium", status: "Approved", marks: 10 },
    { id: "f7", question: "Identify the file formats used for 3D models and animations.", subject: "AUGMENTED REALITY THEORY", unit: "Unit IV", topic: "3D Models", type: "Descriptive", difficulty: "Medium", status: "Approved", marks: 10 },
    { id: "f8", question: "Describe the process of creating 3D characters, vehicles, and environment assets.", subject: "AUGMENTED REALITY THEORY", unit: "Unit IV", topic: "Assets", type: "Descriptive", difficulty: "Hard", status: "Approved", marks: 10 },
    { id: "f9", question: "Discuss the concept of texturing in 3D modeling.", subject: "AUGMENTED REALITY THEORY", unit: "Unit IV", topic: "Texturing", type: "Descriptive", difficulty: "Medium", status: "Approved", marks: 10 },
    { id: "f10", question: "Demonstrate how animation sequences such as walk, jump, run, and dance are created.", subject: "AUGMENTED REALITY THEORY", unit: "Unit IV", topic: "Animation", type: "Descriptive", difficulty: "Hard", status: "Approved", marks: 10 },
    { id: "f11", question: "Define Vuforia and explain its role in AR application development.", subject: "AUGMENTED REALITY THEORY", unit: "Unit V", topic: "Vuforia", type: "Descriptive", difficulty: "Medium", status: "Approved", marks: 10 },
    { id: "f12", question: "Describe the functions of License Manager and Development Key in Vuforia.", subject: "AUGMENTED REALITY THEORY", unit: "Unit V", topic: "License", type: "Descriptive", difficulty: "Medium", status: "Approved", marks: 10 },
    { id: "f13", question: "Demonstrate how to use a camera for AR application development.", subject: "AUGMENTED REALITY THEORY", unit: "Unit V", topic: "Camera", type: "Descriptive", difficulty: "Medium", status: "Approved", marks: 10 },
    { id: "f14", question: "Analyze the integration of Android SDK with Vuforia for AR applications.", subject: "AUGMENTED REALITY THEORY", unit: "Unit V", topic: "Android SDK", type: "Descriptive", difficulty: "Hard", status: "Approved", marks: 10 },
    { id: "f15", question: "List the platforms and toolkits available for AR development.", subject: "AUGMENTED REALITY THEORY", unit: "Unit V", topic: "Platforms", type: "Descriptive", difficulty: "Easy", status: "Approved", marks: 10 },
    { id: "f16", question: "Explain the process of dataset setup in Vuforia.", subject: "AUGMENTED REALITY THEORY", unit: "Unit V", topic: "Dataset", type: "Descriptive", difficulty: "Medium", status: "Approved", marks: 10 },
    { id: "f17", question: "Explain the significance of UI interactions in AR applications.", subject: "AUGMENTED REALITY THEORY", unit: "Unit V", topic: "UI Interactions", type: "Descriptive", difficulty: "Medium", status: "Approved", marks: 10 },
    { id: "f18", question: "Illustrate the integration of assets into AR scenes in Unity.", subject: "AUGMENTED REALITY THEORY", unit: "Unit V", topic: "Unity Scenes", type: "Descriptive", difficulty: "Hard", status: "Approved", marks: 10 },
    { id: "f19", question: "Image Target and 3D Object placement in a Vuforia-based AR application.", subject: "AUGMENTED REALITY THEORY", unit: "Unit V", topic: "Image Target", type: "Descriptive", difficulty: "Medium", status: "Approved", marks: 10 },
    { id: "f20", question: "Rigging and animation in creating interactive AR experiences.", subject: "AUGMENTED REALITY THEORY", unit: "Unit V", topic: "Rigging", type: "Descriptive", difficulty: "Hard", status: "Approved", marks: 10 },
  ];

  const handleGenerateSopQuestionPaper = (paperSet: string = "Set A") => {
    const allQs = examStore.getQuestions();
    
    // Filter questions by selected subject
    const selectedSubName = sopConfig.subjectName.toLowerCase().trim();
    const subjectFilteredQs = allQs.filter((q) => {
      const qSub = (q.subject || "").toLowerCase().trim();
      return qSub.includes(selectedSubName) || selectedSubName.includes(qSub);
    });

    const approvedSubjectQs = subjectFilteredQs.filter(
      (q) => q.status === "Approved" || q.status === "Verified" || q.status === "Published"
    );

    let pool = approvedSubjectQs.length >= 20 
      ? [...approvedSubjectQs] 
      : subjectFilteredQs.length >= 20 
      ? [...subjectFilteredQs] 
      : [...approvedSubjectQs, ...defaultARFallbackQuestions];

    // Shuffle pool based on paperSet choice
    if (paperSet === "Set B") {
      pool = [...pool].reverse();
    } else if (paperSet === "Set C") {
      pool = [...pool].sort((a, b) => a.question.localeCompare(b.question));
    }

    const selected20 = pool.slice(0, 20);
    while (selected20.length < 20) {
      const idx = selected20.length + 1;
      const fb = defaultARFallbackQuestions[(idx - 1) % defaultARFallbackQuestions.length];
      selected20.push({
        ...fb,
        id: `fb-${idx}-${Date.now()}`,
      });
    }

    const pairs: { num: number; qA: QuestionItem; qB: QuestionItem }[] = [];
    for (let i = 0; i < 10; i++) {
      pairs.push({
        num: i + 1,
        qA: selected20[i * 2],
        qB: selected20[i * 2 + 1],
      });
    }

    setSopConfig((prev) => ({ ...prev, selectedPaperSet: paperSet }));
    setSopQuestionPairs(pairs);
    setIsSopConfigModalOpen(false);
    setIsSopPaperPreviewOpen(true);
  };

  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => examStore.getLastUpdated());

  useEffect(() => {
    setStoreQuestions(examStore.getQuestions());
    setLastUpdatedTime(examStore.getLastUpdated());
    const handleUpdate = () => {
      setStoreQuestions(examStore.getQuestions());
      setLastUpdatedTime(examStore.getLastUpdated());
    };
    window.addEventListener("exam-cell-store-update", handleUpdate);
    return () => window.removeEventListener("exam-cell-store-update", handleUpdate);
  }, []);

  const questionFormFields: FormFieldDef[] = [
    { name: "question", label: "Question Text", type: "textarea", required: true },
    { name: "subject", label: "Subject", type: "text", required: true },
    { name: "unit", label: "Unit", type: "text", required: true },
    { name: "topic", label: "Topic", type: "text" },
    {
      name: "type",
      label: "Question Type",
      type: "select",
      options: [
        { label: "Descriptive", value: "Descriptive" },
        { label: "MCQ", value: "MCQ" },
        { label: "Problem Solving", value: "Problem Solving" },
        { label: "Short Answer", value: "Short Answer" },
      ],
      required: true,
    },
    {
      name: "difficulty",
      label: "Difficulty",
      type: "select",
      options: [
        { label: "Easy", value: "Easy" },
        { label: "Medium", value: "Medium" },
        { label: "Hard", value: "Hard" },
      ],
      required: true,
    },
    { name: "marks", label: "Marks", type: "number", required: true },
    {
      name: "imageUrl",
      label: "Question Diagram / Image Attachment",
      type: "image",
      spanFull: true,
    },
    {
      name: "diagramTitle",
      label: "Diagram Title / Figure Caption (Optional)",
      type: "text",
      placeholder: "e.g., Figure 1.1: AR Spatial Feature Tracking Pipeline",
    },
    {
      name: "diagramType",
      label: "Diagram Category",
      type: "select",
      options: [
        { label: "Flowchart", value: "Flowchart" },
        { label: "Circuit", value: "Circuit" },
        { label: "Schematic", value: "Schematic" },
        { label: "Illustration", value: "Illustration" },
        { label: "Graph", value: "Graph" },
        { label: "Architecture", value: "Architecture" },
      ],
    },
    {
      name: "status",
      label: "Status / Workflow Stage",
      type: "select",
      options: [
        { label: "Pending HOD Approval", value: "Pending" },
        { label: "Draft", value: "Draft" },
        { label: "Approved by HOD", value: "Approved" },
        { label: "Verified", value: "Verified" },
      ],
    },
  ];

  const handleSaveQuestion = (data: Partial<QuestionItem>) => {
    if (editingQuestion) {
      examStore.updateQuestion(editingQuestion.id, data);
      setToast("Question updated successfully!");
      setEditingQuestion(null);
    } else {
      examStore.addQuestion({
        code: `MQ-${Date.now().toString().slice(-4)}`,
        bloomLevel: "Apply",
        ...data,
      } as any);
      setToast("Question created successfully!");
      setIsAddingQuestion(false);
    }
  };

  const handleDeleteQuestion = () => {
    if (deletingQuestion) {
      examStore.deleteQuestion(deletingQuestion.id);
      setToast("Question removed from database.");
      setDeletingQuestion(null);
    }
  };

  const mappedQuestions = storeQuestions.map((q) => ({
    id: q.id,
    question: q.question,
    subject: q.subject,
    unit: q.unit,
    topic: q.topic || "Core Concept",
    type: q.type || "Descriptive",
    typeBg: q.type === "MCQ" ? "#f3e8ff" : "#eff6ff",
    typeColor: q.type === "MCQ" ? "#7e22ce" : "#2563eb",
    difficulty: q.difficulty,
    marks: q.marks,
    status: q.status as any,
    imageUrl: q.imageUrl,
    diagramTitle: q.diagramTitle,
    diagramType: q.diagramType,
    reviewerComments: q.reviewerComments,
    createdDate: q.submittedDate || "31 Aug 2024",
    createdTime: "10:30 AM",
    raw: q,
  }));

  const totalCount = storeQuestions.length;
  const publishedCount = storeQuestions.filter(
    (q) => q.status === "Published" || q.status === "Approved"
  ).length;
  const draftCount = storeQuestions.filter(
    (q) => q.status === "Draft" || q.status === "Pending"
  ).length;
  const archivedCount = storeQuestions.filter(
    (q) => q.status === "Archived" || q.status === "Rejected"
  ).length;
  const totalMarks = storeQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  const filteredQuestions = mappedQuestions.filter((q) => {
    if (selectedSubject !== "all") {
      const sub = selectedSubject.toLowerCase();
      if (sub === "vfx" && !q.subject.toLowerCase().includes("vis") && !q.subject.toLowerCase().includes("vfx") && !q.subject.toLowerCase().includes("graphics")) {
        return false;
      } else if (sub !== "vfx" && !q.subject.toLowerCase().includes(sub)) {
        return false;
      }
    }
    if (selectedUnit !== "all") {
      const u = selectedUnit.toLowerCase();
      if (u === "u1" && !q.unit.toLowerCase().includes("unit i") && !q.unit.includes("1")) return false;
      if (u === "u2" && !q.unit.toLowerCase().includes("unit ii") && !q.unit.includes("2")) return false;
    }
    if (selectedDifficulty !== "all" && q.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
    if (selectedType !== "all") {
      const t = selectedType.toLowerCase();
      if (t === "mcq" && q.type.toLowerCase() !== "mcq") return false;
      if (t === "desc" && !q.type.toLowerCase().includes("desc")) return false;
      if (t === "match" && !q.type.toLowerCase().includes("match")) return false;
    }
    if (selectedStatus !== "all") {
      const s = selectedStatus.toLowerCase();
      if (s === "published" && q.status.toLowerCase() !== "published" && q.status.toLowerCase() !== "approved") return false;
      if (s === "draft" && q.status.toLowerCase() !== "draft" && q.status.toLowerCase() !== "pending") return false;
      if (s === "archived" && q.status.toLowerCase() !== "archived" && q.status.toLowerCase() !== "rejected") return false;
    }
    if (selectedAiFilter !== "all") {
      if (selectedAiFilter === "verified" && q.raw.aiStatus !== "AI Verified") return false;
      if (selectedAiFilter === "flagged" && q.raw.aiStatus !== "AI Flagged") return false;
      if (selectedAiFilter === "not_verified" && q.raw.aiStatus === "AI Verified") return false;
    }
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      if (!q.question.toLowerCase().includes(qLower) && !q.subject.toLowerCase().includes(qLower)) {
        return false;
      }
    }
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, selectedUnit, selectedTopic, selectedDifficulty, selectedType, selectedStatus]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map((q) => q.id));
    }
  };

  const toggleSelect = (id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = (status: "Published" | "Draft" | "Archived" | "Approved") => {
    examStore.bulkUpdateQuestions(selectedIds, status as any);
    setToast(`Updated ${selectedIds.length} questions to ${status}!`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} questions?`)) {
      examStore.bulkDeleteQuestions(selectedIds);
      setToast(`Deleted ${selectedIds.length} questions from question bank.`);
      setSelectedIds([]);
    }
  };

  const handleExportCsv = () => {
    const rows = filteredQuestions.map((q) => ({
      ID: q.id,
      Question: q.question,
      Subject: q.subject,
      Unit: q.unit,
      Topic: q.topic,
      Type: q.type,
      Difficulty: q.difficulty,
      Marks: q.marks,
      Status: q.status,
      CreatedDate: q.createdDate,
    }));
    examStore.exportToCsv("manual-questions-export.csv", rows);
    setToast(`Exported ${rows.length} questions to CSV!`);
  };

  const handleReset = () => {
    setSelectedSubject("all");
    setSelectedUnit("all");
    setSelectedTopic("all");
    setSelectedDifficulty("all");
    setSelectedType("all");
    setSelectedStatus("all");
    setSearchQuery("");
  };

  return (
    <RoleGuard route="/manual-questions">
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
                  className={`sidebar-btn-3d ${
                    isActive ? "sidebar-btn-active" : "sidebar-btn-inactive"
                  }`}
                >
                  <IconComp size={18} className="nav-icon-3d" />
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
                        filter: "drop-shadow(0 0 4px rgba(255,255,255,0.7))",
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
        <PortalHeader activeRoute="manual-questions" />


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
                <span>Manual Questions</span>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
                    color: "#ffffff",
                    animation: "float3D 4s infinite ease-in-out",
                  }}
                >
                  <Edit3 size={18} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9)) drop-shadow(0 0 10px rgba(99, 102, 241, 0.8))" }} />
                </div>
              </h1>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                Add, manage and organize questions manually for question papers.
              </p>
            </div>

          </div>

          {/* ================= Top 4 Metric Cards (Matching Bulk Upload / Reports 3D Glow) ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "18px",
              marginBottom: "28px",
            }}
          >
            {/* Metric 1: Total Manual Questions - 3D Blue */}
            <div className="stat-card-3d stat-card-purple">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div className="stat-icon-3d-box glow-purple">
                  <Edit3
                    size={23}
                    color="#ffffff"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(124, 58, 237, 0.8))",
                    }}
                  />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={14} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "4px", fontWeight: 500 }}>
                Total Manual Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {totalCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Across All Subjects</div>
            </div>

            {/* Metric 2: Published Questions - 3D Cyan */}
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
                  <FileText
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
                Published Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {publishedCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>({totalCount ? ((publishedCount / totalCount) * 100).toFixed(1) : 0}%)</div>
            </div>

            {/* Metric 3: Draft Questions - 3D Emerald */}
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
                  <CheckCircle2
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
                Draft Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {draftCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>({totalCount ? ((draftCount / totalCount) * 100).toFixed(1) : 0}%)</div>
            </div>

            {/* Metric 4: Archived Questions - 3D Orange */}
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
                  <Archive
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
                Archived Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {archivedCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>({totalCount ? ((archivedCount / totalCount) * 100).toFixed(1) : 0}%)</div>
            </div>
          </div>
          {/* ================= Main Content Container (Full Width) ================= */}
          <div style={{ width: "100%" }}>
            {/* ================= LEFT COLUMN: Filter & Table ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Card 1: Filter Questions */}
              <div
                className="widget-card-3d"
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(226, 232, 240, 0.9)",
                  padding: "24px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* Top Actions Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "18px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="action-mini-icon-blue">
                      <Filter size={15} />
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
                      Filter Questions
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      type="button"
                      className="filter-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 15px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#475569",
                        cursor: "pointer",
                      }}
                    >
                      <span>Filter</span>
                      <Filter size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="filter-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 15px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#475569",
                        cursor: "pointer",
                      }}
                    >
                      <FileSpreadsheet size={13} />
                      <span>Export CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="filter-btn-3d"
                      style={{
                        padding: "8px 15px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#475569",
                        cursor: "pointer",
                      }}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAiVerify(selectedIds.length > 0 ? selectedIds : undefined)}
                      className="primary-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "8px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
                        color: "#ffffff",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(124, 58, 237, 0.45)",
                      }}
                    >
                      <Sparkles size={15} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }} />
                      <span>🤖 AI Verify Questions</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingQuestion(true)}
                      className="primary-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "8px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                        color: "#ffffff",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)",
                      }}
                    >
                      <Plus size={15} />
                      <span>Add New Question</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSopConfigModalOpen(true)}
                      className="primary-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "8px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "#ffffff",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                      }}
                    >
                      <Printer size={15} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }} />
                      <span>🖨️ Print SOP Question Paper</span>
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

                {/* Search Bar */}
                <div style={{ position: "relative", marginBottom: "18px" }}>
                  <Search
                    size={16}
                    color="#6366f1"
                    style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  />
                  <input
                    type="text"
                    placeholder="Search questions by keywords, code, or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 16px 10px 42px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      fontSize: "13px",
                      color: "#1e293b",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "all 0.2s ease",
                      boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
                    }}
                  />
                </div>

                {/* Filter Dropdowns Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: "12px",
                  }}
                >
                  {/* Subject */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>
                      Subject
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 22px 7px 10px",
                          borderRadius: "9px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          fontWeight: 500,
                          appearance: "none",
                          outline: "none",
                          cursor: "pointer",
                          transition: "border-color 0.2s ease",
                        }}
                      >
                        <option value="all">All Subjects</option>
                        <option value="vfx">Viscom & VFX</option>
                      </select>
                      <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  {/* Unit */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>
                      Unit
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 22px 7px 10px",
                          borderRadius: "9px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          fontWeight: 500,
                          appearance: "none",
                          outline: "none",
                          cursor: "pointer",
                          transition: "border-color 0.2s ease",
                        }}
                      >
                        <option value="all">All Units</option>
                        <option value="u1">Unit I</option>
                        <option value="u2">Unit II</option>
                      </select>
                      <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  {/* Topic */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>
                      Topic
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 22px 7px 10px",
                          borderRadius: "9px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          fontWeight: 500,
                          appearance: "none",
                          outline: "none",
                          cursor: "pointer",
                          transition: "border-color 0.2s ease",
                        }}
                      >
                        <option value="all">All Topics</option>
                        <option value="t1">Color Models</option>
                      </select>
                      <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>
                      Difficulty
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 22px 7px 10px",
                          borderRadius: "9px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          fontWeight: 500,
                          appearance: "none",
                          outline: "none",
                          cursor: "pointer",
                          transition: "border-color 0.2s ease",
                        }}
                      >
                        <option value="all">All Levels</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                      <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>
                      Type
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 22px 7px 10px",
                          borderRadius: "9px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          fontWeight: 500,
                          appearance: "none",
                          outline: "none",
                          cursor: "pointer",
                          transition: "border-color 0.2s ease",
                        }}
                      >
                        <option value="all">All Types</option>
                        <option value="mcq">MCQ</option>
                        <option value="desc">Descriptive</option>
                        <option value="match">Match Type</option>
                      </select>
                      <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>
                      Status
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 22px 7px 10px",
                          borderRadius: "9px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          fontWeight: 500,
                          appearance: "none",
                          outline: "none",
                          cursor: "pointer",
                          transition: "border-color 0.2s ease",
                        }}
                      >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                      <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Manual Questions List Table */}
              <div
                className="widget-card-3d"
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(226, 232, 240, 0.9)",
                  padding: "24px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="action-mini-icon-blue">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
                        Manual Questions List
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        Review, edit and manage question items
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                    Total: <strong style={{ color: "#4f46e5" }}>{filteredQuestions.length}</strong> questions ({storeQuestions.length} total)
                  </div>
                </div>

                {/* Bulk Actions Banner */}
                {selectedIds.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      marginBottom: "16px",
                      background: "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)",
                      border: "1px solid #c7d2fe",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 size={18} color="#4f46e5" />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#3730a3" }}>
                        {selectedIds.length} question{selectedIds.length > 1 ? "s" : ""} selected
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleAiVerify(selectedIds)}
                        style={{
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 2px 8px rgba(124, 58, 237, 0.3)",
                        }}
                      >
                        <Sparkles size={13} />
                        🤖 AI Verify Selected
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkStatus("Published")}
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "#16a34a",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Publish Selected
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkStatus("Draft")}
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "#0ea5e9",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Move to Draft
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "#ef4444",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Delete Selected
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedIds([])}
                        style={{
                          padding: "6px 10px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "#ffffff",
                          color: "#64748b",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Table or Cards View */}
                {viewMode === "table" ? (
                  <div className="no-scrollbar" style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e2e8f0", background: "rgba(248, 250, 252, 0.6)" }}>
                          <th style={{ padding: "12px 10px", width: "34px", borderRadius: "8px 0 0 8px" }}>
                            <input
                              type="checkbox"
                              checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0}
                              onChange={toggleSelectAll}
                              style={{ cursor: "pointer", accentColor: "#4f46e5", width: "15px", height: "15px" }}
                            />
                          </th>
                          <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em" }}>
                            QUESTION
                          </th>
                          <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em" }}>
                            SUBJECT / UNIT / TOPIC
                          </th>
                          <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em" }}>
                            TYPE
                          </th>
                          <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em" }}>
                            DIFFICULTY
                          </th>
                          <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em", textAlign: "center" }}>
                            MARKS
                          </th>
                          <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em" }}>
                            STATUS
                          </th>
                          <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#7c3aed", letterSpacing: "0.02em" }}>
                            🤖 AI VERIFICATION
                          </th>
                          <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em" }}>
                            CREATED ON
                          </th>
                          <th style={{ padding: "12px 12px", fontSize: "12px", fontWeight: 700, color: "#475569", letterSpacing: "0.02em", textAlign: "center", borderRadius: "0 8px 8px 0" }}>
                            ACTIONS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedQuestions.map((item) => {
                          const isChecked = selectedIds.includes(item.id);

                          // Difficulty Pill Styles
                          let diffBg = "rgba(220, 252, 231, 0.8)";
                          let diffColor = "#16a34a";
                          let diffBorder = "rgba(187, 247, 208, 0.8)";
                          if (item.difficulty === "Medium") {
                            diffBg = "rgba(255, 237, 213, 0.8)";
                            diffColor = "#ea580c";
                            diffBorder = "rgba(254, 215, 170, 0.8)";
                          } else if (item.difficulty === "Hard") {
                            diffBg = "rgba(254, 226, 226, 0.8)";
                            diffColor = "#dc2626";
                            diffBorder = "rgba(254, 202, 202, 0.8)";
                          }

                          // Status Pill Styles
                          let statusBg = "rgba(220, 252, 231, 0.8)";
                          let statusColor = "#16a34a";
                          let statusBorder = "rgba(187, 247, 208, 0.8)";
                          if (item.status === "Draft") {
                            statusBg = "rgba(224, 242, 254, 0.8)";
                            statusColor = "#0284c7";
                            statusBorder = "rgba(186, 230, 253, 0.8)";
                          } else if (item.status === "Archived") {
                            statusBg = "rgba(241, 245, 249, 0.8)";
                            statusColor = "#64748b";
                            statusBorder = "rgba(226, 232, 240, 0.8)";
                          }

                          return (
                            <tr
                              key={item.id}
                              className="table-row-3d"
                              style={{
                                borderBottom: "1px solid #f1f5f9",
                                background: isChecked ? "rgba(99, 102, 241, 0.05)" : "transparent",
                                transition: "all 0.15s ease",
                              }}
                            >
                              {/* Checkbox */}
                              <td style={{ padding: "14px 10px" }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleSelect(item.id)}
                                  style={{ cursor: "pointer", accentColor: "#4f46e5", width: "15px", height: "15px" }}
                                />
                              </td>

                              {/* Question */}
                              <td style={{ padding: "14px 12px", maxWidth: "260px" }}>
                                <div
                                  style={{
                                    fontSize: "12.5px",
                                    fontWeight: 700,
                                    color: "#0f172a",
                                    lineHeight: 1.45,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                  title={item.question}
                                >
                                  {item.question}
                                </div>
                                <div style={{ display: "flex", gap: "6px", marginTop: "5px", alignItems: "center" }}>
                                  <span style={{ fontSize: "10px", color: "#6366f1", fontWeight: 700 }}>
                                    #{item.id}
                                  </span>
                                </div>
                              </td>

                              {/* Subject / Unit / Topic */}
                              <td style={{ padding: "14px 12px" }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
                                  {item.subject}
                                </div>
                                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>
                                  {item.unit}
                                </div>
                                <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                                  {item.topic}
                                </div>
                              </td>

                              {/* Type */}
                              <td style={{ padding: "14px 12px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: "#475569",
                                    background: "#f1f5f9",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  {item.type}
                                </span>
                              </td>

                              {/* Difficulty */}
                              <td style={{ padding: "14px 12px" }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    padding: "3px 9px",
                                    borderRadius: "7px",
                                    background: diffBg,
                                    color: diffColor,
                                    border: `1px solid ${diffBorder}`,
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                                  }}
                                >
                                  {item.difficulty}
                                </span>
                              </td>

                              {/* Marks */}
                              <td style={{ padding: "14px 12px", textAlign: "center" }}>
                                <span
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    color: "#0f172a",
                                    background: "#f8fafc",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  {item.marks}
                                </span>
                              </td>

                              {/* Status */}
                              <td style={{ padding: "14px 12px" }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    padding: "3px 9px",
                                    borderRadius: "7px",
                                    background: statusBg,
                                    color: statusColor,
                                    border: `1px solid ${statusBorder}`,
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      background: statusColor,
                                    }}
                                  />
                                  {item.status}
                                </span>
                              </td>

                              {/* AI Verification */}
                              <td style={{ padding: "14px 12px" }}>
                                {item.raw.aiStatus === "AI Verified" ? (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      padding: "3px 9px",
                                      borderRadius: "8px",
                                      background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                                      color: "#15803d",
                                      border: "1px solid #bbf7d0",
                                      boxShadow: "0 1px 4px rgba(22, 163, 74, 0.12)",
                                    }}
                                    title={item.raw.aiRemarks}
                                  >
                                    <ShieldCheck size={13} color="#16a34a" />
                                    🤖 AI Verified ({item.raw.aiScore || 96}%)
                                  </span>
                                ) : item.raw.aiStatus === "AI Flagged" ? (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      padding: "3px 9px",
                                      borderRadius: "8px",
                                      background: "#fffbeb",
                                      color: "#b45309",
                                      border: "1px solid #fde68a",
                                    }}
                                    title={item.raw.aiRemarks}
                                  >
                                    ⚠️ AI Flagged
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAiVerify([item.id])}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      fontSize: "10.5px",
                                      fontWeight: 600,
                                      padding: "2px 8px",
                                      borderRadius: "6px",
                                      background: "#f8fafc",
                                      color: "#64748b",
                                      border: "1px solid #cbd5e1",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Sparkles size={11} color="#7c3aed" />
                                    <span>Verify with AI</span>
                                  </button>
                                )}
                              </td>

                              {/* Created On */}
                              <td style={{ padding: "14px 12px", whiteSpace: "nowrap" }}>
                                <div style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b" }}>
                                  {item.createdDate}
                                </div>
                                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>
                                  {item.createdTime}
                                </div>
                              </td>

                              {/* Actions */}
                              <td style={{ padding: "14px 12px", textAlign: "center", whiteSpace: "nowrap" }}>
                                <div style={{ display: "inline-flex", justifyContent: "center" }}>
                                  <CrudActionButtons
                                    onView={() => setViewingQuestion(item.raw)}
                                    onVerify={() => handleAiVerify([item.id])}
                                    onEdit={() => setEditingQuestion(item.raw)}
                                    onDelete={() => setDeletingQuestion(item.raw)}
                                    viewTitle="View Question Details"
                                    verifyTitle="Verify Question with AI"
                                    editTitle="Edit Question"
                                    deleteTitle="Delete Question"
                                    size={34}
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
                      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {paginatedQuestions.map((item) => {
                      const isChecked = selectedIds.includes(item.id);

                      // Difficulty Pill Styles
                      let diffBg = "rgba(220, 252, 231, 0.8)";
                      let diffColor = "#16a34a";
                      let diffBorder = "rgba(187, 247, 208, 0.8)";
                      if (item.difficulty === "Medium") {
                        diffBg = "rgba(255, 237, 213, 0.8)";
                        diffColor = "#ea580c";
                        diffBorder = "rgba(254, 215, 170, 0.8)";
                      } else if (item.difficulty === "Hard") {
                        diffBg = "rgba(254, 226, 226, 0.8)";
                        diffColor = "#dc2626";
                        diffBorder = "rgba(254, 202, 202, 0.8)";
                      }

                      // Status Pill Styles
                      let statusBg = "rgba(220, 252, 231, 0.8)";
                      let statusColor = "#16a34a";
                      let statusBorder = "rgba(187, 247, 208, 0.8)";
                      if (item.status === "Draft") {
                        statusBg = "rgba(224, 242, 254, 0.8)";
                        statusColor = "#0284c7";
                        statusBorder = "rgba(186, 230, 253, 0.8)";
                      } else if (item.status === "Archived") {
                        statusBg = "rgba(241, 245, 249, 0.8)";
                        statusColor = "#64748b";
                        statusBorder = "rgba(226, 232, 240, 0.8)";
                      }

                      return (
                        <div
                          key={item.id}
                          className="widget-card-3d"
                          style={{
                            background: isChecked ? "#f5f3ff" : "#ffffff",
                            borderRadius: "16px",
                            border: isChecked ? "1.5px solid #6366f1" : "1px solid #e2e8f0",
                            padding: "18px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "14px",
                            boxShadow: isChecked
                              ? "0 8px 20px rgba(99, 102, 241, 0.15)"
                              : "0 4px 14px rgba(0, 0, 0, 0.03)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div>
                            {/* Top Row: Checkbox, ID, Type, Status */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "10px",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleSelect(item.id)}
                                  style={{ cursor: "pointer", accentColor: "#4f46e5", width: "15px", height: "15px" }}
                                />
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "2px 7px", borderRadius: "6px" }}>
                                  #{item.id}
                                </span>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: "#475569",
                                    background: "#f1f5f9",
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                  }}
                                >
                                  {item.type}
                                </span>
                              </div>

                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "3px 9px",
                                  borderRadius: "7px",
                                  background: statusBg,
                                  color: statusColor,
                                  border: `1px solid ${statusBorder}`,
                                }}
                              >
                                <span
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: statusColor,
                                  }}
                                />
                                {item.status}
                              </span>
                            </div>

                            {/* Question Text */}
                            <p
                              style={{
                                fontSize: "13.5px",
                                fontWeight: 700,
                                color: "#0f172a",
                                lineHeight: "1.45",
                                margin: "0 0 10px 0",
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.question}
                            </p>

                            {/* Attached Diagram / Image Preview Box */}
                            {item.imageUrl && (
                              <div
                                style={{
                                  marginTop: "4px",
                                  marginBottom: "10px",
                                  borderRadius: "10px",
                                  overflow: "hidden",
                                  background: "#0f172a",
                                  padding: "8px 10px",
                                  border: "1px solid rgba(56, 189, 248, 0.35)",
                                  cursor: "pointer",
                                }}
                                onClick={() => setViewingQuestion(item.raw)}
                              >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "10.5px", color: "#38bdf8", fontWeight: 700, marginBottom: "4px" }}>
                                  <span>🖼️ Diagram Attached ({item.diagramType || "Figure"})</span>
                                  <span style={{ fontSize: "9.5px", color: "#94a3b8" }}>🔍 Inspect</span>
                                </div>
                                <img
                                  src={item.imageUrl}
                                  alt={item.diagramTitle || "Question Diagram"}
                                  style={{ width: "100%", maxHeight: "110px", objectFit: "contain", borderRadius: "6px" }}
                                />
                                {item.diagramTitle && (
                                  <div style={{ fontSize: "10px", color: "#cbd5e1", marginTop: "4px", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {item.diagramTitle}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Subject / Unit / Topic */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", color: "#64748b" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>{item.subject}</span>
                                <span>•</span>
                                <span>{item.unit}</span>
                              </div>
                              {item.topic && (
                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.topic}</span>
                              )}
                            </div>
                          </div>

                          {/* Card Footer: Difficulty & Marks + Date + CrudActionButtons */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingTop: "12px",
                              borderTop: "1px solid #f1f5f9",
                              marginTop: "auto",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  background: diffBg,
                                  color: diffColor,
                                  border: `1px solid ${diffBorder}`,
                                }}
                              >
                                {item.difficulty}
                              </span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  padding: "2px 7px",
                                  borderRadius: "6px",
                                  background: "#f8fafc",
                                  color: "#64748b",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                {item.marks}M
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                                {item.createdDate}
                              </span>
                              <CrudActionButtons
                                onDelete={() => setDeletingQuestion(item.raw)}
                                onEdit={() => setEditingQuestion(item.raw)}
                                onView={() => setViewingQuestion(item.raw)}
                                onVerify={() => handleAiVerify([item.id])}
                                viewTitle="View Question Details"
                                verifyTitle="Verify Question with AI"
                                editTitle="Edit Question"
                                deleteTitle="Delete Question"
                                size={32}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {/* Table Footer / 3D Pagination */}
                <Pagination
                  currentPage={safeCurrentPage}
                  totalItems={filteredQuestions.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(p) => setCurrentPage(p)}
                  itemName="questions"
                />
              </div>
            </div>
          </div>

          {/* Support Banner & Footer */}
          <PortalFooter />
        </main>
      </div>

      {/* ================= Modals & Notifications ================= */}
      <ViewModal
        isOpen={!!viewingQuestion}
        onClose={() => setViewingQuestion(null)}
        title={viewingQuestion ? `Question Details: ${viewingQuestion.code || viewingQuestion.id}` : ""}
        data={viewingQuestion || {}}
      />

      <FormModal
        isOpen={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSubmit={handleSaveQuestion}
        title="Edit Question"
        fields={questionFormFields}
        initialData={editingQuestion || {}}
        submitLabel="Save Changes"
      />

      <FormModal
        isOpen={isAddingQuestion}
        onClose={() => setIsAddingQuestion(false)}
        onSubmit={handleSaveQuestion}
        title="Create New Question"
        fields={questionFormFields}
        initialData={{
          subject: "Viscom & VFX",
          unit: "Unit I - Introduction",
          topic: "Core Principles",
          type: "Descriptive",
          difficulty: "Medium",
          marks: 5,
          status: "Draft",
        }}
        submitLabel="Create Question"
      />

      <DeleteModal
        isOpen={!!deletingQuestion}
        onClose={() => setDeletingQuestion(null)}
        onConfirm={handleDeleteQuestion}
        title="Delete Question"
        message="Are you sure you want to permanently delete this question from the question repository? This action cannot be undone."
        itemName={deletingQuestion ? `"${deletingQuestion.question.slice(0, 60)}..."` : undefined}
      />

      {/* AI Scanning Modal Overlay */}
      {isAiScanning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "36px 44px",
              maxWidth: "460px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "22px",
                background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
                boxShadow: "0 10px 25px rgba(124, 58, 237, 0.5)",
              }}
            >
              <Sparkles size={36} color="#ffffff" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9))" }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
              🤖 Running AI Question Verification...
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px 0", lineHeight: 1.5 }}>
              Checking phrasing clarity, Bloom's Taxonomy alignment, distractor coverage, and mark distribution against RGU outcome standards.
            </p>

            {/* Progress Bar */}
            <div style={{ background: "#f1f5f9", borderRadius: "10px", height: "10px", overflow: "hidden", marginBottom: "16px" }}>
              <div
                style={{
                  height: "100%",
                  width: aiScanStep === 1 ? "35%" : aiScanStep === 2 ? "70%" : "98%",
                  background: "linear-gradient(90deg, #7c3aed 0%, #ec4899 100%)",
                  transition: "width 0.4s ease-in-out",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div style={{ fontSize: "12px", fontWeight: 700, color: "#7c3aed" }}>
              {aiScanStep === 1 && "🔍 Step 1: Parsing Question Syntax & Structure..."}
              {aiScanStep === 2 && "🧠 Step 2: Evaluating Bloom's Taxonomy Level & Difficulty..."}
              {aiScanStep === 3 && "✅ Step 3: Finalizing AI Audit Quality Score..."}
            </div>
          </div>
        </div>
      )}

      {/* Verification Result Pop-up Modal */}
      <VerificationResultModal
        isOpen={verifyModalItem.isOpen}
        onClose={() => setVerifyModalItem((prev) => ({ ...prev, isOpen: false }))}
        title="🎉 Question Verified Successfully!"
        itemName={verifyModalItem.name}
        verifiedCount={verifyModalItem.totalQuestions}
        qualityScore={verifyModalItem.score}
        bloomLevel="Apply & Analyze"
        remarks={verifyModalItem.remarks}
      />

      {/* SOP Question Paper Configuration Modal */}
      {isSopConfigModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsSopConfigModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              maxWidth: "640px",
              width: "100%",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.3)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: "20px 24px", background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Printer size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17.5px", fontWeight: 800 }}>🖨️ SOP Question Paper Generator</h3>
                  <p style={{ margin: "3px 0 0", fontSize: "12px", opacity: 0.9 }}>
                    Automatically selects & pairs 20 approved questions into 10 Either/Or sets (100 Marks).
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setIsSopConfigModalOpen(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}>✕</button>
            </div>

            {/* Form Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "70vh", overflowY: "auto" }}>
              {/* Row 1: Department & Semester Type */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>Department / Degree</label>
                  <input
                    type="text"
                    value={sopConfig.department}
                    onChange={(e) => setSopConfig({ ...sopConfig, department: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#0f172a" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>Semester Type</label>
                  <select
                    value={sopConfig.semesterType}
                    onChange={(e) => setSopConfig({ ...sopConfig, semesterType: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#0f172a", background: "#ffffff" }}
                  >
                    <option value="EVEN">EVEN SEMESTER (May / July 2026)</option>
                    <option value="ODD">ODD SEMESTER (Nov / Dec 2026)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Subject Name Dropdown & Subject Code */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>Subject Name (Select to Auto-Fill Codes)</label>
                  <select
                    value={sopConfig.subjectName}
                    onChange={(e) => handleSelectSubject(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#0f172a", background: "#ffffff", fontWeight: 600 }}
                  >
                    {availableApprovedSubjects.map((sub) => (
                      <option key={sub.subjectCode} value={sub.subjectName}>
                        {sub.subjectName} ({sub.subjectCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>Subject Code (Fixed Database)</label>
                  <input
                    type="text"
                    value={sopConfig.subjectCode}
                    onChange={(e) => setSopConfig({ ...sopConfig, subjectCode: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#0f172a", background: "#f8fafc", fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Row 3: Semester & QP Code */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>Semester</label>
                  <select
                    value={sopConfig.semester}
                    onChange={(e) => setSopConfig({ ...sopConfig, semester: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#0f172a", background: "#ffffff" }}
                  >
                    <option value="SEMESTER - I">SEMESTER - I</option>
                    <option value="SEMESTER - II">SEMESTER - II</option>
                    <option value="SEMESTER - III">SEMESTER - III</option>
                    <option value="SEMESTER - IV">SEMESTER - IV</option>
                    <option value="SEMESTER - V">SEMESTER - V</option>
                    <option value="SEMESTER - VI">SEMESTER - VI</option>
                    <option value="SEMESTER - VII">SEMESTER - VII</option>
                    <option value="SEMESTER - VIII">SEMESTER - VIII</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>QP Code (Question Paper Code)</label>
                  <input
                    type="text"
                    value={sopConfig.qpCode}
                    onChange={(e) => setSopConfig({ ...sopConfig, qpCode: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#0f172a", background: "#f8fafc", fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Row 4: Examination Type & Month/Year */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>Exam Category</label>
                  <select
                    value={sopConfig.examType}
                    onChange={(e) => setSopConfig({ ...sopConfig, examType: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#0f172a", background: "#ffffff", fontWeight: 600 }}
                  >
                    <option value="ODD SEMESTER EXAMINATIONS">ODD SEMESTER EXAMINATIONS</option>
                    <option value="EVEN SEMESTER EXAMINATIONS">EVEN SEMESTER EXAMINATIONS</option>
                    <option value="SUPPLEMENTARY EXAMINATIONS">SUPPLEMENTARY EXAMINATIONS</option>
                    <option value="END SEMESTER EXAMINATIONS">END SEMESTER EXAMINATIONS</option>
                    <option value="REGULAR END SEMESTER EXAMINATIONS">REGULAR END SEMESTER EXAMINATIONS</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>Exam Month & Year</label>
                  <input
                    type="text"
                    value={sopConfig.examMonthYear}
                    onChange={(e) => setSopConfig({ ...sopConfig, examMonthYear: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#0f172a" }}
                  />
                </div>
              </div>

              {/* Row 5: Time & Max Marks */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>Time Duration</label>
                  <input
                    type="text"
                    value={sopConfig.timeHours}
                    onChange={(e) => setSopConfig({ ...sopConfig, timeHours: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#0f172a" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>Maximum Marks</label>
                  <input
                    type="text"
                    value={sopConfig.maxMarks}
                    onChange={(e) => setSopConfig({ ...sopConfig, maxMarks: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#0f172a" }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#f8fafc" }}>
              <button type="button" onClick={() => setIsSopConfigModalOpen(false)} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>Cancel</button>
              <button
                type="button"
                onClick={() => handleGenerateSopQuestionPaper("Set A")}
                style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#ffffff", fontWeight: 700, cursor: "pointer", fontSize: "13px", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)" }}
              >
                🚀 Generate SOP Question Paper (20 Qs / 10 Either-Or)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable SOP Question Paper Preview Modal */}
      {isSopPaperPreviewOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsSopPaperPreviewOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              maxWidth: "920px",
              width: "100%",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Controls */}
            <div style={{ padding: "14px 24px", background: "#0f172a", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Printer size={22} color="#34d399" />
                <div>
                  <span style={{ fontSize: "15px", fontWeight: 700, display: "block" }}>
                    Official Rathinam SOP Question Paper
                  </span>
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                    {sopConfig.subjectName} ({sopConfig.subjectCode}) • {sopConfig.semester} • QP Code: {sopConfig.qpCode}
                  </span>
                </div>
              </div>

              {/* Set Selector Controls & Print Button */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {/* Select Paper Set Dropdown */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 600 }}>Select Paper Set:</span>
                  {["Set A", "Set B", "Set C"].map((setLabel) => (
                    <button
                      key={setLabel}
                      type="button"
                      onClick={() => handleGenerateSopQuestionPaper(setLabel)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: "none",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        background: sopConfig.selectedPaperSet === setLabel ? "#3b82f6" : "transparent",
                        color: sopConfig.selectedPaperSet === setLabel ? "#ffffff" : "#94a3b8",
                      }}
                    >
                      {setLabel}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 20px", borderRadius: "10px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#ffffff", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)" }}
                >
                  <Printer size={15} />
                  <span>🖨️ Print {sopConfig.selectedPaperSet} Paper</span>
                </button>
                <button type="button" onClick={() => setIsSopPaperPreviewOpen(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}>✕</button>
              </div>
            </div>

            {/* Printable Content Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "30px", background: "#f8fafc" }}>
              <style>{`
                @media print {
                  body * { visibility: hidden !important; }
                  #printable-sop-paper, #printable-sop-paper * { visibility: visible !important; }
                  #printable-sop-paper {
                    position: fixed !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 24px !important;
                    background: #ffffff !important;
                    color: #000000 !important;
                    font-family: 'Times New Roman', Times, serif !important;
                    box-shadow: none !important;
                    border: none !important;
                  }
                }
              `}</style>

              <div
                id="printable-sop-paper"
                style={{
                  background: "#ffffff",
                  padding: "40px 48px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  fontFamily: "'Times New Roman', Times, serif",
                  color: "#000000",
                  maxWidth: "800px",
                  margin: "0 auto",
                }}
              >
                {/* QP Code & Reg No */}
                <div style={{ textTransform: "uppercase", fontSize: "12px", fontWeight: "bold", textAlign: "right", marginBottom: "2px" }}>
                  QP CODE: {sopConfig.qpCode}
                </div>
                <div style={{ fontSize: "12px", fontWeight: "bold", textAlign: "right", marginBottom: "14px" }}>
                  Reg. No.:.........................
                </div>

                {/* Header Section */}
                <div style={{ textAlign: "center", lineHeight: 1.35, marginBottom: "16px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "bold", letterSpacing: "0.5px" }}>
                    RATHINAM GLOBAL (DEEMED TO BE UNIVERSITY)
                  </div>
                  <div style={{ fontSize: "13px" }}>
                    Eachanari, Coimbatore - 21
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: "bold", textTransform: "uppercase", marginTop: "4px" }}>
                    {sopConfig.examType}, {sopConfig.examMonthYear}
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: "bold", marginTop: "2px" }}>
                    {sopConfig.semester} ({sopConfig.semesterType} SEMESTER)
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "2px" }}>
                    DEGREE: {sopConfig.department.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                    SUBJECT: {sopConfig.subjectName.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                    SUBJECT CODE: {sopConfig.subjectCode.toUpperCase()}
                  </div>
                </div>

                {/* Time & Max Marks Row */}
                <div style={{ borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000", padding: "5px 0", display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "bold", marginBottom: "18px" }}>
                  <span>Time: {sopConfig.timeHours}</span>
                  <span>Maximum: {sopConfig.maxMarks}</span>
                </div>

                {/* Section Header */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div style={{ fontSize: "13.5px", fontWeight: "bold", textDecoration: "underline" }}>
                    SECTION A - (10 X 10 = 100)
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                    (ANSWER ALL QUESTIONS)
                  </div>
                </div>

                {/* 10 Either/Or Sets (20 Questions) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "13px", lineHeight: 1.45 }}>
                  {sopQuestionPairs.map((pair) => (
                    <div key={pair.num} style={{ marginBottom: "4px" }}>
                      {/* Option A */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1, paddingRight: "20px" }}>
                          <strong>{pair.num}.A.</strong> {pair.qA.question}
                        </div>
                        <div style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                          (OR)
                        </div>
                      </div>

                      {/* Option B */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "6px" }}>
                        <div style={{ flex: 1, paddingRight: "20px" }}>
                          <strong>{pair.num}.B.</strong> {pair.qB.question}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Page Footer */}
                <div style={{ textAlign: "center", fontSize: "12px", marginTop: "36px", fontWeight: "bold" }}>
                  - 1 -
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastNotification message={toast} onClose={() => setToast(null)} />
    </div>
    </RoleGuard>
  );
}
