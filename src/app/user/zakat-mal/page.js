"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import apiClient from "../../api/apiClient"
import Sidebar from "../../components/Sidebar"
import "../zakat/zakat.css"

const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

export default function ZakatMal() {
  const [profile, setProfile] = useState(null)
  const [debts, setDebts] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)

  const [showPay, setShowPay] = useState(false)
  const [zakatAmount, setZakatAmount] = useState(0)
  const [zakatId, setZakatId] = useState(null)

  // ── FETCH PROFILE ─────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/dashboard")
        const p = res.data.profile
        const u = res.data.user
        if (p) {
          setProfile({ ...p, name: u?.name || "" })
        }
      } catch (err) {
        console.log(err)
        setError("Gagal memuat data profil.")
      } finally {
        setFetching(false)
      }
    }
    fetchProfile()
  }, [])

  const wealth = Number(profile?.wealth || 0)
  const netWealth = Math.max(0, wealth - Number(debts || 0))
  const hasWealth = wealth > 0

  // ── HITUNG ZAKAT ─────────────────────
  const handleCalculate = async () => {
    if (!hasWealth) return
    setLoading(true)
    setError(null)

    try {
      const res = await apiClient.post("/zakat", {
        type: "mal",
        income: netWealth,
        period: "tahunan",
        salary_type: "kotor",
      })
      setResult(res.data)
      setZakatAmount(res.data.zakat_amount)
    } catch (err) {
      setError("Gagal menghitung zakat. Coba lagi.")
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculate = () => {
    setResult(null)
    setError(null)
    setShowPay(false)
  }

  // ── MIDTRANS PAY ─────────────────────
  const handlePay = async () => {
  try {
    const res = await apiClient.post("/midtrans/transaction", {
      zakatAmount: result.zakat_amount,
      zakatId: result.id
    })

    window.snap.pay(res.data.snap_token, {
      onSuccess: function (result) {
        alert("Pembayaran berhasil!")
      },
      onPending: function (result) {
        alert("Menunggu pembayaran")
      },
      onError: function (result) {
        alert("Pembayaran gagal")
      }
    })

  } catch (err) {
    console.log(err)
  }
}

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <main className="zm-main">

        {/* ── TOP BAR ── */}
        <div className="zm-topbar">
          <div className="zm-breadcrumb">Beranda / Zakat</div>
          <h1 className="zm-title">Kalkulator Zakat Mal</h1>
        </div>

        {/* ── LOADING PROFIL ── */}
        {fetching ? (
          <div className="zm-loading">
            <div className="zm-loading-spinner" />
            <span>Memuat data profil…</span>
          </div>

        ) : !profile || !hasWealth ? (
          /* ── EMPTY STATE ── */
          <div className="zm-empty-state">
            <div className="zm-empty-icon">💰</div>
            <div className="zm-empty-title">Data Kekayaan Belum Diisi</div>
            <p className="zm-empty-text">
              Lengkapi data kekayaan di halaman profil terlebih dahulu agar
              kalkulator zakat mal dapat bekerja dengan akurat.
            </p>
            <Link href="/user/profile" className="zm-empty-btn">
              ✏️ Lengkapi Profil
            </Link>
          </div>

        ) : (
          <div className="zm-layout">

            {/* ── FORM CARD ── */}
            <div className="zm-card">
              <div className="zm-card-header gold">
                <div className="zm-card-icon">⚖️</div>
                <div>
                  <div className="zm-card-title">Hitung Zakat Mal</div>
                  <div className="zm-card-sub">Nisab emas 85 gr · Tarif 2,5%</div>
                </div>
              </div>

              <div className="zm-card-body">

                {/* Info Box */}
                <div className="zm-info-box">
                  <span className="zm-info-icon">ℹ️</span>
                  <div className="zm-info-text">
                    <strong>Cara hitung:</strong> Zakat mal = 2,5% × (Total Harta − Hutang).
                    Wajib zakat jika harta bersih ≥ nisab dan telah dimiliki selama 1 tahun (haul).
                  </div>
                </div>

                {/* Data Otomatis dari Profil */}
                <div className="zm-auto-data-card">
                  <div className="zm-auto-data-header">
                    <span className="zm-auto-data-badge">📋 Data dari Profil</span>
                    <Link href="/user/profile" className="zm-auto-data-edit">
                      ✏️ Edit
                    </Link>
                  </div>
                  <div className="zm-auto-data-grid">
                    <div className="zm-auto-data-item">
                      <div className="zm-auto-data-label">Nama</div>
                      <div className="zm-auto-data-value">{profile.name || "—"}</div>
                    </div>
                    <div className="zm-auto-data-item highlight">
                      <div className="zm-auto-data-label">Total Harta</div>
                      <div className="zm-auto-data-value big">Rp {fmt(wealth)}</div>
                    </div>
                  </div>
                </div>

                {/* Input Hutang */}
                <div className="zm-field">
                  <label className="zm-label">Hutang (opsional)</label>
                  <div className="zm-input-wrap">
                    <span className="zm-prefix">Rp</span>
                    <input
                      className="zm-input"
                      type="number"
                      placeholder="0"
                      value={debts}
                      onChange={(e) => setDebts(e.target.value)}
                    />
                  </div>
                  <span className="zm-input-hint">
                    Masukkan total hutang yang jatuh tempo dalam waktu dekat
                  </span>
                </div>

                {/* Meta: Harta Bersih */}
                <div className="zm-meta-row">
                  <div className="zm-meta-item">
                    <div className="zm-meta-label">Total Harta</div>
                    <div className="zm-meta-val">Rp {fmt(wealth)}</div>
                  </div>
                  <div className="zm-meta-item">
                    <div className="zm-meta-label">Hutang</div>
                    <div className="zm-meta-val">Rp {fmt(debts || 0)}</div>
                  </div>
                  <div className="zm-meta-item">
                    <div className="zm-meta-label">Harta Bersih</div>
                    <div className="zm-meta-val gold-text">Rp {fmt(netWealth)}</div>
                  </div>
                </div>

                {/* Error */}
                {error && <div className="zm-error">⚠️ {error}</div>}

                {/* Buttons */}
                <div className="zm-btn-row">
                  <button
                    className={`zm-btn-submit${loading ? " loading" : ""}`}
                    onClick={handleCalculate}
                    disabled={loading || !hasWealth}
                  >
                    {loading ? "⏳ Menghitung…" : "⚖️ Hitung Zakat Mal"}
                  </button>
                  {result && (
                    <button className="zm-btn-reset" onClick={handleRecalculate}>
                      🔄 Ulangi
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* ── RESULT CARD ── */}
            {result && (
              <div className="zm-result-wrapper">
                <div className={`zm-result-card ${result.is_eligible ? "eligible" : "not-eligible"}`}>

                  <div className="zm-result-header">
                    <span className="zm-result-icon">
                      {result.is_eligible ? "✅" : "ℹ️"}
                    </span>
                    <span className="zm-result-status">
                      {result.is_eligible ? "Wajib Zakat" : "Belum Wajib Zakat"}
                    </span>
                  </div>

                  <div className="zm-result-body">

                    <div className="zm-result-main">
                      <div className="zm-result-label">Zakat yang harus dibayar</div>
                      <div className="zm-result-amount">
                        Rp {fmt(result.zakat_amount)}
                      </div>
                    </div>

                    <div className="zm-result-rows">
                      <div className="zm-result-row">
                        <span>Harta Bersih</span>
                        <span>Rp {fmt(netWealth)}</span>
                      </div>
                      <div className="zm-result-row">
                        <span>Nisab</span>
                        <span>Rp {fmt(result.nisab)}</span>
                      </div>
                      <div className="zm-result-divider" />
                      <div className="zm-result-row bold">
                        <span>Zakat (2,5%)</span>
                        <span>Rp {fmt(result.zakat_amount)}</span>
                      </div>
                    </div>

                    {result.is_eligible ? (
                      <button
                        className="zm-btn-submit"
                        onClick={() => setShowPay(true)}
                      >
                        💳 Bayar Sekarang
                      </button>
                    ) : (
                      <div className="zm-not-eligible-note">
                        Harta bersih Anda belum mencapai nisab. Terus tingkatkan
                        kebaikan dan pantau kembali di tahun mendatang.
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* ── MODAL BAYAR ── */}
      {showPay && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "32px 28px",
              width: "100%",
              maxWidth: 400,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Modal Header */}
            <div>
              <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>
                Konfirmasi Pembayaran
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1A2E0D", marginTop: 4 }}>
                Bayar Zakat Mal
              </div>
            </div>

            {/* Amount Display */}
            <div
              style={{
                background: "#FDF8EC",
                border: "1.5px solid #E8D08A",
                borderRadius: 12,
                padding: "20px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Jumlah Zakat
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#A57A12" }}>
                Rp {fmt(zakatAmount)}
              </div>
            </div>

            {/* Buttons */}
            <div className="zm-btn-row">
              <button className="zm-btn-submit" onClick={handlePay}>
                💳 Bayar Sekarang
              </button>
              <button className="zm-btn-reset" onClick={() => setShowPay(false)}>
                Nanti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}