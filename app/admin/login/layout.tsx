/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login Admin",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,500;1,700&family=Bebas+Neue&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Inter:wght@500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
