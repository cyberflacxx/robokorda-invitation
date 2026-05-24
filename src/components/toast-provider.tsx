"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          border: "1px solid rgba(156, 163, 175, 0.35)",
          background: "#132B4F",
          color: "#FFFFFF",
        },
        success: {
          style: {
            background: "#0B5D3B",
            border: "1px solid rgba(34, 197, 94, 0.55)",
            color: "#FFFFFF",
          },
        },
        error: {
          style: {
            background: "#8B1E2D",
            border: "1px solid rgba(248, 113, 113, 0.65)",
            color: "#FFFFFF",
          },
        },
      }}
    />
  );
}
