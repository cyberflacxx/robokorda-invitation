"use client";

import Papa from "papaparse";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faEnvelope,
  faMagnifyingGlass,
  faPlus,
  faTrash,
  faUpload,
  faPen,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { AdminShell } from "@/components/admin/admin-shell";
import { GENDERS, type GenderType, type RSVPStatusType } from "@/lib/enums";
import { getBaseUrl } from "@/lib/utils";

type Guest = {
  id: number;
  fullName: string;
  gender: string | null;
  email: string | null;
  phone: string | null;
  inviteToken: string;
  rsvpCode: string;
  rsvpStatus: RSVPStatusType;
  selectedStarter?: { name: string } | null;
  selectedMain?: { name: string } | null;
  selectedDessert?: { name: string } | null;
  selectedTable?: { tableName: string } | null;
  rsvp?: { submittedAt: string } | null;
  createdAt: string;
};

const STATUS_COLORS: Record<RSVPStatusType, string> = {
  PENDING: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  ACCEPT:  "bg-green-500/20 text-green-300 border-green-400/30",
  DECLINE: "bg-red-500/20 text-red-300 border-red-400/30",
  MAYBE:   "bg-blue-500/20 text-blue-300 border-blue-400/30",
};

const defaultForm = {
  fullName: "",
  gender: "PREFER_NOT_TO_SAY" as GenderType,
  email: "",
  phone: "",
};

async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    const raw = await response.text();
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [form, setForm] = useState(defaultForm);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);

  const loadGuests = async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (statusFilter !== "ALL") query.set("status", statusFilter);

    const response = await fetch(`/api/admin/guests?${query.toString()}`, { cache: "no-store" });
    const body = await safeJson<{ guests?: Guest[]; error?: string }>(response);

    if (!response.ok) {
      toast.error(body?.error || "Failed to fetch guests");
      setLoading(false);
      return;
    }

    setGuests(body?.guests ?? []);
    setLoading(false);
  };

  useEffect(() => {
    setForm(defaultForm);
    void loadGuests();
    const timer = setInterval(() => void loadGuests(), 12000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createGuest = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/admin/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await safeJson<{ guest?: Guest; error?: string }>(response);
    if (!response.ok) {
      toast.error(body?.error || "Failed to create guest");
      return;
    }
    const generatedCode = body?.guest?.rsvpCode;
    toast.success(form.email ? "Guest created & invitation email sent" : "Guest created");
    if (generatedCode) {
      toast.success(`Reservation code generated: ${generatedCode}`);
    }
    setForm(defaultForm);
    void loadGuests();
  };

  const updateGuest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingGuest) return;
    const response = await fetch(`/api/admin/guests/${editingGuest.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: editingGuest.fullName,
        email: editingGuest.email,
        phone: editingGuest.phone,
        gender: editingGuest.gender ?? "PREFER_NOT_TO_SAY",
        rsvpCode: editingGuest.rsvpCode,
        inviteToken: editingGuest.inviteToken,
      }),
    });
    const body = await safeJson<{ guest?: Guest; error?: string }>(response);
    if (!response.ok) {
      toast.error(body?.error || "Failed to update guest");
      return;
    }
    toast.success("Guest updated");
    setEditingGuest(null);
    void loadGuests();
  };

  const removeGuest = async (id: number) => {
    if (!confirm("Delete this guest?")) return;
    const response = await fetch(`/api/admin/guests/${id}`, { method: "DELETE" });
    const body = await safeJson<{ success?: boolean; error?: string }>(response);
    if (!response.ok) {
      toast.error(body?.error || "Failed to delete guest");
      return;
    }
    toast.success("Guest deleted");
    void loadGuests();
  };

  const sendEmail = async (guest: Guest) => {
    if (!guest.email) {
      toast.error("This guest has no email address");
      return;
    }
    setSendingEmail(guest.id);
    const response = await fetch(`/api/admin/guests/${guest.id}/send-email`, { method: "POST" });
    const body = await safeJson<{ success?: boolean; error?: string }>(response);
    if (!response.ok) {
      toast.error(body?.error || "Failed to send email");
    } else {
      toast.success(`Invitation sent to ${guest.email}`);
    }
    setSendingEmail(null);
  };

  const importCsv = async (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const response = await fetch("/api/admin/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ importRows: result.data }),
        });
        const body = await safeJson<{ count?: number; error?: string }>(response);
        if (!response.ok) {
          toast.error(body?.error || "CSV import failed");
          return;
        }
        toast.success(`Imported ${body?.count ?? 0} guests`);
        void loadGuests();
      },
    });
  };

  const baseUrl = useMemo(() => getBaseUrl(), []);

  const copyMessage = async (guest: Guest) => {
    const link = `${baseUrl}/invite/${guest.inviteToken}`;
    const message = `Hi ${guest.fullName}!\nI hope that you're well. Please find details about the event here. RSVP code is ${guest.rsvpCode}. Looking forward to seeing you.\n${link}`;
    await navigator.clipboard.writeText(message);
    toast.success("Invite message copied");
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Guest Management</h1>
          <p className="mt-1 text-sm text-brand-paper/70">
            Create guests, set their gender here, and send their personalised invitation.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-brand-gold/30 bg-brand-black/30 px-3 py-2 text-sm transition hover:bg-brand-gold/10">
          <FontAwesomeIcon icon={faUpload} />
          Import CSV
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void importCsv(f); }}
          />
        </label>
      </div>

      {/* Create / Edit forms */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <form onSubmit={createGuest} className="card space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <FontAwesomeIcon icon={faPlus} className="text-brand-gold" />
            Create Guest
          </h2>
          <p className="text-xs text-brand-paper/60">
            Adding an email address will automatically send the invitation email.
          </p>
          <input
            className="input"
            placeholder="Full name *"
            value={form.fullName}
            onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Email (optional — triggers auto-send)"
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
          />
          <select
            className="input"
            title="Guest gender"
            value={form.gender}
            onChange={(e) => setForm((s) => ({ ...s, gender: e.target.value as GenderType }))}
          >
            <option value={GENDERS[0]}>Male</option>
            <option value={GENDERS[1]}>Female</option>
            <option value={GENDERS[2]}>Prefer not to say</option>
          </select>
          <p className="rounded-lg border border-brand-gold/20 bg-brand-black/25 px-3 py-2 text-xs text-brand-paper/70">
            Reservation code and invite token are auto-generated by the system.
          </p>
          <button type="submit" className="btn-primary w-full gap-2">
            <FontAwesomeIcon icon={faPaperPlane} />
            {form.email ? "Create & Send Invitation" : "Create Guest"}
          </button>
        </form>

        {editingGuest ? (
          <form onSubmit={updateGuest} className="card space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FontAwesomeIcon icon={faPen} className="text-brand-gold" />
              Edit Guest
            </h2>
            <input className="input" placeholder="Full name" title="Full name" value={editingGuest.fullName} onChange={(e) => setEditingGuest({ ...editingGuest, fullName: e.target.value })} required />
            <input className="input" type="email" placeholder="Email" value={editingGuest.email ?? ""} onChange={(e) => setEditingGuest({ ...editingGuest, email: e.target.value })} />
            <input className="input" placeholder="Phone" value={editingGuest.phone ?? ""} onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })} />
            <select
              className="input"
              title="Guest gender"
              value={editingGuest.gender ?? "PREFER_NOT_TO_SAY"}
              onChange={(e) => setEditingGuest({ ...editingGuest, gender: e.target.value })}
            >
              <option value={GENDERS[0]}>Male</option>
              <option value={GENDERS[1]}>Female</option>
              <option value={GENDERS[2]}>Prefer not to say</option>
            </select>
            <input className="input" placeholder="RSVP code" title="RSVP code" value={editingGuest.rsvpCode} onChange={(e) => setEditingGuest({ ...editingGuest, rsvpCode: e.target.value })} />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">Update</button>
              <button type="button" onClick={() => setEditingGuest(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="card flex flex-col items-center justify-center gap-2 text-center text-sm text-brand-paper/60">
            <FontAwesomeIcon icon={faPen} className="text-2xl text-brand-gold/40" />
            Click the edit icon on a guest row to modify their details.
          </div>
        )}
      </div>

      {/* Search & filter */}
      <div className="card mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full md:min-w-64 md:flex-1">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-3 top-3 text-brand-gold/60 text-sm" />
          <input
            className="input pl-9"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void loadGuests()}
          />
        </div>
        <select
          title="Filter by RSVP status"
          className="input w-full md:max-w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPT">Accept</option>
          <option value="DECLINE">Decline</option>
          <option value="MAYBE">Maybe</option>
        </select>
        <button type="button" onClick={() => void loadGuests()} className="rounded-lg border border-brand-gold/30 bg-brand-black/30 px-4 py-2 text-sm transition hover:bg-brand-gold/10">
          Apply
        </button>
      </div>

      {/* Guest table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="h-10 animate-pulse rounded-lg bg-brand-paper/5" />
        ) : guests.length === 0 ? (
          <p className="py-4 text-sm text-brand-paper/60">No guests found.</p>
        ) : (
          <>
          <div className="space-y-3 md:hidden">
            {guests.map((guest) => {
              const link = `${baseUrl}/invite/${guest.inviteToken}`;
              const message = encodeURIComponent(
                `Hi ${guest.fullName}! I hope that you're well. Please find details about the event here. RSVP code is ${guest.rsvpCode}. Looking forward to seeing you. ${link}`,
              );
              return (
                <article key={guest.id} className="rounded-xl border border-brand-gold/20 bg-brand-black/25 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm">{guest.fullName}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[guest.rsvpStatus]}`}>
                      {guest.rsvpStatus}
                    </span>
                  </div>
                  <p className="text-xs text-brand-paper/70">{guest.email || guest.phone || "—"}</p>
                  <p className="mt-1 text-xs text-brand-gold/80 font-mono">{guest.rsvpCode}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <button type="button" onClick={() => setEditingGuest(guest)} className="rounded-lg border border-brand-gold/25 px-2 py-1 text-xs transition hover:bg-brand-gold/10" title="Edit">
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void sendEmail(guest)}
                      disabled={!guest.email || sendingEmail === guest.id}
                      className="rounded-lg border border-brand-gold/25 px-2 py-1 text-xs transition hover:bg-brand-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
                      title={guest.email ? "Send invitation email" : "No email address"}
                    >
                      <FontAwesomeIcon icon={sendingEmail === guest.id ? faCopy : faPaperPlane} />
                    </button>
                    <button type="button" onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("Link copied"))} className="rounded-lg border border-brand-gold/25 px-2 py-1 text-xs transition hover:bg-brand-gold/10" title="Copy invite link">
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                    <a href={`https://wa.me/?text=${message}`} target="_blank" rel="noreferrer" className="rounded-lg border border-brand-gold/25 px-2 py-1 text-xs transition hover:bg-brand-gold/10" title="WhatsApp">
                      <FontAwesomeIcon icon={faWhatsapp} />
                    </a>
                    <button type="button" onClick={() => void removeGuest(guest.id)} className="rounded-lg border border-red-400/50 bg-red-500/10 px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/20" title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <table className="hidden min-w-full text-left text-sm md:table">
            <thead>
              <tr className="border-b border-brand-gold/15 text-xs uppercase tracking-wider text-brand-gold/80">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Contact</th>
                <th className="py-3 pr-4">Gender</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Menu</th>
                <th className="py-3 pr-4">Table</th>
                <th className="py-3 pr-4">RSVP Code</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => {
                const link = `${baseUrl}/invite/${guest.inviteToken}`;
                const message = encodeURIComponent(
                  `Hi ${guest.fullName}! I hope that you're well. Please find details about the event here. RSVP code is ${guest.rsvpCode}. Looking forward to seeing you. ${link}`,
                );
                const menuSummary = [
                  guest.selectedStarter?.name,
                  guest.selectedMain?.name,
                  guest.selectedDessert?.name,
                ].filter(Boolean).join(" · ") || "—";

                return (
                  <tr key={guest.id} className="border-b border-brand-gold/10 transition hover:bg-brand-paper/5">
                    <td className="py-3 pr-4 font-medium">{guest.fullName}</td>
                    <td className="py-3 pr-4 text-brand-paper/70">{guest.email || guest.phone || "—"}</td>
                    <td className="py-3 pr-4 text-brand-paper/70">{guest.gender ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[guest.rsvpStatus]}`}>
                        {guest.rsvpStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-brand-paper/70 max-w-40 truncate" title={menuSummary}>{menuSummary}</td>
                    <td className="py-3 pr-4 text-brand-paper/70">{guest.selectedTable?.tableName || "—"}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-brand-gold/80">{guest.rsvpCode}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingGuest(guest)}
                          className="rounded-lg border border-brand-gold/25 px-2 py-1.5 text-xs transition hover:bg-brand-gold/10"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void sendEmail(guest)}
                          disabled={!guest.email || sendingEmail === guest.id}
                          className="rounded-lg border border-brand-gold/25 px-2 py-1.5 text-xs transition hover:bg-brand-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
                          title={guest.email ? "Send invitation email" : "No email address"}
                        >
                          <FontAwesomeIcon icon={sendingEmail === guest.id ? faCopy : faPaperPlane} />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("Link copied"))}
                          className="rounded-lg border border-brand-gold/25 px-2 py-1.5 text-xs transition hover:bg-brand-gold/10"
                          title="Copy invite link"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void copyMessage(guest)}
                          className="rounded-lg border border-brand-gold/25 px-2 py-1.5 text-xs transition hover:bg-brand-gold/10"
                          title="Copy message"
                        >
                          Msg
                        </button>
                        <a
                          href={`https://wa.me/?text=${message}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-brand-gold/25 px-2 py-1.5 text-xs transition hover:bg-brand-gold/10"
                          title="WhatsApp"
                        >
                          <FontAwesomeIcon icon={faWhatsapp} />
                        </a>
                        <a
                          href={`mailto:${guest.email ?? ""}?subject=You%27re%20Invited&body=${message}`}
                          className="rounded-lg border border-brand-gold/25 px-2 py-1.5 text-xs transition hover:bg-brand-gold/10"
                          title="Open in mail client"
                        >
                          <FontAwesomeIcon icon={faEnvelope} />
                        </a>
                        <button
                          type="button"
                          onClick={() => void removeGuest(guest.id)}
                          className="rounded-lg border border-red-400/50 bg-red-500/10 px-2 py-1.5 text-xs text-red-300 transition hover:bg-red-500/20"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </>
        )}
      </div>
    </AdminShell>
  );
}


