"use client";

import React from "react";
import { Eye, Edit3, Trash2, Sparkles } from "lucide-react";

export interface CrudActionButtonsProps {
  onView?: () => void;
  onVerify?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewTitle?: string;
  verifyTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
  size?: number;
}

export function CrudActionButtons({
  onView,
  onVerify,
  onEdit,
  onDelete,
  viewTitle = "View Details",
  verifyTitle = "Verify with AI",
  editTitle = "Edit Item",
  deleteTitle = "Delete Item",
  size = 34,
}: CrudActionButtonsProps) {
  const iconSize = size > 30 ? 14 : 13;

  return (
    <div
      className="crud-btn-group"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {onView && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          title={viewTitle}
          className="crud-btn-view"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <Eye size={iconSize} strokeWidth={2} />
        </button>
      )}

      {onVerify && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onVerify();
          }}
          title={verifyTitle}
          className="crud-btn-verify-ai"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "10px",
            border: "1px solid rgba(139, 92, 246, 0.4)",
            background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(124, 58, 237, 0.35)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
        >
          <Sparkles size={iconSize} strokeWidth={2} style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.9))" }} />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title={editTitle}
          className="crud-btn-edit"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <Edit3 size={iconSize} strokeWidth={2} />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title={deleteTitle}
          className="crud-btn-delete"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <Trash2 size={iconSize} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

export default CrudActionButtons;
