"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import apiClient from "../api/apiClient"
import "./sidebar.css"

export default function SidebarAdmin() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())

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
  const handleExport = async () => {
  try {
    const res = await apiClient.get(`/admin/export?year=${year}`, {
      responseType: "blob", // penting buat file
    })

    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `zakat-${year}.xls`)
    document.body.appendChild(link)
    link.click()
  } catch (err) {
    console.log(err)
    alert("Gagal export")
  }
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

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="sidebar-select"
              >
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

             <button
                className="sidebar-item"
                onClick={handleExport}
              >
                📤 Export Data {year}
              </button>
            </div>
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