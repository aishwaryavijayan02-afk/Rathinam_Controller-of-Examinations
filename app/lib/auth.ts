"use client";

export type UserRole = "STAFF" | "HOD" | "DEAN" | "COE";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatarBg: string;
  isSubjectFaculty?: boolean; // Specific to HOD role permission rule
}

export const PRESET_USERS: Record<UserRole, AuthUser> = {
  STAFF: {
    id: "usr-staff",
    name: "Mr. Vignesh M",
    email: "staff@rathinam.in",
    role: "STAFF",
    roleTitle: "Assistant Professor",
    department: "Visual Communication",
    avatarBg: "#4f46e5",
  },
  HOD: {
    id: "usr-hod",
    name: "Dr. T.J RAJU",
    email: "hod@rathinam.in",
    role: "HOD",
    roleTitle: "HOD / Associate Dean",
    department: "Visual Arts & VFX",
    avatarBg: "#0284c7",
    isSubjectFaculty: true,
  },
  DEAN: {
    id: "usr-dean",
    name: "Dr. V Rajlakshmi",
    email: "dean@rathinam.in",
    role: "DEAN",
    roleTitle: "Dean Academic Affairs",
    department: "School of Media & Arts",
    avatarBg: "#8b5cf6",
  },
  COE: {
    id: "usr-coe",
    name: "Dr. Rajubalaji",
    email: "coe@rathinam.in",
    role: "COE",
    roleTitle: "Controller of Examinations",
    department: "Exam Cell Office",
    avatarBg: "#10b981",
  },
};

export const STAFF_FACULTY_ACCOUNTS: AuthUser[] = [
  {
    id: "fac-vis-1",
    name: "Mr. Vignesh M",
    email: "vignesh.viscom@rathinam.in",
    role: "STAFF",
    roleTitle: "Assistant Professor",
    department: "Visual Communication",
    avatarBg: "#4f46e5",
  },
  {
    id: "fac-vis-2",
    name: "Mr. Vishal Mithran",
    email: "vishal.viscom@rathinam.in",
    role: "STAFF",
    roleTitle: "Assistant Professor",
    department: "Visual Communication",
    avatarBg: "#0284c7",
  },
  {
    id: "fac-vis-3",
    name: "Mr. Athreya K",
    email: "athreya.viscom@rathinam.in",
    role: "STAFF",
    roleTitle: "Assistant Professor",
    department: "Visual Communication",
    avatarBg: "#059669",
  },
  {
    id: "fac-vis-4",
    name: "Mrs. Gayathiri G",
    email: "gayathiri.viscom@rathinam.in",
    role: "STAFF",
    roleTitle: "Assistant Professor",
    department: "Visual Communication",
    avatarBg: "#db2777",
  },
  {
    id: "fac-vis-5",
    name: "Mr. Saravanan S",
    email: "saravanan.viscom@rathinam.in",
    role: "STAFF",
    roleTitle: "Assistant Professor",
    department: "Visual Communication",
    avatarBg: "#ea580c",
  },
  {
    id: "fac-vis-6",
    name: "Mr. Kailash Tharayil",
    email: "kailash.viscom@rathinam.in",
    role: "STAFF",
    roleTitle: "Assistant Professor",
    department: "Visual Communication",
    avatarBg: "#8b5cf6",
  },
];

export function parseStaffNameFromEmail(rawEmail: string): string {
  const clean = (rawEmail || "").trim().toLowerCase();
  const rawHandle = rawEmail.includes("@") ? rawEmail.split("@")[0].trim() : rawEmail.trim();
  const handle = clean.split("@")[0].trim();

  // If handle is literally 'staff' or 'faculty', return primary faculty name
  if (handle === "staff" || handle === "faculty") {
    return "Mr. Vignesh M";
  }

  // 1. Detect explicit salutation from handle or email string
  let salutation: "Mr." | "Mrs." | "Ms." | "Dr." | "Prof." | null = null;
  if (/^(mrs[\.\s_\-]|\(mrs\)|\[mrs\])/i.test(handle) || /\bmrs\b/i.test(handle)) {
    salutation = "Mrs.";
  } else if (/^(mr[\.\s_\-]|\(mr\)|\[mr\])/i.test(handle) || /\bmr\b/i.test(handle)) {
    salutation = "Mr.";
  } else if (/^(ms[\.\s_\-]|\(ms\)|\[ms\])/i.test(handle) || /\bms\b/i.test(handle)) {
    salutation = "Ms.";
  } else if (/^(dr[\.\s_\-]|\(dr\)|\[dr\])/i.test(handle) || /\bdr\b/i.test(handle)) {
    salutation = "Dr.";
  } else if (/^(prof[\.\s_\-]|\(prof\)|\[prof\])/i.test(handle) || /\bprof\b/i.test(handle)) {
    salutation = "Prof.";
  }

  // 2. Direct recognized faculty & authority members (respect explicit salutation if given)
  if (clean.includes("gayathiri") || clean.includes("gayathri")) {
    return `${salutation || "Mrs."} Gayathiri G`;
  }
  if (clean.includes("vignesh")) {
    return `${salutation || "Mr."} Vignesh M`;
  }
  if (clean.includes("vishal")) {
    return `${salutation || "Mr."} Vishal Mithran`;
  }
  if (clean.includes("athreya")) {
    return `${salutation || "Mr."} Athreya K`;
  }
  if (clean.includes("saravanan")) {
    return `${salutation || "Mr."} Saravanan S`;
  }
  if (clean.includes("kailash")) {
    return `${salutation || "Mr."} Kailash Tharayil`;
  }
  if (clean.includes("raju") && !clean.includes("balaji")) {
    return "Dr. T.J RAJU";
  }
  if (clean.includes("rajubalaji") || clean.includes("balaji")) {
    return "Dr. Rajubalaji";
  }
  if (clean.includes("rajlakshmi")) {
    return "Dr. V Rajlakshmi";
  }

  // 3. Parse custom staff names from email prefix or user input
  let nameHandle = rawHandle
    .replace(/(\.|\s|_|-)+viscom$/gi, "")
    .replace(/(\.|\s|_|-)+fashion$/gi, "")
    .replace(/(\.|\s|_|-)+media$/gi, "")
    .replace(/(\.|\s|_|-)+arts$/gi, "")
    .replace(/(\.|\s|_|-)+design$/gi, "")
    .replace(/(\.|\s|_|-)+cse$/gi, "")
    .replace(/(\.|\s|_|-)+it$/gi, "")
    .trim();

  // Strip salutation tokens from nameHandle so we don't repeat them
  nameHandle = nameHandle
    .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.|mr|mrs|ms|dr|prof)[\s\._\-]+/gi, "")
    .trim();

  const tokens = nameHandle.split(/[\.\s_\-]+/).filter(Boolean);
  if (tokens.length === 0) {
    return salutation ? `${salutation} Faculty` : "Mr. Vignesh M";
  }

  const nameParts = tokens.map((t) => {
    if (t.length === 1) return t.toUpperCase();
    return t.charAt(0).toUpperCase() + t.slice(1);
  });

  const baseName = nameParts.join(" ");
  if (salutation) {
    return `${salutation} ${baseName}`;
  }
  return baseName || "Mr. Vignesh M";
}

export function authenticateUser(
  emailInput: string,
  passwordInput: string,
  selectedRole?: UserRole | null
): { user: AuthUser | null; error: string | null } {
  // Sanitize: trim, lowercase, remove any spaces (e.g. "Raju T.J@rathinam.in" -> "raju.t.j@rathinam.in")
  let cleanEmail = emailInput.trim().toLowerCase().replace(/\s+/g, "");
  const cleanPassword = passwordInput.trim();

  if (!cleanEmail) {
    return { user: null, error: "Please enter your Email (e.g. hod@rathinam.in, staff@rathinam.in)." };
  }

  if (!cleanPassword) {
    return { user: null, error: "Please enter your password (12345)." };
  }

  // Password must be '12345' (from 1 to 5)
  if (cleanPassword !== "12345") {
    return { user: null, error: "Invalid password. Use '12345' as password." };
  }

  // If user only typed the username/name part, automatically append @rathinam.in
  if (!cleanEmail.includes("@")) {
    cleanEmail = `${cleanEmail}@rathinam.in`;
  }

  // Ensure domain is @rathinam.in
  if (!cleanEmail.endsWith("@rathinam.in")) {
    return {
      user: null,
      error: "Invalid email. Please use an official 'name@rathinam.in' email address.",
    };
  }

  const handleRaw = cleanEmail.split("@")[0].toLowerCase();
  const handleNormalized = handleRaw.replace(/[\._\-]/g, "");

  // 1. Direct HOD matches (e.g. hod@rathinam.in, raju.tj@rathinam.in, raju@rathinam.in, tjraju@rathinam.in)
  if (
    handleNormalized === "hod" ||
    (handleNormalized.includes("raju") && !handleNormalized.includes("balaji")) ||
    handleNormalized === "tjraju" ||
    selectedRole === "HOD"
  ) {
    return { user: PRESET_USERS.HOD, error: null };
  }

  // 2. Direct COE matches (e.g. coe@rathinam.in, rajubalaji@rathinam.in, controller@rathinam.in)
  if (
    handleNormalized === "coe" ||
    handleNormalized.includes("rajubalaji") ||
    handleNormalized.includes("controller") ||
    selectedRole === "COE"
  ) {
    return { user: PRESET_USERS.COE, error: null };
  }

  // 3. Direct DEAN matches (e.g. dean@rathinam.in, rajlakshmi@rathinam.in, director@rathinam.in)
  if (
    handleNormalized === "dean" ||
    handleNormalized.includes("rajlakshmi") ||
    handleNormalized.includes("director") ||
    selectedRole === "DEAN"
  ) {
    return { user: PRESET_USERS.DEAN, error: null };
  }

  // 4. Direct STAFF matches (e.g. staff@rathinam.in, vignesh@rathinam.in)
  if (
    handleNormalized === "staff" ||
    handleNormalized.includes("vignesh")
  ) {
    return { user: PRESET_USERS.STAFF, error: null };
  }

  // 5. Check other registered Authority Presets
  const matchedRole = (Object.keys(PRESET_USERS) as UserRole[]).find((r) => {
    const preset = PRESET_USERS[r];
    const presetEmail = preset.email.toLowerCase();
    const presetHandle = presetEmail.split("@")[0].toLowerCase();
    return (
      presetEmail === cleanEmail ||
      presetHandle === cleanEmail.split("@")[0] ||
      (selectedRole === r && (cleanEmail.startsWith(r.toLowerCase()) || cleanEmail === presetEmail))
    );
  });
  if (matchedRole) {
    return { user: PRESET_USERS[matchedRole], error: null };
  }

  // 6. Check All Registered Staff Faculty Accounts
  const matchedStaff = STAFF_FACULTY_ACCOUNTS.find((s) => {
    const staffEmail = s.email.toLowerCase();
    const staffHandle = staffEmail.split("@")[0].toLowerCase();
    return (
      staffEmail === cleanEmail ||
      cleanEmail === `${staffHandle}@rathinam.in` ||
      cleanEmail.split("@")[0] === staffHandle
    );
  });
  if (matchedStaff) {
    return { user: matchedStaff, error: null };
  }

  // 7. Dynamic match for any valid name@rathinam.in address
  const handle = cleanEmail.split("@")[0].toLowerCase();
  const parsedName = parseStaffNameFromEmail(emailInput || cleanEmail);

  // Determine role based on selectedRole or email handle
  let role: UserRole = selectedRole || "STAFF";
  let roleTitle = "Assistant Professor";
  let department = "Department of Visual Communication";

  if (!selectedRole) {
    if (handle.includes("coe") || handle.includes("controller")) {
      role = "COE";
      roleTitle = "Controller of Examinations";
      department = "Exam Cell Office";
    } else if (handle.includes("dean") || handle.includes("director")) {
      role = "DEAN";
      roleTitle = "Dean Academic Affairs";
      department = "School of Media & Arts";
    } else if (handle.includes("hod")) {
      role = "HOD";
      roleTitle = "HOD / Associate Dean";
      department = "Visual Arts & VFX";
    }
  } else {
    const sRole = selectedRole as string;
    if (sRole === "COE") {
      roleTitle = "Controller of Examinations";
      department = "Exam Cell Office";
    } else if (sRole === "DEAN") {
      roleTitle = "Dean Academic Affairs";
      department = "School of Media & Arts";
    } else if (sRole === "HOD") {
      roleTitle = "HOD / Associate Dean";
      department = "Visual Arts & VFX";
    }
  }

  const dynamicUser: AuthUser = {
    id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`,
    name: parsedName,
    email: cleanEmail,
    role: role,
    roleTitle: roleTitle,
    department: department,
    avatarBg: cleanEmail.includes("gayathiri") || cleanEmail.includes("mrs") ? "#db2777" : "#4f46e5",
    isSubjectFaculty: role === "HOD" ? true : undefined,
  };

  return { user: dynamicUser, error: null };
}

// Check permissions strictly matching the matrix table
export function hasPermission(role: UserRole, route: string, isSubjectFaculty: boolean = true): boolean {
  const normalizedRoute = route.replace(/\/$/, "").split("?")[0];

  switch (normalizedRoute) {
    case "/dashboard":
    case "":
      return true; // All roles

    case "/subjects":
    case "/subject":
    case "/academic-vault":
    case "/syllabus":
    case "/question-bank":
    case "/bulk-upload":
      if (role === "COE" || role === "STAFF") return true;
      if (role === "HOD") return Boolean(isSubjectFaculty);
      if (role === "DEAN") return false;
      return false;

    case "/verify-questions":
    case "/approval":
      if (role === "COE" || role === "HOD" || role === "DEAN") return true;
      if (role === "STAFF") return false;
      return false;

    case "/staff-faculty":
    case "/faculty":
    case "/staff-work-status":
      if (role === "COE" || role === "HOD" || role === "DEAN") return true;
      return false; // STAFF denied

    case "/reports":
    case "/manual-questions":
      if (role === "COE") return true;
      return false; // STAFF, HOD, DEAN denied

    case "/print-paper":
      return role === "COE"; // ONLY COE (Controller of Examinations) can print question papers

    case "/notifications":
    case "/settings":
      return true; // All roles

    default:
      return true;
  }
}

const STORAGE_KEY = "exam_cell_auth_user";

export const authStore = {
  getCurrentUser(): AuthUser {
    if (typeof window === "undefined") return PRESET_USERS.COE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.role) {
          if (parsed.name && (/Mr\.\/Ms/i.test(parsed.name) || parsed.name.startsWith("Mr./Ms"))) {
            const reParsed = parseStaffNameFromEmail(parsed.email || parsed.name);
            parsed.name = reParsed.replace(/^Mr\.\/Ms\.\s*/i, "");
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            } catch (e) {}
          }
          // Auto-migrate any outdated generic "Faculty / Staff" or missing names in localStorage
          if (
            parsed.name === "Faculty / Staff" ||
            parsed.name === "Staff" ||
            parsed.roleTitle === "Faculty / Staff" ||
            !parsed.name
          ) {
            if (parsed.email && parsed.email !== "staff@rathinam.in") {
              parsed.name = parseStaffNameFromEmail(parsed.email);
            } else {
              parsed.name = "Mr. Vignesh M";
            }
            if (parsed.role === "STAFF" && (parsed.roleTitle === "Faculty / Staff" || !parsed.roleTitle)) {
              parsed.roleTitle = "Assistant Professor";
            }
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            } catch (e) {}
          }

          if (parsed.email && parsed.name) {
            return parsed as AuthUser;
          }
          if (PRESET_USERS[parsed.role as UserRole]) {
            const fresh = PRESET_USERS[parsed.role as UserRole];
            return {
              ...parsed,
              name: fresh.name,
              email: fresh.email,
              roleTitle: fresh.roleTitle,
            };
          }
        }
      }
    } catch (e) {
      console.error("Auth storage read error:", e);
    }
    return PRESET_USERS.COE;
  },

  setCurrentUser(user: AuthUser): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent("exam-cell-auth-update", { detail: user }));
    } catch (e) {
      console.error("Auth storage save error:", e);
    }
  },

  loginAs(role: UserRole, customIsSubjectFaculty?: boolean): AuthUser {
    const preset = PRESET_USERS[role];
    const userToSave: AuthUser = {
      ...preset,
      isSubjectFaculty: customIsSubjectFaculty !== undefined ? customIsSubjectFaculty : (preset.isSubjectFaculty ?? true),
    };
    this.setCurrentUser(userToSave);
    return userToSave;
  },

  toggleHodSubjectFaculty(): AuthUser {
    const current = this.getCurrentUser();
    if (current.role !== "HOD") return current;
    const updated: AuthUser = {
      ...current,
      isSubjectFaculty: !current.isSubjectFaculty,
    };
    this.setCurrentUser(updated);
    return updated;
  },

  logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("exam-cell-auth-update", { detail: null }));
  },
};
