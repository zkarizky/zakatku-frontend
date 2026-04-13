/**
 * SidebarAdmin — komponen navigasi samping untuk halaman admin.
 * Menampilkan menu: Dashboard, Kelola User, Data Zakat, dan Export Laporan.
 * Mendukung mode responsif (hamburger menu untuk mobile).
 * Termasuk fitur export data zakat per tahun dalam format Excel (.xls).
 */
"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import apiClient from "../api/apiClient"
import "./sidebar.css"

export default function SidebarAdmin() {
  // Mendapatkan path URL saat ini untuk menandai menu aktif
  const pathname = usePathname()
  // State untuk mengontrol buka/tutup sidebar di mobile
  const [open, setOpen] = useState(false)
  // State untuk menyimpan tahun yang dipilih pada fitur export (default: tahun ini)
  const [year, setYear] = useState(new Date().getFullYear())

  /**
   * Handler logout — mengirim request ke API lalu membersihkan localStorage.
   * Setelah logout, admin di-redirect ke halaman login.
   */
  const handleLogout = async () => {
    try {
      await apiClient.post("/logout")
    } catch (err) {
      console.log(err)
    }
    // Bersihkan token dan data user dari localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  /**
   * Handler export — mengunduh file Excel laporan zakat berdasarkan tahun.
   * Menggunakan responseType 'blob' agar response diperlakukan sebagai file binary.
   * File diunduh dengan nama "zakat-{tahun}.xls".
   */
  const handleExport = async () => {
  try {
    // Request file export dari backend dengan filter tahun
    const res = await apiClient.get(`/admin/export?year=${year}`, {
      responseType: "blob", // penting buat file — agar response jadi binary blob
    })

    // Buat URL temporary dari blob response
    const url = window.URL.createObjectURL(new Blob([res.data]))
    // Buat elemen <a> virtual untuk trigger download
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `zakat-${year}.xls`)
    document.body.appendChild(link)
    link.click() // Trigger download file
  } catch (err) {
    console.log(err)
    alert("Gagal export")
  }
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
        {/* LOGO aplikasi ZakatKu */}
        <div className="sidebar-logo">
          <div className="logo-badge">
            Zakat<span>Ku</span>
          </div>
        </div>

        {/* MENU navigasi admin */}
        <div className="sidebar-section">
          <div className="sidebar-label">Admin Panel</div>
          {/* Link ke Dashboard Admin (statistik overview) */}
          <Link href="/admin/dashboard" className={`sidebar-item ${isActive("/admin/dashboard") ? "active" : ""}`} onClick={() => setOpen(false)}>
            📊 Dashboard
          </Link>
          {/* Link ke halaman Kelola User (CRUD user) */}
          <Link href="/admin/users" className={`sidebar-item ${isActive("/admin/users") ? "active" : ""}`} onClick={() => setOpen(false)}>
            👤 Kelola User
          </Link>
          {/* Link ke halaman Data Zakat (riwayat pembayaran) */}
          <Link href="/admin/zakat" className={`sidebar-item ${isActive("/admin/zakat") ? "active" : ""}`} onClick={() => setOpen(false)}>
            💰 Data Zakat
          </Link>
        </div>

        {/* Seksi Laporan — fitur export data zakat per tahun */}
        <div className="sidebar-section">
            <div className="sidebar-label">Laporan</div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Dropdown pilihan tahun untuk export */}
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="sidebar-select"
              >
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Tombol trigger export file Excel */}
             <button
                className="sidebar-item"
                onClick={handleExport}
              >
                📤 Export Data {year}
              </button>
            </div>
          </div>

        {/* LOGOUT — tombol keluar dari akun admin */}
        <div className="sidebar-footer">
          <button className="sidebar-item logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  )
}