"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Lock, RefreshCw, UserCheck } from "lucide-react";
import { authStore, AuthUser, hasPermission, UserRole, PRESET_USERS } from "../lib/auth";

interface RoleGuardProps {
  route: string;
  children: React.ReactNode;
}

export default function RoleGuard({ route, children }: RoleGuardProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadUser = () => {
      setCurrentUser(authStore.getCurrentUser());
    };
    loadUser();

    const handleAuthUpdate = (e: any) => {
      setCurrentUser(e.detail || authStore.getCurrentUser());
    };

    window.addEventListener("exam-cell-auth-update", handleAuthUpdate);
    return () => window.removeEventListener("exam-cell-auth-update", handleAuthUpdate);
  }, []);

  if (!mounted) return null;

  const user = currentUser || authStore.getCurrentUser();
  const allowed = hasPermission(user.role, route, user.isSubjectFaculty);

  if (!allowed) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "75vh",
          padding: "32px 24px",
          textAlign: "center",
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #fee2e2",
            padding: "40px 32px",
            boxShadow: "0 20px 50px -12px rgba(220, 38, 38, 0.12), 0 4px 12px rgba(0, 0, 0, 0.03)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Glowing Red Lock Badge */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "22px",
              background: "linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)",
              border: "1px solid #fca5a5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
              marginBottom: "20px",
              boxShadow: "0 8px 24px -4px rgba(220, 38, 38, 0.25)",
            }}
          >
            <ShieldAlert size={36} />
          </div>

          {/* Access Restricted Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: "#fef2f2",
              color: "#991b1b",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <Lock size={13} />
            <span>403 Access Restricted</span>
          </div>

          <h2
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 10px 0",
              letterSpacing: "-0.4px",
            }}
          >
            Permission Denied for {user.roleTitle}
          </h2>

          <p
            style={{
              fontSize: "13.5px",
              color: "#64748b",
              lineHeight: 1.6,
              margin: "0 0 24px 0",
            }}
          >
            According to the Examination Cell Access Policy, your role (<strong>{user.role}</strong>) does not have permission to access the <strong>{route}</strong> page.
            {user.role === "HOD" && !user.isSubjectFaculty && (
              <span style={{ display: "block", marginTop: "8px", color: "#b45309", fontWeight: 600 }}>
                💡 HODs only have access to Subjects/Syllabus/Question Bank if assigned as a Subject Faculty.
              </span>
            )}
          </p>

          {/* User Info Capsule */}
          <div
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12.5px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", textAlign: "left" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: user.avatarBg || "#6366f1",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                {user.name.charAt(0)}
              </div>
              <div>
                <strong style={{ display: "block", color: "#1e293b" }}>{user.name}</strong>
                <span style={{ color: "#64748b", fontSize: "11px" }}>{user.email}</span>
              </div>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "10px",
                background: "#e0e7ff",
                color: "#3730a3",
              }}
            >
              {user.role}
            </span>
          </div>

          {/* Quick Switch Role Buttons for Testing */}
          <div style={{ width: "100%", marginBottom: "20px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "8px" }}>
              Switch Role to Test Access:
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {(["STAFF", "HOD", "DEAN", "COE"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    authStore.loginAs(r);
                  }}
                  style={{
                    padding: "8px 4px",
                    borderRadius: "8px",
                    border: r === user.role ? "2px solid #6366f1" : "1px solid #cbd5e1",
                    background: r === user.role ? "#e0e7ff" : "#ffffff",
                    color: r === user.role ? "#4338ca" : "#334155",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Return Button */}
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "13.5px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.2)",
              transition: "all 0.2s ease",
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
