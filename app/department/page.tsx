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
  FlaskConical,
  Sprout,
  Briefcase,
  Palette,
  Atom,
  Activity,
  ArrowRight,
  Info,
  Check,
  FolderLock,
  Mail,
  Compass,
  Award,
  CheckCircle2,
} from "lucide-react";
import SidebarUserProfile from "../components/SidebarUserProfile";

const departments = [
  {
    id: "las",
    name: "School Of Liberal arts and science",
    est: "Est. 2012",
    color: "radial-gradient(circle at 35% 30%, #c084fc 0%, #7c3aed 45%, #2e1065 100%)",
    glowColor: "rgba(124, 58, 237, 0.45)",
    badgeBg: "rgba(124, 58, 237, 0.12)",
    badgeColor: "#7c3aed",
    icon: BookOpen,
  },
  {
    id: "bio",
    name: "School of applied bio sciences / Food / Architech",
    est: "Est. 2014",
    color: "radial-gradient(circle at 35% 30%, #fb923c 0%, #ea580c 45%, #431407 100%)",
    glowColor: "rgba(234, 88, 12, 0.45)",
    badgeBg: "rgba(234, 88, 12, 0.12)",
    badgeColor: "#ea580c",
    icon: FlaskConical,
  },
  {
    id: "sus",
    name: "School Of Sustainability And Climate Studies",
    est: "Est. 2016",
    color: "radial-gradient(circle at 35% 30%, #4ade80 0%, #16a34a 45%, #052e16 100%)",
    glowColor: "rgba(22, 163, 74, 0.45)",
    badgeBg: "rgba(22, 163, 74, 0.12)",
    badgeColor: "#16a34a",
    icon: Sprout,
  },
  {
    id: "biz",
    name: "School Of Business And Commerce",
    est: "Est. 2010",
    color: "radial-gradient(circle at 35% 30%, #38bdf8 0%, #0284c7 45%, #082f49 100%)",
    glowColor: "rgba(2, 132, 199, 0.45)",
    badgeBg: "rgba(2, 132, 199, 0.12)",
    badgeColor: "#0284c7",
    icon: Briefcase,
  },
  {
    id: "fash",
    name: "School Of Fashion Design And Media Performing Arts",
    est: "Est. 2015",
    color: "radial-gradient(circle at 35% 30%, #f472b6 0%, #db2777 45%, #500724 100%)",
    glowColor: "rgba(219, 39, 119, 0.45)",
    badgeBg: "rgba(219, 39, 119, 0.12)",
    badgeColor: "#db2777",
    icon: Palette,
  },
  {
    id: "ai",
    name: "School Of Quantum Science Computing & AI",
    est: "Est. 2020",
    color: "radial-gradient(circle at 35% 30%, #818cf8 0%, #6366f1 45%, #1e1b4b 100%)",
    glowColor: "rgba(99, 102, 241, 0.45)",
    badgeBg: "rgba(99, 102, 241, 0.12)",
    badgeColor: "#6366f1",
    icon: Atom,
  },
  {
    id: "sport",
    name: "School Of Sports & Health Science",
    est: "Est. 2013",
    color: "radial-gradient(circle at 35% 30%, #fbbf24 0%, #d97706 45%, #451a03 100%)",
    glowColor: "rgba(217, 119, 6, 0.45)",
    badgeBg: "rgba(217, 119, 6, 0.12)",
    badgeColor: "#d97706",
    icon: Activity,
  },
];

export default function DepartmentPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("fash");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          {/* Step 1: Completed with Green Check */}
          <div className="sidebar-step sidebar-step-completed">
            <div className="sidebar-step-icon">
              <Check size={16} color="#ffffff" />
            </div>
            <div className="sidebar-step-content">
              <strong>Institutions</strong>
              <span>Choose your institution</span>
            </div>
          </div>

          {/* Step 2: Active */}
          <div className="sidebar-step sidebar-step-active">
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
            onClick={() => router.push("/institution")}
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
            <div className="step-indicator-pill step-pill-active">
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
          <h1 className="hero-title-text">Select Your Department ✨</h1>
          <p className="hero-subtitle-text">
            Choose your department to continue to your academic workspace
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
              placeholder="Search department name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="button" className="filter-btn">
            <SlidersHorizontal size={14} />
            <span>Filter</span>
          </button>
        </div>

        <div className="section-subtitle">Our Schools / Departments</div>

        {/* Main Grid + Right Panel */}
        <div className="institution-body">
          {/* 7 Department Cards Grid */}
          <div className="institution-grid">
            {filtered.map((dept) => {
              const IconComp = dept.icon;
              const isSelected = dept.id === selectedId;

              return (
                <div
                  key={dept.id}
                  className={`institution-card ${
                    isSelected ? "institution-card-selected" : ""
                  }`}
                  onClick={() => setSelectedId(dept.id)}
                >
                  <div className="card-top-row">
                    <div
                      className="card-icon-wrap"
                      style={{
                        background: dept.color,
                        boxShadow: `0 8px 20px ${dept.glowColor}, inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -3px 5px rgba(0, 0, 0, 0.4)`,
                      }}
                    >
                      <IconComp size={22} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                    </div>
                    <span className="card-radio-circle" />
                  </div>

                  <div className="card-info">
                    <h3>{dept.name}</h3>
                    <span
                      className="est-badge"
                      style={{
                        background: dept.badgeBg,
                        color: dept.badgeColor,
                        marginTop: "8px",
                      }}
                    >
                      {dept.est}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Panel: Why Department Matters Card */}
          <div className="institution-right-panel">
            <div className="why-card" style={{ height: "100%" }}>
              <div className="why-card-header">Why Department Matters?</div>
              <p
                style={{
                  fontSize: "11.5px",
                  lineHeight: "1.45",
                  color: "#64748b",
                  marginBottom: "16px",
                }}
              >
                Choosing the right department helps us personalize your academic
                journey and provide relevant resources.
              </p>

              <div className="why-list">
                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{ background: "#ede9fe", color: "#6366f1" }}
                  >
                    <FolderLock size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Specialized Resources</strong>
                    <p>Access department-specific learning materials</p>
                  </div>
                </div>

                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{ background: "#dbeafe", color: "#2563eb" }}
                  >
                    <Mail size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Expert Guidance</strong>
                    <p>Get support from department experts and mentors</p>
                  </div>
                </div>

                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{ background: "#f3e8ff", color: "#9333ea" }}
                  >
                    <Compass size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Career Alignment</strong>
                    <p>Helps in better career planning and opportunities</p>
                  </div>
                </div>

                <div className="why-list-item">
                  <div
                    className="why-item-icon"
                    style={{ background: "#dcfce7", color: "#16a34a" }}
                  >
                    <Award size={16} />
                  </div>
                  <div className="why-item-text">
                    <strong>Better Opportunities</strong>
                    <p>Unlock internships, projects and placements</p>
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
                <strong>Can't find your department?</strong>
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
            onClick={() => router.push("/faculty")}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </footer>
      </main>
    </div>
  );
}
