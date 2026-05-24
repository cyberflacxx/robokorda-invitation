"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AdminShell } from "@/components/admin/admin-shell";

type EventTable = {
  id: number;
  tableName: string;
  capacity: number;
  reservedSeats: number;
  locationNote: string | null;
  isActive: boolean;
  guests: Array<{ id: number; fullName: string }>;
};

const defaults = {
  tableName: "",
  capacity: 8,
  locationNote: "",
  isActive: true,
};

async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    const raw = await response.text();
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<EventTable[]>([]);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/admin/tables", { cache: "no-store" });
    const body = await safeJson<{ tables?: EventTable[]; error?: string }>(response);
    if (response.ok) {
      setTables(body?.tables ?? []);
    } else {
      toast.error(body?.error || "Failed to load tables");
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      void load();
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const createTable = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await fetch("/api/admin/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await safeJson<{ table?: EventTable; error?: string }>(response);

    if (!response.ok) {
      toast.error(body?.error || "Failed to create table");
      return;
    }

    toast.success("Table created");
    setForm(defaults);
    void load();
  };

  const updateTable = async (table: EventTable) => {
    const response = await fetch(`/api/admin/tables/${table.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableName: table.tableName,
        capacity: table.capacity,
        locationNote: table.locationNote,
        isActive: table.isActive,
      }),
    });

    const body = await safeJson<{ table?: EventTable; error?: string }>(response);
    if (!response.ok) {
      toast.error(body?.error || "Failed to update table");
      return;
    }

    toast.success("Table updated");
    void load();
  };

  const deleteTable = async (id: number) => {
    if (!confirm("Delete this table?")) return;

    const response = await fetch(`/api/admin/tables/${id}`, { method: "DELETE" });
    const body = await safeJson<{ success?: boolean; error?: string }>(response);

    if (!response.ok) {
      toast.error(body?.error || "Failed to delete table");
      return;
    }

    toast.success("Table deleted");
    void load();
  };

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold md:text-3xl">Table Management</h1>
        <p className="text-sm opacity-80">Manage capacities and monitor assigned guests.</p>
      </div>

      <form onSubmit={createTable} className="card mb-6 grid gap-3 md:grid-cols-4">
        <input className="input" placeholder="Table name" value={form.tableName} onChange={(event) => setForm((state) => ({ ...state, tableName: event.target.value }))} required />
        <input className="input" type="number" min={1} placeholder="Capacity" value={form.capacity} onChange={(event) => setForm((state) => ({ ...state, capacity: Number(event.target.value) }))} required />
        <input className="input" placeholder="Location note" value={form.locationNote} onChange={(event) => setForm((state) => ({ ...state, locationNote: event.target.value }))} />
        <button type="submit" className="rounded-lg bg-brand-navy px-4 py-2 text-brand-paper w-full md:w-auto">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />Add Table
        </button>
      </form>

      <div className="space-y-4">
        {loading && <div className="h-6" />}
        {!loading && tables.length === 0 && <p className="card">No tables yet.</p>}
        {tables.map((table, index) => (
          <article key={table.id} className="card">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <input className="min-w-0 w-full bg-transparent text-lg sm:text-xl font-semibold outline-none" value={table.tableName} onChange={(event) => {
                const next = [...tables];
                next[index] = { ...table, tableName: event.target.value };
                setTables(next);
              }} />
              <div className="flex w-full gap-2 sm:w-auto sm:shrink-0">
                <button
                  type="button"
                  onClick={() => void updateTable(table)}
                  className="rounded border border-brand-gold/30 px-3 py-1 text-sm w-full sm:w-auto"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => void deleteTable(table.id)}
                  className="rounded border border-red-400/70 bg-red-500/10 px-3 py-1 text-sm text-red-200 w-11 sm:w-auto"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <input className="input" type="number" value={table.capacity} min={1} onChange={(event) => {
                const next = [...tables];
                next[index] = { ...table, capacity: Number(event.target.value) };
                setTables(next);
              }} />
              <input className="input" value={table.locationNote ?? ""} onChange={(event) => {
                const next = [...tables];
                next[index] = { ...table, locationNote: event.target.value };
                setTables(next);
              }} />
            </div>

            <p className="mt-3 text-sm">Seats reserved: {table.reservedSeats}/{table.capacity} (remaining {table.capacity - table.reservedSeats})</p>
            <p className="mt-1 text-xs opacity-70">Guests: {table.guests.map((guest) => guest.fullName).join(", ") || "None yet"}</p>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
