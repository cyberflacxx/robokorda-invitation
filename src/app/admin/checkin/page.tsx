"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminShell } from "@/components/admin/admin-shell";
import type { RSVPStatusType } from "@/lib/enums";

type Guest = {
  id: number;
  fullName: string;
  rsvpCode: string;
  rsvpStatus: RSVPStatusType;
  isCheckedIn?: boolean;
};

const STATUS_LABELS: Record<RSVPStatusType, string> = {
  PENDING: "Pending",
  ACCEPT: "Accepted",
  DECLINE: "Declined",
  MAYBE: "Maybe",
};

export default function AdminCheckinPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Guest | null>(null);
  const [qr, setQr] = useState<string>("");
  const [codeInput, setCodeInput] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/guests");
      const raw = await response.text();
      const body = raw ? JSON.parse(raw) : {};

      if (!response.ok) {
        toast.error(body.error || "Failed to load guests");
        setLoading(false);
        return;
      }

      setGuests(body.guests ?? []);
    } catch {
      toast.error("Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      void load();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const prepareQr = async (guest: Guest) => {
    setSelected(guest);
    const data = JSON.stringify({ guestId: guest.id, rsvpCode: guest.rsvpCode });
    const image = await QRCode.toDataURL(data);
    setQr(image);
  };

  const markCheckin = async (guest: Guest, providedCode?: string) => {
    if (guest.rsvpStatus !== "ACCEPT") {
      toast.error("Only accepted guests can be checked in");
      return;
    }

    const response = await fetch(`/api/admin/checkin/${guest.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rsvpCode: providedCode || guest.rsvpCode }),
    });
    const raw = await response.text();
    const body = raw ? JSON.parse(raw) : {};

    if (!response.ok) {
      toast.error(body.error || "Check-in failed");
      return;
    }

    toast.success(`${guest.fullName} checked in`);
    setCodeInput("");
    void load();
  };

  const undoCheckin = async (guest: Guest) => {
    const response = await fetch(`/api/admin/checkin/${guest.id}`, {
      method: "DELETE",
    });
    const raw = await response.text();
    const body = raw ? JSON.parse(raw) : {};

    if (!response.ok) {
      toast.error(body.error || "Undo check-in failed");
      return;
    }

    toast.success(`${guest.fullName} check-in removed`);
    void load();
  };

  const lookupByCode = guests.find((guest) => guest.rsvpCode.toLowerCase() === codeInput.toLowerCase());

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Check-In System</h1>
        <p className="text-sm opacity-80">Verify RSVP codes and prevent duplicate check-ins.</p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Code Check-In</h2>
          <div className="flex gap-2">
            <input className="input" placeholder="Enter RSVP code" value={codeInput} onChange={(event) => setCodeInput(event.target.value)} />
            <button
              type="button"
              onClick={() => {
                if (!lookupByCode) {
                  toast.error("Guest not found for this RSVP code");
                  return;
                }
                void markCheckin(lookupByCode, codeInput);
              }}
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-500"
            >
              Check-In
            </button>
          </div>
        </div>

        <div className="card text-center">
          <h2 className="mb-2 text-lg font-semibold">Guest QR Code</h2>
          {qr ? <img src={qr} alt="Guest QR code" className="mx-auto h-40 w-40" /> : <p className="text-sm opacity-70">Select guest to generate QR</p>}
          {selected && <p className="mt-2 text-sm">{selected.fullName}</p>}
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="h-6" />
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-brand-gold/20 text-left text-brand-gold">
                <th className="py-2 pr-3">Guest</th>
                <th className="py-2 pr-3">RSVP Code</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Check-In</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-b border-brand-gold/10">
                  <td className="py-3 pr-3">{guest.fullName}</td>
                  <td className="py-3 pr-3">{guest.rsvpCode}</td>
                  <td className="py-3 pr-3">{STATUS_LABELS[guest.rsvpStatus]}</td>
                  <td className="py-3 pr-3">{guest.isCheckedIn ? "Checked-In" : "Pending"}</td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-col items-start gap-2">
                      <button onClick={() => void prepareQr(guest)} className="rounded border border-brand-gold/30 px-2 py-1">QR</button>
                      <button
                        onClick={() => void markCheckin(guest)}
                        disabled={guest.isCheckedIn || guest.rsvpStatus !== "ACCEPT"}
                        className="rounded border border-green-400/70 bg-green-500/15 px-2 py-1 text-green-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Check-In
                      </button>
                      <button
                        onClick={() => void undoCheckin(guest)}
                        disabled={!guest.isCheckedIn}
                        className="rounded border border-amber-400/70 bg-amber-500/15 px-2 py-1 text-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Undo
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
