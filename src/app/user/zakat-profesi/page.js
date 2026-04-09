"use client"

import { useEffect, useState } from "react"
import apiClient from "../../api/apiClient"
import Sidebar from "../../components/Sidebar"
import "../zakat/zakat2.css"

const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

export default function ZakatProfesi() {
  const [profile, setProfile] = useState(null)
  const [period, setPeriod] = useState("bulanan")
  const [salaryType, setSalaryType] = useState("kotor")
  const [expenses, setExpenses] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)
  const [showPay, setShowPay] = useState(false)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/dashboard")
        const p = res.data.profile
        const u = res.data.user
        if (p) setProfile({ ...p, name: u?.name || "" })
      } catch (err) {
        console.log(err)
      } finally {
        setFetching(false)
      }
    }
    fetchProfile()
  }, [])

  const baseIncome = Number(profile?.income || 0)
  const income = period === "tahunan" ? baseIncome * 12 : baseIncome
  const netIncome = salaryType === "bersih"
    ? income - Number(expenses || 0)
    : income

  const handleCalculate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.post("/zakat", {
        type: "profesi",
        income,
        period,
        salary_type: salaryType,
        expenses: salaryType === "bersih" ? Number(expenses || 0) : null,
      })
      setResult(res.data)
    } catch (err) {
      setError("Gagal menghitung zakat. Coba lagi.")
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async () => {
    setPaying(true)
    try {
      const res = await apiClient.post("/payment/create", {
        amount: result.zakat_amount,
        zakat_id: result.id,
      })
      window.snap.pay(res.data.token, {
        onSuccess: () => { setShowPay(false) },
        onPending: () => { setShowPay(false) },
        onError: () => { },
      })
    } catch (err) {
      console.log(err)
    } finally {
      setPaying(false)
    }
  }

  if (fetching) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#4A7C2F" }}>
      <p>Memuat data...</p>
    </div>
  )

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      {/* ── Payment Modal ── */}
      {showPay && (
        <div className="zp2-modal-overlay">
          <div className="zp2-modal">
            <div className="zp2-modal-icon">💳</div>
            <div className="zp2-modal-title">Bayar Zakat Profesi</div>
            <div className="zp2-modal-desc">
              Konfirmasi pembayaran zakat profesi Anda melalui Midtrans.
            </div>

            <div className="zp2-modal-amount-box">
              <div className="zp2-modal-amount-label">Total yang dibayarkan</div>
              <div className="zp2-modal-amount">Rp {fmt(result?.zakat_amount)}</div>
            </div>

            <div className="zp2-modal-rows">
              <div className="zp2-modal-row">
                <span>Periode</span>
                <span>{period === "bulanan" ? "Bulanan" : "Tahunan"}</span>
              </div>
              <div className="zp2-modal-row">
                <span>Metode</span>
                <span>{salaryType === "kotor" ? "Gaji Kotor" : "Gaji Bersih"}</span>
              </div>
              <div className="zp2-modal-row">
                <span>Tarif</span>
                <span>2.5%</span>
              </div>
            </div>

            <div className="zp2-modal-actions">
              <button className="zp2-modal-cancel" onClick={() => setShowPay(false)}>
                Batal
              </button>
              <button
                className={`zp2-modal-pay ${paying ? "loading" : ""}`}
                onClick={handlePay}
                disabled={paying}
              >
                {paying ? <><span className="zp2-spinner" /> Memproses...</> : "💳 Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="zp2-main">
        {/* Top Bar */}
        <div className="zp2-topbar">
          <div>
            <small className="zp2-breadcrumb">Zakat Profesi</small>
            <h1 className="zp2-title">Kalkulator Zakat Profesi</h1>
          </div>
        </div>

        <div className="zp2-layout">
          {/* Form Card */}
          <div className="zp2-card">
            <div className="zp2-card-header">
              <div className="zp2-card-icon">🧮</div>
              <div>
                <div className="zp2-card-title">Hitung Zakat Profesi</div>
                <div className="zp2-card-sub">2.5% dari penghasilan yang mencapai nisab</div>
              </div>
            </div>

            <div className="zp2-card-body">

              {/* Profile info banner */}
              {profile ? (
                <div className="zp2-profile-banner">
                  <div className="zp2-profile-avatar">
                    {profile.name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?"}
                  </div>
                  <div className="zp2-profile-info">
                    <div className="zp2-profile-name">{profile.name}</div>
                    <div className="zp2-profile-job">{profile.job || "Pekerjaan belum diisi"}</div>
                  </div>
                  <div className="zp2-profile-income">
                    <div className="zp2-profile-income-label">Penghasilan</div>
                    <div className="zp2-profile-income-val">Rp {fmt(profile.income)}/bln</div>
                  </div>
                </div>
              ) : (
                <div className="zp2-info-box warn">
                  ⚠️ Lengkapi profil Anda terlebih dahulu agar penghasilan terisi otomatis.
                </div>
              )}

              {/* Info */}
              <div className="zp2-info-box">
                <div>💡</div>
                <div>Nisab zakat profesi setara <strong>520 kg beras</strong> atau <strong>85 gram emas</strong>. Tarif zakat adalah <strong>2.5%</strong>.</div>
              </div>

              {/* Period Toggle */}
              <div className="zp2-field">
                <label className="zp2-label">Periode Hitung</label>
                <div className="zp2-toggle">
                  {["bulanan", "tahunan"].map(p => (
                    <button
                      key={p}
                      className={`zp2-toggle-btn ${period === p ? "active" : ""}`}
                      onClick={() => { setPeriod(p); setResult(null) }}
                    >
                      {p === "bulanan" ? "📅 Bulanan" : "📆 Tahunan"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary Type */}
              <div className="zp2-field">
                <label className="zp2-label">Metode Penghasilan</label>
                <div className="zp2-option-group">
                  {[
                    { val: "kotor", icon: "💰", title: "Gaji Kotor", sub: "Sebelum potongan" },
                    { val: "bersih", icon: "🧾", title: "Gaji Bersih", sub: "Setelah pengeluaran" },
                  ].map(opt => (
                    <div
                      key={opt.val}
                      className={`zp2-option ${salaryType === opt.val ? "active" : ""}`}
                      onClick={() => { setSalaryType(opt.val); setResult(null) }}
                    >
                      <div className="zp2-option-icon">{opt.icon}</div>
                      <div>
                        <div className="zp2-option-title">{opt.title}</div>
                        <div className="zp2-option-sub">{opt.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Income display (from profile) */}
              <div className="zp2-field">
                <label className="zp2-label">
                  Penghasilan {period === "bulanan" ? "Per Bulan" : "Per Tahun"}
                </label>
                <div className="zp2-income-display">
                  <span className="zp2-income-prefix">Rp</span>
                  <span className="zp2-income-value">{fmt(income)}</span>
                  {period === "tahunan" && (
                    <span className="zp2-income-note">({fmt(baseIncome)}/bln × 12)</span>
                  )}
                </div>
                {!profile?.income && (
                  <div className="zp2-field-hint warn">⚠️ Penghasilan belum diatur di profil</div>
                )}
              </div>

              {/* Expenses (bersih only) */}
              {salaryType === "bersih" && (
                <div className="zp2-field">
                  <label className="zp2-label">Total Pengeluaran Pokok (Rp)</label>
                  <div className="zp2-input-wrap">
                    <span className="zp2-prefix">Rp</span>
                    <input
                      className="zp2-input"
                      type="number"
                      placeholder="0"
                      value={expenses}
                      onChange={e => { setExpenses(e.target.value); setResult(null) }}
                    />
                  </div>
                  {expenses && income && (
                    <div className="zp2-net-hint">
                      Penghasilan bersih: <strong>Rp {fmt(netIncome)}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="zp2-meta-row">
                <div className="zp2-meta-item">
                  <span className="zp2-meta-label">Periode</span>
                  <span className="zp2-meta-val">{period === "bulanan" ? "Bulanan" : "Tahunan"}</span>
                </div>
                <div className="zp2-meta-item">
                  <span className="zp2-meta-label">Metode</span>
                  <span className="zp2-meta-val">{salaryType === "kotor" ? "Kotor" : "Bersih"}</span>
                </div>
                <div className="zp2-meta-item">
                  <span className="zp2-meta-label">Tarif</span>
                  <span className="zp2-meta-val green">2.5%</span>
                </div>
              </div>

              {error && <div className="zp2-error">{error}</div>}

              <button
                className={`zp2-btn-calc ${loading ? "loading" : ""}`}
                onClick={handleCalculate}
                disabled={loading || !income}
              >
                {loading ? <><span className="zp2-spinner" /> Menghitung...</> : "🧮 Hitung Zakat"}
              </button>
            </div>
          </div>

          {/* Result Card */}
          {result && (
            <div className={`zp2-result-card ${result.is_eligible ? "eligible" : "not-eligible"}`}>
              <div className="zp2-result-header">
                <span>{result.is_eligible ? "✅" : "ℹ️"}</span>
                <span className="zp2-result-status">
                  {result.is_eligible ? "Wajib Zakat" : "Belum Wajib Zakat"}
                </span>
              </div>

              <div className="zp2-result-body">
                <div className="zp2-result-main">
                  <div className="zp2-result-label">Zakat yang harus dibayar</div>
                  <div className="zp2-result-amount">Rp {fmt(result.zakat_amount)}</div>
                </div>

                <div className="zp2-result-rows">
                  <div className="zp2-result-row">
                    <span>Penghasilan {salaryType === "kotor" ? "Kotor" : "Bruto"}</span>
                    <span>Rp {fmt(income)}</span>
                  </div>
                  {salaryType === "bersih" && expenses && (
                    <div className="zp2-result-row">
                      <span>Pengeluaran</span>
                      <span>- Rp {fmt(expenses)}</span>
                    </div>
                  )}
                  {salaryType === "bersih" && (
                    <div className="zp2-result-row">
                      <span>Penghasilan Bersih</span>
                      <span>Rp {fmt(netIncome)}</span>
                    </div>
                  )}
                  <div className="zp2-result-row">
                    <span>Tarif Zakat</span>
                    <span>2.5%</span>
                  </div>
                  <div className="zp2-result-divider" />
                  <div className="zp2-result-row bold">
                    <span>Total Zakat</span>
                    <span>Rp {fmt(result.zakat_amount)}</span>
                  </div>
                </div>

                {result.is_eligible ? (
                  <button className="zp2-pay-btn" onClick={() => setShowPay(true)}>
                    💳 Bayar Zakat Sekarang
                  </button>
                ) : (
                  <div className="zp2-not-eligible-note">
                    Penghasilan belum mencapai nisab. Tetap semangat! 💪
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}