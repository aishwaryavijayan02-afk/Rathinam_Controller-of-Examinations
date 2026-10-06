"use client";

import React, { useState, useEffect } from "react";
import { Info, Headphones, X, Phone, Mail, Send, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { examStore } from "@/app/lib/examStore";

interface PortalFooterProps {
  onContactSupport?: () => void;
}

export default function PortalFooter({ onContactSupport }: PortalFooterProps) {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Ticket form state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Question Bank Issue");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  useEffect(() => {
    const handleGlobalOpenSupport = () => {
      setShowSupportModal(true);
      setTicketSubmitted(false);
    };

    window.addEventListener("open-exam-support-modal", handleGlobalOpenSupport);
    return () => {
      window.removeEventListener("open-exam-support-modal", handleGlobalOpenSupport);
    };
  }, []);

  const handleSupport = () => {
    if (onContactSupport) {
      onContactSupport();
    } else {
      setShowSupportModal(true);
      setTicketSubmitted(false);
    }
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    examStore.logActivity(
      `Support Ticket Created: ${ticketCategory}`,
      "Help & Support",
      `Subject: ${ticketSubject || "General Inquiry"}, Message: ${ticketMessage.slice(0, 40)}...`
    );

    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubject("");
      setTicketMessage("");
    }, 1500);
  };

  return (
    <>
      {/* Support Banner */}
      <div
        className="portal-footer-banner"
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          padding: "16px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          marginTop: "32px",
          marginBottom: "22px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
              flexShrink: 0,
            }}
          >
            <Info size={19} color="#ffffff" />
          </div>
          <div>
            <strong
              style={{
                display: "block",
                fontSize: "13.5px",
                color: "#0f172a",
                fontWeight: 700,
              }}
            >
              Can't find what you need?
            </strong>
            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
                display: "block",
                marginTop: "1px",
              }}
            >
              Contact your administrator or exam cell support desk.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSupport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 18px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#1e293b",
            fontSize: "12.5px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.04)";
            e.currentTarget.style.transform = "none";
          }}
        >
          <Headphones size={15} color="#2563eb" />
          <span>Contact Support</span>
        </button>
      </div>

      {/* Footer */}
      <footer
        className="portal-footer-row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          paddingTop: "14px",
          paddingBottom: "16px",
          borderTop: "1px solid #e2e8f0",
          fontSize: "11.5px",
          color: "#94a3b8",
        }}
      >
        <div>© 2026 Exam Cell Academic Management System. All rights reserved.</div>
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              cursor: "pointer",
              color: "#94a3b8",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              cursor: "pointer",
              color: "#94a3b8",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
          >
            Terms of Service
          </button>
        </div>
      </footer>

      {/* INTERACTIVE SUPPORT MODAL */}
      {showSupportModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowSupportModal(false)}
        >
          <div
            className="portal-support-modal-box"
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "540px",
              maxHeight: "88dvh",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              overflowY: "auto",
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(37, 99, 235, 0.1)",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Headphones size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                    Exam Cell Support Desk
                  </h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                    We're here to assist you with academic exam operations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px",
                  borderRadius: "6px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              {/* Quick Contact Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <a
                  href="tel:+914224040909"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ color: "#2563eb", marginTop: "2px" }}>
                    <Phone size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Helpline</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>+91 422 4040909</div>
                    <div style={{ fontSize: "10px", color: "#16a34a" }}>Mon-Sat 9AM - 5:30PM</div>
                  </div>
                </a>

                <a
                  href="mailto:support@examcell.rgu.ac.in"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ color: "#7c3aed", marginTop: "2px" }}>
                    <Mail size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Official Email</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>support@examcell.rgu.ac.in</div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>Typical reply: &lt; 2 hours</div>
                  </div>
                </a>
              </div>

              {/* Direct Ticket Form */}
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                  Submit an Instant Support Request
                </h4>

                {ticketSubmitted ? (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "12px",
                      padding: "16px",
                      textAlign: "center",
                      color: "#166534",
                    }}
                  >
                    <CheckCircle2 size={28} color="#16a34a" style={{ margin: "0 auto 8px auto" }} />
                    <div style={{ fontWeight: 700, fontSize: "13.5px" }}>Request Logged Successfully!</div>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#15803d" }}>
                      Ticket ID: #EXAM-{Math.floor(1000 + Math.random() * 9000)}. Our exam cell coordinator will review it shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleTicketSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                          Issue Category
                        </label>
                        <select
                          value={ticketCategory}
                          onChange={(e) => setTicketCategory(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "12px",
                            background: "#ffffff",
                            outline: "none",
                          }}
                        >
                          <option value="Question Bank Issue">Question Bank Issue</option>
                          <option value="Bulk Upload Error">Bulk Upload Error</option>
                          <option value="Verification / Approval Flow">Verification / Approval Flow</option>
                          <option value="Account & Permissions">Account & Permissions</option>
                          <option value="System Backup / Export">System Backup / Export</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                          Subject / Topic
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Need help with syllabus unit"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "12px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                        Description of Issue *
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Please describe what you need assistance with..."
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "12px",
                          outline: "none",
                          resize: "none",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "10px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        color: "#ffffff",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                      }}
                    >
                      <Send size={14} />
                      <span>Send Support Ticket</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY POLICY MODAL */}
      {showPrivacyModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="portal-support-modal-box"
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "85dvh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                  Exam Cell Privacy & Confidentiality Policy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px", overflowY: "auto", fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
              <p><strong>1. Academic Confidentiality:</strong> All examination questions, answer keys, syllabus units, and question banks stored within this portal are confidential academic property of the institution.</p>
              <p><strong>2. User Access & Audit Logging:</strong> Access to draft, verified, and approved questions is restricted strictly according to authorized role permissions (Faculty, Verifier, HOD, Exam Cell Administrator). Every action is time-stamped and logged.</p>
              <p><strong>3. Data Storage & Backups:</strong> Question data and system preferences are encrypted in transit and securely maintained in local institutional infrastructure. Regular automated backups ensure zero data loss.</p>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TERMS OF SERVICE MODAL */}
      {showTermsModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="portal-support-modal-box"
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "85dvh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                  Terms of Service & Usage Guidelines
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px", overflowY: "auto", fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
              <p><strong>1. Authorized Academic Use:</strong> This portal is exclusively for authorized academic staff for the curation, review, approval, and generation of assessment materials.</p>
              <p><strong>2. Question Integrity & Quality:</strong> Faculty and verifiers must ensure that questions adhere to Bloom's taxonomy, syllabus units, and institutional standard formats without plagiarism.</p>
              <p><strong>3. Compliance with Examination Regulations:</strong> Any tampering with question status or unauthorized publication is subject to disciplinary action under the university exam code.</p>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
