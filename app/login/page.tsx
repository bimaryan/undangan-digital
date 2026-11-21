"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, next }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.detail || data.error || "Gagal masuk. Periksa email dan kata sandi.");
        return;
      }

      router.replace(data.redirect || "/admin");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.leftPanel}>
        <div className={styles.orb} aria-hidden="true" />

        <div className={styles.brand}>
          <p className={styles.logo}>InovaInvite</p>
          <span className={styles.badge}>Ruang Redaksi · Admin</span>
        </div>

        <div className={styles.hero}>
          <p className={styles.eyebrow}>Edisi Malam · Khusus Pengelola</p>
          <h1 className={styles.title}>
            Kelola semuanya dari <em>satu meja</em> redaksi.
          </h1>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={`${styles.featureNumber} ${styles.pink}`}>01</span>
              <span className={styles.featureText}>Undangan dan tamu</span>
            </div>
            <div className={styles.feature}>
              <span className={`${styles.featureNumber} ${styles.cyan}`}>02</span>
              <span className={styles.featureText}>RSVP dan ucapan</span>
            </div>
            <div className={styles.feature}>
              <span className={`${styles.featureNumber} ${styles.amber}`}>03</span>
              <span className={styles.featureText}>Foto dan musik</span>
            </div>
          </div>
        </div>

        <svg
          viewBox="0 0 400 150"
          preserveAspectRatio="xMidYMax slice"
          aria-hidden="true"
          className={styles.skyline}
        >
          <defs>
            <pattern id="lw-cyan" width="14" height="16" patternUnits="userSpaceOnUse">
              <rect x="3" y="3" width="3" height="4" fill="#22E1FF" />
              <rect x="9" y="10" width="3" height="4" fill="#22E1FF" />
            </pattern>
            <pattern id="lw-pink" width="12" height="18" patternUnits="userSpaceOnUse">
              <rect x="3" y="4" width="3" height="4" fill="#FF3D9A" />
              <rect x="8" y="12" width="3" height="4" fill="#FF3D9A" />
            </pattern>
            <pattern id="lw-amber" width="16" height="14" patternUnits="userSpaceOnUse">
              <rect x="4" y="3" width="3" height="4" fill="#FFB020" />
              <rect x="10" y="9" width="3" height="4" fill="#FFB020" />
            </pattern>
          </defs>
          <rect x="0" y="62" width="40" height="88" fill="#10111B" />
          <rect x="0" y="62" width="40" height="88" fill="url(#lw-amber)" />
          <rect x="36" y="34" width="34" height="116" fill="#141521" />
          <rect x="36" y="34" width="34" height="116" fill="url(#lw-cyan)" />
          <rect x="70" y="80" width="30" height="70" fill="#10111B" />
          <rect x="70" y="80" width="30" height="70" fill="url(#lw-pink)" />
          <rect x="100" y="16" width="36" height="134" fill="#141521" />
          <rect x="100" y="16" width="36" height="134" fill="url(#lw-amber)" />
          <path d="M118 16V2" stroke="#FF3D9A" strokeWidth="1.5" />
          <circle cx="118" cy="2" r="2" fill="#FF3D9A" />
          <rect x="136" y="58" width="44" height="92" fill="#10111B" />
          <rect x="136" y="58" width="44" height="92" fill="url(#lw-cyan)" />
          <rect x="180" y="44" width="30" height="106" fill="#141521" />
          <rect x="180" y="44" width="30" height="106" fill="url(#lw-pink)" />
          <rect x="210" y="88" width="40" height="62" fill="#10111B" />
          <rect x="210" y="88" width="40" height="62" fill="url(#lw-amber)" />
          <rect x="250" y="24" width="34" height="126" fill="#141521" />
          <rect x="250" y="24" width="34" height="126" fill="url(#lw-cyan)" />
          <path d="M267 24V8" stroke="#22E1FF" strokeWidth="1.5" />
          <circle cx="267" cy="8" r="2" fill="#22E1FF" />
          <rect x="284" y="70" width="46" height="80" fill="#10111B" />
          <rect x="284" y="70" width="46" height="80" fill="url(#lw-pink)" />
          <rect x="330" y="42" width="32" height="108" fill="#141521" />
          <rect x="330" y="42" width="32" height="108" fill="url(#lw-amber)" />
          <rect x="362" y="80" width="38" height="70" fill="#10111B" />
          <rect x="362" y="80" width="38" height="70" fill="url(#lw-cyan)" />
        </svg>
      </div>

      <div className={styles.rightPanel}>
        <Link href="/" prefetch={false} className={styles.back}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
          Kembali ke situs
        </Link>

        <div className={styles.formArea}>
          <div className={styles.card}>
            <p className={styles.kicker}>Akses Pengelola</p>
            <h1 className={styles.cardTitle}>Masuk ke Ruang Redaksi</h1>
            <p className={styles.lead}>
              Halaman ini khusus pengelola. Pelanggan masuk lewat halaman utama.
            </p>

            {error ? (
              <div role="alert" className={styles.error}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF6B4A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={styles.errorIcon}
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16.5v.01" />
                </svg>
                <span>{error}</span>
              </div>
            ) : null}

            <form onSubmit={submit} noValidate>
              <label htmlFor="admin-email" className={styles.fieldLabel}>
                Email admin
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@email.com"
                autoComplete="username"
                className={styles.input}
              />

              <label htmlFor="admin-password" className={styles.fieldLabel}>
                Kata sandi
              </label>
              <div className={styles.passWrap}>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Kata sandi admin"
                  autoComplete="current-password"
                  className={`${styles.input} ${styles.passInput}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  aria-pressed={showPassword}
                  className={styles.eyeButton}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                      <path d="M9.9 5.2A9.5 9.5 0 0112 5c6.5 0 10 7 10 7a16 16 0 01-3 4.1" />
                      <path d="M6.6 6.6C3.6 8.6 2 12 2 12s3.5 7 10 7a9.6 9.6 0 004.2-.9" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              <div className={styles.row}>
                <label className={styles.remember} title="Belum tersedia">
                  <input type="checkbox" disabled className={styles.checkbox} />
                  Ingat perangkat ini
                </label>
                <span
                  className={styles.forgot}
                  aria-disabled="true"
                  title="Belum tersedia"
                >
                  Lupa kata sandi?
                </span>
              </div>

              <button type="submit" disabled={loading} className={styles.submit}>
                {loading ? "Memeriksa..." : "Masuk"}
              </button>
            </form>
          </div>
        </div>

        <p className={styles.copyright}>© 2026 InovaInvite · Akses khusus pengelola</p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0C0D14",
            color: "#A9A9BC",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
          }}
        >
          Memuat halaman login...
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
