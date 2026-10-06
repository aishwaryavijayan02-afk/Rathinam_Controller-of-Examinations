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
  Users,
  Briefcase,
  Trash2,
  Plus,
  Settings,
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
  ShieldCheck,
  XCircle,
  Eye,
  Check,
  X,
  Maximize2,
  Download,
  AlertCircle,
  Layers,
  FileSpreadsheet,
  Sparkles,
  RotateCcw,
  LayoutGrid,
  ListFilter,
  Lock,
  Send,
  CheckCheck,
  Building2,
  Archive,
} from "lucide-react";
import { examStore, QuestionItem, SubjectItem, SyllabusUnit } from "../lib/examStore";
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
import Pagination from "../components/Pagination";

export default function VerifyQuestionsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("verify-questions");
  const [searchQuery, setSearchQuery] = useState("");
  const STORAGE_KEY = "exam_cell_verify_filters";

  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | string>(1);
  const [showPreview, setShowPreview] = useState(true);
  const [selectedRows, setSelectedRows] = useState<(number | string)[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [currentPage, setCurrentPage] = useState(1);

  // Restore saved filters from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.subject !== undefined) setSelectedSubject(parsed.subject);
          if (parsed.unit !== undefined) setSelectedUnit(parsed.unit);
          if (parsed.topic !== undefined) setSelectedTopic(parsed.topic);
          if (parsed.difficulty !== undefined) setSelectedDifficulty(parsed.difficulty);
          if (parsed.status !== undefined) setSelectedStatus(parsed.status);
        }
      } catch (e) {
        // ignore
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
            topic: selectedTopic,
            difficulty: selectedDifficulty,
            status: selectedStatus,
          })
        );
      } catch (e) {
        // ignore
      }
    }
  }, [selectedSubject, selectedUnit, selectedTopic, selectedDifficulty, selectedStatus, filtersLoaded]);

  // CRUD state
  const [questions, setQuestions] = useState<QuestionItem[]>(() => examStore.getQuestions());
  const [viewingQuestion, setViewingQuestion] = useState<QuestionItem | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionItem | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Subject Questions Viewer Modal State
  const [subjectModalData, setSubjectModalData] = useState<{
    isOpen: boolean;
    subjectName: string;
    questions: QuestionItem[];
  }>({
    isOpen: false,
    subjectName: "",
    questions: [],
  });

  const handleOpenSubjectModal = (subjName: string) => {
    const cleanSubj = subjName.replace(/\s*\(All\)/i, "").trim();
    const subjQuestions = questions.filter((q) => {
      const qSubj = (q.subject || "").trim();
      return (
        qSubj.toLowerCase().includes(cleanSubj.toLowerCase()) ||
        cleanSubj.toLowerCase().includes(qSubj.toLowerCase())
      );
    });

    setSubjectModalData({
      isOpen: true,
      subjectName: cleanSubj,
      questions: subjQuestions,
    });
  };

  const handleApproveSubjectFromModal = () => {
    const ids = subjectModalData.questions.map((q) => q.id);
    if (ids.length === 0) return;

    setSubjectModalData((prev) => ({ ...prev, isOpen: false }));

    if (currentUser.role === "HOD") {
      examStore.hodVerifyQuestions(ids, currentUser.name);
      triggerToast(`✓ Verified ${ids.length} question(s) by HOD & forwarded to Dean (Dr. V Rajlakshmi)!`, "success");
      setVerifyModalItem({
        isOpen: true,
        name: `${subjectModalData.subjectName} (${ids.length} Questions)`,
        totalQuestions: ids.length,
        score: 98,
      });
    } else if (currentUser.role === "DEAN") {
      examStore.deanApproveQuestions(ids, currentUser.name);
      triggerToast(`✓ Approved ${ids.length} question(s) by Dean & forwarded to COE (Dr. Rajubalaji)!`, "success");
      setVerifyModalItem({
        isOpen: true,
        name: `${subjectModalData.subjectName} (${ids.length} Questions)`,
        totalQuestions: ids.length,
        score: 99,
      });
    } else if (currentUser.role === "COE") {
      examStore.coeFinalizeQuestions(ids, currentUser.name);
      triggerToast(`✓ Finalized ${ids.length} question(s) by COE! Locked for Question Paper Printing.`, "success");
      setVerifyModalItem({
        isOpen: true,
        name: `${subjectModalData.subjectName} (${ids.length} Questions)`,
        totalQuestions: ids.length,
        score: 100,
      });
    } else {
      examStore.bulkUpdateQuestions(ids.map(Number), "Verified");
      triggerToast(`✓ Verified ${ids.length} question(s) successfully!`, "success");
      setVerifyModalItem({
        isOpen: true,
        name: `${subjectModalData.subjectName} (${ids.length} Questions)`,
        totalQuestions: ids.length,
        score: 96,
      });
    }
  };

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [showToast, setShowToast] = useState(false);

  // AI State
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiScanStep, setAiScanStep] = useState(0);

  const [verifyModalItem, setVerifyModalItem] = useState<{
    isOpen: boolean;
    name: string;
    totalQuestions: number;
    score: number;
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
        name: targetIds && targetIds.length === 1 ? `Question #${targetIds[0]}` : "Questions Pool",
        totalQuestions: res.verifiedCount,
        score: Math.floor(Math.random() * 6) + 94,
      });
    }, 1300);
  };

  const triggerToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => examStore.getLastUpdated());
  const [subjects, setSubjects] = useState<SubjectItem[]>(() => examStore.getSubjects());
  const [units, setUnits] = useState<SyllabusUnit[]>(() => examStore.getUnits());

  useEffect(() => {
    const loadQuestions = () => {
      setQuestions(examStore.getQuestions());
      setSubjects(examStore.getSubjects());
      setUnits(examStore.getUnits());
      setLastUpdatedTime(examStore.getLastUpdated());
    };
    loadQuestions();
    window.addEventListener("exam-cell-store-update", loadQuestions);
    return () => window.removeEventListener("exam-cell-store-update", loadQuestions);
  }, []);

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

  // Question Inspection Pack definition for Bulk Upload packs
  interface QuestionInspectionPack {
    id: string;
    subject: string;
    code: string;
    sourceFile: string;
    uploadedBy: string;
    uploadDate: string;
    questions: QuestionItem[];
    totalQuestions: number;
    pendingCount: number;
    verifiedCount: number;
    approvedCount: number;
    finalizedCount: number;
    currentStage: "PENDING_HOD" | "HOD_VERIFIED" | "DEAN_APPROVED" | "COE_FINALIZED";
    stageLabel: string;
    verifiedByHOD?: string;
    approvedByDean?: string;
    finalizedByCOE?: string;
  }

  const inspectionPacks = useMemo<QuestionInspectionPack[]>(() => {
    if (!questions || questions.length === 0) return [];

    const packMap = new Map<string, QuestionItem[]>();

    questions.forEach((q) => {
      const subj = (q.subject || "Viscom & VFX").trim();
      const src = (q.sourceFile || "Uploaded Question Pack").trim();
      const key = `${subj}____${src}`;
      if (!packMap.has(key)) {
        packMap.set(key, []);
      }
      packMap.get(key)!.push(q);
    });

    const result: QuestionInspectionPack[] = [];

    packMap.forEach((pQuestions, key) => {
      const [subject, sourceFile] = key.split("____");
      const matchedSubject = subjects.find(
        (s) => s.name.toLowerCase() === subject.toLowerCase() || subject.toLowerCase().includes(s.name.toLowerCase())
      );

      const totalQuestions = pQuestions.length;
      const pendingCount = pQuestions.filter((q) => q.status === "Pending").length;
      const verifiedCount = pQuestions.filter((q) => q.status === "Verified" || q.verifiedRole === "HOD").length;
      const approvedCount = pQuestions.filter((q) => q.status === "Approved" && q.verifiedRole === "DEAN").length;
      const finalizedCount = pQuestions.filter((q) => q.status === "Approved" && q.verifiedRole === "COE").length;

      const sampleQ = pQuestions[0];
      const uploadedBy = sampleQ?.uploadedBy || "Mr. Vignesh M (Faculty)";
      const uploadDate = sampleQ?.date || sampleQ?.addedOn || "Recently";

      const verifiedQ = pQuestions.find((q) => q.verifiedRole === "HOD" || q.status === "Verified");
      const approvedQ = pQuestions.find((q) => q.verifiedRole === "DEAN");
      const finalizedQ = pQuestions.find((q) => q.verifiedRole === "COE");

      let currentStage: "PENDING_HOD" | "HOD_VERIFIED" | "DEAN_APPROVED" | "COE_FINALIZED" = "PENDING_HOD";
      let stageLabel = `🟡 Pending HOD Review (${pendingCount} Qs)`;

      if (finalizedCount > 0 && pendingCount === 0 && verifiedCount === 0 && approvedCount === 0) {
        currentStage = "COE_FINALIZED";
        stageLabel = `🟣 COE Finalized (${finalizedCount} Qs Locked)`;
      } else if (approvedCount > 0 && pendingCount === 0) {
        currentStage = "DEAN_APPROVED";
        stageLabel = `🔵 Dean Approved ➔ Ready for COE (${approvedCount} Qs)`;
      } else if (verifiedCount > 0 && pendingCount === 0) {
        currentStage = "HOD_VERIFIED";
        stageLabel = `🟢 HOD Verified ➔ Ready for Dean (${verifiedCount} Qs)`;
      } else {
        currentStage = "PENDING_HOD";
        stageLabel = `🟡 Pending HOD Review (${pendingCount > 0 ? pendingCount : totalQuestions} Qs)`;
      }

      result.push({
        id: `pack-${key}`,
        subject,
        code: matchedSubject?.code || "VC2024",
        sourceFile,
        uploadedBy,
        uploadDate,
        questions: pQuestions,
        totalQuestions,
        pendingCount,
        verifiedCount,
        approvedCount,
        finalizedCount,
        currentStage,
        stageLabel,
        verifiedByHOD: verifiedQ?.verifiedBy,
        approvedByDean: approvedQ?.verifiedBy,
        finalizedByCOE: finalizedQ?.verifiedBy,
      });
    });

    return result;
  }, [questions, subjects]);

  const handleOpenPackModal = (pack: QuestionInspectionPack) => {
    setSubjectModalData({
      isOpen: true,
      subjectName: `${pack.subject} [${pack.sourceFile}]`,
      questions: pack.questions,
    });
  };

  const handleVerifyPack = (pack: QuestionInspectionPack) => {
    const ids = pack.questions.map((q) => q.id);
    if (ids.length === 0) return;

    if (currentUser.role === "HOD") {
      examStore.hodVerifyQuestions(ids, currentUser.name);
      triggerToast(`✓ Pack "${pack.subject}" verified by HOD & forwarded to Dean (Dr. V Rajlakshmi)!`, "success");
      setVerifyModalItem({
        isOpen: true,
        name: `${pack.subject} (${ids.length} Questions)`,
        totalQuestions: ids.length,
        score: 98,
      });
    } else if (currentUser.role === "DEAN") {
      examStore.deanApproveQuestions(ids, currentUser.name);
      triggerToast(`✓ Pack "${pack.subject}" approved by Dean & forwarded to COE (Dr. Rajubalaji)!`, "success");
      setVerifyModalItem({
        isOpen: true,
        name: `${pack.subject} (${ids.length} Questions)`,
        totalQuestions: ids.length,
        score: 99,
      });
    } else if (currentUser.role === "COE") {
      examStore.coeFinalizeQuestions(ids, currentUser.name);
      triggerToast(`✓ Pack "${pack.subject}" finalized by COE! Locked for Question Paper Printing.`, "success");
      setVerifyModalItem({
        isOpen: true,
        name: `${pack.subject} (${ids.length} Questions)`,
        totalQuestions: ids.length,
        score: 100,
      });
    } else {
      examStore.bulkUpdateQuestions(ids.map(Number), "Verified");
      triggerToast(`✓ Pack "${pack.subject}" verified successfully!`, "success");
      setVerifyModalItem({
        isOpen: true,
        name: `${pack.subject} (${ids.length} Questions)`,
        totalQuestions: ids.length,
        score: 96,
      });
    }
  };

  const handleCreateSampleBulkUpload = () => {
    const sampleBatch: Omit<QuestionItem, "id">[] = [
      {
        question: "Explain the visual effects pipeline and how Rotoscopy is used to separate foreground elements from background in live-action footage.",
        subject: "Viscom & VFX",
        unit: "Unit 01 - Visual Effects & Rotoscopy",
        topic: "Rotoscopy Fundamentals",
        type: "Descriptive",
        difficulty: "Medium",
        marks: 10,
        status: "Pending",
        uploadedBy: "Mr. Vignesh M (Staff)",
        email: "vignesh.viscom@rathinam.in",
        sourceFile: "Staff_Rotoscopy_Exam_Batch_2024.docx",
        addedOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      },
      {
        question: "What is green screen keying (Chroma Key)? Describe the difference between spill suppression and alpha matte generation.",
        subject: "Viscom & VFX",
        unit: "Unit 02 - Chroma Keying & Matting",
        topic: "Chroma Keying",
        type: "Descriptive",
        difficulty: "Hard",
        marks: 10,
        status: "Pending",
        uploadedBy: "Mr. Vignesh M (Staff)",
        email: "vignesh.viscom@rathinam.in",
        sourceFile: "Staff_Rotoscopy_Exam_Batch_2024.docx",
        addedOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      },
      {
        question: "Which of the following color channels is most commonly used in digital video cameras for luminance encoding?",
        subject: "Viscom & VFX",
        unit: "Unit 03 - Digital Compositing",
        topic: "Color Science",
        type: "MCQ",
        difficulty: "Easy",
        marks: 2,
        options: ["Green channel", "Red channel", "Blue channel", "Alpha channel"],
        correctAnswer: "Green channel",
        status: "Pending",
        uploadedBy: "Mr. Vignesh M (Staff)",
        email: "vignesh.viscom@rathinam.in",
        sourceFile: "Staff_Rotoscopy_Exam_Batch_2024.docx",
        addedOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      },
      {
        question: "Differentiate between Motion Blur estimation and Optical Flow in modern compositing suites.",
        subject: "Viscom & VFX",
        unit: "Unit 04 - Advanced VFX",
        topic: "Optical Flow Analysis",
        type: "Short Answer",
        difficulty: "Medium",
        marks: 5,
        status: "Pending",
        uploadedBy: "Mr. Vignesh M (Staff)",
        email: "vignesh.viscom@rathinam.in",
        sourceFile: "Staff_Rotoscopy_Exam_Batch_2024.docx",
        addedOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      },
      {
        question: "Describe 3D camera tracking and matchmoving techniques used in feature film production.",
        subject: "Viscom & VFX",
        unit: "Unit 05 - 3D Camera Tracking",
        topic: "Matchmoving",
        type: "Descriptive",
        difficulty: "Hard",
        marks: 10,
        status: "Pending",
        uploadedBy: "Mr. Vignesh M (Staff)",
        email: "vignesh.viscom@rathinam.in",
        sourceFile: "Staff_Rotoscopy_Exam_Batch_2024.docx",
        addedOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      },
    ];

    sampleBatch.forEach((q) => examStore.saveQuestion(q));
    triggerToast("Sample Staff Upload Pack (5 Questions) added successfully!", "success");
  };

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

  // Available subjects for dropdown
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.subject && q.subject.trim()) set.add(q.subject.trim());
    });
    subjects.forEach((s) => {
      if (s.name && s.name.trim()) set.add(s.name.trim());
    });
    return Array.from(set);
  }, [questions, subjects]);

  // Available units for dropdown
  const availableUnits = useMemo(() => {
    const set = new Set<string>();
    const targetQs =
      selectedSubject === "all"
        ? questions
        : questions.filter(
            (q) =>
              q.subject.toLowerCase().includes(selectedSubject.toLowerCase()) ||
              selectedSubject.toLowerCase().includes(q.subject.toLowerCase())
          );
    targetQs.forEach((q) => {
      if (q.unit && q.unit.trim()) set.add(q.unit.trim());
    });
    return Array.from(set);
  }, [questions, selectedSubject]);

  // Available topics for dropdown
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    const targetQs = questions.filter((q) => {
      if (
        selectedSubject !== "all" &&
        !q.subject.toLowerCase().includes(selectedSubject.toLowerCase()) &&
        !selectedSubject.toLowerCase().includes(q.subject.toLowerCase())
      )
        return false;
      if (
        selectedUnit !== "all" &&
        !q.unit.toLowerCase().includes(selectedUnit.toLowerCase()) &&
        !selectedUnit.toLowerCase().includes(q.unit.toLowerCase())
      )
        return false;
      return true;
    });
    targetQs.forEach((q) => {
      if (q.topic && q.topic.trim()) set.add(q.topic.trim());
    });
    return Array.from(set);
  }, [questions, selectedSubject, selectedUnit]);

  // Filtering
  const filteredQuestions = questions.filter((q) => {
    if (selectedSubject !== "all") {
      const subLower = selectedSubject.toLowerCase();
      if (subLower === "vfx" && !q.subject.toLowerCase().includes("vfx")) return false;
      else if (subLower === "viscom" && !q.subject.toLowerCase().includes("viscom")) return false;
      else if (
        !q.subject.toLowerCase().includes(subLower) &&
        !subLower.includes(q.subject.toLowerCase())
      )
        return false;
    }
    if (selectedUnit !== "all") {
      const uLower = selectedUnit.toLowerCase();
      if (uLower === "u1" && !q.unit.toLowerCase().includes("unit 01") && !q.unit.toLowerCase().includes("unit i")) return false;
      else if (uLower === "u2" && !q.unit.toLowerCase().includes("unit 02") && !q.unit.toLowerCase().includes("unit ii")) return false;
      else if (uLower === "u3" && !q.unit.toLowerCase().includes("unit 03") && !q.unit.toLowerCase().includes("unit iii")) return false;
      else if (!q.unit.toLowerCase().includes(uLower)) return false;
    }
    if (selectedTopic !== "all") {
      if (!q.topic.toLowerCase().includes(selectedTopic.toLowerCase())) return false;
    }
    if (selectedDifficulty !== "all" && q.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
    if (selectedStatus === "pending" && q.status !== "Pending") return false;
    if (selectedStatus === "verified" && !(q.status === "Verified" || q.verifiedRole === "HOD")) return false;
    if (selectedStatus === "approved" && !(q.status === "Approved" && q.verifiedRole === "DEAN")) return false;
    if (selectedStatus === "finalized" && !(q.status === "Approved" && q.verifiedRole === "COE")) return false;
    if (selectedStatus === "rejected" && q.status !== "Rejected") return false;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      const match =
        q.question.toLowerCase().includes(qLower) ||
        q.subject.toLowerCase().includes(qLower) ||
        q.topic.toLowerCase().includes(qLower) ||
        (q.uploadedBy && q.uploadedBy.toLowerCase().includes(qLower)) ||
        (q.sourceFile && q.sourceFile.toLowerCase().includes(qLower));
      if (!match) return false;
    }
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, selectedUnit, selectedTopic, selectedDifficulty, selectedStatus]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  const currentPreview = filteredQuestions.find((q) => String(q.id) === String(selectedQuestionId)) || filteredQuestions[0] || questions[0];

  const handleVerifyQuestion = (id: number | string) => {
    if (currentUser.role === "HOD") {
      examStore.hodVerifyQuestions([id], currentUser.name);
      triggerToast(`Question #${id} verified by HOD & forwarded to Dean (Dr. V Rajlakshmi)!`, "success");
    } else if (currentUser.role === "DEAN") {
      examStore.deanApproveQuestions([id], currentUser.name);
      triggerToast(`Question #${id} approved by Dean & forwarded to COE (Dr. Rajubalaji)!`, "success");
    } else if (currentUser.role === "COE") {
      examStore.coeFinalizeQuestions([id], currentUser.name);
      triggerToast(`Question #${id} finalized by COE! Locked for Question Paper Printing.`, "success");
    } else {
      examStore.saveQuestion({ id, status: "Verified" });
      triggerToast(`Question #${id} verified successfully!`, "success");
    }
  };

  const handleRejectQuestion = (id: number | string) => {
    examStore.saveQuestion({ id, status: "Rejected" });
    triggerToast(`Question #${id} rejected.`, "info");
  };

  const handleBulkVerify = () => {
    if (selectedRows.length === 0) return;
    if (currentUser.role === "HOD") {
      examStore.hodVerifyQuestions(selectedRows, currentUser.name);
      triggerToast(`${selectedRows.length} question(s) verified by HOD & forwarded to Dean (Dr. V Rajlakshmi)!`, "success");
    } else if (currentUser.role === "DEAN") {
      examStore.deanApproveQuestions(selectedRows, currentUser.name);
      triggerToast(`${selectedRows.length} question(s) approved by Dean & forwarded to COE (Dr. Rajubalaji)!`, "success");
    } else if (currentUser.role === "COE") {
      examStore.coeFinalizeQuestions(selectedRows, currentUser.name);
      triggerToast(`${selectedRows.length} question(s) finalized by COE & locked for Question Bank!`, "success");
    } else {
      examStore.bulkUpdateQuestions(selectedRows.map(Number), "Verified");
      triggerToast(`${selectedRows.length} question(s) verified successfully!`, "success");
    }
    setSelectedRows([]);
  };

  const handleBulkReject = () => {
    if (selectedRows.length === 0) return;
    examStore.bulkUpdateQuestions(selectedRows.map(Number), "Rejected");
    setSelectedRows([]);
    triggerToast(`${selectedRows.length} question(s) rejected.`, "info");
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (confirm(`Delete ${selectedRows.length} selected question(s)?`)) {
      examStore.bulkDeleteQuestions(selectedRows.map(Number));
      setSelectedRows([]);
      triggerToast(`${selectedRows.length} question(s) removed.`, "error");
    }
  };

  const handleExportVerified = () => {
    const dataToExport = filteredQuestions.length > 0 ? filteredQuestions : questions;
    const rows = dataToExport.map((q) => ({
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
    examStore.exportToCsv("verify_questions_export.csv", rows);
    triggerToast(`Exported ${rows.length} questions to CSV!`, "success");
  };

  const toggleRow = (id: number | string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredQuestions.length && filteredQuestions.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredQuestions.map((q) => q.id));
    }
  };

  const handleReset = () => {
    setSelectedSubject("all");
    setSelectedUnit("all");
    setSelectedTopic("all");
    setSelectedDifficulty("all");
    setSelectedStatus("pending");
    setSearchQuery("");
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // ignore
      }
    }
  };

  const questionFields: FormFieldDef[] = [
    { name: "question", label: "Question Text", type: "textarea", required: true },
    {
      name: "subject",
      label: "Subject",
      type: "select",
      options: ["Viscom & VFX", "Viscom", "Animation Basics", "Sound Engineering"],
      required: true,
    },
    { name: "unit", label: "Unit", type: "text", required: true },
    { name: "topic", label: "Topic", type: "text", required: true },
    {
      name: "type",
      label: "Question Type",
      type: "select",
      options: ["MCQ", "Descriptive", "Match Type", "Short Answer"],
      required: true,
    },
    {
      name: "difficulty",
      label: "Difficulty Level",
      type: "select",
      options: ["Easy", "Medium", "Hard"],
      required: true,
    },
    { name: "marks", label: "Marks", type: "number", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Pending", "Verified", "Approved", "Rejected"],
      required: true,
    },
  ];

  return (
    <RoleGuard route="/verify-questions">
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "11px 15px",
                    borderRadius: "14px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 700 : 500,
                    textAlign: "left",
                    position: "relative",
                  }}
                >
                  <IconComp
                    size={18}
                    style={{
                      filter: isActive
                        ? "drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))"
                        : "none",
                    }}
                  />
                  <span style={{ flex: 1 }}>{item.label}</span>

                  {item.badge && (
                    <span
                      style={{
                        background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                        color: "#ffffff",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        boxShadow: "0 2px 8px rgba(236, 72, 153, 0.5)",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.hasArrow && (
                    <ChevronRight
                      size={16}
                      color="#ffffff"
                      style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))" }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Need Help Box */}
        <div className="support-card-3d" style={{ marginTop: "20px" }}>
          <div className="shield-icon-3d">
            <Shield size={20} style={{ filter: "drop-shadow(0 0 4px rgba(96, 165, 250, 0.8))" }} />
          </div>
          <strong style={{ display: "block", color: "#ffffff", fontSize: "14px", marginBottom: "4px", fontWeight: 700 }}>
            Need Help?
          </strong>
          <p style={{ fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.45, margin: "0 0 14px 0" }}>
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
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.16)")}
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
        <PortalHeader activeRoute="verify-questions" />


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
                <span>Verify Questions</span>
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
                  <ShieldCheck size={20} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9)) drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))" }} />
                </div>
              </h1>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                Review, verify and manage questions uploaded to the question bank.
              </p>
            </div>

          </div>

          {/* ================= Main Content Container (Full Width) ================= */}
          <div style={{ width: "100%" }}>
            {/* ================= LEFT WIDE COLUMN: Filters, Table & Preview ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Card 1: Filter & Table Container */}
              <div className="widget-card-3d" style={{ padding: "24px" }}>
                {/* Header Title with 3D Icon */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "18px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      className="action-mini-icon-blue"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 16px rgba(37, 99, 235, 0.35)",
                      }}
                    >
                      <Search size={18} color="#ffffff" />
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
                        Questions Verification List
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                        Review, modify, approve or reject uploaded questions before publishing
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => handleAiVerify(selectedRows.length > 0 ? selectedRows : undefined)}
                      className="primary-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 16px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
                        color: "#ffffff",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)",
                      }}
                    >
                      <Sparkles size={15} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }} />
                      <span>🤖 AI Verify Questions</span>
                    </button>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#2563eb",
                        background: "#eff6ff",
                        padding: "4px 12px",
                        borderRadius: "100px",
                        boxShadow: "0 2px 6px rgba(37, 99, 235, 0.15)",
                      }}
                    >
                      {filteredQuestions.length} Questions Shown
                    </span>
                  </div>
                </div>

                {/* 3-Tier Academic Verification Workflow Pipeline Banner */}
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "16px 20px",
                    background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)",
                    borderRadius: "16px",
                    border: "1.5px solid #bfdbfe",
                    boxShadow: "0 4px 16px rgba(37, 99, 235, 0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        <Shield size={16} />
                      </div>
                      <div>
                        <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                          3-Tier Academic Verification Pipeline
                        </strong>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          Faculty Upload ➔ HOD Verification ➔ Dean Academic Approval ➔ COE Final Sign-Off
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          color: "#334155",
                        }}
                      >
                        Active Role: <strong style={{ color: "#2563eb" }}>{currentUser.name} ({currentUser.role})</strong>
                      </span>
                    </div>
                  </div>

                  {/* 4 Pipeline Stages */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "10px",
                      marginBottom: 0,
                    }}
                  >
                    {/* Stage 1: Faculty Upload */}
                    <div
                      role="button"
                      tabIndex={0}
                      title="Click to filter questions by this stage"
                      className={`pipeline-stage-card${selectedStatus === "all" ? " is-active" : ""}`}
                      onClick={() => { setSelectedStatus("all"); setSelectedSubject("all"); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedStatus("all"); setSelectedSubject("all"); } }}
                      data-ring="22, 163, 74"
                      style={{
                        ["--stage-ring" as any]: "22, 163, 74",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        background: "#ffffff",
                        border: "1px solid #86efac",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#166534" }}>1. FACULTY UPLOAD</span>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#16a34a", background: "#dcfce7", padding: "1px 6px", borderRadius: "10px" }}>
                          ✓ Done
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Mr. Vignesh M</div>
                      <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                        Rotoscopy_and_Keying...docx (100 Qs)
                      </div>
                    </div>

                    {/* Stage 2: HOD Verification */}
                    <div
                      role="button"
                      tabIndex={0}
                      title="Click to filter questions by this stage"
                      className={`pipeline-stage-card${selectedStatus === "pending" ? " is-active" : ""}`}
                      onClick={() => { setSelectedStatus("pending"); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedStatus("pending"); } }}
                      data-ring="37, 99, 235"
                      style={{
                        ["--stage-ring" as any]: "37, 99, 235",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        background: currentUser.role === "HOD" ? "#eff6ff" : "#ffffff",
                        border: currentUser.role === "HOD" ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        boxShadow: currentUser.role === "HOD" ? "0 4px 12px rgba(37, 99, 235, 0.15)" : "0 2px 6px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: 700, color: currentUser.role === "HOD" ? "#1d4ed8" : "#475569" }}>
                          2. HOD VERIFY
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            color: questions.filter((q) => q.status === "Pending").length > 0 ? "#b45309" : "#16a34a",
                            background: questions.filter((q) => q.status === "Pending").length > 0 ? "#fef3c7" : "#dcfce7",
                            padding: "1px 6px",
                            borderRadius: "10px",
                          }}
                        >
                          {questions.filter((q) => q.status === "Pending").length} Pending
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Dr. T.J RAJU (HOD)</div>
                      <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                        Verifies Bloom's level & sends to Dean
                      </div>
                    </div>

                    {/* Stage 3: Dean Approval */}
                    <div
                      role="button"
                      tabIndex={0}
                      title="Click to filter questions by this stage"
                      className={`pipeline-stage-card${selectedStatus === "verified" ? " is-active" : ""}`}
                      onClick={() => { setSelectedStatus("verified"); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedStatus("verified"); } }}
                      data-ring="124, 58, 237"
                      style={{
                        ["--stage-ring" as any]: "124, 58, 237",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        background: currentUser.role === "DEAN" ? "#f5f3ff" : "#ffffff",
                        border: currentUser.role === "DEAN" ? "2px solid #7c3aed" : "1px solid #e2e8f0",
                        boxShadow: currentUser.role === "DEAN" ? "0 4px 12px rgba(124, 58, 237, 0.15)" : "0 2px 6px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: 700, color: currentUser.role === "DEAN" ? "#6d28d9" : "#475569" }}>
                          3. DEAN APPROVAL
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            color: questions.filter((q) => q.status === "Verified").length > 0 ? "#4338ca" : "#64748b",
                            background: questions.filter((q) => q.status === "Verified").length > 0 ? "#e0e7ff" : "#f1f5f9",
                            padding: "1px 6px",
                            borderRadius: "10px",
                          }}
                        >
                          {questions.filter((q) => q.status === "Verified").length} Ready
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Dr. V Rajlakshmi (Dean)</div>
                      <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                        Approves & forwards to COE
                      </div>
                    </div>

                    {/* Stage 4: COE Finalization */}
                    <div
                      role="button"
                      tabIndex={0}
                      title="Click to filter questions by this stage"
                      className={`pipeline-stage-card${selectedStatus === "finalized" ? " is-active" : ""}`}
                      onClick={() => { setSelectedStatus("finalized"); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedStatus("finalized"); } }}
                      data-ring="192, 38, 211"
                      style={{
                        ["--stage-ring" as any]: "192, 38, 211",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        background: currentUser.role === "COE" ? "#fdf4ff" : "#ffffff",
                        border: currentUser.role === "COE" ? "2px solid #c026d3" : "1px solid #e2e8f0",
                        boxShadow: currentUser.role === "COE" ? "0 4px 12px rgba(192, 38, 211, 0.15)" : "0 2px 6px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: 700, color: currentUser.role === "COE" ? "#a21caf" : "#475569" }}>
                          4. COE FINAL SIGN-OFF
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            color: "#166534",
                            background: "#dcfce7",
                            padding: "1px 6px",
                            borderRadius: "10px",
                          }}
                        >
                          {questions.filter((q) => q.status === "Approved" && q.verifiedRole === "COE").length} Finalized
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Dr. Rajubalaji (COE)</div>
                      <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                        Locks question bank & enables printing
                      </div>
                    </div>
                  </div>

                </div>


                {/* Bulk Actions Banner if rows selected */}
                {selectedRows.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                      borderRadius: "12px",
                      border: "1px solid #bfdbfe",
                      marginBottom: "16px",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e40af" }}>
                      {selectedRows.length} question(s) selected
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleAiVerify(selectedRows)}
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
                        }}
                      >
                        <Sparkles size={13} />
                        🤖 AI Verify Selected
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkVerify}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          background:
                            currentUser.role === "HOD"
                              ? "#16a34a"
                              : currentUser.role === "DEAN"
                              ? "#4f46e5"
                              : currentUser.role === "COE"
                              ? "#c026d3"
                              : "#16a34a",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}
                      >
                        {currentUser.role === "HOD"
                          ? "✓ Verify & Send to Dean"
                          : currentUser.role === "DEAN"
                          ? "✓ Approve & Send to COE"
                          : currentUser.role === "COE"
                          ? "✓ Final Approval (COE Bank)"
                          : "Verify Selected"}
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkReject}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "#ea580c",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Reject Selected
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "#ef4444",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Delete Selected
                      </button>
                    </div>
                  </div>
                )}

                {/* Filter Row 1 */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Search questions by text, subject, or unit..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 42px 10px 14px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "13px",
                        color: "#1e293b",
                        outline: "none",
                        boxSizing: "border-box",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                      }}
                    />
                    <Search
                      size={16}
                      color="#2563eb"
                      style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExportVerified}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 16px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Download size={14} color="#2563eb" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="filter-btn-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddingQuestion(true)}
                    className="filter-btn-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#ffffff",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                    }}
                  >
                    <Plus size={15} />
                    <span>Add Question</span>
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

                {/* Filter Row 2: Select Dropdowns */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1.3fr",
                    gap: "12px",
                    marginBottom: "20px",
                    paddingBottom: "18px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "5px", fontWeight: 600 }}>
                      Subject
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedSubject}
                        onChange={(e) => {
                          setSelectedSubject(e.target.value);
                          setSelectedUnit("all");
                          setSelectedTopic("all");
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 26px 8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">All Subjects ({questions.length})</option>
                        {availableSubjects.map((sub: string) => {
                          const count = questions.filter(
                            (q) => q.subject.toLowerCase() === sub.toLowerCase()
                          ).length;
                          return (
                            <option key={sub} value={sub}>
                              {sub} ({count})
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown
                        size={14}
                        color="#64748b"
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "5px", fontWeight: 600 }}>
                      Unit
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedUnit}
                        onChange={(e) => {
                          setSelectedUnit(e.target.value);
                          setSelectedTopic("all");
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 26px 8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">All Units ({availableUnits.length})</option>
                        {availableUnits.map((u: string) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        color="#64748b"
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "5px", fontWeight: 600 }}>
                      Topic
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 26px 8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">All Topics ({availableTopics.length})</option>
                        {availableTopics.map((t: string) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        color="#64748b"
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "5px", fontWeight: 600 }}>
                      Difficulty
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 26px 8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">All Levels</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <ChevronDown
                        size={14}
                        color="#64748b"
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "5px", fontWeight: 600 }}>
                      Workflow Status
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 26px 8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">All Statuses ({questions.length})</option>
                        <option value="pending">🟡 Pending HOD Review ({questions.filter((q) => q.status === "Pending").length})</option>
                        <option value="verified">🟢 Verified by HOD ({questions.filter((q) => q.status === "Verified").length})</option>
                        <option value="approved">🔵 Approved by Dean / COE ({questions.filter((q) => q.status === "Approved").length})</option>
                        <option value="rejected">🔴 Rejected ({questions.filter((q) => q.status === "Rejected").length})</option>
                      </select>
                      <ChevronDown
                        size={14}
                        color="#64748b"
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Table or Cards View */}
                {viewMode === "table" ? (
                  <div className="no-scrollbar" style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px", textAlign: "left" }}>
                      <thead>
                        <tr>
                          <th style={{ padding: "8px 10px", width: "32px" }}>
                            <input
                              type="checkbox"
                              checked={selectedRows.length === questions.length}
                              onChange={toggleSelectAll}
                              style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#2563eb" }}
                            />
                          </th>
                          <th style={{ padding: "8px 12px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Question
                          </th>
                          <th style={{ padding: "8px 12px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Subject / Unit / Topic
                          </th>
                          <th style={{ padding: "8px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Type
                          </th>
                          <th style={{ padding: "8px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Difficulty
                          </th>
                          <th style={{ padding: "8px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Uploaded On
                          </th>
                          <th style={{ padding: "8px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Uploaded By
                          </th>
                          <th style={{ padding: "8px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedQuestions.map((q) => {
                          const isSelected = String(selectedQuestionId) === String(q.id);
                          const isChecked = selectedRows.includes(q.id);

                          return (
                            <tr
                              key={q.id}
                              onClick={() => {
                                setSelectedQuestionId(q.id);
                                setShowPreview(true);
                              }}
                              className="table-row-3d"
                              style={{
                                background: isSelected
                                  ? "#eff6ff"
                                  : isChecked
                                  ? "#f8fafc"
                                  : "#ffffff",
                                borderRadius: "12px",
                                cursor: "pointer",
                                boxShadow: isSelected
                                  ? "0 4px 14px rgba(37, 99, 235, 0.12), inset 0 0 0 1.5px #3b82f6"
                                  : "0 2px 6px rgba(0,0,0,0.02)",
                                border: "1px solid #f1f5f9",
                              }}
                            >
                              <td
                                style={{ padding: "14px 10px", verticalAlign: "top", borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleRow(q.id)}
                                  style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#2563eb", marginTop: "3px" }}
                                />
                              </td>

                              <td style={{ padding: "14px 12px", verticalAlign: "top", maxWidth: "260px" }}>
                                <div
                                  style={{
                                    fontSize: "12.5px",
                                    fontWeight: 700,
                                    color: "#0f172a",
                                    lineHeight: "1.45",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                  title={q.question}
                                >
                                  {q.question}
                                </div>
                                <div style={{ display: "flex", gap: "6px", marginTop: "6px", alignItems: "center", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "10.5px", color: "#2563eb", fontWeight: 700 }}>
                                    #{q.id}
                                  </span>
                                  {q.marks !== undefined && (
                                    <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: 500 }}>
                                      • {q.marks} Marks
                                    </span>
                                  )}
                                  {q.sourceFile && (
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        color: "#047857",
                                        background: "#d1fae5",
                                        padding: "1px 6px",
                                        borderRadius: "4px",
                                        border: "1px solid #a7f3d0",
                                      }}
                                      title={q.sourceFile}
                                    >
                                      📄 {q.sourceFile.length > 22 ? q.sourceFile.slice(0, 22) + "..." : q.sourceFile}
                                    </span>
                                  )}
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                      background:
                                        q.status === "Approved"
                                          ? "#dcfce7"
                                          : q.status === "Verified"
                                          ? "#e0f2fe"
                                          : q.status === "Rejected"
                                          ? "#fee2e2"
                                          : "#fef3c7",
                                      color:
                                        q.status === "Approved"
                                          ? "#166534"
                                          : q.status === "Verified"
                                          ? "#0369a1"
                                          : q.status === "Rejected"
                                          ? "#991b1b"
                                          : "#92400e",
                                    }}
                                  >
                                    {q.status === "Pending"
                                      ? "🟡 Pending HOD"
                                      : q.status === "Verified"
                                      ? "🟢 HOD Verified ➔ Dean"
                                      : q.verifiedRole === "COE"
                                      ? "🏆 COE Finalized"
                                      : "🔵 Dean Approved ➔ COE"}
                                  </span>
                                </div>
                              </td>

                              <td style={{ padding: "14px 12px", verticalAlign: "top" }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
                                  {q.subject}
                                </div>
                                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                  {q.unit}
                                </div>
                                <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                                  {q.topic}
                                </div>
                              </td>

                              <td style={{ padding: "14px 10px", verticalAlign: "top" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  {q.type}
                                </span>
                              </td>

                              <td style={{ padding: "14px 10px", verticalAlign: "top" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    padding: "3px 9px",
                                    borderRadius: "7px",
                                    background:
                                      q.difficulty === "Easy"
                                        ? "#dcfce7"
                                        : q.difficulty === "Medium"
                                        ? "#fef3c7"
                                        : "#fee2e2",
                                    color:
                                      q.difficulty === "Easy"
                                        ? "#15803d"
                                        : q.difficulty === "Medium"
                                        ? "#b45309"
                                        : "#b91c1c",
                                  }}
                                >
                                  {q.difficulty}
                                </span>
                              </td>

                              <td style={{ padding: "14px 10px", verticalAlign: "top", fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>
                                {q.addedOn}
                              </td>

                              <td style={{ padding: "14px 10px", verticalAlign: "top", fontSize: "12px", color: "#334155", fontWeight: 600 }}>
                                {q.uploadedBy || "Faculty"}
                              </td>

                              <td
                                style={{ padding: "14px 10px", verticalAlign: "middle", textAlign: "center", borderTopRightRadius: "12px", borderBottomRightRadius: "12px" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                  <CrudActionButtons
                                    onView={() => setViewingQuestion(q)}
                                    onVerify={() => handleAiVerify([q.id])}
                                    onEdit={() => setEditingQuestion(q)}
                                    onDelete={() => setDeletingQuestion(q)}
                                    viewTitle="View Details"
                                    verifyTitle="Verify Question with AI"
                                    editTitle="Edit Question"
                                    deleteTitle="Delete Question"
                                    size={32}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyQuestion(q.id)}
                                    title={
                                      currentUser.role === "HOD"
                                        ? "Verify & Send to Dean (Dr. V Rajlakshmi)"
                                        : currentUser.role === "DEAN"
                                        ? "Approve & Send to COE (Dr. Rajubalaji)"
                                        : currentUser.role === "COE"
                                        ? "Final Sign-off & Lock in Question Bank"
                                        : "Verify Question"
                                    }
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "8px",
                                      border: "1px solid #bbf7d0",
                                      background: "#f0fdf4",
                                      color: "#16a34a",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    <Check size={14} strokeWidth={2.2} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectQuestion(q.id)}
                                    title="Reject Question"
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "8px",
                                      border: "1px solid #fed7aa",
                                      background: "#fff7ed",
                                      color: "#ea580c",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    <X size={14} strokeWidth={2.2} />
                                  </button>
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
                    {paginatedQuestions.map((q) => {
                      const isSelected = String(selectedQuestionId) === String(q.id);
                      const isChecked = selectedRows.includes(q.id);

                      return (
                        <div
                          key={q.id}
                          onClick={() => {
                            setSelectedQuestionId(q.id);
                            setShowPreview(true);
                          }}
                          className="widget-card-3d"
                          style={{
                            background: isSelected ? "#eff6ff" : isChecked ? "#f8fafc" : "#ffffff",
                            borderRadius: "16px",
                            border: isSelected
                              ? "1.5px solid #2563eb"
                              : isChecked
                              ? "1.5px solid #93c5fd"
                              : "1px solid #e2e8f0",
                            padding: "18px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "14px",
                            cursor: "pointer",
                            boxShadow: isSelected
                              ? "0 8px 24px rgba(37, 99, 235, 0.18)"
                              : "0 4px 14px rgba(0, 0, 0, 0.03)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div>
                            {/* Top Row: Checkbox, ID, Type badge, Difficulty badge */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "10px",
                              }}
                            >
                              <div
                                style={{ display: "flex", alignItems: "center", gap: "8px" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleRow(q.id)}
                                  style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#2563eb" }}
                                />
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 7px", borderRadius: "6px" }}>
                                  #{q.id}
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
                                  {q.type}
                                </span>
                              </div>

                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "3px 9px",
                                  borderRadius: "7px",
                                  background:
                                    q.difficulty === "Easy"
                                      ? "#dcfce7"
                                      : q.difficulty === "Medium"
                                      ? "#fef3c7"
                                      : "#fee2e2",
                                  color:
                                    q.difficulty === "Easy"
                                      ? "#15803d"
                                      : q.difficulty === "Medium"
                                      ? "#b45309"
                                      : "#b91c1c",
                                }}
                              >
                                {q.difficulty}
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
                              {q.question}
                            </p>

                            {/* Subject & Unit & Topic */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", color: "#64748b" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>{q.subject}</span>
                                <span>•</span>
                                <span>{q.unit}</span>
                              </div>
                              {q.topic && (
                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>{q.topic}</span>
                              )}
                              <div style={{ display: "flex", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                                {q.sourceFile && (
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 600,
                                      color: "#047857",
                                      background: "#d1fae5",
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                      border: "1px solid #a7f3d0",
                                    }}
                                    title={q.sourceFile}
                                  >
                                    📄 {q.sourceFile.length > 20 ? q.sourceFile.slice(0, 20) + "..." : q.sourceFile}
                                  </span>
                                )}
                                <span
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                    background:
                                      q.status === "Approved"
                                        ? "#dcfce7"
                                        : q.status === "Verified"
                                        ? "#e0f2fe"
                                        : q.status === "Rejected"
                                        ? "#fee2e2"
                                        : "#fef3c7",
                                    color:
                                      q.status === "Approved"
                                        ? "#166534"
                                        : q.status === "Verified"
                                        ? "#0369a1"
                                        : q.status === "Rejected"
                                        ? "#991b1b"
                                        : "#92400e",
                                  }}
                                >
                                  {q.status === "Pending"
                                    ? "🟡 Pending HOD"
                                    : q.status === "Verified"
                                    ? "🟢 HOD Verified ➔ Dean"
                                    : q.verifiedRole === "COE"
                                    ? "🏆 COE Finalized"
                                    : "🔵 Dean Approved ➔ COE"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Footer with Uploader & Actions */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingTop: "12px",
                              borderTop: "1px solid #f1f5f9",
                              marginTop: "auto",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                                By {q.uploadedBy || "Faculty"}
                              </span>
                              <span style={{ fontSize: "10px", color: "#94a3b8" }}>{q.addedOn}</span>
                            </div>

                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <CrudActionButtons
                                onView={() => setViewingQuestion(q)}
                                onVerify={() => handleAiVerify([q.id])}
                                onEdit={() => setEditingQuestion(q)}
                                onDelete={() => setDeletingQuestion(q)}
                                viewTitle="View Details"
                                verifyTitle="Verify Question with AI"
                                editTitle="Edit Question"
                                deleteTitle="Delete Question"
                                size={30}
                              />
                              <button
                                type="button"
                                onClick={() => handleVerifyQuestion(q.id)}
                                title={
                                  currentUser.role === "HOD"
                                    ? "Verify & Send to Dean (Dr. V Rajlakshmi)"
                                    : currentUser.role === "DEAN"
                                    ? "Approve & Send to COE (Dr. Rajubalaji)"
                                    : currentUser.role === "COE"
                                    ? "Final Sign-off & Lock in Question Bank"
                                    : "Verify Question"
                                }
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: "8px",
                                  border: "1px solid #bbf7d0",
                                  background: "#f0fdf4",
                                  color: "#16a34a",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                <Check size={14} strokeWidth={2.2} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectQuestion(q.id)}
                                title="Reject Question"
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: "8px",
                                  border: "1px solid #fed7aa",
                                  background: "#fff7ed",
                                  color: "#ea580c",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                <X size={14} strokeWidth={2.2} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Table Footer / 3D Pagination */}
                <Pagination
                  currentPage={safeCurrentPage}
                  totalItems={filteredQuestions.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(p) => setCurrentPage(p)}
                  itemName="questions"
                />
              </div>

              {/* Card 2: Question Preview Card */}
              {showPreview && currentPreview && (
                <div
                  className="widget-card-3d"
                  style={{
                    padding: "24px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "18px",
                      borderBottom: "1px solid #f1f5f9",
                      paddingBottom: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="action-mini-icon-blue"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
                        }}
                      >
                        <Eye size={16} color="#ffffff" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                      </div>
                      <span style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                        Question Preview
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className="filter-btn-3d"
                      style={{
                        background: "#f1f5f9",
                        border: "none",
                        cursor: "pointer",
                        color: "#64748b",
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Preview Body Grid: Left Question/Options & Right Metadata */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.45fr 1fr",
                      gap: "24px",
                      marginBottom: "20px",
                    }}
                  >
                    {/* Left: Question statement & Options */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          marginBottom: "16px",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "14.5px",
                            fontWeight: 700,
                            color: "#0f172a",
                            margin: 0,
                            lineHeight: "1.45",
                            flex: 1,
                          }}
                        >
                          Q. {currentPreview.question}
                        </h4>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#6366f1",
                            background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                            padding: "3px 9px",
                            borderRadius: "7px",
                            flexShrink: 0,
                            boxShadow: "0 2px 6px rgba(99, 102, 241, 0.2)",
                          }}
                        >
                          {currentPreview.type}
                        </span>
                      </div>

                      {/* Options List with 3D Pill Cards */}
                      {currentPreview.options && currentPreview.options.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                          {currentPreview.options.map((opt: any, idx: number) => {
                            const optKey = typeof opt === "object" && opt.key ? opt.key : String.fromCharCode(65 + idx);
                            const optText = typeof opt === "object" && opt.text ? opt.text : String(opt);
                            const isCorrect = typeof opt === "object" ? !!opt.correct : (currentPreview.correctAnswer === opt);

                            return (
                              <div
                                key={optKey}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "10px 14px",
                                  borderRadius: "10px",
                                  background: isCorrect
                                    ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                                    : "#ffffff",
                                  border: isCorrect ? "1.5px solid #10b981" : "1px solid #e2e8f0",
                                  color: isCorrect ? "#065f46" : "#334155",
                                  fontWeight: isCorrect ? 700 : 500,
                                  fontSize: "13px",
                                  boxShadow: isCorrect
                                    ? "0 4px 12px rgba(16, 185, 129, 0.15)"
                                    : "0 2px 4px rgba(0,0,0,0.02)",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <span
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    borderRadius: "50%",
                                    border: isCorrect ? "5px solid #10b981" : "2px solid #cbd5e1",
                                    background: "#ffffff",
                                    display: "inline-block",
                                    flexShrink: 0,
                                    boxShadow: isCorrect ? "0 0 8px rgba(16, 185, 129, 0.6)" : "none",
                                  }}
                                />
                                <span>
                                  <strong>{optKey}.</strong> {optText}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: "18px",
                            borderRadius: "12px",
                            background: "#f8fafc",
                            border: "1px dashed #cbd5e1",
                            fontSize: "12.5px",
                            color: "#64748b",
                            lineHeight: 1.5,
                          }}
                        >
                          <Info size={16} color="#2563eb" style={{ display: "inline", marginRight: "6px", verticalAlign: "text-bottom" }} />
                          Descriptive Question: Students are expected to provide detailed explanations with examples.
                        </div>
                      )}
                    </div>

                    {/* Right: Metadata Specifications Card */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "16px 18px",
                        fontSize: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
                      }}
                    >
                      {(() => {
                        const displaySubject = (currentPreview?.subject && !currentPreview.subject.includes("dataset") && !currentPreview.subject.includes("setup")) ? currentPreview.subject : "Viscom & VFX";
                        const displayUnit = currentPreview?.unit || "Unit I - Image Target";
                        const displayTopic = (currentPreview?.topic && currentPreview.topic !== displaySubject) ? currentPreview.topic : "Asset Integration & Controls";
                        const displayDifficulty = (currentPreview?.difficulty && ["Easy", "Medium", "Hard"].includes(currentPreview.difficulty)) ? currentPreview.difficulty : "Medium";
                        const displayUploadedBy = currentPreview?.uploadedBy || "Exam Cell Admin";
                        const displayEmail = currentPreview?.email || "admin@rgu.ac.in";
                        const displayDate = currentPreview?.uploadedOnDate || currentPreview?.date || currentPreview?.addedOn || currentPreview?.submittedDate || "16 Sept 2026";
                        const displayTime = currentPreview?.uploadedOnTime || currentPreview?.time || "10:30 AM";

                        return (
                          <>
                            <div style={{ display: "flex" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Subject</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <strong style={{ color: "#0f172a" }}>{displaySubject}</strong>
                            </div>

                            <div style={{ display: "flex" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Unit</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <span style={{ color: "#334155" }}>{displayUnit}</span>
                            </div>

                            <div style={{ display: "flex" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Topic</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <span style={{ color: "#334155" }}>{displayTopic}</span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Difficulty</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                                  color: "#15803d",
                                  boxShadow: "0 2px 6px rgba(22, 163, 74, 0.2)",
                                }}
                              >
                                {displayDifficulty}
                              </span>
                            </div>

                            <div style={{ display: "flex" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Uploaded By</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <span style={{ color: "#334155" }}>
                                {displayUploadedBy} ({displayEmail})
                              </span>
                            </div>

                            <div style={{ display: "flex" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Uploaded On</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <span style={{ color: "#334155" }}>
                                {displayDate}{displayTime ? `, ${displayTime}` : ""}
                              </span>
                            </div>

                            {currentPreview?.sourceFile && (
                              <div style={{ display: "flex" }}>
                                <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Source File</span>
                                <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                                <span style={{ color: "#047857", fontWeight: 700, wordBreak: "break-all" }}>
                                  📄 {currentPreview.sourceFile}
                                </span>
                              </div>
                            )}

                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Workflow</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  background:
                                    currentPreview?.status === "Approved"
                                      ? "#dcfce7"
                                      : currentPreview?.status === "Verified"
                                      ? "#e0f2fe"
                                      : currentPreview?.status === "Rejected"
                                      ? "#fee2e2"
                                      : "#fef3c7",
                                  color:
                                    currentPreview?.status === "Approved"
                                      ? "#166534"
                                      : currentPreview?.status === "Verified"
                                      ? "#0369a1"
                                      : currentPreview?.status === "Rejected"
                                      ? "#991b1b"
                                      : "#92400e",
                                }}
                              >
                                {currentPreview?.status === "Pending"
                                  ? "🟡 Pending HOD Review"
                                  : currentPreview?.status === "Verified"
                                  ? "🟢 Verified by HOD ➔ Pending Dean"
                                  : currentPreview?.verifiedRole === "COE"
                                  ? "🏆 COE Finalized (Print Ready)"
                                  : "🔵 Dean Approved ➔ Pending COE"}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Preview Action Buttons Row */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "16px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => currentPreview && setViewingQuestion(currentPreview)}
                      className="filter-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "1px solid #bfdbfe",
                        background: "#ffffff",
                        color: "#2563eb",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Maximize2 size={15} />
                      <span>View in Fullscreen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => currentPreview && handleVerifyQuestion(currentPreview.id)}
                      className="filter-btn-3d"
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background:
                          currentUser.role === "HOD"
                            ? "linear-gradient(135deg, #059669 0%, #10b981 100%)"
                            : currentUser.role === "DEAN"
                            ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                            : currentUser.role === "COE"
                            ? "linear-gradient(135deg, #c026d3 0%, #db2777 100%)"
                            : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px) scale(1.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                    >
                      <CheckCircle2 size={16} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))" }} />
                      <span>
                        {currentUser.role === "HOD"
                          ? "✓ Verify & Forward to Dean"
                          : currentUser.role === "DEAN"
                          ? "✓ Approve & Forward to COE"
                          : currentUser.role === "COE"
                          ? "✓ Final Approval (COE Exam Bank)"
                          : "Verify Question"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => currentPreview && handleRejectQuestion(currentPreview.id)}
                      className="filter-btn-3d"
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px) scale(1.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                    >
                      <XCircle size={16} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))" }} />
                      <span>Reject Question</span>
                    </button>
                  </div>
                </div>
              )}
            </div>


          </div>

          {/* Support Banner & Footer */}
          <PortalFooter />
        </main>
      </div>

      {/* ================= CRUD MODALS ================= */}
      <ViewModal
        isOpen={subjectModalData.isOpen}
        onClose={() => setSubjectModalData({ isOpen: false, subjectName: "", questions: [] })}
        title={`${subjectModalData.subjectName} - Subject Question Bank`}
        subtitle="Read all questions in full detail below before giving official verification approval"
        badge={`${subjectModalData.questions.length} Questions`}
        badgeColor="blue"
        questionsList={subjectModalData.questions}
        onVerify={handleApproveSubjectFromModal}
        verifyLabel={
          currentUser.role === "HOD"
            ? "✓ HOD Verify & Send to Dean"
            : currentUser.role === "DEAN"
            ? "✓ Dean Approve & Send to COE"
            : currentUser.role === "COE"
            ? "✓ Final COE Approval (Lock in Exam Bank)"
            : "✓ Verify Subject Questions"
        }
      />

      <ViewModal
        isOpen={!!viewingQuestion}
        onClose={() => setViewingQuestion(null)}
        title="Question Details"
        subtitle={`ID: #${viewingQuestion?.id} • Subject: ${viewingQuestion?.subject}`}
        badge={viewingQuestion?.status || "Pending"}
        badgeColor={
          viewingQuestion?.status === "Approved" || viewingQuestion?.status === "Verified"
            ? "green"
            : viewingQuestion?.status === "Rejected"
            ? "red"
            : "blue"
        }
        data={
          viewingQuestion
            ? [
                { label: "Question Text", value: viewingQuestion.question },
                { label: "Subject", value: viewingQuestion.subject },
                { label: "Unit", value: viewingQuestion.unit },
                { label: "Topic", value: viewingQuestion.topic },
                { label: "Type", value: viewingQuestion.type },
                { label: "Difficulty", value: viewingQuestion.difficulty },
                { label: "Marks", value: viewingQuestion.marks || 5 },
                { label: "Status", value: viewingQuestion.status },
                { label: "Uploaded By", value: `${viewingQuestion.uploadedBy || "Vignesh"} (${viewingQuestion.email || "admin@rgu.ac.in"})` },
                { label: "Uploaded On", value: `${viewingQuestion.date || "31 Aug 2024"}, ${viewingQuestion.time || "03:45 PM"}` },
              ]
            : []
        }
      />

      <FormModal
        isOpen={isAddingQuestion || !!editingQuestion}
        onClose={() => {
          setIsAddingQuestion(false);
          setEditingQuestion(null);
        }}
        title={editingQuestion ? "Edit Question" : "Add New Question"}
        subtitle={editingQuestion ? `Editing Question #${editingQuestion.id}` : "Create a new question for verification"}
        fields={questionFields}
        initialData={editingQuestion || { subject: "Viscom & VFX", type: "MCQ", difficulty: "Medium", marks: 5, status: "Pending" }}
        submitLabel={editingQuestion ? "Update Question" : "Create Question"}
        onSubmit={(data) => {
          if (editingQuestion) {
            examStore.saveQuestion({ ...editingQuestion, ...data });
            triggerToast("Question updated successfully!", "success");
          } else {
            examStore.saveQuestion({ ...data, status: data.status || "Pending" });
            triggerToast("New question created successfully!", "success");
          }
          setIsAddingQuestion(false);
          setEditingQuestion(null);
        }}
      />

      <DeleteModal
        isOpen={!!deletingQuestion}
        onClose={() => setDeletingQuestion(null)}
        title="Delete Question"
        message="Are you sure you want to permanently delete this question? This action cannot be undone."
        itemName={deletingQuestion?.question ? `"${deletingQuestion.question.slice(0, 60)}..."` : undefined}
        onConfirm={() => {
          if (deletingQuestion) {
            examStore.deleteQuestion(deletingQuestion.id);
            triggerToast("Question deleted successfully.", "info");
            setDeletingQuestion(null);
          }
        }}
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
              🤖 Running AI Verification Engine...
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px 0", lineHeight: 1.5 }}>
              Evaluating question syntax, options coverage, Bloom's Taxonomy, and mark balance against RGU curriculum standards.
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
              {aiScanStep === 1 && "🔍 Step 1: Parsing Question Syntax & Ambiguity..."}
              {aiScanStep === 2 && "🧠 Step 2: Evaluating Bloom's Taxonomy & Difficulty Level..."}
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
        remarks="Question phrasing, Bloom's Taxonomy evaluation, and CO curriculum mapping successfully verified."
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
