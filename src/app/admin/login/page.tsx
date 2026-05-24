"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@robokorda.com");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const body = await response.json();

    if (!response.ok) {
      toast.error(body.error || "Login failed");
      setLoading(false);
      return;
    }

    toast.success("Welcome back");
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d7b46a2a,transparent_50%),linear-gradient(150deg,#071324,#0E1E36_58%,#132a4a)]">
      <header className="sticky-top border-bottom border-secondary-subtle bg-white" style={{ boxShadow: "0 8px 24px rgba(11, 31, 58, 0.08)" }}>
        <div className="container d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle overflow-hidden"
              style={{ width: "48px", height: "48px", border: "1px solid #d9e2ec", backgroundColor: "#f8fafc" }}
            >
              <Image
                src="/robokorda-logo.png"
                alt="Robokorda Africa logo"
                width={42}
                height={42}
                priority
                style={{ objectFit: "contain" }}
              />
            </div>
            <span className="fs-5 fw-bold text-uppercase" style={{ color: "#0b1f3a" }}>Robokorda Africa</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Link href="/" className="text-decoration-none rk-nav-link" style={{ color: "#0b1f3a" }}>Home</Link>
            <Link href="/invite/sample-dambu-token" className="text-decoration-none rk-nav-link" style={{ color: "#0b1f3a" }}>Invite</Link>
          </div>
        </div>
      </header>

      <main className="d-flex align-items-center justify-content-center px-4 py-5" style={{ minHeight: "calc(100vh - 148px)" }}>
        <form onSubmit={onSubmit} className="w-100 rounded-3xl border border-brand-gold/30 bg-brand-black/70 p-8 text-brand-paper shadow-glow backdrop-blur" style={{ maxWidth: "420px" }}>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-brand-gold">Control Center</p>
          <h1 className="mb-2 text-3xl font-semibold text-brand-paper">Admin Login</h1>
          <p className="mb-6 text-sm text-brand-paper/80">Manage invitations and RSVPs securely.</p>

          <div className="mb-4">
            <label className="mb-2 block text-sm">Email</label>
            <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm">Password</label>
            <input className="input" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </main>

      <footer className="border-top border-secondary-subtle bg-white py-4">
        <div className="container d-flex flex-wrap justify-content-center align-items-center gap-3 text-center">
          <div className="small fw-semibold" style={{ color: "#0b1f3a" }}>
            Celebrating 10 Years of Robokorda Africa
          </div>
          <div className="small fw-semibold" style={{ color: "#0b1f3a" }}>
            Copyright &copy; {new Date().getFullYear()} Robokorda Africa. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
