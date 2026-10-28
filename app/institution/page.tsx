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
  Settings,
  PlusSquare,
  Activity,
  Briefcase,
  Layers,
  ArrowRight,
  Info,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import SidebarUserProfile from "../components/SidebarUserProfile";

const institutions = [
  {
    id: "rgu",
    name: "Rathinam Global (Deemed to be University)",
    location: "Coimbatore, Tamil Nadu",
    est: "Est. 2006",
    color: "radial-gradient(circle at 35% 30%, #818cf8 0%, #4f46e5 45%, #1e1b4b 100%)",
    glowColor: "rgba(79, 70, 229, 0.45)",
    badgeBg: "rgba(99, 102, 241, 0.14)",
    badgeColor: "#4f46e5",
    icon: Landmark,
    students: "25,000+",
    totalInstitutions: "6",
  },
  {
    id: "rtc",
    name: "Rathinam Technical Campus",
    location: "Coimbatore, Tamil Nadu",
    est: "Est. 2002",
    color: "radial-gradient(circle at 35% 30%, #38bdf8 0%, #0284c7 45%, #082f49 100%)",
    glowColor: "rgba(2, 132, 199, 0.45)",
    badgeBg: "rgba(2, 132, 199, 0.14)",
    badgeColor: "#0284c7",
    icon: Settings,
    students: "8,500+",
    totalInstitutions: "6",
  },
  {
    id: "rcp",
    name: "Rathinam College of Pharmacy",
    location: "Coimbatore, Tamil Nadu",
    est: "Est. 2007",
    color: "radial-gradient(circle at 35% 30%, #4ade80 0%, #16a34a 45%, #052e16 100%)",
    glowColor: "rgba(22, 163, 74, 0.45)",
    badgeBg: "rgba(22, 163, 74, 0.14)",
    badgeColor: "#16a34a",
    icon: PlusSquare,
    students: "3,200+",
    totalInstitutions: "6",
  },
  {
    id: "rcpt",
    name: "Rathinam College of Physiotherapy",
    location: "Coimbatore, Tamil Nadu",
    est: "Est. 2008",
    color: "radial-gradient(circle at 35% 30%, #f472b6 0%, #db2777 45%, #500724 100%)",
    glowColor: "rgba(219, 39, 119, 0.45)",
    badgeBg: "rgba(219, 39, 119, 0.14)",
    badgeColor: "#db2777",
    icon: Activity,
    students: "2,100+",
    totalInstitutions: "6",
  },
  {
    id: "rim",
    name: "Rathinam Institute of Management",
    location: "Coimbatore, Tamil Nadu",
    est: "Est. 2009",
    color: "radial-gradient(circle at 35% 30%, #fbbf24 0%, #d97706 45%, #451a03 100%)",
    glowColor: "rgba(217, 119, 6, 0.45)",
    badgeBg: "rgba(217, 119, 6, 0.14)",
    badgeColor: "#d97706",
    icon: Briefcase,
    students: "4,400+",
    totalInstitutions: "6",
  },
  {
    id: "rlas",
    name: "Rathinam Liberal Arts and Science",
    location: "Coimbatore, Tamil Nadu",
    est: "Est. 2012",
    color: "radial-gradient(circle at 35% 30%, #c084fc 0%, #7c3aed 45%, #2e1065 100%)",
    glowColor: "rgba(124, 58, 237, 0.45)",
    badgeBg: "rgba(124, 58, 237, 0.14)",
    badgeColor: "#7c3aed",
    icon: BookOpen,
    students: "6,800+",
    totalInstitutions: "6",
  },
];

export default function InstitutionPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("rgu");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedInstitution =
    institutions.find((i) => i.id === selectedId) || institutions[0];

  const filtered = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="institution-page">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="institution-sidebar">
        {/* Rathinam Logo */}
        <div className="sidebar-logo">
          <img
            src="/images/rathinam-logo.svg"
            alt="Rathinam Group of Institutions Exam Cell"
          />
        </div>

        {/* Vertical Step Navigation */}
        <nav className="sidebar-navigation">
          {/* Step 1: Active */}
          <div className="sidebar-step sidebar-step-active">
            <div className="sidebar-step-icon">
              <Landmark size={18} />
            </div>
            <div className="sidebar-step-content">
              <strong>Institutions</strong>
              <span>Choose your institution</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="sidebar-step">
            <div className="sidebar-step-icon">
              <GraduationCap size={18} />
            </div>
            <div className="sidebar-step-content">
              <strong>Select Department</strong>
              <span>Choose your department</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="sidebar-step">
            <div className="sidebar-step-icon">
              <Users size={18} />
            </div>
            <div className="sidebar-step-content">
              <strong>Select Faculty</strong>
              <span>Choose your faculty</span>
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
            onClick={() => router.push("/")}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          {/* Horizontal Step Indicators */}
          <div className="header-step-indicators">
            <div className="step-indicator-pill step-pill-active">
              <span className="step-pill-number">01</span>
              <span>Institutions</span>
            </div>
            <div className="step-indicator-pill">
              <span className="step-pill-number">02</span>
              <span>Department</span>
            </div>
            <div className="step-indicator-pill">
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
          <h1 className="hero-title-text">Select Your Institution ✨</h1>
          <p className="hero-subtitle-text">
            Choose your institution to continue to your academic workspace
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
              placeholder="Search institution name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="button" className="filter-btn">
            <SlidersHorizontal size={14} />
            <span>Filter</span>
          </button>
        </div>

        <div className="section-subtitle">Our Institutions</div>

        {/* Main Grid + Right Selection Column */}
        <div className="institution-body">
          {/* 6 Institution Cards */}
          <div className="institution-grid">
            {filtered.map((inst) => {
              const IconComp = inst.icon;
              const isSelected = inst.id === selectedId;

              return (
                <div
                  key={inst.id}
                  className={`institution-card ${
                    isSelected ? "institution-card-selected" : ""
                  }`}
                  onClick={() => setSelectedId(inst.id)}
                >
                  <div className="card-top-row">
                    <div
                      className="card-icon-wrap"
                      style={{
                        background: inst.color,
                        boxShadow: `0 8px 20px ${inst.glowColor}, inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -3px 5px rgba(0, 0, 0, 0.4)`,
                      }}
                    >
                      <IconComp size={22} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                    </div>
                    <span className="card-radio-circle" />
                  </div>

                  <div className="card-info">
                    <h3>{inst.name}</h3>
                    <p>{inst.location}</p>
                    <span
                      className="est-badge"
                      style={{
                        background: inst.badgeBg,
                        color: inst.badgeColor,
                      }}
                    >
                      {inst.est}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Panel: Split into Two White Cards */}
          <div className="institution-right-panel">
            {/* Your Selection Card */}
            <div className="selection-card">
              <div className="selection-card-header">Your Selection</div>
              <div className="selection-banner">
                <div className="selection-landmark-icon">
                  <Landmark size={20} />
                </div>
                <div>
                  <h4>{selectedInstitution.name}</h4>
                  <p>{selectedInstitution.location}</p>
                </div>
              </div>

              <div className="selection-stats-row">
                <div className="stat-metric-box">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <GraduationCap size={15} color="#2563eb" />
                    <strong>{selectedInstitution.students}</strong>
                  </div>
                  <span>Total Students</span>
                </div>

                <div className="stat-metric-box">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <LayoutGrid size={14} color="#7c3aed" />
                    <strong>{selectedInstitution.totalInstitutions}</strong>
                  </div>
                  <span>Institutions</span>
                </div>
              </div>
            </div>

            {/* Why Institution Matters Card */}
            <div className="why-card">
              <div className="why-card-header">Why Institution Matters?</div>
              <div className="why-list">
                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{ background: "#ede9fe", color: "#6366f1" }}
                  >
                    <ShieldCheck size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Personalized Access</strong>
                    <p>Get access to institution specific resources</p>
                  </div>
                </div>

                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{ background: "#dbeafe", color: "#2563eb" }}
                  >
                    <Layers size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Department Mapping</strong>
                    <p>We'll show only relevant departments</p>
                  </div>
                </div>

                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{ background: "#dcfce7", color: "#16a34a" }}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Subject Relevance</strong>
                    <p>Subjects will be tailored to your institution</p>
                  </div>
                </div>

                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{ background: "#fef3c7", color: "#d97706" }}
                  >
                    <Users size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Better Experience</strong>
                    <p>A smarter and smoother academic journey</p>
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
                <strong>Can't find your institution?</strong>
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
            onClick={() => router.push("/department")}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </footer>
      </main>
    </div>
  );
}
