"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminShell } from "@/components/admin/admin-shell";

type Settings = {
  eventName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  dressCode: string;
  theme: string;
  heroImageUrl: string;
  lightModeLogoUrl: string;
  darkModeLogoUrl: string;
};

const defaults: Settings = {
  eventName: "Robokorda 10th Anniversary",
  eventDate: "2026-09-13",
  eventTime: "18:00",
  venueName: "Manna Safari Lodge",
  venueAddress: "Manna Safari Lodge",
  dressCode: "Formal / Corporate Elegant",
  theme: "Celebrating 10 Years of Innovation",
  heroImageUrl: "",
  lightModeLogoUrl: "",
  darkModeLogoUrl: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Settings>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const raw = await response.text();
        const body = raw ? JSON.parse(raw) : {};

        if (response.ok && body.settings) {
          setForm({
            ...defaults,
            ...body.settings,
            eventDate: body.settings.eventDate?.split("T")[0] ?? defaults.eventDate,
          });
        } else if (!response.ok) {
          toast.error(body.error || "Failed to load settings");
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const raw = await response.text();
      const body = raw ? JSON.parse(raw) : {};

      if (!response.ok) {
        toast.error(body.error || "Failed to save settings");
        return;
      }

      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Event Settings</h1>
        <p className="text-sm opacity-80">Update core event information and branding assets.</p>
      </div>

      {loading ? (
        <div className="h-6" />
      ) : (
        <form onSubmit={save} className="card grid gap-4 md:grid-cols-2">
          <input className="input" value={form.eventName} onChange={(event) => setForm((state) => ({ ...state, eventName: event.target.value }))} placeholder="Event name" required />
          <input className="input" type="date" value={form.eventDate} onChange={(event) => setForm((state) => ({ ...state, eventDate: event.target.value }))} required />
          <input className="input" value={form.eventTime} onChange={(event) => setForm((state) => ({ ...state, eventTime: event.target.value }))} placeholder="Event time" required />
          <input className="input" value={form.venueName} onChange={(event) => setForm((state) => ({ ...state, venueName: event.target.value }))} placeholder="Venue name" required />
          <input className="input md:col-span-2" value={form.venueAddress} onChange={(event) => setForm((state) => ({ ...state, venueAddress: event.target.value }))} placeholder="Venue address" required />
          <input className="input" value={form.dressCode} onChange={(event) => setForm((state) => ({ ...state, dressCode: event.target.value }))} placeholder="Dress code" />
          <input className="input" value={form.theme} onChange={(event) => setForm((state) => ({ ...state, theme: event.target.value }))} placeholder="Theme" />
          <input className="input md:col-span-2" value={form.heroImageUrl} onChange={(event) => setForm((state) => ({ ...state, heroImageUrl: event.target.value }))} placeholder="Hero image URL" />
          <input className="input" value={form.lightModeLogoUrl} onChange={(event) => setForm((state) => ({ ...state, lightModeLogoUrl: event.target.value }))} placeholder="Light logo URL" />
          <input className="input" value={form.darkModeLogoUrl} onChange={(event) => setForm((state) => ({ ...state, darkModeLogoUrl: event.target.value }))} placeholder="Dark logo URL" />

          <button type="submit" className="rounded-lg bg-brand-navy px-4 py-2 text-white md:col-span-2">Save Settings</button>
        </form>
      )}
    </AdminShell>
  );
}
