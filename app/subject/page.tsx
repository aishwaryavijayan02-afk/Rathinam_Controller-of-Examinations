"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Landmark,
  GraduationCap,
  Users,
  BookOpen,
  LayoutGrid,
  ShieldCheck,
  ChevronLeft,
  Headphones,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Info,
  Check,
  Clapperboard,
  Target,
  BarChart3,
  UserCheck,
  Briefcase,
} from "lucide-react";
import SidebarUserProfile from "../components/SidebarUserProfile";

const subjects = [
  {
    id: "vfx-prac",
    name: "VFX Practical",
    code: "VFX-P301",
    type: "Practical Lab",
    credits: "2 Credits",
    underline: "#7c3aed",
    boxBg: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    neonGlow: "rgba(124, 58, 237, 0.25)",
    iconColor: "#7c3aed",
    icon: Clapperboard,
  },
  {
    id: "vfx-theo",
    name: "VFX Theory",
    code: "VFX-T302",
    type: "Theory Core",
    credits: "4 Credits",
    underline: "#0284c7",
    boxBg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
    neonGlow: "rgba(2, 132, 199, 0.25)",
    iconColor: "#0284c7",
    icon: BookOpen,
  },
];

export default function SubjectPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = subjects.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="institution-page">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="institution-sidebar">
        {/* RGU Logo */}
        <div className="sidebar-logo">
          <img
            src="/images/rgu-logo.png"
            alt="Rathinam Global (Deemed to be University)"
          />
        </div>

        {/* Vertical Step Navigation */}
        <nav className="sidebar-navigation">
          {/* Step 1: Completed */}
          <div className="sidebar-step sidebar-step-completed">
            <div className="sidebar-step-icon">
              <Check size={16} color="#ffffff" />
            </div>
            <div className="sidebar-step-content">
              <strong>Institutions</strong>
              <span>Choose your institution</span>
            </div>
          </div>

          {/* Step 2: Completed */}
          <div className="sidebar-step sidebar-step-completed">
            <div className="sidebar-step-icon">
              <Check size={16} color="#ffffff" />
            </div>
            <div className="sidebar-step-content">
              <strong>Select Department</strong>
              <span>Choose your department</span>
            </div>
          </div>

          {/* Step 3: Completed */}
          <div className="sidebar-step sidebar-step-completed">
            <div className="sidebar-step-icon">
              <Check size={16} color="#ffffff" />
            </div>
            <div className="sidebar-step-content">
              <strong>Select Faculty</strong>
              <span>Choose your profile</span>
            </div>
          </div>

          {/* Step 4: Active */}
          <div className="sidebar-step sidebar-step-active">
            <div className="sidebar-step-icon">
              <BookOpen size={18} />
            </div>
            <div className="sidebar-step-content">
              <strong>Your Subjects</strong>
              <span>Assigned subjects</span>
            </div>
          </div>

          {/* Step 5 */}
          <div className="sidebar-step">
            <div className="sidebar-step-icon">
              <LayoutGrid size={18} />
            </div>
            <div className="sidebar-step-content">
              <strong>Dashboard</strong>
              <span>Your academic workspace</span>
            </div>
          </div>
        </nav>

        {/* 3D Isometric Campus Illustration */}
        <div className="sidebar-campus-art">
          <img
            src="/images/sidebar-building-isometric.png"
            alt="Rathinam Campus"
          />
        </div>

        {/* Logged in User Profile Box (Outlook Style) */}
        <SidebarUserProfile />
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="institution-main">
        {/* Top Header */}
        <header className="institution-header">
          <button
            type="button"
            className="header-back-btn"
            onClick={() => router.push("/faculty")}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          {/* Horizontal Step Indicators */}
          <div className="header-step-indicators">
            <div className="step-indicator-pill step-pill-completed">
              <span className="step-pill-number">
                <Check size={12} />
              </span>
              <span>Institutions</span>
            </div>
            <div className="step-indicator-pill step-pill-completed">
              <span className="step-pill-number">
                <Check size={12} />
              </span>
              <span>Department</span>
            </div>
            <div className="step-indicator-pill step-pill-completed">
              <span className="step-pill-number">
                <Check size={12} />
              </span>
              <span>Faculty</span>
            </div>
            <div className="step-indicator-pill step-pill-active">
              <span className="step-pill-number">04</span>
              <span>Your Subjects</span>
            </div>
          </div>

          <button
            type="button"
            className="header-need-help-btn"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-exam-support-modal"));
              }
            }}
          >
            <Headphones size={15} />
            <span>Need Help?</span>
          </button>
        </header>

        {/* Title & Classical Building Illustration */}
        <div className="institution-hero">
          <h1 className="hero-title-text">Your Subjects ✨</h1>
          <p className="hero-subtitle-text">
            Review your assigned subjects and continue directly to your academic workspace
          </p>

          <div className="hero-building">
            <img
              src="/images/hero-classical-university.png"
              alt="University Landmark"
            />
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="institution-search-bar">
          <div className="search-input-box">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search subject name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="button" className="filter-btn">
            <SlidersHorizontal size={14} />
            <span>Filter</span>
          </button>
        </div>

        <div className="section-subtitle">Assigned Subjects</div>

        {/* Main Grid + Right Panel */}
        <div className="institution-body">
          {/* 2 Subject Cards Grid with 3D Depth & Neon Glow - No selection needed */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "18px",
              alignContent: "start",
            }}
          >
            {filtered.map((sub) => {
              const IconComp = sub.icon;

              return (
                <div
                  key={sub.id}
                  className="institution-card"
                  style={{
                    minHeight: "245px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "24px",
                    borderBottom: `4px solid ${sub.underline}`,
                    boxShadow: `0 12px 30px ${sub.neonGlow}, 0 2px 8px rgba(15, 23, 42, 0.04), inset 0 1px 2px #ffffff`,
                    borderColor: "rgba(226, 232, 240, 0.9)",
                    background: "#ffffff",
                    cursor: "default",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: "8px",
                        background: "#f1f5f9",
                        color: "#475569",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      {sub.code}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        color: "#15803d",
                        background: "#dcfce7",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      <Check size={13} strokeWidth={2.5} />
                      Allocated
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: 1,
                      gap: "14px",
                      padding: "12px 0",
                    }}
                  >
                    {/* 3D Embossed Icon Box */}
                    <div
                      style={{
                        width: "86px",
                        height: "86px",
                        borderRadius: "22px",
                        background: sub.boxBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `
                          0 14px 28px rgba(0, 0, 0, 0.1),
                          0 4px 10px ${sub.neonGlow},
                          inset 0 3px 5px rgba(255, 255, 255, 0.7),
                          inset 0 -3px 6px rgba(0, 0, 0, 0.15)
                        `,
                        transform: "perspective(400px) rotateX(4deg)",
                      }}
                    >
                      <IconComp
                        size={44}
                        color={sub.iconColor}
                        style={{
                          filter: `drop-shadow(0 4px 8px ${sub.neonGlow})`,
                        }}
                      />
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <h2
                        style={{
                          fontSize: "21px",
                          fontWeight: 800,
                          color: "#0f172a",
                          margin: "0 0 6px 0",
                          letterSpacing: "-0.3px",
                        }}
                      >
                        {sub.name}
                      </h2>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#64748b",
                          background: "#f8fafc",
                          padding: "3px 10px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {sub.type} • {sub.credits}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Panel: Subject Overview Card */}
          <div className="institution-right-panel">
            <div className="why-card" style={{ height: "100%" }}>
              <div className="why-card-header">Subject Overview</div>
              <p
                style={{
                  fontSize: "11.5px",
                  lineHeight: "1.45",
                  color: "#64748b",
                  marginBottom: "16px",
                }}
              >
                Both subjects are already assigned to your faculty profile for this academic semester.
              </p>

              <div className="why-list">
                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{
                      background: "radial-gradient(circle at 35% 30%, #ede9fe, #ddd6fe)",
                      color: "#6366f1",
                      boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)",
                    }}
                  >
                    <Target size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Focused Syllabus</strong>
                    <p>Course materials & lab manuals already configured</p>
                  </div>
                </div>

                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{
                      background: "radial-gradient(circle at 35% 30%, #dbeafe, #bfdbfe)",
                      color: "#2563eb",
                      boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                    }}
                  >
                    <BarChart3 size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Attendance & Grading</strong>
                    <p>Track student performance & internal marks</p>
                  </div>
                </div>

                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{
                      background: "radial-gradient(circle at 35% 30%, #e0e7ff, #c7d2fe)",
                      color: "#4f46e5",
                      boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                    }}
                  >
                    <UserCheck size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Students Enrolled</strong>
                    <p>Class roster mapped directly to these subjects</p>
                  </div>
                </div>

                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{
                      background: "radial-gradient(circle at 35% 30%, #fef3c7, #fde68a)",
                      color: "#d97706",
                      boxShadow: "0 2px 8px rgba(217, 119, 6, 0.25)",
                    }}
                  >
                    <Briefcase size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Direct Access</strong>
                    <p>Click continue straightaway to open workspace</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Row */}
        <footer className="institution-bottom">
          <div className="cant-find-banner">
            <div className="cant-find-text">
              <Info size={18} color="#2563eb" />
              <div>
                <strong>Need more subjects added?</strong>
                <span>Contact your administrator or exam cell support.</span>
              </div>
            </div>
            <button
              type="button"
              className="contact-support-btn"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-exam-support-modal"));
                }
              }}
            >
              <Headphones size={14} />
              <span>Contact Support</span>
            </button>
          </div>

          <button
            type="button"
            className="continue-action-btn"
            onClick={() => router.push("/dashboard")}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </footer>
      </main>
    </div>
  );
}
