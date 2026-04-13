/**
 * DashboardPage — halaman utama user setelah login.
 * Menampilkan ringkasan zakat, nisab terkini, riwayat pembayaran,
 * dan tombol aksi cepat ke kalkulator zakat.
 * 
 * Data yang ditampilkan:
 * - Harga emas & nisab (mal + profesi) hari ini
 * - Total zakat terbayar (keseluruhan, profesi, mal)
 * - Tabel riwayat pembayaran dengan sorting & status
 */
"use client"
import { useEffect, useState } from "react"
import apiClient from "../../api/apiClient"
import Sidebar from "../../components/Sidebar"
import "./dashboard.css"
import { useRouter } from "next/navigation"

// Fungsi utilitas format angka ke format Indonesia (1.000.000)
const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

export default function DashboardPage() {
  // State data user yang sedang login
  const [user, setUser] = useState(null)
  // State daftar pembayaran zakat user
  const [payments, setPayments] = useState([])
  // State harga emas per gram (Rupiah)
  const [gold, setGold] = useState(0)
  // State loading indicator
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  // State urutan sorting tabel (terbaru/terlama)
  const [sortOrder, setSortOrder] = useState("desc") // default terbaru

  // Hitung nisab berdasarkan harga emas terkini
  const nisabMal = gold * 85             // Nisab mal = 85 gram emas
  const nisabProfesi = (gold * 85) / 12  // Nisab profesi = 1/12 nisab mal (per bulan)

  /**
   * Mengambil data dashboard dan harga emas saat komponen pertama kali dimuat.
   * Data: user, payments, dan gold price.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data dashboard (user, payments/zakat)
        const res = await apiClient.get("/dashboard")
        // Ambil harga emas terkini
        const goldRes = await apiClient.get("/gold-price")
        setUser(res.data.user)
        // ✅ Expecting payments from the backend now instead of zakat calculations
        setPayments(res.data.payments || res.data.zakat || []) 
        setGold(goldRes.data.price)
      } catch (err) {
        console.log(err)
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

  // Sort payments berdasarkan tanggal (terbaru/terlama)
  const sortedPayments = [...payments].sort((a, b) => {
    if (sortOrder === "asc") {
      return new Date(a.created_at) - new Date(b.created_at)
    } else {
      return new Date(b.created_at) - new Date(a.created_at)
    }
  })

  // Cari pembayaran terakhir per jenis zakat (hanya yang settlement/lunas)
  const lastProfesi = payments
    .filter(i => i.zakat?.type === "profesi" && i.transaction_status === "settlement")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

  const lastMal = payments
    .filter(i => i.zakat?.type === "mal" && i.transaction_status === "settlement")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

  /**
   * Memformat tanggal ke format Indonesia (contoh: 07 Apr 2026)
   */
  const formatDate = (date) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  // Hitung ringkasan (summary) — hanya pembayaran yang sudah lunas (settlement)
  const successPayments = payments.filter(p => p.transaction_status === "settlement")
  const totalPayment = successPayments.reduce((a, b) => a + Number(b.amount || 0), 0)
  const paymentProfesi = successPayments.filter(i => i.zakat?.type === "profesi").reduce((a, b) => a + Number(b.amount || 0), 0)
  const paymentMal = successPayments.filter(i => i.zakat?.type === "mal").reduce((a, b) => a + Number(b.amount || 0), 0)

  return (
    <div style={{ display: "flex" }}>
      {/* ── SIDEBAR navigasi kiri ── */}
      <Sidebar />

      {/* ── MAIN CONTENT ── */}
      <main className="main">
        {/* Top Bar — sapaan user dan harga emas */}
        <div className="topbar">
          <div className="topbar-left">
            <small>Assalamu'alaikum 👋</small>
            <h1>{user?.name || "Ahmad Fauzi"}</h1>
          </div>
          <div className="topbar-right">
            {/* Badge harga emas per gram hari ini */}
            <div className="gold-pill">
              Rp {fmt(gold)} / gram
            </div>
          </div>
        </div>

        {/* Nisab Banner — menampilkan nisab mal & profesi berdasarkan harga emas */}
        <div className="nisab-banner">
          <div className="nisab-banner-header">
            <span className="nisab-banner-icon">📊</span>
            <span className="nisab-banner-title">Nisab Zakat Hari Ini</span>
            <span className="nisab-banner-sub">Berdasarkan harga emas Rp {fmt(gold)} / gram</span>
          </div>
          <div className="nisab-banner-cards">
            {/* Nisab Zakat Mal */}
            <div className="nisab-item">
              <div className="nisab-item-label">🏠 Zakat Mal</div>
              <div className="nisab-item-amount">Rp {fmt(nisabMal)}</div>
              <div className="nisab-item-desc">85 gram emas · dihitung per tahun</div>
            </div>
            <div className="nisab-divider" />
            {/* Nisab Zakat Profesi */}
            <div className="nisab-item">
              <div className="nisab-item-label">💼 Zakat Profesi</div>
              <div className="nisab-item-amount">Rp {fmt(Math.round(nisabProfesi))}</div>
              <div className="nisab-item-desc">1/12 nisab mal · dihitung per bulan</div>
            </div>
          </div>
        </div>

        {/* Summary Cards — total zakat terbayar (keseluruhan / profesi / mal) */}
        <div className="cards-row">
          {/* Card: Total keseluruhan */}
          <div className="card-summary green">
            <div className="card-label">Total Pelaksanaan Zakat</div>
            <div className="card-amount">Rp {fmt(totalPayment / 1e6).replace(",", ".")}jt</div>
          </div>
          {/* Card: Total zakat profesi */}
          <div className="card-summary white">
            <div className="card-label">Zakat Profesi Tersalurkan</div>
            <div className="card-amount">Rp {fmt(paymentProfesi / 1e6).replace(",", ".")}jt</div>
            <div className="card-badge">
              {lastProfesi ? "Sudah bayar" : "Belum bayar"}
            </div>
            <div className="card-date">
              Terakhir {formatDate(lastProfesi?.created_at)}
            </div>
          </div>
          {/* Card: Total zakat mal */}
          <div className="card-summary gold">
            <div className="card-label">Zakat Mal Tersalurkan</div>
            <div className="card-amount">Rp {fmt(paymentMal / 1e6).replace(",", ".")}jt</div>
            <div className="card-badge">
              {lastMal ? "Sudah bayar" : "Belum bayar"}
            </div>
            <div className="card-date">
              Terakhir {formatDate(lastMal?.created_at)}
            </div>
          </div>
        </div>

        {/* Action Buttons — tombol shortcut ke kalkulator zakat */}
        <div className="action-row">
          {/* Tombol ke Kalkulator Zakat Profesi */}
          <button 
            className="action-btn green-btn"
            onClick={() => router.push("/user/zakat-profesi")}
          >
            <div className="action-btn-left">
              <div className="action-btn-title">🧮 Hitung & Bayar Zakat Profesi</div>
              <div className="action-btn-sub">2.5% / bulan · Dihitung tiap bulan</div>
            </div>
            <span className="action-btn-icon">›</span>
          </button>
          {/* Tombol ke Kalkulator Zakat Mal */}
          <button 
            className="action-btn gold-btn"
            onClick={() => router.push("/user/zakat-mal")}
          >
            <div className="action-btn-left">
              <div className="action-btn-title">⚖️ Hitung & Bayar Zakat Mal</div>
              <div className="action-btn-sub">Perhitungan simpanan dan aset tahunan</div>
            </div>
            <span className="action-btn-icon">›</span>
          </button>
        </div>

        {/* Tabel Riwayat Pembayaran — menampilkan semua transaksi zakat user */}
        <div className="table-section">
          <div className="table-header">
            <span className="table-title">Riwayat Pembayaran Zakat Terakhir</span>
            {/* Dropdown sorting: Terbaru / Terlama */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "12px"
              }}
            >
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>
          </div>

          {/* Jika belum ada riwayat pembayaran */}
          {payments.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--gray-400)", fontSize: "13px" }}>
              Belum ada riwayat pembayaran
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jenis Zakat</th>
                  <th>Nominal Pembayaran</th>
                  <th>Metode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayments.map((item) => {
                  // Ambil tipe zakat dari relasi atau fallback ke field langsung
                  const type = item.zakat?.type || item.type;
                  return (
                    <tr key={item.id}>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        {/* Badge jenis zakat dengan icon */}
                        <div className="jenis-badge">
                          <div className={`jenis-icon ${type}`}>
                            {type === "profesi" ? "💼" : "🏠"}
                          </div>
                          {type === "profesi" ? "Profesi" : "Mal"}
                        </div>
                      </td>
                      <td className="zakat-amount">Rp {fmt(item.amount || item.zakat_amount)}</td>
                      <td>{item.payment_type || "-"}</td>
                      <td>
                        {/* Status pill — Lunas / Menunggu / Gagal */}
                        <span className={`status-pill`}>
                          {item.transaction_status === "settlement" ? "Lunas" : item.transaction_status === "pending" ? "Menunggu" : item.transaction_status === "failed" ? "Gagal" : item.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}