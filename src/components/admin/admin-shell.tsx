"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChartLine,
  faDoorOpen,
  faGear,
  faImage,
  faUserCheck,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: faChartLine },
  { href: "/admin/guests", label: "Guests", icon: faUsers },
  { href: "/admin/gallery", label: "Gallery", icon: faImage },
  { href: "/admin/checkin", label: "Check-In", icon: faUserCheck },
  { href: "/admin/settings", label: "Settings", icon: faGear },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-brand-ink text-brand-paper">
      <div className="mx-auto flex w-full max-w-7xl overflow-x-hidden">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white px-4 py-6 text-[#0b1f3a] shadow-xl transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-8 flex items-center gap-3">
            <div>
              <p className="text-sm font-medium text-[#0b1f3a]">Robokorda</p>
              <p className="text-lg font-semibold tracking-wide text-[#0b1f3a]">Admin</p>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <img
              src="/robokorda-logo.png"
              alt="Robokorda Africa logo"
              className="h-14 w-full object-contain"
            />
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2 text-sm transition",
                  pathname === item.href
                    ? "bg-[#0b1f3a] text-white"
                    : "text-[#0b1f3a] hover:bg-slate-100 hover:text-[#0b1f3a]",
                )}
              >
                <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {open && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-brand-navy/60 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-brand-gold/20 bg-brand-black/70 px-4 py-3 backdrop-blur lg:px-6">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-gold/30 text-brand-paper lg:hidden"
              aria-label="Toggle navigation"
            >
              <FontAwesomeIcon icon={open ? faXmark : faBars} />
            </button>

            <p className="text-sm font-medium text-brand-paper truncate">Robokorda 10th Anniversary</p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-lg border border-[#a03a4e] bg-[#8B1E2D] px-3 py-2 text-sm text-white transition hover:bg-[#751829]"
              >
                <FontAwesomeIcon icon={faDoorOpen} />
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden px-3 py-5 sm:px-4 lg:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
