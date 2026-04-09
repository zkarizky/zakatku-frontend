"use client"

import { useEffect, useState } from "react"
import apiClient from "../../api/apiClient"
import AdminSidebar from "../../components/SidebarAdmin"
import "./zakatdata.css"

const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

const PAGE_SIZE = 10

export default function PaymentPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("semua")
  const [page, setPage] = useState(1)

  useEffect(() => {
    apiClient.get("/admin/payments")
      .then(res => setData(res.data))
      .catch(e => console.log(e))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { setPage(1) }, [search, filterType])

  // ✅ FILTER DATA
  const filtered = data.filter(item => {
    const matchType = filterType === "semua" || item.zakat?.type === filterType
    const matchSearch =
      item.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.user?.email?.toLowerCase().includes(search.toLowerCase())

    return matchType && matchSearch
  })

  // ✅ PAGINATION
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ✅ SUMMARY (PAYMENT)
  const totalPayment = filtered.reduce((a, b) => a + Number(b.amount || 0), 0)
  const totalSuccess = filtered.filter(i => i.transaction_status === "settlement").length
  const totalPending = filtered.filter(i => i.transaction_status === "pending").length

  const getInitials = (name) =>
    name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?"

  const getPageNumbers = () => {
    const delta = 2
    const range = []

    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i)
    }

    if (range[0] > 1) {
      range.unshift("...")
      range.unshift(1)
    }

    if (range[range.length - 1] < totalPages) {
      range.push("...")
      range.push(totalPages)
    }

    return range
  }

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar />

      <main className="zd-main">
        {/* Top Bar */}
        <div className="zd-topbar">
          <div>
            <small className="zd-breadcrumb">Admin Panel</small>
            <h1 className="zd-title">Riwayat Pembayaran</h1>
          </div>
          <div className="zd-count-badge">{data.length} transaksi</div>
        </div>

        {/* ✅ SUMMARY PAYMENT */}
        <div className="zd-summary">
          <div className="zd-sum-card total">
            <div className="zd-sum-label">Total Pembayaran</div>
            <div className="zd-sum-value">Rp {fmt(totalPayment)}</div>
            <div className="zd-sum-sub">{filtered.length} transaksi</div>
          </div>

          <div className="zd-sum-card profesi">
            <div className="zd-sum-label">Berhasil</div>
            <div className="zd-sum-value">{totalSuccess}</div>
            <div className="zd-sum-sub">Status settlement</div>
          </div>

          <div className="zd-sum-card mal">
            <div className="zd-sum-label">Pending</div>
            <div className="zd-sum-value">{totalPending}</div>
            <div className="zd-sum-sub">Menunggu pembayaran</div>
          </div>
        </div>

        {/* Table */}
        <div className="zd-card">
          <div className="zd-card-header">
            <div className="zd-card-title">Riwayat Transaksi</div>

            <div className="zd-filters">
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
                    <td>
                      <div className="zd-user-cell">
                        <div className="zd-avatar">
                          {getInitials(item.user?.name)}
                        </div>
                        <div>
                          <div className="zd-username">{item.user?.name}</div>
                          <div className="zd-useremail">{item.user?.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`zd-type-badge ${item.zakat?.type}`}>
                        {item.zakat?.type === "profesi" ? "💼 Profesi" : "🏠 Mal"}
                      </span>
                    </td>

                    <td>{item.payment_type || "-"}</td>

                    <td className="zd-zakat">
                      Rp {fmt(item.amount)}
                    </td>

                    <td>
                      <span className={`zd-status ${item.transaction_status}`}>
                        {item.transaction_status === "settlement" && "Lunas"}
                        {item.transaction_status === "pending" && "Menunggu"}
                        {item.transaction_status === "failed" && "Gagal"}
                      </span>
                    </td>

                    <td>
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="zd-card-footer">
              <div className="zd-footer-info">
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}
              </div>

              <div className="zd-pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ‹
                </button>

                {getPageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={i}>...</span>
                  ) : (
                    <button
                      key={p}
                      className={page === p ? "active" : ""}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}