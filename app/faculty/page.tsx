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
  Star,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import SidebarUserProfile from "../components/SidebarUserProfile";

const facultyList = [
  {
    id: "vignesh",
    name: "Vignesh",
    dept: "Viscom & VFX",
    avatarBg: "linear-gradient(135deg, #7c3aed, #a855f7)",
    underline: "#7c3aed",
  },
  {
    id: "saravanan",
    name: "Saravanan",
    dept: "VISCOM & VFX",
    avatarBg: "linear-gradient(135deg, #ea580c, #f97316)",
    underline: "#ea580c",
  },
  {
    id: "raju",
    name: "Raju",
    dept: "VISCOM",
    avatarBg: "linear-gradient(135deg, #16a34a, #22c55e)",
    underline: "#16a34a",
  },
  {
    id: "gayathri",
    name: "Gayathri",
    dept: "Fashion Design",
    avatarBg: "linear-gradient(135deg, #0284c7, #38bdf8)",
    underline: "#0284c7",
  },
  {
    id: "karthik",
    name: "Karthik",
    dept: "VISCOM & VFX",
    avatarBg: "linear-gradient(135deg, #db2777, #f43f5e)",
    underline: "#db2777",
  },
  {
    id: "praveen",
    name: "Praveen",
    dept: "VISCOM",
    avatarBg: "linear-gradient(135deg, #6366f1, #818cf8)",
    underline: "#6366f1",
  },
  {
    id: "deepika",
    name: "Deepika",
    dept: "VISCOM & VFX",
    avatarBg: "linear-gradient(135deg, #0d9488, #14b8a6)",
    underline: "#0d9488",
  },
  {
    id: "manoj",
    name: "Manoj",
    dept: "VISCOM",
    avatarBg: "linear-gradient(135deg, #d97706, #f59e0b)",
    underline: "#d97706",
  },
];

export default function FacultyPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("vignesh");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = facultyList.filter((fac) =>
    fac.name.toLowerCase().includes(searchQuery.toLowerCase())
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

          {/* Step 3: Active */}
          <div className="sidebar-step sidebar-step-active">
            <div className="sidebar-step-icon">
              <Users size={18} />
            </div>
            <div className="sidebar-step-content">
              <strong>Select Faculty</strong>
              <span>Choose your profile</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="sidebar-step">
            <div className="sidebar-step-icon">
              <BookOpen size={18} />
            </div>
            <div className="sidebar-step-content">
              <strong>Select Subject</strong>
              <span>Choose your subject</span>
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
            onClick={() => router.push("/department")}
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
            <div className="step-indicator-pill step-pill-active">
              <span className="step-pill-number">03</span>
              <span>Faculty</span>
            </div>
            <div className="step-indicator-pill">
              <span className="step-pill-number">04</span>
              <span>Select Subject</span>
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
          <h1 className="hero-title-text">Select Your Profile ✨</h1>
          <p className="hero-subtitle-text">
            Choose your profile to continue to your academic workspace
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
              placeholder="Search faculty name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="button" className="filter-btn">
            <SlidersHorizontal size={14} />
            <span>Filter</span>
          </button>
        </div>

        <div className="section-subtitle">Our Faculty Members</div>

        {/* Main Grid + Right Panel */}
        <div className="institution-body">
          {/* 8 Faculty Member Cards Grid */}
          <div className="institution-grid">
            {filtered.map((fac) => {
              const isSelected = fac.id === selectedId;

              return (
                <div
                  key={fac.id}
                  className={`institution-card ${
                    isSelected ? "institution-card-selected" : ""
                  }`}
                  onClick={() => setSelectedId(fac.id)}
                  style={{
                    borderBottom: `3.5px solid ${fac.underline}`,
                  }}
                >
                  <div className="card-top-row">
                    <div
                      className="card-icon-wrap"
                      style={{
                        background: fac.avatarBg,
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>👤</span>
                    </div>
                    <span className="card-radio-circle" />
                  </div>

                  <div className="card-info" style={{ marginTop: "14px" }}>
                    <h3>{fac.name}</h3>
                    <p style={{ color: "#64748b", fontWeight: 600 }}>{fac.dept}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Panel: Why Faculty Matters Card */}
          <div className="institution-right-panel">
            <div className="why-card" style={{ height: "100%" }}>
              <div className="why-card-header">Why Faculty Matters?</div>
              <p
                style={{
                  fontSize: "11.5px",
                  lineHeight: "1.45",
                  color: "#64748b",
                  marginBottom: "16px",
                }}
              >
                Choosing the right faculty helps us personalize your academic
                journey and provide the best guidance.
              </p>

              <div className="why-list">
                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{ background: "#ede9fe", color: "#6366f1" }}
                  >
                    <Star size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Expert Guidance</strong>
                    <p>Learn from experienced educators and mentors</p>
                  </div>
                </div>

                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{ background: "#dbeafe", color: "#2563eb" }}
                  >
                    <UserCheck size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Personalized Support</strong>
                    <p>Get faculty support tailored to your needs</p>
                  </div>
                </div>

                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{ background: "#e0e7ff", color: "#4f46e5" }}
                  >
                    <GraduationCap size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Academic Excellence</strong>
                    <p>Achieve your goals with expert mentorship</p>
                  </div>
                </div>

                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{ background: "#dcfce7", color: "#16a34a" }}
                  >
                    <TrendingUp size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Career Growth</strong>
                    <p>Build skills and grow with the right guidance</p>
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
                <strong>Can't find your profile?</strong>
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
            onClick={() => router.push("/subject")}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </footer>
      </main>
    </div>
  );
}
