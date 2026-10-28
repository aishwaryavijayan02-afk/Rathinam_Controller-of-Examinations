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
  ChevronRight,
  ArrowRight,
  School,
  Trash2,
  UploadCloud,
  Users,
  Briefcase,
  Archive,
  FileSpreadsheet,
  Eye,
  Download,
  X,
} from "lucide-react";
import { examStore, QuestionItem, SyllabusUnit, SubjectItem, INSTITUTIONAL_SUBJECTS } from "../lib/examStore";
import { authStore, AuthUser, hasPermission } from "../lib/auth";
import { extractDocxText, extractFileText } from "../lib/aiSyllabusParser";
import JSZip from "jszip";
import RoleGuard from "../components/RoleGuard";
import { ToastNotification } from "../components/CrudModal";
import PortalFooter from "../components/PortalFooter";
import PortalHeader from "../components/PortalHeader";
import SyllabusDocumentPreview from "../components/SyllabusDocumentPreview";

type ParsedBulkQuestion = Partial<QuestionItem> & { question: string };
type SyllabusUploadFormat = "excel" | "word" | "pdf" | "diagram";

const cleanCell = (value: unknown) => String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Unable to preserve the uploaded document."));
    reader.readAsDataURL(file);
  });
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cleanCell(cell));
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cleanCell(cell));
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cleanCell(cell));
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function columnIndex(cellRef: string) {
  const letters = cellRef.replace(/\d/g, "").toUpperCase();
  return [...letters].reduce((result, letter) => result * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

async function parseXlsxRows(arrayBuffer: ArrayBuffer): Promise<string[][]> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const sharedFile = zip.file("xl/sharedStrings.xml");
  const sharedStrings = sharedFile
    ? [...(await sharedFile.async("string")).matchAll(/<si\b[\s\S]*?<\/si>/gi)].map((item) =>
        [...item[0].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/gi)].map((match) => match[1]).join("")
      )
    : [];
  const sheetFile = zip.file("xl/worksheets/sheet1.xml");
  if (!sheetFile) return [];
  const xml = await sheetFile.async("string");
  return [...xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/gi)].map((rowMatch) => {
    const values: string[] = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/gi)) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const ref = attrs.match(/\br="([A-Z]+\d+)"/i)?.[1];
      const index = ref ? columnIndex(ref) : values.length;
      const type = attrs.match(/\bt="([^"]+)"/i)?.[1];
      const rawValue = body.match(/<v[^>]*>([\s\S]*?)<\/v>/i)?.[1] || body.match(/<t[^>]*>([\s\S]*?)<\/t>/i)?.[1] || "";
      const value = type === "s" ? sharedStrings[Number(rawValue)] || "" : rawValue;
      values[index] = cleanCell(value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
    }
    return values;
  });
}

function rowsToBulkQuestions(rows: string[][], sourceFile: string): ParsedBulkQuestion[] {
  if (!rows.length) return [];
  const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const headers = rows[0].map(normalized);
  const questionIndex = headers.findIndex((header) => ["question", "questiontext", "questionstatement", "text"].includes(header));
  const hasHeader = questionIndex >= 0;
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const indexOf = (names: string[], fallback: number) => {
    const index = headers.findIndex((header) => names.includes(header));
    return index >= 0 ? index : fallback;
  };
  const get = (row: string[], names: string[], fallback: number) => cleanCell(row[indexOf(names, fallback)]);

  return dataRows
    .map((row) => {
      const question = get(row, ["question", "questiontext", "questionstatement", "text"], 0);
      if (!question || question.length < 5) return null;
      const type = get(row, ["type", "questiontype", "kind"], 5);
      const difficulty = get(row, ["difficulty", "level"], 6);
      const parsedType = ["MCQ", "Descriptive", "Match Type", "Short Answer", "Problem Solving"].find((item) => item.toLowerCase() === type.toLowerCase()) || (type ? "Descriptive" : "Descriptive");
      const parsedDifficulty = ["Easy", "Medium", "Hard"].find((item) => item.toLowerCase() === difficulty.toLowerCase()) || "Medium";
      const options = ["optiona", "optionb", "optionc", "optiond"].map((name, index) => get(row, [name, `choice${String.fromCharCode(97 + index)}`], 7 + index)).filter(Boolean);
      return {
        question,
        subject: get(row, ["subject", "coursename", "course"], 1),
        unit: get(row, ["unit", "unitno", "module"], 2) || "1",
        topic: get(row, ["topic", "chapter"], 3) || "General",
        marks: Number(get(row, ["marks", "mark"], 4)) || 2,
        type: parsedType as QuestionItem["type"],
        difficulty: parsedDifficulty as QuestionItem["difficulty"],
        options: options.length ? options : undefined,
        correctAnswer: get(row, ["correctanswer", "answer", "correctoption"], 11) || undefined,
        sourceFile,
      } as ParsedBulkQuestion;
    })
    .filter((question): question is ParsedBulkQuestion => Boolean(question));
}

function parseTextQuestionBank(text: string, sourceFile: string): ParsedBulkQuestion[] {
  const lines = text.split(/\r?\n/).map((line) => cleanCell(line)).filter(Boolean);
  const numberedQuestion = /^(?:(?:question|q)\s*)?\d+\s*[.)\-:]\s*(.+)$/i;
  const optionLine = /^(?:\(?([A-D])\)?\s*[.)\-:]|\(([A-D])\))\s*(.+)$/i;
  const answerLine = /^(?:correct\s+)?answer\s*[:\-]\s*(.+)$/i;
  const questions: ParsedBulkQuestion[] = [];
  let current: ParsedBulkQuestion | null = null;
  let foundNumberedQuestions = false;

  const finish = () => {
    if (current?.question.trim()) questions.push(current);
    current = null;
  };

  for (const line of lines) {
    const questionMatch = line.match(numberedQuestion);
    if (questionMatch) {
      foundNumberedQuestions = true;
      finish();
      current = { question: questionMatch[1].trim(), options: [], sourceFile, unit: "1", topic: "General", type: "Descriptive", difficulty: "Medium", marks: 2 };
      continue;
    }

    const optionMatch = line.match(optionLine);
    const answerMatch = line.match(answerLine);
    if (optionMatch && current) {
      current.options = [...(current.options || []), optionMatch[3].trim()];
      current.type = "MCQ";
    } else if (answerMatch && current) {
      current.correctAnswer = answerMatch[1].trim();
    } else if (current) {
      current.question = `${current.question}\n${line}`;
    } else if (!foundNumberedQuestions && !optionMatch && !answerMatch && line.length >= 5) {
      current = { question: line, sourceFile, unit: "1", topic: "General", type: "Descriptive", difficulty: "Medium", marks: 2 };
      finish();
    }
  }
  finish();
  return questions;
}

async function parseBulkQuestionFile(file: File): Promise<ParsedBulkQuestion[]> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (extension === "csv") return rowsToBulkQuestions(parseCsvRows(await file.text()), file.name);
  if (extension === "xlsx" || extension === "xls") return rowsToBulkQuestions(await parseXlsxRows(await file.arrayBuffer()), file.name);
  if (extension === "docx" || extension === "doc") {
    const text = extension === "docx" ? await extractDocxText(await file.arrayBuffer()) : await file.text();
    return parseTextQuestionBank(text, file.name);
  }
  if (extension === "pdf") {
    const text = await extractFileText(file);
    return parseTextQuestionBank(text, file.name);
  }
  if (["png", "jpg", "jpeg", "svg", "webp"].includes(extension)) {
    return [{ question: `Diagram attachment: ${file.name}`, sourceFile: file.name, unit: "1", topic: "Diagram", type: "Descriptive", difficulty: "Medium", marks: 2 }];
  }
  return [];
}

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
      id: "verify-approval",
      label: "Verify & Approval",
      icon: CheckSquare,
      route: "/approval",
    },
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

  // Staff users may upload work only for subjects assigned to their profile.
  // Leadership roles retain the complete institutional subject catalogue.
  const availableSubjects = React.useMemo(() => {
    if (currentUser.role !== "STAFF") return INSTITUTIONAL_SUBJECTS;

    const assigned = examStore.getStaffAssignedSubjects(currentUser.email, currentUser.name).subjects;
    const normalize = (value: string) => value.toLowerCase().replace(/\s*\([^)]*\)\s*/g, " ").replace(/[^a-z0-9]+/g, "");
    const assignedKeys = assigned.map(normalize).filter(Boolean);

    return INSTITUTIONAL_SUBJECTS.filter((subject) => {
      const subjectName = normalize(subject.name);
      const subjectCode = subject.code.toLowerCase().replace(/[^a-z0-9]+/g, "");
      return assignedKeys.some((key) => key.includes(subjectName) || subjectName.includes(key) || key.includes(subjectCode));
    });
  }, [currentUser, subjects]);

  // ---------------- PARTITION 1: SYLLABUS HUB STATE ----------------
  const [syllabusSubject, setSyllabusSubject] = useState("");
  const [syllabusCode, setSyllabusCode] = useState("");
  const [syllabusSemester, setSyllabusSemester] = useState("Semester 1");
  const [syllabusDepartment, setSyllabusDepartment] = useState("");
  const [syllabusFileName, setSyllabusFileName] = useState<string | null>(null);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [syllabusFileUrl, setSyllabusFileUrl] = useState<string | null>(null);
  const [syllabusPreviewText, setSyllabusPreviewText] = useState<string | null>(null);
  const [savedSyllabus, setSavedSyllabus] = useState<{ name: string; code: string } | null>(null);
  const [showSyllabusFilePreview, setShowSyllabusFilePreview] = useState(false);
  const [isSyllabusDragOver, setIsSyllabusDragOver] = useState(false);
  const [syllabusFormat, setSyllabusFormat] = useState<SyllabusUploadFormat>("pdf");
  const syllabusFileRef = useRef<HTMLInputElement>(null);

  const processSyllabusFile = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions: Record<SyllabusUploadFormat, string[]> = {
      excel: ["xlsx", "xls"],
      word: ["docx", "doc"],
      pdf: ["pdf"],
      diagram: ["png", "jpg", "jpeg", "svg", "webp"],
    };
    if (!allowedExtensions[syllabusFormat].includes(extension)) {
      const formatName = syllabusFormat === "excel" ? "Excel" : syllabusFormat === "word" ? "Word" : syllabusFormat === "pdf" ? "PDF" : "Diagram image";
      showToast(`Please choose a ${formatName} file.`, "danger");
      return;
    }
    setSyllabusFile(file);
    setSyllabusFileName(file.name);
    setSyllabusFileUrl(URL.createObjectURL(file));
    setSyllabusPreviewText(null);
    if (extension === "docx") {
      try {
        setSyllabusPreviewText(await extractDocxText(await file.arrayBuffer()));
      } catch {
        setSyllabusPreviewText("Unable to read this Word document.");
      }
    } else if (extension === "doc") {
      setSyllabusPreviewText("Legacy .doc preview is not supported in the browser. Please upload the document as .docx.");
    }
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    if (!syllabusSubject) {
      setSyllabusSubject(baseName);
      setSyllabusCode(`SUB-${Math.floor(100 + Math.random() * 900)}`);
      setSyllabusDepartment("General Studies");
    }
    showToast("Uploaded successfully.");
  };

  const handleSyllabusFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processSyllabusFile(file);
  };

  const handleDeleteSyllabusUpload = () => {
    if (savedSyllabus) {
      examStore.deleteSubjectSyllabus(savedSyllabus.name);
      examStore.deleteSubject(savedSyllabus.code);
      examStore.getSyllabusApprovals()
        .filter((item) => item.courseCode === savedSyllabus.code || item.courseName.toLowerCase() === savedSyllabus.name.toLowerCase())
        .forEach((item) => examStore.deleteSyllabusApproval(item.id));
      showToast(`Syllabus "${savedSyllabus.name}" deleted.`, "danger");
    } else {
      showToast("Syllabus upload removed.");
    }

    setSavedSyllabus(null);
    setShowSyllabusFilePreview(false);
    setSyllabusFileName(null);
    setSyllabusFile(null);
    setSyllabusFileUrl(null);
    setSyllabusPreviewText(null);
    setSyllabusSubject("");
    setSyllabusCode("");
    setSyllabusDepartment("");
    if (syllabusFileRef.current) syllabusFileRef.current.value = "";
  };

  const handleSaveSyllabusPack = async (e: React.FormEvent) => {
    e.preventDefault();
    const derivedSubject = syllabusFileName
      ? syllabusFileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim()
      : "";
    const resolvedSubject = syllabusSubject.trim() || derivedSubject;
    const resolvedCode = syllabusCode.trim() || `SUB-${Math.floor(100 + Math.random() * 900)}`;
    const resolvedDepartment = syllabusDepartment.trim() || "Department of Visual Communication";

    if (!resolvedSubject) {
      showToast("Please upload a syllabus document or enter a valid Subject Name.", "danger");
      return;
    }

    const existingSub = subjects.find(
      (s) => s.name.toLowerCase() === resolvedSubject.toLowerCase() || s.code === resolvedCode
    );
    const newId = existingSub?.id || `sub-${Date.now()}`;
    const subItem: SubjectItem = {
      id: newId,
      name: resolvedSubject,
      code: resolvedCode,
      semester: syllabusSemester,
      department: resolvedDepartment,
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
    let extractedDocumentText = syllabusPreviewText?.trim() || "";
    if (!extractedDocumentText && syllabusFile) {
      try {
        const extension = syllabusFile.name.split(".").pop()?.toLowerCase() || "";
        extractedDocumentText = extension === "docx"
          ? (await extractDocxText(await syllabusFile.arrayBuffer())).trim()
          : extension === "pdf"
            ? (await extractFileText(syllabusFile)).trim()
            : "";
      } catch {
        extractedDocumentText = "";
      }
    }
    const documentPreview = extractedDocumentText || [
      `Syllabus document: ${syllabusFileName || `${subItem.name}.docx`}`,
      `Subject: ${subItem.name}`,
      `Course code: ${subItem.code}`,
      `Department: ${subItem.department}`,
      `Semester: ${subItem.semester}`,
      "",
      "The syllabus was uploaded and ingested successfully. HOD verification can be completed from this review record.",
    ].join("\n");
    let originalDocumentData = "";
    if (syllabusFile) {
      try {
        originalDocumentData = await readFileAsDataUrl(syllabusFile);
      } catch {
        // The extracted full text preview remains available even if the
        // browser cannot persist the original binary document.
      }
    }
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
      documentName: syllabusFileName || `${subItem.name}.docx`,
      documentFormat: syllabusFormat,
      documentText: documentPreview,
      documentData: originalDocumentData || undefined,
    });

    setSavedSyllabus({ name: subItem.name, code: subItem.code });

    // Reset form inputs after save
    setSyllabusSubject("");
    setSyllabusCode("");
    setSyllabusDepartment("");
    setSyllabusFile(null);
    showToast(`Syllabus "${subItem.name}" saved & ingested into Vault!`);
  };

  // ---------------- PARTITION 2: QUESTION BANK STATE ----------------
  const [bulkFileName, setBulkFileName] = useState<string | null>(null);
  const [bulkFileUrl, setBulkFileUrl] = useState<string | null>(null);
  const [bulkSourceText, setBulkSourceText] = useState<string | null>(null);
  const [bulkFormat, setBulkFormat] = useState<SyllabusUploadFormat>("excel");
  const [bulkSubject, setBulkSubject] = useState(subjects[0]?.name || "General");
  const bulkFileRef = useRef<HTMLInputElement>(null);
  const [parsedBulkCount, setParsedBulkCount] = useState(0);
  const [parsedBulkQuestions, setParsedBulkQuestions] = useState<ParsedBulkQuestion[]>([]);
  const [isParsingBulk, setIsParsingBulk] = useState(false);
  const [isBulkDragOver, setIsBulkDragOver] = useState(false);
  const [showBulkPreview, setShowBulkPreview] = useState(false);
  const [bulkPreviewTab, setBulkPreviewTab] = useState<"document" | "questions">("document");

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some((subject) => subject.name === bulkSubject)) {
      setBulkSubject(availableSubjects[0].name);
    }
  }, [availableSubjects, bulkSubject]);

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

  const processBulkFile = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions: Record<SyllabusUploadFormat, string[]> = {
      excel: ["xlsx", "xls"],
      word: ["docx", "doc"],
      pdf: ["pdf"],
      diagram: ["png", "jpg", "jpeg", "svg", "webp"],
    };
    if (!allowedExtensions[bulkFormat].includes(extension)) {
      const formatName = bulkFormat === "excel" ? "Excel" : bulkFormat === "word" ? "Word" : bulkFormat === "pdf" ? "PDF" : "Diagram image";
      showToast(`Please choose a ${formatName} file.`, "danger");
      return;
    }
    setBulkFileName(file.name);
    setBulkFileUrl(URL.createObjectURL(file));
    setBulkSourceText(null);
    setParsedBulkQuestions([]);
    setParsedBulkCount(0);
    setIsParsingBulk(true);
    try {
      if (extension === "docx") {
        setBulkSourceText(await extractDocxText(await file.arrayBuffer()));
      } else if (extension === "doc") {
        setBulkSourceText("Previewing legacy .doc files is not supported in the browser. Convert the document to .docx to preview its contents here.");
      }
      const parsed = await parseBulkQuestionFile(file);
      setParsedBulkQuestions(parsed);
      setParsedBulkCount(parsed.length);
      if (!parsed.length) {
        showToast(`No question rows found in ${file.name}. Check the file format and Question column.`, "danger");
      } else {
        showToast("Uploaded successfully.");
      }
    } catch (error) {
      console.error("Bulk question parsing failed", error);
      setBulkFileName(null);
      setBulkFileUrl(null);
      setBulkSourceText(null);
      showToast(`Unable to read ${file.name}. Please upload a valid .xlsx file.`, "danger");
    } finally {
      setIsParsingBulk(false);
    }
  };

  const handleBulkFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processBulkFile(file);
  };

  const handleCommitBulkImport = () => {
    if (!bulkFileName || parsedBulkQuestions.length === 0) {
      showToast("Please upload a spreadsheet or Word question pack.", "danger");
      return;
    }

    const targetSub = bulkSubject || (subjects[0]?.name ?? "General");
    const batchId = Date.now();
    const importedQuestions: QuestionItem[] = parsedBulkQuestions.map((parsed, index) => ({
      ...parsed,
      id: `q-bulk-${batchId}-${index + 1}`,
      code: `Q-${targetSub.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
      subject: targetSub,
      unit: parsed.unit || "1",
      topic: parsed.topic || "General",
      type: parsed.type || "Descriptive",
      difficulty: parsed.difficulty || "Medium",
      marks: parsed.marks || 2,
      status: "Pending",
      uploadedBy: currentUser.name || "Faculty",
      email: currentUser.email,
      sourceFile: bulkFileName,
    }));

    importedQuestions.forEach((question) => examStore.saveQuestion(question));
    showToast(`${importedQuestions.length} questions from "${bulkFileName}" inserted into Question Bank.`);
    setParsedBulkCount(0);
    setParsedBulkQuestions([]);
    setShowBulkPreview(false);
    if (bulkFileRef.current) bulkFileRef.current.value = "";
  };

  const handleDeleteBulkUpload = () => {
    if (!bulkFileName && parsedBulkQuestions.length === 0) {
      showToast("No question bank upload to delete.", "danger");
      return;
    }

    const sourceFile = bulkFileName;
    if (sourceFile) {
      examStore
        .getQuestions()
        .filter((question) => question.sourceFile === sourceFile)
        .forEach((question) => examStore.deleteQuestion(question.id));
    }

    setBulkFileName(null);
    setBulkFileUrl(null);
    setBulkSourceText(null);
    setParsedBulkCount(0);
    setParsedBulkQuestions([]);
    setShowBulkPreview(false);
    if (bulkFileRef.current) bulkFileRef.current.value = "";
    showToast(sourceFile ? `Question bank "${sourceFile}" deleted.` : "Question bank upload removed.", "danger");
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
                src="/images/rgu-logo.svg"
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
                  📚 {subjects.length} {subjects.length === 1 ? "Syllabus" : "Syllabi"}
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

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "10px" }}>
                    {([
                      ["excel", "Excel", ".xlsx"],
                      ["word", "Word", ".docx"],
                      ["pdf", "PDF", ".pdf"],
                      ["diagram", "Diagram", ".png/.jpg"],
                    ] as const).map(([value, label, extension]) => (
                      <button key={value} type="button" onClick={() => { setSyllabusFormat(value); setSyllabusFile(null); setSyllabusFileName(null); setSyllabusFileUrl(null); setSyllabusPreviewText(null); if (syllabusFileRef.current) syllabusFileRef.current.value = ""; }} style={{ padding: "7px 4px", borderRadius: "7px", border: syllabusFormat === value ? "1px solid #6366f1" : "1px solid #e2e8f0", background: syllabusFormat === value ? "#eef2ff" : "#ffffff", color: syllabusFormat === value ? "#4338ca" : "#64748b", fontSize: "10.5px", fontWeight: 800, cursor: "pointer" }}>
                        {label}<span style={{ display: "block", fontSize: "9px", fontWeight: 600, marginTop: "2px" }}>{extension}</span>
                      </button>
                    ))}
                  </div>

                  {/* Compact File Dropzone */}
                  <div
                    className={`question-bank-dropzone${isSyllabusDragOver ? " is-drag-over" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => syllabusFileRef.current?.click()}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); syllabusFileRef.current?.click(); } }}
                    onDragEnter={(event) => { event.preventDefault(); setIsSyllabusDragOver(true); }}
                    onDragOver={(event) => { event.preventDefault(); setIsSyllabusDragOver(true); }}
                    onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsSyllabusDragOver(false); }}
                    onDrop={(event) => { event.preventDefault(); setIsSyllabusDragOver(false); const file = event.dataTransfer.files?.[0]; if (file) void processSyllabusFile(file); }}
                    style={{
                      border: "2px dashed #c7d2fe",
                      borderRadius: "12px",
                      padding: "36px 20px",
                      textAlign: "center",
                      background: syllabusFileName ? "#f0f9ff" : "#f0f9ff",
                      cursor: "pointer",
                      marginBottom: "14px",
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
                      ref={syllabusFileRef}
                      onChange={handleSyllabusFileUpload}
                      accept={syllabusFormat === "excel" ? ".xlsx,.xls" : syllabusFormat === "word" ? ".docx,.doc" : syllabusFormat === "pdf" ? ".pdf" : ".png,.jpg,.jpeg,.svg,.webp"}
                      style={{ display: "none" }}
                    />
                    <div className="question-bank-file-orb syllabus-file-orb"><UploadCloud size={24} color="#0284c7" className="question-bank-file-glyph" /></div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: syllabusFileName ? "#15803d" : "#334155" }}>
                      {syllabusFileName ? "Uploaded" : `Click or Drag & Drop ${syllabusFormat === "excel" ? "Excel" : syllabusFormat === "word" ? "Word" : syllabusFormat === "pdf" ? "PDF" : "Diagram"} file`}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Selected: {syllabusFormat === "excel" ? "Excel (.xlsx, .xls)" : syllabusFormat === "word" ? "Word (.docx, .doc)" : syllabusFormat === "pdf" ? "PDF (.pdf)" : "Diagram (.png, .jpg, .svg)"}
                    </div>
                  </div>

                  {syllabusFileName && syllabusFileUrl && (
                    <div onClick={() => setShowSyllabusFilePreview(true)} title="Click to view uploaded document" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "9px 11px", marginBottom: "14px", borderRadius: "8px", background: "#f5f3ff", border: "1px solid #ddd6fe", cursor: "pointer" }}>
                      <div style={{ minWidth: 0, fontSize: "11.5px", color: "#4338ca", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📄 {syllabusFileName}</div>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSaveSyllabusPack} style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                            Subject Name *
                          </label>
                          <select
                            value={syllabusSubject}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSyllabusSubject(val);
                              const match = availableSubjects.find((s) => s.name === val);
                              if (match) {
                                setSyllabusCode(match.code);
                                setSyllabusDepartment(match.department.replace("Department of ", ""));
                                if (match.semester) setSyllabusSemester(match.semester);
                              }
                            }}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "7px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12.5px",
                              boxSizing: "border-box",
                              fontWeight: 600,
                              background: "#ffffff",
                              cursor: "pointer",
                            }}
                          >
                            <option value="">-- Select Subject from Dropdown --</option>
                            {availableSubjects.map((s) => (
                              <option key={s.code} value={s.name}>
                                {s.name} ({s.code})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "3px" }}>
                            Subject Code *
                          </label>
                          <select
                            value={syllabusCode}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSyllabusCode(val);
                              const match = availableSubjects.find((s) => s.code === val);
                              if (match) {
                                setSyllabusSubject(match.name);
                                setSyllabusDepartment(match.department.replace("Department of ", ""));
                                if (match.semester) setSyllabusSemester(match.semester);
                              }
                            }}
                            required
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "7px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12.5px",
                              boxSizing: "border-box",
                              fontWeight: 600,
                              background: "#ffffff",
                              cursor: "pointer",
                            }}
                          >
                            <option value="">-- Select Code --</option>
                            {availableSubjects.map((s) => (
                              <option key={s.code} value={s.code}>
                                {s.code} — {s.name}
                              </option>
                            ))}
                          </select>
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

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                      <button
                        type="button"
                        onClick={handleDeleteSyllabusUpload}
                        disabled={!syllabusFileName && !savedSyllabus}
                        title="Delete syllabus upload"
                        aria-label="Delete syllabus upload"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #fecaca", background: (!syllabusFileName && !savedSyllabus) ? "#f8fafc" : "#fff1f2", color: (!syllabusFileName && !savedSyllabus) ? "#cbd5e1" : "#dc2626", fontSize: "12px", fontWeight: 700, cursor: (!syllabusFileName && !savedSyllabus) ? "not-allowed" : "pointer" }}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
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
                      <span>Upload Question Bank</span>
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
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "6px" }}>
                        {([
                          ["excel", "Excel", ".xlsx/.xls"],
                          ["word", "Word", ".docx/.doc"],
                          ["pdf", "PDF", ".pdf"],
                          ["diagram", "Diagram", ".png/.jpg"],
                        ] as const).map(([value, label, extension]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setBulkFormat(value);
                              setBulkFileName(null);
                              setBulkFileUrl(null);
                              setBulkSourceText(null);
                              setParsedBulkQuestions([]);
                              setParsedBulkCount(0);
                              if (bulkFileRef.current) bulkFileRef.current.value = "";
                            }}
                            style={{
                              padding: "8px 4px",
                              borderRadius: "8px",
                              border: bulkFormat === value ? "1px solid #0284c7" : "1px solid #cbd5e1",
                              background: bulkFormat === value ? "#e0f2fe" : "#ffffff",
                              color: bulkFormat === value ? "#0369a1" : "#64748b",
                              fontSize: "11px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            {label}<br /><span style={{ fontSize: "9px", fontWeight: 600 }}>{extension}</span>
                          </button>
                        ))}
                      </div>
                      <div
                        className={`question-bank-dropzone${isBulkDragOver ? " is-drag-over" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => bulkFileRef.current?.click()}
                        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); bulkFileRef.current?.click(); } }}
                        onDragEnter={(event) => { event.preventDefault(); setIsBulkDragOver(true); }}
                        onDragOver={(event) => { event.preventDefault(); setIsBulkDragOver(true); }}
                        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsBulkDragOver(false); }}
                        onDrop={(event) => { event.preventDefault(); setIsBulkDragOver(false); const file = event.dataTransfer.files?.[0]; if (file) void processBulkFile(file); }}
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
                          accept={
                            bulkFormat === "excel"
                              ? ".xlsx,.xls"
                              : bulkFormat === "word"
                                ? ".docx,.doc"
                                : bulkFormat === "pdf"
                                  ? ".pdf"
                                  : ".png,.jpg,.jpeg,.svg,.webp"
                          }
                          style={{ display: "none" }}
                        />
                        <div className="question-bank-file-orb"
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
                          <FileSpreadsheet size={26} color="#0284c7" className="question-bank-file-glyph" />
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: bulkFileName ? "#15803d" : "#0369a1" }}>
                          {bulkFileName
                            ? "Uploaded"
                            : `Click to Browse Question Bank (${bulkFormat === "excel" ? "Excel" : bulkFormat === "word" ? "Word" : bulkFormat === "pdf" ? "PDF" : "Diagram"})`}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#64748b", maxWidth: "340px", lineHeight: 1.4 }}>
                          Upload one {bulkFormat === "excel" ? "Excel (.xlsx/.xls)" : bulkFormat === "word" ? "Word (.docx/.doc)" : bulkFormat === "pdf" ? "PDF (.pdf)" : "Diagram (.png/.jpg/.jpeg/.svg/.webp)"} question bank file. All questions will be previewed together before saving.
                        </div>
                        {isParsingBulk && <div style={{ fontSize: "12px", fontWeight: 700, color: "#0369a1" }}>Reading every question from the file...</div>}
                        {!isParsingBulk && (parsedBulkCount > 0 || bulkSourceText !== null) && (
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#15803d" }}>
                            ✓ {parsedBulkCount} questions found and ready to insert
                          </div>
                        )}
                        {!isParsingBulk && parsedBulkCount > 0 && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setBulkPreviewTab(bulkSourceText !== null ? "document" : "questions");
                              setShowBulkPreview(true);
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "7px 12px",
                              borderRadius: "7px",
                              border: "1px solid #7dd3fc",
                              background: "#ffffff",
                              color: "#0369a1",
                              fontSize: "12px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            <Eye size={14} />
                            Open File Preview
                          </button>
                        )}
                      </div>

                      {bulkFileName && bulkFileUrl && !isParsingBulk && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "9px 11px", borderRadius: "8px", background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                          <div style={{ minWidth: 0, fontSize: "11.5px", color: "#0369a1", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📊 {bulkFileName}</div>
                          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                            <button type="button" onClick={() => { setBulkPreviewTab(bulkSourceText !== null ? "document" : "questions"); setShowBulkPreview(true); }} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 10px", borderRadius: "7px", border: "1px solid #7dd3fc", background: "#ffffff", color: "#0369a1", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>
                              <Eye size={13} /> View Questions
                            </button>
                            {!isParsingBulk && parsedBulkCount > 0 && (
                              <button type="button" onClick={() => { setBulkPreviewTab("questions"); setShowBulkPreview(true); }} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 10px", borderRadius: "7px", border: "1px solid #86efac", background: "#ffffff", color: "#15803d", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>
                                <Eye size={13} /> Preview Questions
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                        <button
                          type="button"
                          onClick={handleDeleteBulkUpload}
                          disabled={!bulkFileName && parsedBulkQuestions.length === 0}
                          title="Delete question bank upload"
                          aria-label="Delete question bank upload"
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #fecaca", background: (!bulkFileName && parsedBulkQuestions.length === 0) ? "#f8fafc" : "#fff1f2", color: (!bulkFileName && parsedBulkQuestions.length === 0) ? "#cbd5e1" : "#dc2626", fontSize: "12px", fontWeight: 700, cursor: (!bulkFileName && parsedBulkQuestions.length === 0) ? "not-allowed" : "pointer" }}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCommitBulkImport}
                          disabled={isParsingBulk}
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
                            cursor: isParsingBulk ? "not-allowed" : "pointer",
                            opacity: isParsingBulk ? 0.55 : 1,
                            boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)",
                          }}
                        >
                          <CheckCircle2 size={15} />
                          <span>{parsedBulkCount ? `Save & Ingest ${parsedBulkCount} Questions` : "Save & Ingest Questions"}</span>
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

      {showBulkPreview && bulkFileName && (
        <div
          onClick={() => setShowBulkPreview(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.56)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(1180px, 100%)",
              maxHeight: "90vh",
              background: "#f8fafc",
              borderRadius: "18px",
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.35)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #e2e8f0" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ width: "38px", height: "38px", borderRadius: "11px", display: "grid", placeItems: "center", color: "#0e7490", background: "linear-gradient(145deg, #cffafe, #e0f2fe)" }}><FileText size={19} /></span><span style={{ fontSize: "18px", fontWeight: 850, color: "#0f172a" }}>Question Bank Preview</span></div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{bulkFileName} · {parsedBulkCount} questions</div>
              </div>
              <button type="button" onClick={() => setShowBulkPreview(false)} aria-label="Close preview" style={{ border: "none", background: "#f1f5f9", color: "#475569", borderRadius: "8px", width: "34px", height: "34px", cursor: "pointer", display: "grid", placeItems: "center" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ overflow: "auto", padding: "20px 22px 24px" }}>
              <div style={{ marginBottom: "16px", padding: "12px 15px", borderRadius: "10px", border: "1px solid #dbeafe", background: "linear-gradient(100deg, #eff6ff, #f0fdfa)", color: "#475569", fontSize: "12px" }}><strong style={{ color: "#0f172a" }}>Check before importing.</strong> Review the uploaded file or inspect the questions that will be added to the bank.</div>
              <div role="tablist" aria-label="Question bank preview mode" style={{ display: "flex", gap: "6px", padding: "5px", marginBottom: "16px", width: "fit-content", borderRadius: "11px", background: "#e9eef5", border: "1px solid #dbe3ee" }}>
                {bulkSourceText !== null && <button type="button" role="tab" aria-selected={bulkPreviewTab === "document"} onClick={() => setBulkPreviewTab("document")} style={{ border: "none", borderRadius: "8px", padding: "9px 14px", color: bulkPreviewTab === "document" ? "#0f172a" : "#64748b", background: bulkPreviewTab === "document" ? "#ffffff" : "transparent", boxShadow: bulkPreviewTab === "document" ? "0 1px 3px rgba(15,23,42,.12)" : "none", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Original document</button>}
                <button type="button" role="tab" aria-selected={bulkPreviewTab === "questions"} onClick={() => setBulkPreviewTab("questions")} style={{ border: "none", borderRadius: "8px", padding: "9px 14px", color: bulkPreviewTab === "questions" ? "#0f172a" : "#64748b", background: bulkPreviewTab === "questions" ? "#ffffff" : "transparent", boxShadow: bulkPreviewTab === "questions" ? "0 1px 3px rgba(15,23,42,.12)" : "none", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Parsed questions <span style={{ marginLeft: "5px", color: "#0e7490" }}>{parsedBulkCount}</span></button>
              </div>
              {bulkPreviewTab === "document" && bulkSourceText !== null && (
                <section style={{ border: "1px solid #d8e1ec", borderRadius: "13px", background: "#e9eef5", overflow: "hidden", padding: "18px" }}>
                  <div style={{ maxWidth: "900px", margin: "0 auto", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#ffffff", boxShadow: "0 8px 24px rgba(15,23,42,.08)", overflow: "hidden" }}>
                    <div style={{ padding: "14px 24px", borderBottom: "1px solid #edf1f5", display: "flex", justifyContent: "space-between", gap: "12px", color: "#64748b", fontSize: "11px", fontWeight: 700 }}><span>DOCUMENT TEXT PREVIEW</span><span>{bulkFileName}</span></div>
                    <div style={{ padding: "24px clamp(18px, 5vw, 52px) 36px", maxHeight: "58vh", overflow: "auto", color: "#1e293b" }}>
                      {(bulkSourceText || "No readable text was found in this Word document.").split(/\r?\n/).filter((line) => line.trim()).map((line, lineIndex) => {
                        const value = line.trim();
                        const isUnit = /^unit\s+[ivx\d]+/i.test(value);
                        const isSection = /^section\b/i.test(value);
                        const isQuestion = /^\d+[.)]\s/.test(value);
                        const isOption = /^[A-D][.)]\s/i.test(value);
                        const isTitle = lineIndex === 0;
                        const isSummary = /^(total:|distribution:|each of the)/i.test(value);
                        return <div key={`${lineIndex}-${value}`} style={{
                          marginTop: isTitle ? 0 : isUnit ? 26 : isSection ? 16 : isQuestion ? 18 : isOption ? 6 : isSummary ? 10 : 9,
                          padding: isTitle ? "0 0 8px" : isUnit ? "12px 14px" : isSection ? "2px 0 6px" : isQuestion ? "12px 14px" : isSummary ? "9px 12px" : isOption ? "0 0 0 22px" : "0",
                          borderLeft: isUnit ? "3px solid #0f8b8d" : isQuestion ? "3px solid #cbd5e1" : "none",
                          borderRadius: isUnit ? "0 9px 9px 0" : isQuestion ? "0 9px 9px 0" : 0,
                          background: isUnit ? "linear-gradient(90deg, #ecfeff, #f8fafc)" : isQuestion ? "#f8fafc" : isSummary ? "#f8fafc" : "transparent",
                          color: isUnit ? "#0f4c5c" : isSection ? "#0e7490" : isOption ? "#526174" : isSummary ? "#526174" : "#1e293b",
                          fontSize: isTitle ? "21px" : isUnit ? "15px" : isSection ? "13px" : isQuestion ? "14px" : "13px",
                          fontWeight: isTitle || isUnit || isSection || isQuestion ? 750 : isSummary ? 600 : 450,
                          lineHeight: 1.65,
                          letterSpacing: isTitle ? "-0.02em" : isSection ? "0.02em" : undefined,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}>{value}</div>;
                      })}
                    </div>
                  </div>
                </section>
              )}
              {bulkPreviewTab === "questions" && (
              <div style={{ overflow: "hidden", border: "1px solid #dbe3ee", borderRadius: "12px", background: "#ffffff" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#eff6ff", color: "#1e3a8a", textAlign: "left" }}>
                    <th style={{ padding: "11px 12px", position: "sticky", top: 0, background: "#eff6ff" }}>#</th>
                    <th style={{ padding: "11px 12px", position: "sticky", top: 0, background: "#eff6ff", minWidth: "420px" }}>Question</th>
                    <th style={{ padding: "11px 12px", position: "sticky", top: 0, background: "#eff6ff" }}>Unit</th>
                    <th style={{ padding: "11px 12px", position: "sticky", top: 0, background: "#eff6ff" }}>Topic</th>
                    <th style={{ padding: "11px 12px", position: "sticky", top: 0, background: "#eff6ff" }}>Type</th>
                    <th style={{ padding: "11px 12px", position: "sticky", top: 0, background: "#eff6ff" }}>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedBulkQuestions.map((item, index) => (
                    <tr key={`${item.question}-${index}`} style={{ borderBottom: "1px solid #e2e8f0", background: index % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                      <td style={{ padding: "13px 14px", color: "#64748b", verticalAlign: "top", fontWeight: 800 }}>{String(index + 1).padStart(2, "0")}</td>
                      <td style={{ padding: "13px 14px", color: "#0f172a", fontWeight: 650, lineHeight: 1.6 }}>
                        <div style={{ whiteSpace: "pre-wrap" }}>{item.question}</div>
                        {item.options?.length ? <div style={{ marginTop: "8px", display: "grid", gap: "4px", color: "#475569", fontWeight: 500 }}>{item.options.map((option, optionIndex) => <div key={`${index}-option-${optionIndex}`}>{String.fromCharCode(65 + optionIndex)}. {option}</div>)}</div> : null}
                        {item.correctAnswer ? <div style={{ marginTop: "7px", color: "#15803d", fontSize: "11px", fontWeight: 750 }}>Answer: {item.correctAnswer}</div> : null}
                      </td>
                      <td style={{ padding: "13px 14px", color: "#475569", verticalAlign: "top" }}><span style={{ padding: "4px 8px", borderRadius: "6px", background: "#f1f5f9", fontWeight: 700 }}>{item.unit || "1"}</span></td>
                      <td style={{ padding: "13px 14px", color: "#475569", verticalAlign: "top" }}>{item.topic || "General"}</td>
                      <td style={{ padding: "13px 14px", color: "#475569", verticalAlign: "top" }}><span style={{ padding: "4px 8px", borderRadius: "6px", background: "#eef2ff", color: "#4338ca", fontWeight: 700 }}>{item.type || "Descriptive"}</span></td>
                      <td style={{ padding: "13px 14px", color: "#475569", verticalAlign: "top", fontWeight: 800 }}>{item.marks || 2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSyllabusFilePreview && syllabusFileUrl && syllabusFileName && (
        <div onClick={() => setShowSyllabusFilePreview(false)} style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(15, 23, 42, 0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={(event) => event.stopPropagation()} style={{ width: "min(1080px, 100%)", height: "min(92vh, 900px)", background: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 80px rgba(15, 23, 42, 0.4)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "12px 18px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📄 {syllabusFileName}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <a href={syllabusFileUrl} download={syllabusFileName} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 10px", borderRadius: "8px", border: "1px solid #c7d2fe", background: "#eef2ff", color: "#4338ca", fontSize: "11px", fontWeight: 800, textDecoration: "none" }}><Download size={14} /> Download original</a>
                <button type="button" onClick={() => setShowSyllabusFilePreview(false)} aria-label="Close file preview" style={{ width: "32px", height: "32px", border: "none", borderRadius: "7px", background: "#f1f5f9", color: "#475569", cursor: "pointer", display: "grid", placeItems: "center" }}><X size={17} /></button>
              </div>
            </div>
            <SyllabusDocumentPreview
              text={syllabusPreviewText || "The uploaded syllabus document is being prepared for preview."}
              fileName={syllabusFileName}
              subject={syllabusSubject}
              code={syllabusCode}
              semester={syllabusSemester}
              department={syllabusDepartment}
              fileUrl={syllabusFileUrl}
            />
            {false && (syllabusPreviewText !== null ? (
              <div style={{ flex: 1, overflow: "auto", padding: "32px 24px 48px", background: "linear-gradient(135deg, #e8edf5 0%, #f8fafc 55%, #e9eef8 100%)" }}>
                <div style={{ maxWidth: "850px", minHeight: "100%", margin: "0 auto", background: "#ffffff", border: "1px solid #dbe3ee", borderRadius: "4px", boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)", overflow: "hidden" }}>
                  <div style={{ padding: "34px 46px 28px", borderBottom: "1px solid #dbe3ee", background: "linear-gradient(135deg, #f8fafc, #eef2ff)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "24px" }}><div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6366f1" }}>Official Academic Document</div><div style={{ padding: "5px 9px", borderRadius: "999px", background: "#e0e7ff", color: "#4338ca", fontSize: "10px", fontWeight: 800 }}>FULL PREVIEW</div></div>
                    <div style={{ fontSize: "24px", fontWeight: 850, lineHeight: 1.25, color: "#172554" }}>Syllabus Document</div>
                    <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>{syllabusFileName}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "22px" }}>
                      {[["SUBJECT", syllabusSubject || "Academic syllabus"], ["SEMESTER", syllabusSemester], ["FORMAT", syllabusFormat.toUpperCase()]].map(([label, value]) => <div key={label} style={{ padding: "9px 10px", borderRadius: "9px", background: "rgba(255,255,255,0.72)", border: "1px solid #dbe3ee" }}><div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 800, letterSpacing: "0.08em" }}>{label}</div><div style={{ marginTop: "3px", color: "#334155", fontSize: "11px", fontWeight: 750, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div></div>)}
                    </div>
                  </div>
                  <div style={{ padding: "34px 46px 52px", fontFamily: "Arial, sans-serif" }}>
                    {(syllabusPreviewText || "").trim() ? (() => {
                      let currentUnitNumber = 0;
                      let currentTopicNumber = 0;
                      let currentOutcomeNumber = 0;
                      return (syllabusPreviewText || "").split(/\r?\n/).map((line, index) => {
                      const value = line.trim();
                      if (!value) return <div key={`space-${index}`} style={{ height: "10px" }} />;
                      const isTitle = index === 0;
                      const isUnit = /^(unit|module|chapter)\s*(\d+|[ivx]+)?\s*[:.)-]?/i.test(value);
                      const isLabel = /^(subject code|programme|level|course type|suggested credits|suggested contact hours|semester|department|unit|course objectives?|course outcomes?|topics?|references?)\s*:?$/i.test(value);
                      const isCourseOutcome = /^CO\s*\d+\s*[:.)-]?/i.test(value);
                      const isDocumentNote = /^(prepared from|note\s*[:.)-]?|source\s*[:.)-]?|document\s*[:.)-]?|academic year|version\s*[:.)-]?|remarks?\s*[:.)-]?)/i.test(value);
                      if (isLabel && /^course outcomes?\s*:?$/i.test(value)) currentOutcomeNumber = 0;
                      if (isUnit) {
                        currentUnitNumber += 1;
                        currentTopicNumber = 0;
                      }
                      const isTopic = currentUnitNumber > 0 && !isTitle && !isUnit && !isLabel && !isCourseOutcome && !isDocumentNote;
                      if (isCourseOutcome) currentOutcomeNumber += 1;
                      const topicNumber = isTopic ? `${++currentTopicNumber}` : "";
                      const outcomeNumber = isCourseOutcome ? `${currentOutcomeNumber}` : "";
                      const displayValue = isCourseOutcome ? value.replace(/^CO\s*\d+\s*[:.)-]?\s*/i, "") : value;
                      return (
                        <div key={`${value}-${index}`} style={{ display: "flex", alignItems: "flex-start", gap: (isTopic || isCourseOutcome) ? "12px" : 0, marginTop: isUnit ? "26px" : 0, marginBottom: isTitle ? "22px" : isUnit ? "12px" : isLabel ? "6px" : "14px", padding: isUnit ? "13px 16px" : isLabel ? "8px 10px" : (isTopic || isCourseOutcome) ? "7px 10px" : 0, borderLeft: isUnit ? "5px solid #4f46e5" : isLabel ? "3px solid #818cf8" : (isTopic || isCourseOutcome) ? "3px solid #c7d2fe" : "none", borderBottom: isUnit || isLabel ? "1px solid #dbe3ee" : "none", borderRadius: isUnit ? "8px" : (isTopic || isCourseOutcome) ? "6px" : 0, background: isUnit ? "linear-gradient(135deg, #eef2ff, #f8fafc)" : isLabel ? "#f8faff" : (isTopic || isCourseOutcome) ? "#fbfdff" : "transparent", color: isTitle ? "#1e3a8a" : isUnit ? "#312e81" : isLabel ? "#4338ca" : "#334155", fontSize: isTitle ? "20px" : isUnit ? "15px" : isLabel ? "11px" : "13px", fontWeight: isTitle || isUnit || isLabel ? 800 : 500, letterSpacing: isUnit || isLabel ? "0.06em" : "normal", textTransform: isUnit || isLabel ? "uppercase" : "none", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", boxShadow: isUnit ? "0 3px 10px rgba(79, 70, 229, 0.08)" : "none" }}>
                          {(isTopic || isCourseOutcome) && <span style={{ flex: "0 0 32px", display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "24px", borderRadius: "6px", background: isCourseOutcome ? "#dcfce7" : "#e0e7ff", color: isCourseOutcome ? "#166534" : "#4338ca", fontSize: "11px", fontWeight: 800, letterSpacing: 0 }}>{isCourseOutcome ? outcomeNumber : topicNumber}</span>}
                          <span style={{ flex: 1 }}>{displayValue}</span>
                        </div>
                      );
                      });
                    })() : <div style={{ color: "#64748b", textAlign: "center", padding: "48px 10px" }}>This Word document has no readable text.</div>}
                  </div>
                </div>
              </div>
            ) : (
              <iframe src={syllabusFileUrl || undefined} title={`Preview ${syllabusFileName}`} style={{ width: "100%", flex: 1, border: "none", background: "#f8fafc" }} />
            ))}
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
