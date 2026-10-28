"use client";

import React from "react";
import { Download, FileText } from "lucide-react";

type SyllabusDocumentPreviewProps = {
  text: string;
  fileName: string;
  subject?: string;
  code?: string;
  semester?: string;
  department?: string;
  fileUrl?: string | null;
};

type DocumentSection = { title: string; lines: string[] };

function splitDocument(text: string): { overview: string[]; units: DocumentSection[] } {
  const overview: string[] = [];
  const units: DocumentSection[] = [];
  let current: DocumentSection | null = null;
  text.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    const unitHeading = /^(unit|module|chapter)\b\s*(\d+|[ivx]+)?\s*[:.)-]?\s*(.*)$/i.exec(line);
    if (unitHeading) {
      current = { title: line, lines: [] };
      units.push(current);
      return;
    }
    if (current) current.lines.push(rawLine);
    else overview.push(rawLine);
  });
  return { overview, units };
}

function DocumentLines({ lines, startIndex = 0 }: { lines: string[]; startIndex?: number }) {
  let topicNumber = 0;
  let outcomeNumber = 0;
  return (
    <div>
      {lines.map((rawLine, index) => {
        const value = rawLine.trim();
        if (!value) return <div key={`space-${startIndex}-${index}`} style={{ height: "8px" }} />;
        const isOutcome = /^CO\s*\d+\s*[:.)-]?/i.test(value);
        const isLabel = /^(subject code|programme|level|course type|suggested credits|suggested contact hours|semester|department|course objectives?|course outcomes?|topics?|references?|prerequisites?|assessment|textbooks?)\s*:?$/i.test(value);
        const isNote = /^(prepared from|note\s*[:.)-]?|source\s*[:.)-]?|document\s*[:.)-]?|academic year|version\s*[:.)-]?|remarks?\s*[:.)-]?)/i.test(value);
        const isTopic = !isLabel && !isNote && !isOutcome && value.length > 25;
        if (isOutcome) outcomeNumber += 1;
        if (isTopic) topicNumber += 1;
        const displayValue = isOutcome ? value.replace(/^CO\s*\d+\s*[:.)-]?\s*/i, "") : value;
        return (
          <div key={`${startIndex}-${index}-${value}`} style={{ display: "flex", alignItems: "flex-start", gap: isTopic || isOutcome ? "10px" : 0, marginBottom: isLabel ? "6px" : "10px", padding: isLabel ? "7px 10px" : isTopic || isOutcome ? "6px 9px" : 0, borderLeft: isLabel ? "3px solid #818cf8" : isTopic || isOutcome ? "3px solid #c7d2fe" : "none", borderBottom: isLabel ? "1px solid #dbe3ee" : "none", borderRadius: isTopic || isOutcome ? "6px" : 0, background: isLabel ? "#f8faff" : isTopic || isOutcome ? "#fbfdff" : "transparent", color: isLabel ? "#4338ca" : "#334155", fontSize: isLabel ? "11px" : "13px", fontWeight: isLabel ? 800 : 500, letterSpacing: isLabel ? "0.05em" : "normal", textTransform: isLabel ? "uppercase" : "none", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {(isTopic || isOutcome) && <span style={{ flex: "0 0 28px", display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "22px", borderRadius: "6px", background: isOutcome ? "#dcfce7" : "#e0e7ff", color: isOutcome ? "#166534" : "#4338ca", fontSize: "10px", fontWeight: 800 }}>{isOutcome ? `CO${outcomeNumber}` : topicNumber}</span>}
            <span style={{ flex: 1 }}>{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SyllabusDocumentPreview({ text, fileName, subject, code, semester, department, fileUrl }: SyllabusDocumentPreviewProps) {
  const { overview, units } = splitDocument(text);
  return (
    <div style={{ flex: 1, overflow: "auto", padding: "28px 20px 48px", background: "linear-gradient(135deg, #e8edf5 0%, #f8fafc 55%, #e9eef8 100%)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", background: "#ffffff", border: "1px solid #dbe3ee", borderRadius: "8px", boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)", overflow: "hidden" }}>
        <div style={{ padding: "30px 38px 24px", borderBottom: "1px solid #dbe3ee", background: "linear-gradient(135deg, #f8fafc, #eef2ff)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6366f1", fontSize: "10px", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}><FileText size={15} /> Official Academic Document</div>
            <div style={{ padding: "5px 9px", borderRadius: "999px", background: "#e0e7ff", color: "#4338ca", fontSize: "10px", fontWeight: 800 }}>FULL PREVIEW</div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 850, lineHeight: 1.25, color: "#172554" }}>{subject || "Syllabus Document"}</div>
          <div style={{ marginTop: "7px", fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "20px" }}>
            {[["COURSE CODE", code || "—"], ["SEMESTER", semester || "—"], ["DEPARTMENT", department || "—"], ["UNITS", String(units.length || 1)]].map(([label, value]) => <div key={label} style={{ padding: "9px 10px", borderRadius: "9px", background: "rgba(255,255,255,0.72)", border: "1px solid #dbe3ee" }}><div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 800, letterSpacing: "0.07em" }}>{label}</div><div style={{ marginTop: "3px", color: "#334155", fontSize: "11px", fontWeight: 750, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div></div>)}
          </div>
          {fileUrl && <a href={fileUrl} download={fileName} style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "14px", color: "#4338ca", fontSize: "11px", fontWeight: 800, textDecoration: "none" }}><Download size={14} /> Download original document</a>}
        </div>
        <div style={{ padding: "28px 38px 44px", fontFamily: "Arial, sans-serif" }}>
          {units.length > 0 && <div style={{ position: "sticky", top: 0, zIndex: 5, display: "grid", gridTemplateColumns: `repeat(${Math.min(units.length, 5)}, minmax(0, 1fr))`, gap: "7px", marginBottom: "20px", padding: "9px", border: "1px solid #c7d2fe", borderRadius: "11px", background: "rgba(248,250,252,0.94)", backdropFilter: "blur(8px)" }}>
            {units.slice(0, 5).map((unit, index) => <a key={`unit-link-${index}`} href={`#syllabus-unit-${index + 1}`} style={{ padding: "8px 5px", borderRadius: "8px", background: "#eef2ff", color: "#4338ca", fontSize: "10px", fontWeight: 850, textAlign: "center", textDecoration: "none", border: "1px solid #c7d2fe" }}>UNIT {index + 1}</a>)}
          </div>}
          {overview.some((line) => line.trim()) && <section style={{ padding: "16px", marginBottom: "18px", border: "1px solid #dbe3ee", borderRadius: "10px", background: "#ffffff" }}><div style={{ marginBottom: "12px", color: "#1e3a8a", fontSize: "13px", fontWeight: 850, letterSpacing: "0.08em", textTransform: "uppercase" }}>Course Overview</div><DocumentLines lines={overview} startIndex={0} /></section>}
          {units.map((unit, index) => <section id={`syllabus-unit-${index + 1}`} key={`${unit.title}-${index}`} style={{ scrollMarginTop: "70px", marginTop: "18px", padding: "18px", border: "1px solid #c7d2fe", borderRadius: "12px", background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)", boxShadow: "0 4px 14px rgba(79, 70, 229, 0.07)" }}><div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", padding: "12px 14px", borderLeft: "5px solid #4f46e5", borderRadius: "8px", background: "linear-gradient(135deg, #eef2ff, #f8fafc)", color: "#312e81" }}><span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "8px", background: "#4f46e5", color: "#ffffff", fontSize: "12px", fontWeight: 850 }}>{String(index + 1).padStart(2, "0")}</span><span style={{ fontSize: "15px", fontWeight: 850, letterSpacing: "0.04em", textTransform: "uppercase" }}>{unit.title}</span></div><DocumentLines lines={unit.lines} startIndex={index + 1} /></section>)}
          {!overview.some((line) => line.trim()) && units.length === 0 && <DocumentLines lines={text.split(/\r?\n/)} />}
        </div>
      </div>
    </div>
  );
}
