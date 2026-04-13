/**
 * Sidebar — komponen navigasi samping untuk halaman user (muzakki).
 * Menampilkan menu: Dashboard, Zakat Profesi, Zakat Mal, Profile, dan Logout.
 * Mendukung mode responsif (hamburger menu untuk mobile).
 */
"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import apiClient from "../api/apiClient"
import "./sidebar.css"

export default function Sidebar() {
  // Mendapatkan path URL saat ini untuk menandai menu aktif
  const pathname = usePathname()
  // State untuk mengontrol buka/tutup sidebar di mobile
  const [open, setOpen] = useState(false)

  /**
   * Handler logout — mengirim request ke API lalu membersihkan localStorage.
   * Setelah logout, user di-redirect ke halaman login.
   */
  const handleLogout = async () => {
    try {
      // Kirim request logout ke backend untuk menghapus token di server
      await apiClient.post("/logout")
    } catch (err) {
      console.log(err)
    }
    // Hapus data autentikasi dari localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    // Redirect ke halaman login
    window.location.href = "/login"
  }

  // Fungsi helper untuk mengecek apakah menu sedang aktif berdasarkan URL
  const isActive = (href) => pathname === href

  return (
    <>
      {/* Mobile hamburger — tombol toggle sidebar untuk tampilan mobile */}
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
        {open ? "✕" : "☰"}
      </button>

      {/* Backdrop — overlay gelap saat sidebar mobile terbuka */}
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <div className={`sidebar ${open ? "open" : ""}`}>
        {/* Logo aplikasi ZakatKu */}
        <div className="sidebar-logo">
          <div className="logo-badge">
            Zakat<span>Ku</span>
          </div>
        </div>

        {/* Menu navigasi utama */}
        <div className="sidebar-section">
          <div className="sidebar-label">Menu Utama</div>
          {/* Link ke Dashboard */}
          <Link href="/user/dashboard" className={`sidebar-item ${isActive("/user/dashboard") ? "active" : ""}`} onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/>
            </svg>
            Dashboard
          </Link>
          {/* Link ke Kalkulator Zakat Profesi */}
          <Link href="/user/zakat-profesi" className={`sidebar-item ${isActive("/user/zakat-profesi") ? "active" : ""}`} onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-4 0v2M12 12v4M10 14h4"/>
            </svg>
            Zakat Profesi
          </Link>
          {/* Link ke Kalkulator Zakat Mal */}
          <Link href="/user/zakat-mal" className={`sidebar-item ${isActive("/user/zakat-mal") ? "active" : ""}`} onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Zakat Mal
          </Link>
          {/* Link ke halaman Profil User */}
          <Link href="/user/profile" className={`sidebar-item ${isActive("/user/profile") ? "active" : ""}`} onClick={() => setOpen(false)}>
            👤 Profile
          </Link>
        </div>

        {/* Footer sidebar — tombol Logout */}
        <div className="sidebar-footer">
          <button className="sidebar-item logout-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  )
}