/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inovainvite.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InovaInvite - Undangan Digital Modern & Elegan",
    template: "%s | InovaInvite",
  },
  description:
    "Platform undangan digital modern, elegan, responsif, dan interaktif dengan integrasi WhatsApp, konfirmasi kehadiran (RSVP), dan kalender pengingat.",
  keywords: [
    "undangan digital",
    "undangan online",
    "undangan khitanan",
    "undangan pernikahan",
    "invitation website",
    "inovainvite",
  ],
  authors: [{ name: "InovaInvite" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "InovaInvite",
    title: "InovaInvite - Platform Undangan Digital Elegan",
    description:
      "Undangan digital interaktif dengan integrasi WhatsApp, konfirmasi kehadiran (RSVP), dan kemudahan pengelolaan tamu.",
    images: [
      {
        url: "/images/cover.jpg",
        width: 1200,
        height: 630,
        alt: "InovaInvite Digital Invitation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InovaInvite - Platform Undangan Digital Elegan",
    description: "Undangan digital interaktif dengan konfirmasi kehadiran dan pengelolaan tamu.",
    images: ["/images/cover.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=Pinyon+Script&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
