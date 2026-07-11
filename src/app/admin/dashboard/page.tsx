"use client";

import { useEffect, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { AdminShell } from "@/components/admin/admin-shell";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const statCards = [
  { key: "totalInvited", label: "Total Invited" },
  { key: "accepted", label: "Accepted" },
  { key: "declined", label: "Declined" },
  { key: "maybe", label: "Maybe" },
  { key: "pending", label: "Pending" },
  { key: "checkedIn", label: "Checked-In" },
] as const;

type Stats = Record<(typeof statCards)[number]["key"], number>;
type StatsPayload = Stats & { degraded?: boolean };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string>("-");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/dashboard-stats", {
          cache: "no-store",
        });

        const raw = await response.text();
        const body = raw ? (JSON.parse(raw) as StatsPayload) : null;

        if (response.ok && body) {
          setStats(body);
          setUpdatedAt(new Date().toLocaleTimeString());
        } else {
          setStats(null);
        }
      } catch {
        setStats(null);
      }

      setLoading(false);
    };

    void load();
    const timer = setInterval(() => {
      void load();
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Dashboard Overview</h1>
        <p className="text-sm text-brand-paper/80">Live invitation and RSVP performance metrics.</p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-paper/10 px-3 py-1 text-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
          Auto-refresh every 10s | Last updated: {updatedAt}
        </div>
      </div>

      <section className="mb-6 overflow-hidden rounded-2xl border border-brand-gold/20 bg-brand-black/45">
        <div className="grid gap-4 p-4 md:grid-cols-[1.2fr_0.8fr] md:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-gold/85">Executive Panel</p>
            <h2 className="mt-2 text-2xl font-semibold">Real-time invitation operations</h2>
            <p className="mt-2 text-sm text-brand-paper/85">
              Built with live refresh and charted RSVP performance.
            </p>
          </div>
          <img
            src="/images/gallery/gallery-03.jpg"
            alt="Dashboard hero"
            className="h-36 w-full rounded-xl border border-brand-gold/30 object-cover md:h-32"
          />
        </div>
      </section>

      {loading && <div className="h-6" />}

      {!loading && !stats && <p className="text-red-300">Failed to load stats.</p>}

      {stats && (
        <>
          {stats.degraded && (
            <div className="mb-4 rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-4 py-3 text-sm">
              Showing fallback values. Database metrics are temporarily unavailable.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <article
                key={card.key}
                className="rounded-2xl border border-brand-gold/25 bg-brand-paper p-5 text-brand-ink shadow-soft"
              >
                <p className="text-sm">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold">{stats[card.key]}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-brand-gold/25 bg-brand-paper p-4 text-brand-ink">
              <h2 className="mb-3 text-lg font-semibold">RSVP Trend Snapshot</h2>
              <Bar
                data={{
                  labels: ["Accepted", "Declined", "Maybe", "Pending"],
                  datasets: [
                    {
                      label: "Guests",
                      data: [stats.accepted, stats.declined, stats.maybe, stats.pending],
                      backgroundColor: "rgba(14, 30, 54, 0.88)",
                      borderColor: "rgba(14, 30, 54, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: { color: "#0A172B" },
                      grid: { color: "rgba(14, 30, 54, 0.12)" },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { color: "#0A172B" },
                      grid: { color: "rgba(14, 30, 54, 0.12)" },
                    },
                  },
                }}
              />
            </article>

            <article className="rounded-2xl border border-brand-gold/25 bg-brand-paper p-4 text-brand-ink">
              <h2 className="mb-3 text-lg font-semibold">Operational Metrics</h2>
              <Bar
                data={{
                  labels: ["Checked-In", "Accepted", "Pending", "Total Invited"],
                  datasets: [
                    {
                      label: "Count",
                      data: [
                        stats.checkedIn,
                        stats.accepted,
                        stats.pending,
                        stats.totalInvited,
                      ],
                      backgroundColor: [
                        "rgba(14, 30, 54, 0.92)",
                        "rgba(14, 30, 54, 0.78)",
                        "rgba(14, 30, 54, 0.64)",
                        "rgba(14, 30, 54, 0.50)",
                      ],
                      borderColor: "rgba(14, 30, 54, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: { color: "#0A172B" },
                      grid: { color: "rgba(14, 30, 54, 0.12)" },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { color: "#0A172B" },
                      grid: { color: "rgba(14, 30, 54, 0.12)" },
                    },
                  },
                }}
              />
            </article>
          </div>
        </>
      )}
    </AdminShell>
  );
}
