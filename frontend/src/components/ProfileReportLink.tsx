"use client";

import { useState } from "react";
import { ReportModal } from "@/components/ReportModal";

export function ProfileReportLink({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 text-[0.75rem] underline decoration-transparent underline-offset-2 transition-[color,text-decoration-color] hover:decoration-current"
        style={{ color: "var(--p-muted)" }}
      >
        Report this page
      </button>
      {open && <ReportModal username={username} onClose={() => setOpen(false)} />}
    </>
  );
}
