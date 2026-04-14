/**
 * AdminDashboard — halaman dashboard utama panel admin.
 * Menampilkan statistik ringkasan sistem:
 * - Total user terdaftar
 * - Total zakat terkumpul (settlement)
 * - Total transaksi/penghitungan
 * 
 * Juga menampilkan quick-link ke halaman Kelola User dan Data Zakat.
 */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import apiClient from "../../api/apiClient"
import "./admindashboard.css"
import AdminSidebar from "../../components/SidebarAdmin"

// Fungsi utilitas format angka ke format Indonesia
const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

  
// ── Main Page ──────────────────────────────────────────────
export default function AdminDashboard() {
  // State menyimpan data statistik dari API admin
  const [data, setData] = useState({})
  // State loading indicator
  const [loading, setLoading] = useState(true)

  /**
   * Mengambil data statistik dashboard admin saat komponen dimuat.
   * Endpoint: GET /admin/dashboard
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get("/admin/dashboard")
        setData(res.data)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Tampilkan loading indicator saat data belum siap
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#4A7C2F" }}>
      <p>Memuat data...</p>
    </div>
  )

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar navigasi admin */}
      <AdminSidebar />

      <main className="ad-main">
        {/* Top Bar — judul halaman dan badge role */}
        <div className="ad-topbar">
          <div>
            <small className="ad-breadcrumb">Admin Panel</small>
            <h1 className="ad-title">Dashboard</h1>
          </div>
          <div className="ad-topbar-right">
            {/* Badge Administrator */}
            <div className="ad-admin-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Administrator
            </div>
          </div>
        </div>

        {/* Stats Cards — kartu statistik utama */}
        <div className="ad-cards">
          {/* Card: Total User terdaftar */}
          <div className="ad-card green">
            <div className="ad-card-top">
              <div className="ad-card-icon green-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <span className="ad-card-label">Total User</span>
            </div>
            <div className="ad-card-value">{fmt(data.total_user)}</div>
            <div className="ad-card-sub">Pengguna terdaftar</div>
          </div>

          {/* Card: Total Zakat terkumpul (settlement saja) */}
          <div className="ad-card gold">
            <div className="ad-card-top">
              <div className="ad-card-icon gold-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
              </div>
              <span className="ad-card-label">Total Zakat</span>
            </div>
            <div className="ad-card-value">Rp {fmt(data.total_zakat)}</div>
            <div className="ad-card-sub">Total Zakat Terkumpul</div>
          </div>

          {/* Card: Total Penghitungan/Transaksi */}
          <div className="ad-card blue">
            <div className="ad-card-top">
              <div className="ad-card-icon blue-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
              </div>
              <span className="ad-card-label">Total Pelaksanaan</span>
            </div>
            <div className="ad-card-value">{fmt(data.total_transaksi)}</div>
            <div className="ad-card-sub">Perhitungan zakat</div>
          </div>
        </div>

        {/* Quick Links — akses cepat ke fitur admin lainnya */}
        <div className="ad-quick-title">Aksi Cepat</div>
        <div className="ad-quick-row">
          {/* Link ke halaman Kelola User */}
          <Link href="/admin/users" className="ad-quick-card">
            <div className="ad-quick-icon">👥</div>
            <div className="ad-quick-text">
              <div className="ad-quick-name">Kelola User</div>
              <div className="ad-quick-desc">Lihat & manajemen pengguna</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          {/* Link ke halaman Data Zakat */}
          <Link href="/admin/zakat" className="ad-quick-card">
            <div className="ad-quick-icon">📊</div>
            <div className="ad-quick-text">
              <div className="ad-quick-name">Data Zakat</div>
              <div className="ad-quick-desc">Riwayat semua perhitungan</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          
        </div>
      </main>
    </div>
  )
}