"use client";

import { useEffect } from "react";
import { examStore } from "../lib/examStore";

/** Hydrates the local UI store from Supabase once when the app starts. */
export default function SupabaseSync() {
  useEffect(() => {
    void (async () => {
      // One-time cleanup requested for the current dataset. It keeps the
      // subjects but removes old question rows and resets every counter.
      const resetMarker = "exam_cell_uploaded_academic_data_reset_v3";
      if (!localStorage.getItem(resetMarker)) {
        await examStore.resetAllQuestionCounts();
        localStorage.setItem(resetMarker, "true");
      }
      await examStore.syncFromSupabase();
    })();
  }, []);

  return null;
}
