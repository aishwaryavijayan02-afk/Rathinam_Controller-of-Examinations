"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AcademicVaultPage from "../academic-vault/page";

export default function SyllabusPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/syllabus") {
      router.replace("/academic-vault?tab=syllabus-upload");
    }
  }, [router]);

  return <AcademicVaultPage />;
}
