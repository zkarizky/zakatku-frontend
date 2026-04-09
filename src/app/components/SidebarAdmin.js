"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import apiClient from "../api/apiClient"
import "./sidebar.css"

export default function SidebarAdmin() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await apiClient.post("/logout")
    } catch (err) {
      console.log(err)
    }
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }
  const handleExport = () => {
  const year = 2026 // bisa dari input/select
  window.open(`http://127.0.0.1:8000/api/admin/export?year=${year}`)
}
  const isActive = (href) => pathname === href

  return (
    <>
      {/* Mobile hamburger */}
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
        {open ? "✕" : "☰"}
      </button>

      {/* Backdrop */}
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <div className={`sidebar ${open ? "open" : ""}`}>
        {/* LOGO */}
        <div className="sidebar-logo">
          <div className="logo-badge">
            Zakat<span>Ku</span>
          </div>
        </div>

        {/* MENU */}
        <div className="sidebar-section">
          <div className="sidebar-label">Admin Panel</div>
          <Link href="/admin/dashboard" className={`sidebar-item ${isActive("/admin/dashboard") ? "active" : ""}`} onClick={() => setOpen(false)}>
            📊 Dashboard
          </Link>
          <Link href="/admin/users" className={`sidebar-item ${isActive("/admin/users") ? "active" : ""}`} onClick={() => setOpen(false)}>
            👤 Kelola User
          </Link>
          <Link href="/admin/zakat" className={`sidebar-item ${isActive("/admin/zakat") ? "active" : ""}`} onClick={() => setOpen(false)}>
            💰 Data Zakat
          </Link>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Laporan</div>
          <button
            className="sidebar-item"
            onClick={() => {
              const token = localStorage.getItem("token")
              window.open(`http://127.0.0.1:8000/api/zakat/export?token=${token}`)
            }}
          >
            📤 Export Data
          </button>
        </div>

        {/* LOGOUT */}
        <div className="sidebar-footer">
          <button className="sidebar-item logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  )
}