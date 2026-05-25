"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faTiktok } from "@fortawesome/free-brands-svg-icons";
import {
  faCalendarDays,
  faCheckCircle,
  faClock,
  faLocationDot,
  faPhone,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { RSVP_STATUSES, type RSVPStatusType } from "@/lib/enums";

type MealCourse = "STARTER" | "MAIN" | "DESSERT";

type MealItem = {
  id: number;
  name: string;
  description: string | null;
  course: MealCourse;
  category: string | null;
  imageUrl: string | null;
  availableQuantity: number;
  reservedQuantity: number;
  isActive: boolean;
};

type InvitePayload = {
  guest: {
    id: number;
    fullName: string;
    inviteToken: string;
    rsvpCode: string;
    rsvpStatus: RSVPStatusType;
    selectedStarterId: number | null;
    selectedMainId: number | null;
    selectedDessertId: number | null;
    selectedTableId: number | null;
  };
  settings: {
    eventName: string;
    eventDate: string;
    eventTime: string;
    venueName: string;
    venueAddress: string;
    dressCode: string | null;
    theme: string | null;
    heroImageUrl: string | null;
  } | null;
  meals: MealItem[];
  gallery: Array<{
    id: number;
    title: string;
    imageUrl: string;
    type: "HERO" | "GALLERY";
    isHero: boolean;
  }>;
};

const curatedImages = {
  hero: "/images/hero/hero-main.jpg",
  venue: [
    "/images/venue/venue-01.png",
    "/images/venue/venue-02.png",
    "/images/venue/venue-03.png",
  ],
  gallery: [
    "/images/gallery/gallery-01.JPG",
    "/images/gallery/gallery-02.JPG",
    "/images/gallery/gallery-03.jpg",
    "/images/gallery/gallery-04.jpg",
    "/images/gallery/gallery-05.jpg",
    "/images/gallery/gallery-06.jpg",
    "/images/gallery/gallery-07.jpg",
    "/images/gallery/gallery-08.jpg",
    "/images/gallery/gallery-09.jpg",
    "/images/hero/hero-main.jpg",
  ],
  dress: {
    ladies: [
      "/images/dress-code/ladies-01.png",
      "/images/dress-code/ladies-02.png",
    ],
    males: [
      "/images/dress-code/males-01.png",
      "/images/dress-code/males-02.png",
    ],
  },
};

const scheduleItems = [
  { time: "18:00", title: "Guest Arrival & Networking", image: curatedImages.venue[0] },
  { time: "18:45", title: "Opening Remarks",             image: curatedImages.venue[1] },
  { time: "19:30", title: "Dinner Service",              image: curatedImages.venue[2] },
  { time: "20:30", title: "Innovation Highlights",       image: curatedImages.gallery[0] },
  { time: "21:15", title: "Celebration Toast",           image: curatedImages.gallery[1] },
  { time: "22:00", title: "Closing Session",             image: curatedImages.gallery[3] },
];

const dressGuides = {
  ladies: {
    title: "Ladies",
    intro: "Elegant evening wear, long dress with heals, in jewel tones or classic neutrals.Any colour is allowed.",
    tip: "Floor-length gown, chic midi dress, or tailored jumpsuit with elegant heels.",
    samples: curatedImages.dress.ladies,
    helpName: "Event Styling Desk (Ladies)",
    helpPhone: "+263 774 189 500",
  },
  males: {
    title: "Gentlemen",
    intro: "Black Tie,Corporate formal with clean tailoring and sharp finishing. Mainly black and grey suits",
    tip: "Well-fitted suit or blazer with dress shirt, tie or pocket square.",
    samples: curatedImages.dress.males,
    helpName: "Event Styling Desk (Gents)",
    helpPhone: "+263 77 500 9390",
  },
};

const courseLabels: Record<MealCourse, string> = {
  STARTER: "Starter",
  MAIN: "Main Course",
  DESSERT: "Dessert",
};

function MealCard({
  meal,
  selected,
  onSelect,
  disabled,
  fallbackImage,
}: {
  meal: MealItem & { isAvailable: boolean };
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
  fallbackImage: string;
}) {
  const unavailable = !meal.isAvailable || disabled;

  return (
    <button
      type="button"
      onClick={unavailable ? undefined : onSelect}
      className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
        selected
          ? "border-brand-gold ring-2 ring-brand-gold/50"
          : unavailable
          ? "cursor-not-allowed border-brand-gold/10 opacity-50"
          : "cursor-pointer border-brand-gold/20 hover:border-brand-gold/50"
      }`}
    >
      <img
        src={meal.imageUrl || fallbackImage}
        alt={meal.name}
        className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
      />
      {selected && (
        <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold">
          <FontAwesomeIcon icon={faCheckCircle} className="text-sm text-brand-ink" />
        </div>
      )}
      {!meal.isAvailable && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-black/70">
          <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white">Fully Booked</span>
        </div>
      )}
      <div className="p-3">
        <p className="font-semibold leading-snug">{meal.name}</p>
        {meal.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-brand-paper/70">{meal.description}</p>
        )}
        <p className="mt-1 text-xs text-brand-gold">
          {meal.availableQuantity - meal.reservedQuantity} remaining
        </p>
      </div>
    </button>
  );
}

function CourseSection({
  course,
  meals,
  selectedId,
  onSelect,
  disabled,
  optional,
}: {
  course: MealCourse;
  meals: Array<MealItem & { isAvailable: boolean }>;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  disabled: boolean;
  optional: boolean;
}) {
  const [open, setOpen] = useState(true);
  const galleryPool = curatedImages.gallery;

  return (
    <div className="rounded-2xl border border-brand-gold/20 bg-brand-black/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold">{courseLabels[course]}</span>
          {optional && (
            <span className="rounded-full border border-brand-gold/30 px-2 py-0.5 text-xs text-brand-gold/70">
              optional
            </span>
          )}
          {selectedId && (
            <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-xs text-brand-gold">
              {meals.find((m) => m.id === selectedId)?.name}
            </span>
          )}
        </div>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="text-brand-gold/60 text-sm" />
      </button>

      {open && (
        <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
          {meals.length === 0 ? (
            <p className="text-sm text-brand-paper/60 col-span-full py-2">No {courseLabels[course].toLowerCase()} options available.</p>
          ) : (
            meals.map((meal, idx) => (
              <MealCard
                key={meal.id}
                meal={meal}
                selected={selectedId === meal.id}
                onSelect={() => onSelect(selectedId === meal.id ? null : meal.id)}
                disabled={disabled}
                fallbackImage={galleryPool[idx % galleryPool.length]}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function InviteClient({ token }: { token: string }) {
  const currentYear = new Date().getFullYear();
  const [data, setData] = useState<InvitePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [rsvpCode, setRsvpCode] = useState("");
  const [status, setStatus] = useState<RSVPStatusType>("ACCEPT");
  const [starterId, setStarterId] = useState<number | null>(null);
  const [mainId, setMainId] = useState<number | null>(null);
  const [dessertId, setDessertId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [countdown, setCountdown] = useState("00d 00h 00m 00s");

  useEffect(() => {
    const fetchInvite = async () => {
      const response = await fetch(`/api/invite/${token}`);
      if (!response.ok) {
        const body = await response.json();
        setError(body.error || "Invitation not found");
        setLoading(false);
        return;
      }
      const payload: InvitePayload = await response.json();
      setData(payload);
      setRsvpCode(payload.guest.rsvpCode);
      setStarterId(payload.guest.selectedStarterId);
      setMainId(payload.guest.selectedMainId);
      setDessertId(payload.guest.selectedDessertId);
      setStatus(payload.guest.rsvpStatus === "PENDING" ? "ACCEPT" : payload.guest.rsvpStatus);
      setLoading(false);
    };

    void fetchInvite();
  }, [token]);

  useEffect(() => {
    if (!data?.settings?.eventDate) return;
    const target = new Date(`${data.settings.eventDate.split("T")[0]}T${data.settings.eventTime || "18:00"}:00`);
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setCountdown("Event is happening!"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(`${String(d).padStart(2, "0")}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [data?.settings?.eventDate, data?.settings?.eventTime]);

  const heroImage = useMemo(
    () => data?.gallery.find((img) => img.isHero)?.imageUrl || data?.settings?.heroImageUrl || curatedImages.hero,
    [data],
  );

  const mealsByCourse = useMemo(() => {
    const raw = data?.meals ?? [];
    const withAvail = raw.map((m) => ({ ...m, isAvailable: m.reservedQuantity < m.availableQuantity }));
    return {
      STARTER: withAvail.filter((m) => m.course === "STARTER"),
      MAIN:    withAvail.filter((m) => m.course === "MAIN"),
      DESSERT: withAvail.filter((m) => m.course === "DESSERT"),
    };
  }, [data?.meals]);

  const submitRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        rsvpCode,
        status,
        starterId: status === "DECLINE" ? null : starterId,
        mainId:    status === "DECLINE" ? null : mainId,
        dessertId: status === "DECLINE" ? null : dessertId,
        notes,
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      toast.error(body.error || "Failed to submit RSVP");
      setSubmitting(false);
      return;
    }
    toast.success("RSVP submitted! We look forward to seeing you.");
    setSubmitting(false);
    setData((cur) => cur ? { ...cur, guest: { ...cur.guest, rsvpStatus: status } } : cur);
  };

  if (loading) return <div className="min-h-screen bg-brand-ink" />;

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-ink">
        <div className="text-center">
          <p className="text-4xl mb-4">Invitation</p>
          <p className="text-lg text-red-300">{error || "Invitation not found"}</p>
        </div>
      </div>
    );
  }

  const isSubmitted = data.guest.rsvpStatus !== "PENDING";
  const needsMeals = status === "ACCEPT" || status === "MAYBE";
  const firstName = data.guest.fullName.split(" ")[0];

  return (
    <div className="bg-brand-ink text-brand-paper">

      {/* Sticky nav */}
      <header
        className="fixed top-0 z-30 w-full"
        style={{
          background: "rgba(255, 255, 255, 0.14)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.28)",
          boxShadow: "0 8px 24px rgba(11, 31, 58, 0.16)",
        }}
      >
        <div className="container d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-2">
            <img
              src="/robokorda-logo.png"
              alt="Robokorda Africa logo"
              className="rounded"
              style={{ width: "36px", height: "36px", objectFit: "contain" }}
            />
            <span className="text-sm font-semibold tracking-widest text-brand-gold uppercase">
              Robokorda Africa
            </span>
          </div>
          <nav className="hidden items-center gap-5 text-xs font-medium tracking-wide uppercase text-brand-paper/70 md:flex">
            {["Schedule", "Venue", "Dress Code", "RSVP", "FAQ"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(" ", "-")}`}
                className="rk-nav-link transition hover:text-brand-gold"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        id="hero"
        className="relative flex min-h-screen items-end pt-16"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(11,31,58,0.3) 0%, rgba(11,31,58,0.85) 70%, #0B1F3A 100%), url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="container pb-5">
          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-brand-gold">
            Private Invitation
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
            {data.settings?.eventName ?? "Robokorda 10th Anniversary"}
          </h1>
          <p className="mt-5 text-xl text-brand-paper/85">
            Hi <span className="text-brand-gold font-semibold">{firstName}</span>, your invitation awaits.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
              {countdown}
            </div>
            <a
              href="#rsvp"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-2.5 text-sm font-semibold text-brand-ink transition hover:brightness-110"
            >
              Confirm Attendance</a>
          </div>
        </div>
      </section>

      {/* Quick info */}
      <section className="bg-brand-black/60 py-10 backdrop-blur">
        <div className="container">
          <div className="row g-3">
            {[
              { icon: faCalendarDays, label: "Date", value: new Date(data.settings?.eventDate ?? "2026-09-13").toDateString() },
              { icon: faClock, label: "Time", value: data.settings?.eventTime ?? "18:00" },
              { icon: faLocationDot, label: "Venue", value: "To be advised", sub: "To be advised" },
            ].map(({ icon, label, value, sub }) => (
              <div key={label} className="col-12 col-md-6 col-lg-4">
                <div className="d-flex align-items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <FontAwesomeIcon icon={icon} className="mt-1 text-brand-gold text-lg" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-brand-paper/50">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                    {sub && <p className="text-xs text-brand-paper/60 mt-0.5">{sub}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="py-16">
        <div className="container">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-brand-gold">Programme</p>
          <h2 className="mb-8 text-3xl font-semibold">Schedule</h2>
          <div className="row g-3">
            {scheduleItems.map((item) => (
              <div key={item.time} className="col-12 col-md-6 col-lg-4">
                <article className="group relative overflow-hidden rounded-2xl border border-white/10">
                  <img src={item.image} alt={item.title} className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-transparent" />
                  <div className="absolute bottom-0 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-gold/80">{item.time}</p>
                    <p className="mt-1 font-semibold">{item.title}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue */}
      <section id="venue" className="bg-brand-black/40 py-16">
        <div className="container">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-brand-gold">Location</p>
          <h2 className="mb-8 text-3xl font-semibold">Venue</h2>
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <img src={curatedImages.venue[2]} alt="Venue" className="h-64 w-full rounded-2xl object-cover border border-white/10" />
              <p className="mt-4 text-lg font-semibold">To be advised</p>
              <p className="mt-1 text-sm text-brand-paper/70">To be advised</p>
            </div>
            <div className="col-12 col-lg-6">
              <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-widest text-brand-gold mb-3">Event Details</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-brand-paper/60">Dress Code</span><span>{data.settings?.dressCode || "Formal"}</span></div>
                  <div className="flex justify-between"><span className="text-brand-paper/60">Theme</span><span>{data.settings?.theme || "-"}</span></div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dress code */}
      <section id="dress-code" className="py-16">
        <div className="container">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-brand-gold">Attire</p>
          <h2 className="mb-8 text-3xl font-semibold">Dress Code</h2>
          <div className="row g-4">
            {[dressGuides.ladies, dressGuides.males].map((guide) => (
              <div key={guide.title} className="col-12 col-lg-6">
                <article className="h-100 rounded-2xl border border-white/10 bg-brand-black/40 overflow-hidden">
                  <div className="row g-0">
                    {guide.samples.map((src, i) => (
                      <div key={i} className="col-6">
                        <img src={src} alt={`${guide.title} sample`} className="h-52 w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-brand-gold">{guide.title}</h3>
                    <p className="mt-1 text-sm text-brand-paper/80">{guide.intro}</p>
                    <p className="mt-2 text-sm text-brand-paper/70">{guide.tip}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <FontAwesomeIcon icon={faPhone} className="text-brand-gold" />
                      <span className="text-brand-paper/70">{guide.helpName}:</span>
                      <span className="text-brand-gold">{guide.helpPhone}</span>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp" className="bg-brand-black/50 py-16">
        <div className="container">
          <div className="mx-auto" style={{ maxWidth: "980px" }}>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-brand-gold">Confirm Attendance</p>
          <h2 className="mb-2 text-3xl font-semibold">RSVP</h2>
          <p className="mb-8 text-brand-paper/70 text-sm">
            Please confirm your attendance and select your preferences.
          </p>

          {isSubmitted && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-400/40 bg-green-500/10 px-4 py-3 text-green-200 text-sm">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
              Your RSVP has been submitted - status: <strong>{data.guest.rsvpStatus}</strong>
            </div>
          )}

          <form onSubmit={submitRSVP} className="space-y-6">
            {/* Code + response */}
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label htmlFor="rsvp-code" className="mb-1.5 block text-xs uppercase tracking-wider text-brand-paper/60">RSVP Code</label>
                <input
                  id="rsvp-code"
                  value={rsvpCode}
                  onChange={(e) => setRsvpCode(e.target.value)}
                  className="input"
                  placeholder="Your RSVP code"
                  required
                  disabled={isSubmitted}
                />
              </div>
              <div className="col-12 col-md-6">
                <label htmlFor="rsvp-status" className="mb-1.5 block text-xs uppercase tracking-wider text-brand-paper/60">Response</label>
                <select id="rsvp-status" title="RSVP Response" value={status} onChange={(e) => setStatus(e.target.value as RSVPStatusType)} className="input" disabled={isSubmitted}>
                  <option value={RSVP_STATUSES[1]}>Accept</option>
                  <option value={RSVP_STATUSES[2]}>Decline</option>
                  <option value={RSVP_STATUSES[3]}>Maybe</option>
                </select>
              </div>
            </div>

            {needsMeals && (
              <>
                {/* Menu selection per course */}
                <div>
                  <p className="mb-3 text-sm font-semibold">
                    Menu Selection{" "}
                    <span className="text-xs font-normal text-brand-paper/50">(starter & dessert optional)</span>
                  </p>
                  <div className="space-y-4">
                    {(["STARTER", "MAIN", "DESSERT"] as MealCourse[]).map((course) => (
                      <CourseSection
                        key={course}
                        course={course}
                        meals={mealsByCourse[course]}
                        selectedId={course === "STARTER" ? starterId : course === "MAIN" ? mainId : dessertId}
                        onSelect={(id) => {
                          if (course === "STARTER") setStarterId(id);
                          else if (course === "MAIN") setMainId(id);
                          else setDessertId(id);
                        }}
                        disabled={isSubmitted}
                        optional={course !== "MAIN"}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-brand-paper/60">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="Dietary requirements, allergies, or anything else we should know"
                disabled={isSubmitted}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || isSubmitted}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : isSubmitted ? "RSVP Submitted" : "Confirm RSVP"}
            </button>
          </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-brand-black/40 py-16">
        <div className="container">
          <div className="mx-auto" style={{ maxWidth: "900px" }}>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-brand-gold">Questions</p>
          <h2 className="mb-8 text-3xl font-semibold">FAQ</h2>
          <div className="space-y-3">
            {[
              ["Can I update my RSVP?", "Please contact the host if your availability changes after submission."],
              ["Can I bring a plus one?", "This event is by personalised invitation only."],
              ["Is parking available?", "Yes, dedicated guest parking is available at the venue."],
              ["What if I have dietary restrictions?", "Please note any requirements in the RSVP notes field."],
            ].map(([q, a]) => (
              <details key={q} className="group rounded-2xl border border-white/10 bg-brand-black/30 p-5">
                <summary className="cursor-pointer list-none font-semibold text-sm flex items-center justify-between">
                  {q}
                  <FontAwesomeIcon icon={faChevronDown} className="text-brand-gold/60 text-xs transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-brand-paper/70 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
          </div>
        </div>
      </section>

      <footer className="border-top border-secondary-subtle bg-white py-4">
        <div className="container rk-footer-bar">
          <div className="d-flex align-items-center gap-3">
            <a
              href="https://www.tiktok.com/@robokorda.africa"
              target="_blank"
              rel="noreferrer"
              aria-label="Robokorda Africa on TikTok"
              className="rk-social-link"
            >
              <FontAwesomeIcon icon={faTiktok} />
            </a>
            <a
              href="https://www.instagram.com/robokorda_africa?igsh=Z2I4aDUwYTFpaTlo"
              target="_blank"
              rel="noreferrer"
              aria-label="Robokorda Africa on Instagram"
              className="rk-social-link"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a
              href="https://www.facebook.com/people/RoboKorda-Africa/61562540085696/"
              target="_blank"
              rel="noreferrer"
              aria-label="Robokorda Africa on Facebook"
              className="rk-social-link"
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
          </div>
          <div className="small fw-semibold rk-footer-copy" style={{ color: "#0b1f3a" }}>
            Celebrating 10 Years of Robokorda Africa
          </div>
          <div className="small fw-semibold rk-footer-copy" style={{ color: "#0b1f3a" }}>
            Copyright &copy; {currentYear} Robokorda Africa. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
