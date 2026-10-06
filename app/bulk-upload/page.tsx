"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AcademicVaultPage from "../academic-vault/page";

export default function BulkUploadPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/bulk-upload") {
      router.replace("/academic-vault?tab=question-bank-upload");
    }
  }, [router]);

  return <AcademicVaultPage />;
}
