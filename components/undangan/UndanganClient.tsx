"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Account = {
  id?: string;
  type: "bank" | "wallet";
  label: string;
  no: string;
  name: string;
};

const defaultAccounts: Account[] = [
  { id: "bca", type: "bank", label: "BCA", no: "[NO. REKENING]", name: "[NAMA PEMILIK]" },
  { id: "bri", type: "bank", label: "BRI", no: "[NO. REKENING]", name: "[NAMA PEMILIK]" },
  { id: "mandiri", type: "bank", label: "Mandiri", no: "[NO. REKENING]", name: "[NAMA PEMILIK]" },
  { id: "bni", type: "bank", label: "BNI", no: "[NO. REKENING]", name: "[NAMA PEMILIK]" },
  { id: "bsi", type: "bank", label: "BSI", no: "[NO. REKENING]", name: "[NAMA PEMILIK]" },
  { id: "dana", type: "wallet", label: "DANA", no: "[NO. HP]", name: "[NAMA PEMILIK]" },
  { id: "ovo", type: "wallet", label: "OVO", no: "[NO. HP]", name: "[NAMA PEMILIK]" },
  { id: "gopay", type: "wallet", label: "GoPay", no: "[NO. HP]", name: "[NAMA PEMILIK]" },
];

const defaultTurutMengundang = [
  "Bpk. Sardi - Ibu Dariyah, Arahan Kidul",
  "Bpk. Salim - Ibu Sat, Bangkir Gg. Macan",
  "Bpk. Kusen, Alm. - Ibu Rofiah, Lobener Lor blok Masjid",
  "Bpk. H. Tanya, Karanggetas",
];

const defaultOrangBerbahagia = [
  {
    nama: "Bpk. KASTAM",
    keterangan: "Bin Bpk. Rekiwan, Alm. - Ibu Minah, Almh.\n(Telukagung)",
  },
  {
    nama: "Ibu SARINIH",
    keterangan: "Binti Bpk. Kartam, Alm. - Ibu Sari, Almh.\n(Rambatan Kulon-Bangkir)",
  },
];

type FloraVariant = "tl" | "tr" | "bl" | "br";

function Flora({ variant = "tl" }: { variant?: FloraVariant }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/flora-${variant}.png`}
      alt=""
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
    />
  );
}

// Komponen kelopak bunga berguguran (Canvas Particle Engine)
// Menggunakan HTML5 Canvas agar 100% mulus 60fps, tidak macet di pojok/CSS transform,
// dan otomatis menyebar proporsional di seluruh layar baik di HP maupun desktop.
function FallingPetals() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Aksesibilitas: hormati pengguna yang mematikan animasi
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Muat 3 varian kelopak bunga watercolor asli
    const images: HTMLImageElement[] = [];
    const sources = [
      "/images/petal-blue.png",
      "/images/petal-white.png",
      "/images/petal-lilac.png",
    ];
    sources.forEach((src) => {
      const img = new Image();
      img.src = src;
      images.push(img);
    });

    // 16 kelopak bunga dengan variasi ukuran, kecepatan, goyangan angin, & posisi
    const COUNT = 16;
    type Petal = {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      angle: number;
      angleSpeed: number;
      swaySpeed: number;
      swayDist: number;
      imgIndex: number;
      opacity: number;
    };

    const petals: Petal[] = [];
    for (let i = 0; i < COUNT; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height, // Langsung bertebaran di seluruh layar sejak awal buka
        size: 18 + Math.random() * 12, // 18px s/d 30px
        speedY: 0.8 + Math.random() * 1.2, // Jatuh lembut & anggun
        speedX: -0.2 + Math.random() * 0.4,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.02,
        swaySpeed: 0.012 + Math.random() * 0.015,
        swayDist: 0.6 + Math.random() * 0.9,
        imgIndex: i % 3,
        opacity: 0.65 + Math.random() * 0.25,
      });
    }

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.y += p.speedY;
        p.x += Math.sin(tick * p.swaySpeed + i) * p.swayDist + p.speedX;
        p.angle += p.angleSpeed;

        // Reset ke atas dengan posisi horizontal acak setelah lewat bawah layar
        if (p.y > height + 35) {
          p.y = -30;
          p.x = Math.random() * width;
        }
        if (p.x > width + 35) p.x = -25;
        if (p.x < -35) p.x = width + 25;

        const img = images[p.imgIndex];
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.globalAlpha = p.opacity;
          ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="falling-petals-canvas"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 10,
      }}
      aria-hidden="true"
    />
  );
}

function PictureIcon({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M21 16l-5-5-9 9" />
      </g>
    </svg>
  );
}

function PhotoFrame({ round = false, src }: { round?: boolean; src?: string }) {
  return (
    <div
      className={`frame${round ? " round" : ""}`}
      role="img"
      aria-label="Foto Dokumentasi"
    >
      <div className="ph">
        <PictureIcon size={round ? 30 : 34} />
        <span>{round ? "Foto" : "Pasang foto di sini"}</span>
      </div>
      {src && <img src={src} alt="" onError={(event) => event.currentTarget.remove()} />}
    </div>
  );
}

function parseTimeToSeconds(val?: string | number): number {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return val >= 0 ? val : 0;
  const s = String(val).trim();
  if (!s) return 0;
  if (s.includes(":")) {
    const parts = s.split(":");
    if (parts.length === 2) {
      const min = parseFloat(parts[0]) || 0;
      const sec = parseFloat(parts[1]) || 0;
      return Math.max(0, min * 60 + sec);
    }
    if (parts.length === 3) {
      const hr = parseFloat(parts[0]) || 0;
      const min = parseFloat(parts[1]) || 0;
      const sec = parseFloat(parts[2]) || 0;
      return Math.max(0, hr * 3600 + min * 60 + sec);
    }
  }
  const num = parseFloat(s);
  return !isNaN(num) && num >= 0 ? num : 0;
}

function MusicPlayer({
  src,
  startTime,
  endTime,
}: {
  src: string;
  title?: string;
  startTime?: string;
  endTime?: string;
}) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const startedRef = React.useRef(false);

  const startSec = React.useMemo(() => parseTimeToSeconds(startTime), [startTime]);
  const endSec = React.useMemo(() => parseTimeToSeconds(endTime), [endTime]);

  // Coba autoplay saat mount; jika diblokir browser, mulai pada interaksi pertama tamu.
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setStartPos = () => {
      if (startSec > 0 && Math.abs(audio.currentTime - startSec) > 1) {
        try {
          audio.currentTime = startSec;
        } catch {}
      }
    };

    const tryPlay = () => {
      if (startedRef.current) return;
      setStartPos();
      audio
        .play()
        .then(() => {
          startedRef.current = true;
          setStartPos();
        })
        .catch(() => {
          // Autoplay diblokir — tunggu gesture pertama tamu
        });
    };

    const onFirstGesture = () => {
      tryPlay();
    };

    // Saat pemutaran mencapai batas akhir yang diatur admin, loop kembali ke startSec
    const onTimeUpdate = () => {
      if (endSec > startSec && audio.currentTime >= endSec) {
        audio.currentTime = startSec;
        audio.play().catch(() => {});
      }
    };

    // Saat audio habis secara alami, loop kembali ke startSec
    const onEnded = () => {
      audio.currentTime = startSec;
      audio.play().catch(() => {});
    };

    if (audio.readyState >= 1) {
      setStartPos();
    }

    if (audio.readyState >= 3) {
      tryPlay();
    } else {
      audio.addEventListener("loadedmetadata", setStartPos, { once: true });
      audio.addEventListener("canplay", tryPlay, { once: true });
    }

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    document.addEventListener("click",      onFirstGesture, { once: true, capture: true });
    document.addEventListener("touchstart", onFirstGesture, { once: true, capture: true });
    document.addEventListener("keydown",    onFirstGesture, { once: true, capture: true });

    return () => {
      audio.removeEventListener("loadedmetadata", setStartPos);
      audio.removeEventListener("canplay", tryPlay);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      document.removeEventListener("click",      onFirstGesture, { capture: true });
      document.removeEventListener("touchstart", onFirstGesture, { capture: true });
      document.removeEventListener("keydown",    onFirstGesture, { capture: true });
    };
  }, [src, startSec, endSec]);

  return (
    <audio
      ref={audioRef}
      src={src}
      loop={endSec <= startSec}
      preload="auto"
      style={{ display: "none" }}
      aria-hidden="true"
    />
  );
}

type UndanganData = {
  slug?: string;
  nama_anak?: string;
  nama_orang_tua?: string;
  tanggal?: string | Date;
  jam?: string;
  lokasi?: string;
  foto_cover?: string;
  foto_acara?: string;
  maps_url?: string;
  hiburan?: string;
  turut_mengundang?: string[];
  orang_berbahagia?: Array<{ nama: string; keterangan: string }>;
  rekening?: Array<{ type: "bank" | "wallet"; label: string; no: string; name: string }>;
  ayat?: string;
  data_json?: {
    judul_sampul?: string;
    tanggal_sampul?: string;
    label_acara?: string;
    tempat_singkat?: string;
    hari_acara?: string;
    tanggal_acara?: string;
    jam_acara?: string;
    sekeluarga?: string;
    alamat_keluarga?: string;
    footer_text?: string;
    musik_url?: string;
    musik_judul?: string;
    musik_start?: string;
    musik_end?: string;
  };
};

export default function UndanganClient({
  data,
  guest: initialGuest,
}: {
  data?: UndanganData | null;
  guest?: string;
}) {
  const searchParams = useSearchParams();
  const guestParam = searchParams.get("to");
  const guestIdParam = searchParams.get("tid") || searchParams.get("tamu_id");
  const guest = guestParam || initialGuest || "[Nama Tamu]";

  const [section, setSection] = useState<1 | 2 | 3>(1);

  const goToSection = (nextStep: 1 | 2 | 3) => {
    setSection(nextStep);
    if (typeof window !== "undefined") {
      // Use requestAnimationFrame to ensure the new section has rendered before scrolling
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  const dj = data?.data_json || {};

  // Variabel teks yang terintegrasi penuh
  const judulSampul = dj.judul_sampul || "UNDANGAN";
  const tanggalSampul = dj.tanggal_sampul || "Rabu, 18 November 2026";
  const namaAnak = data?.nama_anak || "Zayyan Arkana Alfarizqi";
  const labelAcara = dj.label_acara || "Khitanan :";
  const hiburan = data?.hiburan || "Seni Reog Vikar Group";
  const tempatSingkat = dj.tempat_singkat || "Rambatan Kulon, November 2026";
  const hariAcara = dj.hari_acara || "Rabu malam Kamis";
  const tanggalAcara = dj.tanggal_acara || "18 – 19 November 2026";
  const jamAcara =
    dj.jam_acara ||
    (data?.jam ? `Pkl. ${String(data.jam).slice(0, 5)} Wib s/d Selesai` : "Pkl. 08.00 Wib s/d Selesai");
  const lokasi =
    data?.lokasi ||
    "Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01 blok Kangkung Kec. Lohbener Kab. Indramayu";
  const mapsUrl = data?.maps_url || "";
  const sekeluarga = dj.sekeluarga || "Sekeluarga";
  const alamatKeluarga =
    dj.alamat_keluarga ||
    "Desa Rambatan Kulon (Bangkir) Rt. 07 Rw. 01\nblok Kangkung Kec. Lohbener\nKab. Indramayu";
  const ayat =
    data?.ayat ||
    "Dizana zakaria memohon kepada Tuhannya ia berkata : Ya Tuhanku anugerahkanlah aku seorang anak yang baik dari sisimu, sesungguhnya engkau maha mendengar do'a";
  const footerText = dj.footer_text || "Terima kasih atas do'a restu Bapak/Ibu/Saudara/i";
  const musikUrl = (dj as Record<string, string>).musik_url || "";
  const musikJudul = (dj as Record<string, string>).musik_judul || "";
  const musikStart = (dj as Record<string, string>).musik_start || "";
  const musikEnd = (dj as Record<string, string>).musik_end || "";

  const rekeningData = data?.rekening;
  const accountList = useMemo<Account[]>(() => {
    if (rekeningData && Array.isArray(rekeningData) && rekeningData.length > 0) {
      return rekeningData.map((r, i) => ({
        id: `acc-${i}-${r.label.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        type: r.type,
        label: r.label,
        no: r.no,
        name: r.name,
      }));
    }
    return defaultAccounts;
  }, [rekeningData]);

  const [countdown, setCountdown] = useState({ days: "00", hours: "00", minutes: "00" });
  const [selectedId, setSelectedId] = useState(defaultAccounts[0].id);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  // Deteksi platform perangkat (SSR-safe, tanpa useEffect)
  const isIos = React.useSyncExternalStore(
    () => () => {},
    () => typeof window !== "undefined" && /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !/CriOS/.test(window.navigator.userAgent),
    () => false
  );
  const isAndroid = React.useSyncExternalStore(
    () => () => {},
    () => typeof window !== "undefined" && /Android/.test(window.navigator.userAgent),
    () => false
  );

  const activeSelectedId = accountList.some((a) => a.id === selectedId)
    ? selectedId
    : accountList[0]?.id || "bca";
  const selected = accountList.find((account) => account.id === activeSelectedId) ?? accountList[0];

  useEffect(() => {
    const tick = () => {
      let targetTime = new Date("2026-11-18T08:00:00+07:00").getTime();
      if (data?.tanggal && data?.jam) {
        try {
          const d = data.tanggal instanceof Date ? data.tanggal : new Date(data.tanggal);
          if (!isNaN(d.getTime())) {
            const dateStr = d.toISOString().slice(0, 10);
            const jamStr = String(data.jam).slice(0, 5);
            const customTime = new Date(`${dateStr}T${jamStr}:00+07:00`).getTime();
            if (!isNaN(customTime)) {
              targetTime = customTime;
            }
          }
        } catch {
          // fallback jika tanggal tidak dapat diparse
        }
      }
      const distance = Math.max(0, targetTime - Date.now());
      const pad = (value: number) => String(value).padStart(2, "0");
      setCountdown({
        days: pad(Math.floor(distance / 86400000)),
        hours: pad(Math.floor((distance % 86400000) / 3600000)),
        minutes: pad(Math.floor((distance % 3600000) / 60000)),
      });
    };
    tick();
    const timer = window.setInterval(tick, 30000);
    return () => window.clearInterval(timer);
  }, [data?.tanggal, data?.jam]);

  // Helper mendapatkan waktu acara yang presisi dan benar dalam zona waktu WIB (UTC+7)
  const getEventDates = () => {
    let dateObj = new Date("2026-11-18T08:00:00+07:00");
    if (data?.tanggal) {
      try {
        const d = data.tanggal instanceof Date ? data.tanggal : new Date(data.tanggal);
        if (!isNaN(d.getTime())) {
          const dateStr = d.toISOString().slice(0, 10);
          let jamStr = "08:00";
          if (data?.jam) {
            jamStr = String(data.jam).slice(0, 5);
          }
          const parsed = new Date(`${dateStr}T${jamStr}:00+07:00`);
          if (!isNaN(parsed.getTime())) {
            dateObj = parsed;
          }
        }
      } catch {}
    }
    const startUtc = new Date(dateObj.getTime());
    // Durasi acara default 5 jam
    const endUtc = new Date(dateObj.getTime() + 5 * 3600 * 1000);
    return { startUtc, endUtc };
  };

  const getGoogleCalendarUrl = () => {
    const { startUtc, endUtc } = getEventDates();
    const formatUtc = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const cleanTitle = `${labelAcara.replace(/:/g, "").trim()} ${namaAnak}`;
    const title = encodeURIComponent(cleanTitle);
    const dates = `${formatUtc(startUtc)}/${formatUtc(endUtc)}`;
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const details = encodeURIComponent(
      `Syukuran ${cleanTitle}\n\n` +
      `📍 Lokasi:\n${lokasi}\n\n` +
      (mapsUrl ? `🗺 Google Maps: ${mapsUrl}\n` : "") +
      (currentUrl ? `💌 Undangan Online: ${currentUrl}\n` : "") +
      `\nKami menantikan kehadiran dan do'a restu Bapak/Ibu/Saudara/i.`
    );
    const loc = encodeURIComponent(lokasi);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${loc}`;
  };

  const submitRsvp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    const form = new FormData(event.currentTarget);
    try {
      await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: data?.slug || "khitanan-zayyan-arkana-alfarizqi",
          tamuId: guestIdParam ? Number(guestIdParam) : null,
          nama: form.get("nama"),
          hadir: form.get("hadir"),
          ucapan: form.get("ucapan"),
        }),
      });
    } catch {
      // Abaikan bila offline/tanpa db
    }
  };

  const copyNumber = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.no);
    } finally {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const getWaConfirmTransferUrl = () => {
    if (!selected) return "https://api.whatsapp.com/send?phone=628976632321";
    const cleanLabelAcara = labelAcara.replace(/:/g, "").trim();
    const bankName = selected.type === "bank" ? `Bank ${selected.label}` : selected.label;
    const pengirim = guest && guest !== "[Nama Tamu]" ? guest : "Tamu Undangan";
    const msg =
      `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\n` +
      `Saya ingin konfirmasi bukti transfer tanda kasih untuk acara ${cleanLabelAcara} ananda *${namaAnak}*.\n\n` +
      `👤 *Nama Pengirim:* ${pengirim}\n` +
      `💳 *Tujuan Transfer:* ${bankName} (a.n. ${selected.name})\n\n` +
      `Berikut bukti transfer terlampir. Terima kasih.`;
    return `https://api.whatsapp.com/send?phone=628976632321&text=${encodeURIComponent(msg)}`;
  };

  const turutMengundangList = useMemo(() => {
    let list: unknown = data?.turut_mengundang;
    if (typeof list === "string") {
      try {
        list = JSON.parse(list);
      } catch {
        list = [];
      }
    }
    if (Array.isArray(list) && list.length > 0) {
      return list as string[];
    }
    return defaultTurutMengundang;
  }, [data]);

  const orangBerbahagiaList = useMemo(() => {
    let list: unknown = data?.orang_berbahagia;
    if (typeof list === "string") {
      try {
        list = JSON.parse(list);
      } catch {
        list = [];
      }
    }
    if (Array.isArray(list) && list.length > 0) {
      return list as Array<{ nama: string; keterangan: string }>;
    }
    if (data?.nama_orang_tua) {
      return [{ nama: data.nama_orang_tua, keterangan: "" }];
    }
    return defaultOrangBerbahagia;
  }, [data]);

  return (
    <>
      {/* Kelopak bunga berguguran — tampil di semua section */}
      <FallingPetals />

      {/* Musik latar — tampil di semua section jika tersedia */}
      {musikUrl && (
        <MusicPlayer
          src={musikUrl}
          title={musikJudul}
          startTime={musikStart}
          endTime={musikEnd}
        />
      )}

      {/* ========================================================
          1. SECTION COVER (Halaman Pembuka / Sampul)
          ======================================================== */}
      {section === 1 && (
        <header className="cover cover-fullscreen section-animate" id="sampul">
          <div className="flora cover-flora">
            <Flora variant="tr" />
          </div>
          <div className="wrap cover-wrap">
            <div className="left">
              <h1>{judulSampul}</h1>
              <p className="cover-date">{tanggalSampul}</p>
              <div className="art">
                <div className="plate" />
                <PhotoFrame src={data?.foto_cover} />
                <div className="flora f1">
                  <Flora variant="bl" />
                </div>
                <div className="flora f2">
                  <Flora variant="tr" />
                </div>
                <div
                  className="name script"
                  style={{
                    position: "absolute",
                    left: "128px",
                    top: "258px",
                    width: "194px",
                    textAlign: "left",
                    fontSize: "35px",
                    lineHeight: "1.1",
                  }}
                >
                  {namaAnak.split(" ").map((w, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: "block",
                        marginLeft:
                          idx === 1
                            ? "20px"
                            : idx === 2
                            ? "42px"
                            : idx > 2
                            ? `${42 + (idx - 2) * 18}px`
                            : "0px",
                        color: idx === 1 ? "#232a8c" : "var(--ink)",
                      }}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="guest-heading">Kepada Yth.</p>
              <p className="guest-title">Bapak/Ibu/Saudara/i,</p>
              <div className="guest" id="tamu">
                {guest}
              </div>
              <p className="small guest-note">Mohon Ma&apos;af bila salah dalam penulisan nama/gelar</p>
              <button
                type="button"
                className="btn open-button"
                onClick={() => goToSection(2)}
              >
                Buka Undangan
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ========================================================
          2. SECTION ACARA (Rundown, Lokasi, Do'a Restu & Orang Tua)
          ======================================================== */}
      {section === 2 && (
        <section id="acara" className="alt section-animate">
          {/* Bunga kanan atas section acara */}
          <div className="flora acara-flora-tr">
            <Flora variant="tr" />
          </div>
          {/* Bunga kiri bawah section acara */}
          <div className="flora acara-flora-bl">
            <Flora variant="bl" />
          </div>
          <div className="wrap wide">
            <div className="cols">
              <div>
                <PhotoFrame round src={data?.foto_acara} />
                <p className="khitan-label">{labelAcara}</p>
                <h2 className="couple script">{namaAnak}</h2>
                <div className="card countdown-card">
                  <p className="eyebrow countdown-title">Menuju Hari Acara</p>
                  <div className="count" aria-live="off">
                    <div>
                      <b>{countdown.days}</b>
                      <small>Hari</small>
                    </div>
                    <div>
                      <b>{countdown.hours}</b>
                      <small>Jam</small>
                    </div>
                    <div>
                      <b>{countdown.minutes}</b>
                      <small>Menit</small>
                    </div>
                  </div>
                </div>
                <p className="entertainment-label">Hiburan :</p>
                <p className="entertainment-name">” {hiburan} “</p>
              </div>
              <div>
                <p className="small place-date">{tempatSingkat}</p>
                <p className="salam">Assalamu&apos;allaikum Wr.Wb.</p>
                <p className="opening-copy">
                  Dengan memohon rahmat dan ridho Allah SWT. kami bermaksud menyelenggarakan syukuran
                  Khitanan anak kami, yang insya Allah akan dilaksanakan pada :
                </p>
                <dl className="card detail">
                  <div>
                    <dt>Hari</dt>
                    <dd>{hariAcara}</dd>
                  </div>
                  <div>
                    <dt>Tanggal</dt>
                    <dd>{tanggalAcara}</dd>
                  </div>
                  <div>
                    <dt>Waktu</dt>
                    <dd>{jamAcara}</dd>
                  </div>
                  <div>
                    <dt>Tempat</dt>
                    <dd>{lokasi}</dd>
                  </div>
                </dl>
                <div className="stack">
                  <a
                    className="btn"
                    href={mapsUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lihat Lokasi di Google Maps
                  </a>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => setShowCalendarModal(true)}
                  >
                    Simpan ke Kalender
                  </button>
                </div>
                <p className="honor-copy">
                  Merupakan suatu kehormatan dan kebahagiaan bagi kami, apabila Bapak/Ibu/Saudara/i,
                  berkenan hadir untuk memberikan do&apos;a restu
                </p>
                <p className="thanks-copy">
                  Atas kehadiran serta do`a restunya kami ucapkan terima kasih
                </p>
                <p className="closing-salam">Wassalamu&apos;allaikum Wr. Wb</p>

                {/* Daftar Tuan Rumah / Kami yang Berbahagia — terintegrasi dengan daftar orang_berbahagia di Admin */}
                <div className="hosts-list">
                  {orangBerbahagiaList.map((p, idx) => (
                    <div key={idx} className="host-item" style={{ marginTop: idx === 0 ? "16px" : "14px" }}>
                      <p className="parent-names" style={{ margin: 0 }}>
                        {p.nama}
                      </p>
                      {p.keterangan && (
                        <p
                          className="host-desc"
                          style={{
                            fontSize: "15px",
                            color: "var(--muted)",
                            marginTop: "4px",
                            lineHeight: 1.45,
                            whiteSpace: "pre-line",
                          }}
                        >
                          {p.keterangan}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <p className="family-closing">{sekeluarga}</p>
              </div>
            </div>

            {/* Tombol Selanjutnya menuju Section 3 */}
            <div className="nav-section-bar">
              <button
                type="button"
                className="btn"
                onClick={() => goToSection(3)}
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          3. SECTION KELUARGA, RSVP & AMPLOP DIGITAL
          ======================================================== */}
      {section === 3 && (
        <div className="section-animate">
          {/* Turut Mengundang & Kami yang Berbahagia */}
          <section id="keluarga">
            <div className="flora family-flora">
              <Flora variant="tl" />
            </div>
            <div className="wrap wide family-wrap">
              <div className="cols">
                <div>
                  <h2 className="eyebrow family-title">Turut Mengundang</h2>
                  <ol className="card list">
                    {turutMengundangList.map((item, idx) => (
                      <li key={idx}>
                        {item.startsWith(`${idx + 1}.`) ? item : `${idx + 1}. ${item}`}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h2 className="eyebrow family-title">Kami yang Berbahagia</h2>
                  {orangBerbahagiaList.map((p, idx) => (
                    <div
                      key={idx}
                      className={idx === 0 ? "parent first-parent" : "parent next-parent"}
                    >
                      <b>{p.nama}</b>
                      <p style={{ whiteSpace: "pre-line" }}>{p.keterangan}</p>
                    </div>
                  ))}
                  <div className="rule" />
                  <p className="family-address" style={{ whiteSpace: "pre-line" }}>
                    {alamatKeluarga}
                  </p>
                </div>
              </div>
              <p className="verse">” {ayat} ”</p>
            </div>
          </section>

          {/* Konfirmasi Kehadiran / RSVP */}
          <section id="rsvp" className="alt rsvp-section">
            <div className="wrap">
              <form className="card rsvp-form" onSubmit={submitRsvp}>
                <h2>Konfirmasi Kehadiran</h2>
                <label htmlFor="nama">Nama</label>
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  placeholder="Nama lengkap"
                  autoComplete="name"
                  required
                  defaultValue={guest !== "[Nama Tamu]" ? guest : ""}
                />
                <div className="radios" role="radiogroup" aria-label="Kehadiran">
                  <label>
                    <input type="radio" name="hadir" value="Hadir" defaultChecked />
                    Hadir
                  </label>
                  <label>
                    <input type="radio" name="hadir" value="Berhalangan" />
                    Berhalangan
                  </label>
                </div>
                <label htmlFor="ucapan">Ucapan dan do&apos;a</label>
                <textarea
                  id="ucapan"
                  name="ucapan"
                  placeholder={`Tulis ucapan dan do'a untuk ${namaAnak.split(" ")[0] || "Zayyan"}`}
                />
                <button className="btn" type="submit">
                  Kirim
                </button>
                {submitted && <p id="thanks">Terima kasih, konfirmasi Anda sudah tercatat.</p>}
              </form>
            </div>
          </section>

          {/* Amplop Digital */}
          <section id="amplop">
            <div className="wrap">
              <div className="ico">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </div>
              <h2 className="gift-title">Amplop Digital</h2>
              <div className="gift-rule" />
              <p>
                Do&apos;a restu Bapak/Ibu/Saudara/i adalah hadiah terbaik bagi kami. Bagi yang berkenan
                memberikan tanda kasih, dapat melalui rekening berikut:
              </p>
              <p className="eyebrow transfer-title">Pilih Transfer Melalui</p>
              <p className="account-type-title">Bank</p>
              <div className="chips">
                {accountList
                  .filter((item) => item.type === "bank")
                  .map((item) => (
                    <button
                      className="chip"
                      type="button"
                      key={item.id}
                      aria-pressed={selectedId === item.id}
                      onClick={() => setSelectedId(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
              <p className="account-type-title wallet-title">E-Wallet</p>
              <div className="chips">
                {accountList
                  .filter((item) => item.type === "wallet")
                  .map((item) => (
                    <button
                      className="chip"
                      type="button"
                      key={item.id}
                      aria-pressed={selectedId === item.id}
                      onClick={() => setSelectedId(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
              {selected && (
                <div className="acc" aria-live="polite">
                  <div className="flora">
                    <Flora variant="br" />
                  </div>
                  <div className="g">
                    <span>{selected.type === "bank" ? "Transfer Bank" : "E-Wallet"}</span>
                  </div>
                  <div className="l">
                    {selected.type === "bank" ? `Bank ${selected.label}` : selected.label}
                  </div>
                  <div className="n">{selected.no}</div>
                  <p className="account-owner">
                    a.n. <span>{selected.name}</span>
                  </p>
                  <button className="btn" type="button" onClick={copyNumber}>
                    {copied
                      ? "Tersalin"
                      : selected.type === "bank"
                        ? "Salin Nomor Rekening"
                        : "Salin Nomor"}
                  </button>
                  <a
                    href={getWaConfirmTransferUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-wa-confirm"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.19 8.19 0 01-5.82 2.41c-1.45 0-2.88-.38-4.14-1.11l-.3-.17-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.44c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.41.08-.17.04-.32-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.78 2.71 4.31 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.07-.1-.23-.17-.48-.29z" />
                    </svg>
                    <span>Konfirmasi Bukti Transfer</span>
                  </a>
                </div>
              )}
              <p className="small gift-note">
                Setelah mengirim, boleh memberi kabar melalui kolom ucapan di atas. Terima kasih atas
                kebaikan dan do&apos;a Bapak/Ibu/Saudara/i.
              </p>
            </div>
          </section>

          <footer>{footerText}</footer>
        </div>
      )}

      {/* Modal Pilihan Simpan ke Kalender */}
      {showCalendarModal && (
        <div
          className="calendar-modal-overlay"
          onClick={() => setShowCalendarModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-modal-title"
        >
          <div className="calendar-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h3 id="calendar-modal-title">Simpan Acara ke Kalender</h3>
              <button
                type="button"
                className="calendar-modal-close"
                onClick={() => setShowCalendarModal(false)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
            <p className="calendar-modal-desc">
              Pilih kalender yang biasa Anda gunakan agar tersimpan otomatis dan ada pengingat menjelang hari acara:
            </p>

            <div className="calendar-options">
              {/* Google Calendar — terbaik untuk Android & Desktop */}
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`cal-btn gcal-btn${!isIos ? " cal-btn-recommended" : ""}`}
                onClick={() => setShowCalendarModal(false)}
              >
                <span className="cal-icon" aria-hidden="true"></span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                    <strong>Google Calendar</strong>
                    {!isIos && <span className="cal-badge">{isAndroid ? "Direkomendasikan ✓" : "Direkomendasikan"}</span>}
                  </div>
                  <small>{isAndroid ? "Ketuk untuk buka langsung di Google Calendar" : "Cocok untuk HP Android & Laptop/PC"}</small>
                </div>
              </a>

              {/* Apple / ICS — terbaik untuk iPhone/iPad, bisa juga Outlook */}
              <a
                href={`/api/calendar/${data?.slug || "khitanan-zayyan-arkana-alfarizqi"}`}
                {...(!isIos ? { download: `undangan-${data?.slug || "khitanan-zayyan-arkana-alfarizqi"}.ics` } : {})}
                className={`cal-btn ics-btn${isIos ? " cal-btn-recommended" : ""}`}
                onClick={() => setShowCalendarModal(false)}
              >
                <span className="cal-icon" aria-hidden="true">{isIos ? "" : ""}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                    <strong>{isIos ? "Apple Calendar (iPhone/iPad)" : "Apple / Outlook Calendar"}</strong>
                    {isIos && <span className="cal-badge">Direkomendasikan ✓</span>}
                  </div>
                  <small>
                    {isIos
                      ? "Ketuk untuk langsung tambah ke Kalender iPhone dengan pengingat H-1 & 2 jam sebelum"
                      : "Untuk iPhone, iPad, atau Outlook — unduh file .ics lalu buka"}
                  </small>
                </div>
              </a>
            </div>

            <button
              type="button"
              className="calendar-cancel-btn"
              onClick={() => setShowCalendarModal(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </>
  );
}
