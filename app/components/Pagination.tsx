"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = "questions",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrent = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = totalItems === 0 ? 0 : (safeCurrent - 1) * itemsPerPage + 1;
  const endIndex = Math.min(safeCurrent * itemsPerPage, totalItems);

  // Generate pagination items matching user's screenshot: < 1 2 3 ... 16 >
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrent <= 3) {
      return [1, 2, 3, "...", totalPages];
    }
    if (safeCurrent >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", safeCurrent - 1, safeCurrent, safeCurrent + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        paddingTop: "16px",
        borderTop: "1px solid #f1f5f9",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      {/* Left text: Showing X to Y of Z */}
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
        Showing <span style={{ color: "#0f172a", fontWeight: 700 }}>{startIndex}</span> to{" "}
        <span style={{ color: "#0f172a", fontWeight: 700 }}>{endIndex}</span> of{" "}
        <span style={{ color: "#0f172a", fontWeight: 700 }}>{totalItems}</span> {itemName}
      </div>

      {/* Right pagination controls */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
        {/* Previous chevron button */}
        <button
          type="button"
          disabled={safeCurrent <= 1}
          onClick={() => onPageChange(Math.max(1, safeCurrent - 1))}
          style={{
            width: "32px",
            height: "32px",
            padding: 0,
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: safeCurrent <= 1 ? "not-allowed" : "pointer",
            opacity: safeCurrent <= 1 ? 0.35 : 1,
            color: "#64748b",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
          title="Previous Page"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page buttons */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  minWidth: "22px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#94a3b8",
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === safeCurrent;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              style={{
                minWidth: "32px",
                height: "32px",
                padding: "0 8px",
                borderRadius: "8px",
                border: isActive ? "none" : "1px solid #e2e8f0",
                background: isActive
                  ? "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)"
                  : "#ffffff",
                color: isActive ? "#ffffff" : "#475569",
                fontSize: "13px",
                fontWeight: isActive ? 800 : 600,
                cursor: "pointer",
                boxShadow: isActive
                  ? "0 4px 12px rgba(79, 70, 229, 0.38)"
                  : "0 1px 2px rgba(0,0,0,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              title={`Page ${pageNum}`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next chevron button */}
        <button
          type="button"
          disabled={safeCurrent >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, safeCurrent + 1))}
          style={{
            width: "32px",
            height: "32px",
            padding: 0,
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: safeCurrent >= totalPages ? "not-allowed" : "pointer",
            opacity: safeCurrent >= totalPages ? 0.35 : 1,
            color: "#64748b",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
          title="Next Page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
