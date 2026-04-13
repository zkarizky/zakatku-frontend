/**
 * RootLayout — layout utama aplikasi Next.js.
 * Komponen ini membungkus seluruh halaman dan menyediakan:
 * - Konfigurasi font (Geist Sans & Geist Mono)
 * - Meta title & description untuk SEO
 * - Viewport settings untuk responsivitas mobile
 * - Script Midtrans SNAP untuk integrasi payment gateway
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

// Inisialisasi font Geist Sans sebagai font utama (variabel CSS)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Inisialisasi font Geist Mono untuk elemen monospace (variabel CSS)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata SEO — title dan description halaman
export const metadata: Metadata = {
  title: "ZakatKu",
  description: "Aplikasi Penghitungan Zakat",
};

// Konfigurasi viewport — mencegah zoom berlebih di mobile
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

/**
 * Komponen layout root yang membungkus semua halaman.
 * Menyertakan font classes dan script Midtrans SNAP (sandbox mode).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Render halaman anak (semua route) */}
        {children}
        {/* Script Midtrans SNAP — diload secara global agar window.snap tersedia di semua halaman */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key="Mid-client-yF2UyP4Lvf6JAJLe">
        </Script>
      </body>
    </html>
  );
}
