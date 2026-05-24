import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faTiktok } from "@fortawesome/free-brands-svg-icons";
import { faCode, faRobot, faUsers } from "@fortawesome/free-solid-svg-icons";

const heroImage = "/images/hero/hero-main.jpg";

const galleryImages = [
  "/images/gallery/gallery-01.JPG",
  "/images/gallery/gallery-02.JPG",
  "/images/gallery/gallery-03.jpg",
  "/images/gallery/gallery-04.jpg",
  "/images/gallery/gallery-05.jpg",
  "/images/gallery/gallery-06.jpg",
  "/images/gallery/gallery-07.jpg",
  "/images/gallery/gallery-08.jpg",
  "/images/gallery/gallery-09.jpg",
];

const venueImages = [
  "/images/venue/venue-01.png",
  "/images/venue/venue-02.png",
  "/images/venue/venue-03.png",
];

export default function HomePage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-vh-100">
      <header
        className="sticky-top"
        style={{
          background: "rgba(255, 255, 255, 0.14)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.28)",
          boxShadow: "0 8px 24px rgba(11, 31, 58, 0.16)",
        }}
      >
        <div className="container py-0" style={{ minHeight: "72px" }}>
          <div className="d-flex flex-column gap-2 py-2">
            <div className="d-flex align-items-center gap-2">
              <img
                src="/robokorda-logo.png"
                alt="Robokorda Africa logo"
                className="rounded"
                style={{ width: "48px", height: "48px", objectFit: "contain" }}
              />
              <div className="fs-5 fw-bold text-uppercase text-white">Robokorda Africa</div>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <Link href="/invite/sample-dambu-token" className="btn btn-light btn-sm fw-semibold navbar-action-btn rk-top-btn">
                View Invite
              </Link>
              <Link href="/admin/login" className="btn btn-sm navbar-action-btn rk-top-btn">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-4 py-lg-5">
        <section className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="rk-surface position-relative overflow-hidden p-4 p-md-5" style={{ minHeight: "460px" }}>
              <img
                src={heroImage}
                alt="Robokorda Africa anniversary hero"
                className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
              />
              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ background: "linear-gradient(120deg, rgba(11,31,58,0.82), rgba(11,31,58,0.36))" }}
              />
              <div className="position-relative text-white d-flex flex-column h-100">
                <span className="badge rounded-pill text-bg-light text-dark align-self-start px-3 py-2">
                  Robokorda Africa • 10 Years
                </span>
                <h1 className="display-5 mt-3 mb-3">Celebrating a decade of joyful robotics and coding education</h1>
                <p className="mb-4" style={{ maxWidth: "48ch", color: "rgba(255,255,255,0.9)" }}>
                  From classrooms to communities, we have empowered learners with practical digital skills, confidence, and creative
                  problem-solving. This invitation platform marks the beginning of our next chapter.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="d-flex flex-column gap-4 h-100">
              <div className="rk-surface p-3">
                <img
                  src={heroImage}
                  alt="Students in robotics session"
                  className="w-100 rounded-4 object-fit-cover mb-3"
                  style={{ height: "210px" }}
                />
                <h2 className="h5 mb-2 text-dark">A Visual-First Experience</h2>
                <p className="small mb-0 text-secondary">
                  A modern invite journey inspired by current UI/UX landing patterns with cleaner hierarchy, stronger visuals, and
                  mobile-first responsiveness.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4">
          <div className="rk-surface p-4">
            <h2 className="h4 mb-3 text-dark">Impact Snapshot</h2>
            <div className="row g-4 text-dark">
              <div className="col-12 col-lg-4">
                <div className="d-flex align-items-start gap-3 h-100">
                  <FontAwesomeIcon icon={faRobot} className="mt-1" />
                  <div>
                    <div className="fw-semibold">Hands-on robotics programs</div>
                    <div className="small text-secondary">Project-based learning from beginner to advanced levels.</div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="d-flex align-items-start gap-3 h-100">
                  <FontAwesomeIcon icon={faCode} className="mt-1" />
                  <div>
                    <div className="fw-semibold">Coding made practical</div>
                    <div className="small text-secondary">Interactive tasks that build both skill and confidence.</div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="d-flex align-items-start gap-3 h-100">
                  <FontAwesomeIcon icon={faUsers} className="mt-1" />
                  <div>
                    <div className="fw-semibold">Communities empowered</div>
                    <div className="small text-secondary">Learners, mentors, and families growing together.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="row g-4 mt-1">
          <div className="col-12 col-lg-4">
            <article className="rk-glass-card p-4 h-100">
              <h2 className="h4 text-white mb-3">10 Years Anniversary</h2>
              <p className="small text-white mb-0" style={{ opacity: 0.9 }}>
                For ten years, Robokorda Africa has equipped young minds with practical innovation skills that go beyond the classroom.
                This celebration honors the discipline, consistency, and shared belief that technology education can transform futures.
              </p>
            </article>
          </div>
          <div className="col-12 col-lg-4">
            <article className="rk-glass-card p-4 h-100">
              <h2 className="h4 text-white mb-3">Robotics and Coding, Made Fun</h2>
              <p className="small text-white mb-0" style={{ opacity: 0.9 }}>
                Our model combines creativity, play, and real-world relevance so learners enjoy the process while still mastering core
                technical concepts. Each session is built to be engaging, memorable, and confidence-building for different age groups.
              </p>
            </article>
          </div>
          <div className="col-12 col-lg-4">
            <article className="rk-glass-card p-4 h-100">
              <h2 className="h4 text-white mb-3">Celebrating Lives Empowered</h2>
              <p className="small text-white mb-0" style={{ opacity: 0.9 }}>
                Behind every build is a story of growth: a learner discovering potential, a mentor shaping direction, and a family
                supporting the journey. This anniversary is a celebration of those stories and the impact they continue to create.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-4 mt-md-5">
          <h2 className="h3 text-white mb-3">Gallery</h2>
          <div className="row g-3 pb-4">
            {galleryImages.map((src, idx) => (
              <div key={src} className={`col-6 ${idx % 5 === 0 ? "col-lg-6" : "col-lg-3"}`}>
                <div className="rk-surface p-2">
                  <img
                    src={src}
                    alt={`Robokorda gallery image ${idx + 1}`}
                    className="w-100 rounded-4 object-fit-cover"
                    style={{ height: idx % 3 === 0 ? "250px" : "190px" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-4 pb-md-5">
          <h2 className="h3 text-white mb-3">Venue</h2>
          <div className="row g-3">
            {venueImages.map((src, idx) => (
              <div key={src} className="col-12 col-md-4">
                <div className="rk-surface p-2">
                  <img
                    src={src}
                    alt={`Robokorda venue image ${idx + 1}`}
                    className="w-100 rounded-4 object-fit-cover"
                    style={{ height: "220px" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

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
