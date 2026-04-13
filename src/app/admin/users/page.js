/**
 * UsersPage — halaman manajemen user di panel admin.
 * Menampilkan tabel semua user terdaftar dengan fitur:
 * - Pencarian berdasarkan nama/email
 * - Hapus user dengan dialog konfirmasi
 * - Tampilan avatar inisial nama
 * - Badge role (Admin / Muzakki)
 */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import apiClient from "../../api/apiClient"
import AdminSidebar from "../../components/SidebarAdmin"
import "./users.css"

// Fungsi utilitas format angka ke format Indonesia
const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

/**
 * ConfirmModal — komponen modal konfirmasi sebelum hapus user.
 * Menampilkan nama & email user yang akan dihapus.
 * @param {Object} user - data user yang akan dihapus
 * @param {Function} onConfirm - callback saat tombol Hapus ditekan
 * @param {Function} onCancel - callback saat tombol Batal ditekan
 */
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
  // State daftar semua user
  const [users, setUsers] = useState([])
  // State loading indicator
  const [loading, setLoading] = useState(true)
  // State keyword pencarian
  const [search, setSearch] = useState("")
  // State user yang akan dihapus (untuk modal konfirmasi)
  const [deleteTarget, setDeleteTarget] = useState(null)
  // State loading saat proses delete berlangsung
  const [deleting, setDeleting] = useState(false)

  /**
   * Mengambil daftar semua user dari API.
   * Endpoint: GET /admin/users
   */
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

  /**
   * Handler hapus user — memanggil API delete lalu refresh data.
   * Endpoint: DELETE /admin/users/{id}
   */
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.delete(`/admin/users/${deleteTarget.id}`)
      // Refresh daftar user setelah berhasil hapus
      await fetchUsers()
    } catch (e) {
      console.log(e)
    } finally {
      setDeleting(false)
      setDeleteTarget(null) // Tutup modal
    }
  }

  // Fetch data saat komponen pertama kali dimuat
  useEffect(() => { fetchUsers() }, [])

  // Filter user berdasarkan keyword pencarian (nama atau email)
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  /**
   * Generate inisial nama untuk avatar (misal: "Ahmad Fauzi" → "AF")
   */
  const getInitials = (name) =>
    name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?"

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar navigasi admin */}
      <AdminSidebar />

      {/* Modal konfirmasi hapus — muncul saat deleteTarget terisi */}
      {deleteTarget && (
        <ConfirmModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <main className="us-main">
        {/* Top Bar — judul halaman dan badge total user */}
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

        {/* Card tabel user */}
        <div className="us-card">
          {/* Header card — judul dan search bar */}
          <div className="us-card-header">
            <div className="us-card-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              Daftar Pengguna
            </div>
            {/* Input pencarian user */}
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

          {/* Tabel daftar user */}
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
                    {/* Kolom nama dengan avatar inisial */}
                    <td>
                      <div className="us-user-cell">
                        <div className="us-avatar">{getInitials(user.name)}</div>
                        <span className="us-name">{user.name}</span>
                      </div>
                    </td>
                    <td className="us-email">{user.email}</td>
                    {/* Badge role: Admin atau Muzakki */}
                    <td>
                      <span className={`us-role-badge ${user.role === "admin" ? "admin" : "user"}`}>
                        {user.role === "admin" ? "Admin" : "Muzakki"}
                      </span>
                    </td>
                    {/* Tanggal bergabung */}
                    <td className="us-date">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "-"}
                    </td>
                    {/* Tombol hapus user */}
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

          {/* Footer — informasi jumlah user yang ditampilkan */}
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