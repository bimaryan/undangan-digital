"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconArrow, IconEye } from "./icons";

const inputClass =
  "h-auto! mt-0! w-full rounded-none! border-x-0! border-t-0! border-b border-[#161d33]/20! bg-transparent! px-0! pt-1! pb-2.5! font-['Inter']! text-[15px]! leading-6! font-normal! text-[#161d33]! outline-none transition placeholder:text-[#9b968b] focus:border-[#b95467]! [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#f4efe6] [&:-webkit-autofill]:[-webkit-text-fill-color:#161d33]";

const labelClass =
  "mb-2 mt-0! block text-[10.5px]! font-semibold! uppercase tracking-[0.16em] text-[#6f6a61]!";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";

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
    <main className="min-h-screen bg-[#f4efe6] font-['Inter'] text-[#161d33] antialiased">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-[#161d33] px-12 py-12 text-[#f4efe6] lg:flex lg:flex-col xl:px-16">
          <Image
            src="/images/flora-tl.png"
            alt=""
            width={300}
            height={300}
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -left-20 w-[300px] opacity-80"
          />
          <Image
            src="/images/flora-tl.png"
            alt=""
            width={340}
            height={340}
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -bottom-28 w-[340px] rotate-180 opacity-25"
          />

          <div className="relative z-10 flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-[#f4efe6] font-['Cormorant_Garamond'] text-xl italic leading-none text-[#161d33]">
              I
            </span>
            <span className="text-sm font-semibold tracking-[-0.01em]">InovaInvite</span>
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center py-12">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#f4efe6]/45">
              Undangan digital
            </p>
            <h2 className="mt-5 max-w-[430px] font-['Cormorant_Garamond'] text-[54px] font-medium leading-[0.96] tracking-[-0.01em] xl:text-[64px]">
              Untuk momen yang <em className="italic text-[#e6a6a1]">berarti</em>.
            </h2>
            <p className="mt-6 max-w-[320px] text-[14px] leading-[1.7] text-[#f4efe6]/60">
              Kelola undangan, tamu, dan konfirmasi kehadiran dalam satu tempat.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-[#f4efe6]/15 pt-5 text-[10px] uppercase tracking-[0.18em] text-[#f4efe6]/35">
            <span>InovaInvite</span>
            <span>Indramayu — Indonesia</span>
          </div>
        </aside>

        <div className="flex flex-col lg:flex-1 lg:justify-center">
          <div className="relative overflow-hidden bg-[#161d33] px-5 pt-5 pb-9 text-[#f4efe6] lg:hidden">
            <Image
              src="/images/flora-tl.png"
              alt=""
              width={200}
              height={200}
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -right-12 w-[200px] rotate-180 opacity-35"
            />
            <div className="relative z-10 flex items-center gap-3">
              <Link href="/" prefetch={false} className="inline-flex items-center gap-2.5 text-[#f4efe6] no-underline">
                <span className="grid size-7 place-items-center rounded-full bg-[#f4efe6] font-['Cormorant_Garamond'] text-[18px] italic leading-none text-[#161d33]">
                  I
                </span>
                <span className="text-sm font-semibold tracking-[-0.01em]">InovaInvite</span>
              </Link>
            </div>

            <div className="relative z-10 mt-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f4efe6]/40">
                Undangan digital
              </p>
              <h2 className="mt-3 max-w-[320px] font-['Cormorant_Garamond'] text-[34px] font-medium leading-[1.02] tracking-[-0.01em]">
                Untuk momen yang <em className="italic text-[#e6a6a1]">berarti</em>.
              </h2>
            </div>
          </div>

          <div className="flex flex-col px-5 sm:px-8 lg:flex-1 lg:px-12">
            <div className="flex flex-1 items-start justify-center py-8 lg:items-center lg:py-0">
              <div className="w-full max-w-[390px]">
                <h1 className="font-['Cormorant_Garamond'] text-[42px] font-medium leading-none tracking-[-0.01em] sm:text-[46px]">
                  Masuk
                </h1>
                <p className="mt-3 text-[13.5px] leading-[1.65] text-[#6f6a61]">
                  Masukkan email dan kata sandi untuk melanjutkan.
                </p>

                {error ? (
                  <div
                    role="alert"
                    className="mt-6 rounded-lg border border-[#b95467]/25 bg-[#b95467]/[0.07] px-4 py-3 text-[12.5px] leading-[1.5] text-[#8a3245]"
                  >
                    <span>{error}</span>
                  </div>
                ) : null}

                <form onSubmit={submit} className="mt-8" noValidate>
                  <div>
                    <label htmlFor="login-email" className={labelClass}>
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="nama@perusahaan.com"
                      autoComplete="username"
                      className={inputClass}
                    />
                  </div>

                  <div className="mt-6">
                    <label htmlFor="login-password" className={labelClass}>
                      Kata sandi
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Masukkan kata sandi"
                        autoComplete="current-password"
                        className={`${inputClass} [padding-right:2.25rem]!`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                        aria-pressed={showPassword}
                        className="absolute right-0 bottom-1.5 grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-[#8b877c] transition-colors hover:text-[#161d33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b95467]"
                      >
                        <IconEye off={showPassword} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-8 flex w-full cursor-pointer items-center justify-between gap-4 rounded-full border border-[#161d33] bg-[#161d33] px-6 py-4 font-['Inter'] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f4efe6] transition-colors hover:border-[#b95467] hover:bg-[#b95467] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b95467] disabled:cursor-wait disabled:opacity-60 [&>svg]:shrink-0 [&>svg]:transition-transform hover:[&>svg]:translate-x-1 motion-reduce:transition-none motion-reduce:[&>svg]:transition-none"
                  >
                    <span>{loading ? "Memeriksa akun…" : "Masuk"}</span>
                    {loading ? (
                      <span
                        className="size-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-[#f4efe6]/35 border-t-[#f4efe6] motion-reduce:[animation-duration:1.6s]"
                        aria-hidden="true"
                      />
                    ) : (
                      <IconArrow />
                    )}
                  </button>
                </form>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#161d33]/10 pt-5">
                  <Link
                    href="/"
                    prefetch={false}
                    className="w-fit text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#161d33] no-underline transition-colors hover:text-[#b95467] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b95467] motion-reduce:transition-none"
                  >
                    Kembali ke beranda
                  </Link>
                  <p className="text-[11.5px] text-[#9b968b]">
                    Belum punya akun?{" "}
                    <Link
                      href="/register"
                      prefetch={false}
                      className="font-semibold text-[#b95467] no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b95467]"
                    >
                      Daftar
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
