"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import apiClient from "../../api/apiClient"
import AdminSidebar from "../../components/SidebarAdmin"
import "./users.css"

const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

// ── Confirm Modal ──────────────────────────────────────────
function ConfirmModal({ user, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon">🗑️</div>
        <div className="modal-title">Hapus User?</div>
        <div className="modal-desc">
          Akun <strong>{user.name}</strong> ({user.email}) akan dihapus permanen dan tidak bisa dikembalikan.
        </div>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel}>Batal</button>
          <button className="modal-btn-confirm" onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/admin/users")
      setUsers(res.data)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.delete(`/admin/users/${deleteTarget.id}`)
      await fetchUsers()
    } catch (e) {
      console.log(e)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name) =>
    name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?"

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar />

      {deleteTarget && (
        <ConfirmModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <main className="us-main">
        {/* Top Bar */}
        <div className="us-topbar">
          <div>
            <small className="us-breadcrumb">Admin Panel</small>
            <h1 className="us-title">Manajemen User</h1>
          </div>
          <div className="us-topbar-right">
            <div className="us-count-badge">
              {users.length} pengguna
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="us-card">
          {/* Card Header */}
          <div className="us-card-header">
            <div className="us-card-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              Daftar Pengguna
            </div>
            {/* Search */}
            <div className="us-search-wrap">
              <svg className="us-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input
                className="us-search"
                type="text"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="us-empty">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="us-empty">
              {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada pengguna"}
            </div>
          ) : (
            <table className="us-table">
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Bergabung</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="us-user-cell">
                        <div className="us-avatar">{getInitials(user.name)}</div>
                        <span className="us-name">{user.name}</span>
                      </div>
                    </td>
                    <td className="us-email">{user.email}</td>
                    <td>
                      <span className={`us-role-badge ${user.role === "admin" ? "admin" : "user"}`}>
                        {user.role === "admin" ? "Admin" : "Muzakki"}
                      </span>
                    </td>
                    <td className="us-date">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "-"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="us-delete-btn"
                        onClick={() => setDeleteTarget(user)}
                        disabled={deleting}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="us-card-footer">
              Menampilkan {filtered.length} dari {users.length} pengguna
            </div>
          )}
        </div>
      </main>
    </div>
  )
}