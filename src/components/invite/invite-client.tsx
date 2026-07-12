"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faTiktok } from "@fortawesome/free-brands-svg-icons";
import {
  faCalendarDays,
  faCheckCircle,
  faChevronDown,
  faClock,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { type RSVPStatusType } from "@/lib/enums";

type InvitePayload = {
  guest: {
    id: number;
    fullName: string;
    inviteToken: string;
    rsvpStatus: RSVPStatusType;
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
  { time: "17:00", title: "Guest Arrival & Networking", image: curatedImages.venue[0] },
  { time: "18:45", title: "Opening Remarks", image: curatedImages.venue[1] },
  { time: "19:30", title: "Anniversary Presentation", image: curatedImages.venue[2] },
  { time: "20:30", title: "Innovation Highlights", image: curatedImages.gallery[0] },
  { time: "21:15", title: "Celebration Toast", image: curatedImages.gallery[1] },
  { time: "22:00", title: "Closing Session", image: curatedImages.gallery[3] },
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

export function InviteClient({ token }: { token: string }) {
  const redirectUrl = "https://robokorda-africa.com";
  const currentYear = new Date().getFullYear();
  const [data, setData] = useState<InvitePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [countdown, setCountdown] = useState("00d 00h 00m 00s");
  const [shouldRedirectAfterSuccess, setShouldRedirectAfterSuccess] = useState(false);

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
      setLoading(false);
    };

    void fetchInvite();
  }, [token]);

  useEffect(() => {
    if (!data?.settings?.eventDate) return;
    const target = new Date(`${data.settings.eventDate.split("T")[0]}T${data.settings.eventTime || "17:00"}:00`);
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("Event is happening!");
        return;
      }
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

  useEffect(() => {
    if (!shouldRedirectAfterSuccess) return;

    // Redirect confirmed guests to the main Robokorda Africa website after RSVP success.
    const timer = window.setTimeout(() => {
      window.location.href = redirectUrl;
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [redirectUrl, shouldRedirectAfterSuccess]);

  const heroImage = useMemo(
    () => data?.gallery.find((img) => img.isHero)?.imageUrl || data?.settings?.heroImageUrl || curatedImages.hero,
    [data],
  );

  const submitRSVP = async (status: RSVPStatusType) => {
    setSubmitting(true);
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        status,
        notes,
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      toast.error(body.error || "Failed to submit RSVP");
      setSubmitting(false);
      return;
    }
    toast.success(status === "DECLINE" ? "RSVP updated." : "RSVP confirmed.");
    setSubmitting(false);
    setData((current) => current ? { ...current, guest: { ...current.guest, rsvpStatus: status } } : current);
    setShouldRedirectAfterSuccess(status === "ACCEPT");
  };

  if (loading) return <div className="min-h-screen bg-brand-ink" />;

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-ink">
        <div className="text-center">
          <p className="mb-4 text-4xl">Invitation</p>
          <p className="text-lg text-red-300">{error || "Invitation not found"}</p>
        </div>
      </div>
    );
  }

  const isSubmitted = data.guest.rsvpStatus !== "PENDING";
  const firstName = data.guest.fullName.split(" ")[0];

  return (
    <div className="bg-brand-ink text-brand-paper">
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
            Hi <span className="font-semibold text-brand-gold">{firstName}</span>, your invitation awaits.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-gold" />
              {countdown}
            </div>
            <a
              href="#rsvp"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-2.5 text-sm font-semibold text-brand-ink transition hover:brightness-110"
            >
              Confirm Attendance
            </a>
          </div>
        </div>
      </section>

      <section className="bg-brand-black/60 py-10 backdrop-blur">
        <div className="container">
          <div className="row g-3">
            {[
              { icon: faCalendarDays, label: "Date", value: new Date(data.settings?.eventDate ?? "2026-09-13").toDateString() },
              { icon: faClock, label: "Time", value: data.settings?.eventTime ?? "17:00" },
              { icon: faLocationDot, label: "Venue", value: data.settings?.venueName ?? "Manna Safari Lodge", sub: data.settings?.venueAddress ?? "Harare Zimbabwe" },
            ].map(({ icon, label, value, sub }) => (
              <div key={label} className="col-12 col-md-6 col-lg-4">
                <div className="d-flex align-items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <FontAwesomeIcon icon={icon} className="mt-1 text-lg text-brand-gold" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-brand-paper/50">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                    {sub && <p className="mt-0.5 text-xs text-brand-paper/60">{sub}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section id="venue" className="bg-brand-black/40 py-16">
        <div className="container">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-brand-gold">Location</p>
          <h2 className="mb-8 text-3xl font-semibold">Venue</h2>
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <img src={curatedImages.venue[2]} alt="Venue" className="h-64 w-full rounded-2xl border border-white/10 object-cover" />
              <p className="mt-4 text-lg font-semibold">{data.settings?.venueName ?? "Manna Safari Lodge"}</p>
              <p className="mt-1 text-sm text-brand-paper/70">{data.settings?.venueAddress ?? "Harare Zimbabwe"}</p>
            </div>
            <div className="col-12 col-lg-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="mb-3 text-xs uppercase tracking-widest text-brand-gold">Event Details</p>
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

      <section id="dress-code" className="py-16">
        <div className="container">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-brand-gold">Attire</p>
          <h2 className="mb-8 text-3xl font-semibold">Dress Code</h2>
          <div className="row g-4">
            {[dressGuides.ladies, dressGuides.males].map((guide) => (
              <div key={guide.title} className="col-12 col-lg-6">
                <article className="h-100 overflow-hidden rounded-2xl border border-white/10 bg-brand-black/40">
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

      <section id="rsvp" className="bg-brand-black/50 py-16">
        <div className="container">
          <div className="mx-auto" style={{ maxWidth: "980px" }}>
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-brand-gold">Confirm Attendance</p>
            <h2 className="mb-2 text-3xl font-semibold">RSVP</h2>
            <p className="mb-8 text-sm text-brand-paper/70">
              Confirm your attendance using your private invitation link.
            </p>

            {isSubmitted && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-400/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                {data.guest.rsvpStatus === "ACCEPT" ? "RSVP Confirmed" : `RSVP ${data.guest.rsvpStatus}`}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submitRSVP("ACCEPT");
              }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                <p className="text-xs uppercase tracking-wider text-brand-paper/60">Guest</p>
                <p className="mt-1 font-semibold">{data.guest.fullName}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-brand-paper/60">Message (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="input resize-none"
                  placeholder="Add a short note for the host"
                  disabled={isSubmitted}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting || isSubmitted}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : isSubmitted ? "RSVP Confirmed" : "Confirm Attendance"}
                </button>
                {!isSubmitted && (
                  <button
                    type="button"
                    onClick={() => void submitRSVP("DECLINE")}
                    disabled={submitting}
                    className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Decline Invitation
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

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
                ["Can I leave a message with my RSVP?", "Yes, you can add a short note in the RSVP message field."],
              ].map(([q, a]) => (
                <details key={q} className="group rounded-2xl border border-white/10 bg-brand-black/30 p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                    {q}
                    <FontAwesomeIcon icon={faChevronDown} className="text-xs text-brand-gold/60 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-sm text-brand-paper/70">{a}</p>
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
