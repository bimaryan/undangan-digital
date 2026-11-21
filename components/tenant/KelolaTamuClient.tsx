"use client";

import React from "react";
import KelolaClient, { type KelolaProps } from "@/components/kelola/KelolaClient";

/**
 * Komponen Kelola Tamu & RSVP khusus halaman client / tenant.
 * Terintegrasi penuh dengan layout dashboard client tanpa sidebar ganda.
 */
export default function KelolaTamuClient({
  initialSlug,
  access = "tenant",
  embedded = true,
}: KelolaProps) {
  return (
    <KelolaClient
      initialSlug={initialSlug}
      access={access}
      embedded={embedded}
    />
  );
}
