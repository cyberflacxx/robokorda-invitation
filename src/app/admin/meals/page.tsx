"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";
import { AdminShell } from "@/components/admin/admin-shell";

type MealCourse = "STARTER" | "MAIN" | "DESSERT";

const COURSE_LABELS: Record<MealCourse, string> = {
  STARTER: "Starter",
  MAIN: "Main Course",
  DESSERT: "Dessert",
};

const COURSE_COLORS: Record<MealCourse, string> = {
  STARTER: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  MAIN:    "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
  DESSERT: "bg-pink-500/15 text-pink-300 border-pink-400/30",
};

type Meal = {
  id: number;
  name: string;
  description: string | null;
  course: MealCourse;
  category: string | null;
  imageUrl: string | null;
  availableQuantity: number;
  reservedQuantity: number;
  isActive: boolean;
  starterGuests: Array<{ id: number; fullName: string }>;
  mainGuests:    Array<{ id: number; fullName: string }>;
  dessertGuests: Array<{ id: number; fullName: string }>;
};

const formDefaults = {
  name: "",
  description: "",
  course: "MAIN" as MealCourse,
  category: "",
  imageUrl: "",
  availableQuantity: 10,
  isActive: true,
};

export default function AdminMealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(formDefaults);

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/admin/meals");
    const body = await response.json();
    if (response.ok) {
      setMeals(body.meals);
    } else {
      toast.error(body.error || "Failed to fetch meals");
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 12000);
    return () => clearInterval(timer);
  }, []);

  const createMeal = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/admin/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await response.json();
    if (!response.ok) {
      toast.error(body.error || "Failed to create meal");
      return;
    }
    toast.success("Meal created");
    setForm(formDefaults);
    void load();
  };

  const deleteMeal = async (id: number) => {
    if (!confirm("Delete this meal?")) return;
    const response = await fetch(`/api/admin/meals/${id}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) {
      toast.error(body.error || "Failed to delete meal");
      return;
    }
    toast.success("Meal deleted");
    void load();
  };

  const updateMeal = async (meal: Meal) => {
    const response = await fetch(`/api/admin/meals/${meal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: meal.name,
        description: meal.description,
        course: meal.course,
        category: meal.category,
        imageUrl: meal.imageUrl,
        availableQuantity: meal.availableQuantity,
        isActive: meal.isActive,
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      toast.error(body.error || "Update failed");
      return;
    }
    toast.success("Meal updated");
    void load();
  };

  const grouped = (["STARTER", "MAIN", "DESSERT"] as MealCourse[]).map((course) => ({
    course,
    items: meals.filter((m) => m.course === course),
  }));

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Meal Management</h1>
        <p className="mt-1 text-sm text-brand-paper/70">
          Add meals per course (Starter, Main, Dessert). Guests select one per course when RSVPing.
        </p>
      </div>

      {/* Create form */}
      <form onSubmit={createMeal} className="card mb-8 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FontAwesomeIcon icon={faPlus} className="text-brand-gold" />
          Add Meal
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="input"
            placeholder="Meal name *"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            required
          />

          <div>
            <select
              title="Course"
              className="input"
              value={form.course}
              onChange={(e) => setForm((s) => ({ ...s, course: e.target.value as MealCourse }))}
            >
              <option value="STARTER">Starter</option>
              <option value="MAIN">Main Course</option>
              <option value="DESSERT">Dessert</option>
            </select>
          </div>

          <input
            className="input"
            placeholder="Category (e.g. Beef, Vegetarian)"
            value={form.category}
            onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
          />

          <input
            className="input"
            type="number"
            min={1}
            placeholder="Available qty"
            value={form.availableQuantity}
            onChange={(e) => setForm((s) => ({ ...s, availableQuantity: Number(e.target.value) }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className="input"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))}
          />
        </div>

        <button type="submit" className="btn-primary gap-2">
          <FontAwesomeIcon icon={faPlus} />
          Add Meal
        </button>
      </form>

      {/* Meals grouped by course */}
      {loading && <div className="h-10 animate-pulse rounded-xl bg-brand-paper/5" />}

      {!loading && (
        <div className="space-y-8">
          {grouped.map(({ course, items }) => (
            <section key={course}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-xl font-semibold">{COURSE_LABELS[course]}</h2>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${COURSE_COLORS[course]}`}>
                  {items.length} option{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {items.length === 0 ? (
                <p className="card py-4 text-center text-sm text-brand-paper/60">
                  No {COURSE_LABELS[course].toLowerCase()} options yet.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((meal, index) => {
                    const allGuests = [
                      ...meal.starterGuests,
                      ...meal.mainGuests,
                      ...meal.dessertGuests,
                    ];
                    return (
                      <article key={meal.id} className="card flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <input
                              className="w-full bg-transparent text-base font-semibold outline-none"
                              title="Meal name"
                              value={meal.name}
                              onChange={(e) => {
                                const next = [...meals];
                                const i = next.findIndex((m) => m.id === meal.id);
                                next[i] = { ...meal, name: e.target.value };
                                setMeals(next);
                              }}
                            />
                            <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs ${COURSE_COLORS[meal.course]}`}>
                              {COURSE_LABELS[meal.course]}
                            </span>
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            <button
                              type="button"
                              onClick={() => void updateMeal(meal)}
                              className="rounded-lg border border-brand-gold/30 px-2.5 py-1.5 text-xs transition hover:bg-brand-gold/10"
                              title="Save changes"
                            >
                              <FontAwesomeIcon icon={faSave} />
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteMeal(meal.id)}
                              className="rounded-lg border border-red-400/50 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 transition hover:bg-red-500/20"
                              title="Delete meal"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="input text-sm"
                            placeholder="Description"
                            title="Description"
                            value={meal.description ?? ""}
                            onChange={(e) => {
                              const next = [...meals];
                              const i = next.findIndex((m) => m.id === meal.id);
                              next[i] = { ...meal, description: e.target.value };
                              setMeals(next);
                            }}
                          />
                          <input
                            className="input text-sm"
                            type="number"
                            min={1}
                            placeholder="Available qty"
                            title="Available quantity"
                            value={meal.availableQuantity}
                            onChange={(e) => {
                              const next = [...meals];
                              const i = next.findIndex((m) => m.id === meal.id);
                              next[i] = { ...meal, availableQuantity: Number(e.target.value) };
                              setMeals(next);
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-brand-paper/60">
                            Reserved: <span className="font-semibold text-brand-gold">{meal.reservedQuantity}</span> / {meal.availableQuantity}
                          </span>
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-brand-paper/10">
                            <div
                              className="meal-fill-bar h-full rounded-full bg-brand-gold transition-all"
                              style={{ "--meal-fill": `${Math.min(100, (meal.reservedQuantity / meal.availableQuantity) * 100)}%` } as React.CSSProperties}
                            />
                          </div>
                        </div>

                        {allGuests.length > 0 && (
                          <p className="text-xs text-brand-paper/50">
                            Selected by: {allGuests.map((g) => g.fullName).join(", ")}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
