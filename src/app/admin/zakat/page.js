/**
 * PaymentPage (Admin Zakat Data) — halaman riwayat pembayaran di panel admin.
 * Menampilkan semua transaksi pembayaran zakat dari seluruh user.
 * 
 * Fitur:
 * - Summary cards (total pembayaran, berhasil, pending)
 * - Filter berdasarkan jenis zakat (semua / profesi / mal)
 * - Pencarian berdasarkan nama user
 * - Pagination (10 item per halaman)
 * - Hanya menampilkan transaksi dengan status settlement (lunas)
 */
"use client"

import { useEffect, useState } from "react"
import apiClient from "../../api/apiClient"
import AdminSidebar from "../../components/SidebarAdmin"
import "./zakatdata.css"

// Fungsi utilitas format angka ke format Indonesia
const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

// Jumlah item per halaman untuk pagination
const PAGE_SIZE = 10

export default function PaymentPage() {
  // State data pembayaran dari API
  const [data, setData] = useState([])
  // State loading indicator
  const [loading, setLoading] = useState(true)
  // State keyword pencarian
  const [search, setSearch] = useState("")
  // State filter jenis zakat: "semua", "profesi", atau "mal"
  const [filterType, setFilterType] = useState("semua")
  // State halaman saat ini (pagination)
  const [page, setPage] = useState(1)

  /**
   * Mengambil semua data pembayaran saat komponen dimuat.
   * Endpoint: GET /admin/payments
   */
  useEffect(() => {
    apiClient.get("/admin/payments")
      .then(res => setData(res.data))
      .catch(e => console.log(e))
      .finally(() => setLoading(false))
  }, [])

  // Reset ke halaman 1 saat filter atau pencarian berubah
  useEffect(() => { setPage(1) }, [search, filterType])

  /**
   * Filter data tabel — hanya tampilkan transaksi yang:
   * 1. Sesuai jenis zakat (filterType)
   * 2. Cocok dengan keyword pencarian (nama/email)
   * 3. Status settlement (lunas) saja
   */
  // ✅ FILTER TABEL — hanya settlement, sesuai search & type
  const filtered = data.filter(item => {
    const matchType = filterType === "semua" || item.zakat?.type === filterType
    const matchSearch =
      item.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.user?.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = item.transaction_status === "settlement"

    return matchType && matchSearch && matchStatus
  })

  // ✅ PAGINATION — hitung total halaman dan slice data sesuai halaman aktif
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ✅ SUMMARY — hitung statistik ringkasan
  const totalPayment = filtered.reduce((a, b) => a + Number(b.amount || 0), 0) // Total nominal
  const totalSuccess = filtered.length                                          // Jumlah lunas
  const totalPending = data.filter(i => i.transaction_status === "pending").length // Jumlah pending

  /**
   * Generate inisial nama untuk avatar (misal: "Ahmad Fauzi" → "AF")
   */
  const getInitials = (name) =>
    name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?"

  /**
   * Menghitung nomor halaman yang ditampilkan di pagination.
   * Menampilkan range ±2 halaman dari halaman aktif, dengan elipsis jika perlu.
   */
  const getPageNumbers = () => {
    const delta = 2
    const range = []
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i)
    }
    // Tambahkan halaman pertama dan elipsis jika range tidak mulai dari 1
    if (range[0] > 1) { range.unshift("..."); range.unshift(1) }
    // Tambahkan halaman terakhir dan elipsis jika range tidak sampai akhir
    if (range[range.length - 1] < totalPages) { range.push("..."); range.push(totalPages) }
    return range
  }

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar navigasi admin */}
      <AdminSidebar />

      <main className="zd-main">
        {/* Top Bar — judul dan badge total transaksi */}
        <div className="zd-topbar">
          <div>
            <small className="zd-breadcrumb">Admin Panel</small>
            <h1 className="zd-title">Riwayat Pembayaran</h1>
          </div>
          <div className="zd-count-badge">{data.length} transaksi</div>
        </div>

        {/* Summary Cards — ringkasan statistik pembayaran */}
        {/* ✅ SUMMARY */}
        <div className="zd-summary">
          {/* Card: Total nominal pembayaran */}
          <div className="zd-sum-card total">
            <div className="zd-sum-label">Total Pembayaran</div>
            <div className="zd-sum-value">Rp {fmt(totalPayment)}</div>
            <div className="zd-sum-sub">{totalSuccess} transaksi lunas</div>
          </div>

          {/* Card: Jumlah transaksi berhasil */}
          <div className="zd-sum-card profesi">
            <div className="zd-sum-label">Berhasil</div>
            <div className="zd-sum-value">{totalSuccess}</div>
            <div className="zd-sum-sub">Status settlement</div>
          </div>

          {/* Card: Jumlah transaksi pending */}
          <div className="zd-sum-card mal">
            <div className="zd-sum-label">Pending</div>
            <div className="zd-sum-value">{totalPending}</div>
            <div className="zd-sum-sub">Menunggu pembayaran</div>
          </div>
        </div>

        {/* Tabel transaksi */}
        <div className="zd-card">
          {/* Header tabel — judul, filter jenis, dan search */}
          <div className="zd-card-header">
            <div className="zd-card-title">Riwayat Transaksi</div>

            <div className="zd-filters">
              {/* Toggle filter jenis zakat: Semua / Profesi / Mal */}
              <div className="zd-type-toggle">
                {["semua", "profesi", "mal"].map(t => (
                  <button
                    key={t}
                    className={`zd-type-btn ${filterType === t ? "active" : ""}`}
                    onClick={() => setFilterType(t)}
                  >
                    {t === "semua" ? "Semua" : t === "profesi" ? "💼 Profesi" : "🏠 Mal"}
                  </button>
                ))}
              </div>

              {/* Input pencarian user */}
              <div className="zd-search-wrap">
                <input
                  className="zd-search"
                  type="text"
                  placeholder="Cari nama user..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Body tabel — data atau empty state */}
          {loading ? (
            <div className="zd-empty">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="zd-empty">Tidak ada data</div>
          ) : (
            <table className="zd-table">
              <thead>
                <tr>
                  <th>Muzakki</th>
                  <th>Jenis</th>
                  <th>Metode</th>
                  <th>Total Bayar</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map(item => (
                  <tr key={item.id}>
                    {/* Kolom muzakki: avatar inisial + nama + email */}
                    <td>
                      <div className="zd-user-cell">
                        <div className="zd-avatar">{getInitials(item.user?.name)}</div>
                        <div>
                          <div className="zd-username">{item.user?.name}</div>
                          <div className="zd-useremail">{item.user?.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Kolom jenis zakat dengan badge */}
                    <td>
                      <span className={`zd-type-badge ${item.zakat?.type}`}>
                        {item.zakat?.type === "profesi" ? "💼 Profesi" : "🏠 Mal"}
                      </span>
                    </td>

                    {/* Kolom metode pembayaran (dari Midtrans callback) */}
                    <td>{item.payment_type || "-"}</td>

                    {/* Kolom nominal pembayaran */}
                    <td className="zd-zakat">Rp {fmt(item.amount)}</td>

                    <td>
                      {/* ✅ Semua pasti Lunas karena sudah difilter settlement */}
                      <span className="zd-status settlement">Lunas</span>
                    </td>

                    {/* Kolom tanggal transaksi */}
                    <td>{new Date(item.created_at).toLocaleDateString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Footer: Pagination — navigasi antar halaman */}
          {!loading && filtered.length > 0 && (
            <div className="zd-card-footer">
              {/* Info jumlah item yang ditampilkan */}
              <div className="zd-footer-info">
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}
              </div>

              {/* Tombol navigasi halaman */}
              <div className="zd-pagination">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>

                {getPageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={i}>...</span>
                  ) : (
                    <button key={p} className={page === p ? "active" : ""} onClick={() => setPage(p)}>
                      {p}
                    </button>
                  )
                )}

                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}