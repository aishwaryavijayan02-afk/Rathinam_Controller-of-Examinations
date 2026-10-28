"use client";

import React, { useEffect, useState } from "react";
import { authStore, AuthUser, PRESET_USERS } from "../lib/auth";

export default function SidebarUserProfile() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setCurrentUser(authStore.getCurrentUser());

    const handleAuthChange = (e: CustomEvent<AuthUser | null>) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      } else {
        setCurrentUser(authStore.getCurrentUser());
      }
    };

    window.addEventListener(
      "exam-cell-auth-update",
      handleAuthChange as EventListener
    );
    return () => {
      window.removeEventListener(
        "exam-cell-auth-update",
        handleAuthChange as EventListener
      );
    };
  }, []);

  const user = currentUser || PRESET_USERS.STAFF;
  
  const getAvatarInitial = (name: string) => {
    const stripped = (name || "").replace(/^(Mr\.\/Ms\.|Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Mr|Mrs|Ms|Dr|Prof)\s*/gi, "").trim();
    return (stripped || name || "U").charAt(0).toUpperCase();
  };

  const initial = getAvatarInitial(user.name);

  return (
    <div className="sidebar-security user-profile-sidebar-card">
      <div
        className="user-avatar-badge"
        style={{
          background: user.avatarBg
            ? `radial-gradient(circle at 35% 30%, ${user.avatarBg}, #1e1b4b)`
            : "radial-gradient(circle at 35% 30%, #7c3aed, #4c1d95)",
        }}
      >
        <span>{initial}</span>
      </div>

      <div className="user-profile-details">
        <strong className="user-profile-name" title={user.name}>
          {user.name}
        </strong>
        <span className="user-profile-email" title={user.email}>
          {user.email}
        </span>
        <span className="user-profile-role">{user.roleTitle || "Faculty / Staff"}</span>
      </div>

      <span
        className="security-status online-pulse-dot"
        title="Outlook Authenticated Session"
      />
    </div>
  );
}
