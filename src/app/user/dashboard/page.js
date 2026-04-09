"use client"
import { useEffect, useState } from "react"
import apiClient from "../../api/apiClient"
import Sidebar from "../../components/Sidebar"
import "./dashboard.css"
import { useRouter } from "next/navigation"

const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [payments, setPayments] = useState([])
  const [gold, setGold] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [sortOrder, setSortOrder] = useState("desc") // default terbaru

  const nisabMal = gold * 85
  const nisabProfesi = (gold * 85) / 12

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get("/dashboard")
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

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#4A7C2F" }}>
      <p>Memuat data...</p>
    </div>
  )

  // Sort Payments
  const sortedPayments = [...payments].sort((a, b) => {
    if (sortOrder === "asc") {
      return new Date(a.created_at) - new Date(b.created_at)
    } else {
      return new Date(b.created_at) - new Date(a.created_at)
    }
  })

  // Get Last Payment per type
  const lastProfesi = payments
    .filter(i => i.zakat?.type === "profesi" && i.transaction_status === "settlement")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

  const lastMal = payments
    .filter(i => i.zakat?.type === "mal" && i.transaction_status === "settlement")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

  const formatDate = (date) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  // Summary logic (only calculate successful "settlement" payments)
  const successPayments = payments.filter(p => p.transaction_status === "settlement")
  const totalPayment = successPayments.reduce((a, b) => a + Number(b.amount || 0), 0)
  const paymentProfesi = successPayments.filter(i => i.zakat?.type === "profesi").reduce((a, b) => a + Number(b.amount || 0), 0)
  const paymentMal = successPayments.filter(i => i.zakat?.type === "mal").reduce((a, b) => a + Number(b.amount || 0), 0)

  return (
    <div style={{ display: "flex" }}>
      {/* ── SIDEBAR ── */}
      <Sidebar />

      {/* ── MAIN ── */}
      <main className="main">
        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-left">
            <small>Assalamu'alaikum 👋</small>
            <h1>{user?.name || "Ahmad Fauzi"}</h1>
          </div>
          <div className="topbar-right">
            <div className="gold-pill">
              Rp {fmt(gold)} / gram
            </div>
          </div>
        </div>

        {/* Nisab Banner */}
        <div className="nisab-banner">
          <div className="nisab-banner-header">
            <span className="nisab-banner-icon">📊</span>
            <span className="nisab-banner-title">Nisab Zakat Hari Ini</span>
            <span className="nisab-banner-sub">Berdasarkan harga emas Rp {fmt(gold)} / gram</span>
          </div>
          <div className="nisab-banner-cards">
            <div className="nisab-item">
              <div className="nisab-item-label">🏠 Zakat Mal</div>
              <div className="nisab-item-amount">Rp {fmt(nisabMal)}</div>
              <div className="nisab-item-desc">85 gram emas · dihitung per tahun</div>
            </div>
            <div className="nisab-divider" />
            <div className="nisab-item">
              <div className="nisab-item-label">💼 Zakat Profesi</div>
              <div className="nisab-item-amount">Rp {fmt(Math.round(nisabProfesi))}</div>
              <div className="nisab-item-desc">1/12 nisab mal · dihitung per bulan</div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="cards-row">
          <div className="card-summary green">
            <div className="card-label">Total Pelaksanaan Zakat</div>
            <div className="card-amount">Rp {fmt(totalPayment / 1e6).replace(",", ".")}jt</div>
          </div>
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

        {/* Action Buttons */}
        <div className="action-row">
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

        {/* Payment History Table */}
        <div className="table-section">
          <div className="table-header">
            <span className="table-title">Riwayat Pembayaran Zakat Terakhir</span>
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
                  const type = item.zakat?.type || item.type; // support old structure just in case
                  return (
                    <tr key={item.id}>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
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