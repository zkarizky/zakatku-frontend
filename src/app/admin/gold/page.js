"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import apiClient from "../../api/apiClient"
import SidebarAdmin from "../../components/SidebarAdmin"
import "./goldpage.css"

const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

// ── Main Page ──────────────────────────────────────────────
export default function GoldPage() {
  const [price, setPrice] = useState("")
  const [currentPrice, setCurrentPrice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null) // { type: "success"|"error", msg }

  useEffect(() => {
    apiClient.get("/gold-price")
      .then(res => setCurrentPrice(res.data.price))
      .catch(e => console.log(e))
      .finally(() => setLoading(false))
  }, [])

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  const handleUpdate = async () => {
    if (!price) return
    setSaving(true)
    try {
      await apiClient.post("/admin/gold-price", { price: Number(price) })
      setCurrentPrice(Number(price))
      setPrice("")
      showToast("success", "Harga emas berhasil diperbarui!")
    } catch (e) {
      console.log(e)
      showToast("error", "Gagal memperbarui harga. Coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  // Nisab calculations based on gold price
  const nisabMal     = currentPrice ? currentPrice * 85 : null
  const nisabProfesi = currentPrice ? currentPrice * 85 / 12 : null

  return (
    <div style={{ display: "flex" }}>
      <SidebarAdmin />

      {/* Toast */}
      {toast && (
        <div className={`gp-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <main className="gp-main">
        {/* Top Bar */}
        <div className="gp-topbar">
          <div>
            <small className="gp-breadcrumb">Admin Panel</small>
            <h1 className="gp-title">Harga Emas</h1>
          </div>
        </div>

        <div className="gp-layout">
          {/* Current Price Card */}
          <div className="gp-current-card">
            <div className="gp-current-left">
              <div className="gp-gold-icon">🪙</div>
              <div>
                <div className="gp-current-label">Harga Emas Saat Ini</div>
                {loading ? (
                  <div className="gp-current-value muted">Memuat...</div>
                ) : (
                  <div className="gp-current-value">
                    Rp {fmt(currentPrice)} <span>/gram</span>
                  </div>
                )}
                <div className="gp-current-sub">
                  Digunakan untuk menghitung nisab zakat
                </div>
              </div>
            </div>
            <div className="gp-gold-deco">◈</div>
          </div>

          {/* Update Form */}
          <div className="gp-form-card">
            <div className="gp-form-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Update Harga Emas
            </div>

            <div className="gp-form-body">
              <div className="gp-info-box">
                <div>💡</div>
                <div>Harga emas digunakan sebagai acuan <strong>nisab zakat mal</strong> (85 gram) dan <strong>nisab zakat profesi</strong>. Pastikan harga sesuai harga pasar terkini.</div>
              </div>

              <div className="gp-field">
                <label className="gp-label">Harga Emas Baru (Rp / gram)</label>
                <div className="gp-input-wrap">
                  <span className="gp-prefix">Rp</span>
                  <input
                    className="gp-input"
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                  <span className="gp-suffix">/gram</span>
                </div>
                {price && (
                  <div className="gp-input-hint">{fmt(price)} rupiah per gram</div>
                )}
              </div>

              {/* Preview nisab */}
              {price && (
                <div className="gp-preview">
                  <div className="gp-preview-title">Preview Nisab Baru</div>
                  <div className="gp-preview-row">
                    <span>Nisab Zakat Mal (85g)</span>
                    <strong>Rp {fmt(Number(price) * 85)}</strong>
                  </div>
                  <div className="gp-preview-divider" />
                  <div className="gp-preview-row">
                    <span>Nisab Profesi / bulan</span>
                    <strong>Rp {fmt(Math.round(Number(price) * 85 / 12))}</strong>
                  </div>
                </div>
              )}

              <button
                className={`gp-btn ${saving ? "loading" : ""}`}
                onClick={handleUpdate}
                disabled={!price || saving}
              >
                {saving ? "Menyimpan..." : "💾 Simpan Harga Baru"}
              </button>
            </div>
          </div>

          {/* Nisab Info Cards */}
          {!loading && currentPrice && (
            <div className="gp-nisab-row">
              <div className="gp-nisab-card">
                <div className="gp-nisab-icon green">🌿</div>
                <div className="gp-nisab-label">Nisab Zakat Mal</div>
                <div className="gp-nisab-value">Rp {fmt(nisabMal)}</div>
                <div className="gp-nisab-sub">85 gram × Rp {fmt(currentPrice)}</div>
              </div>
              <div className="gp-nisab-card">
                <div className="gp-nisab-icon gold">💼</div>
                <div className="gp-nisab-label">Nisab Zakat Profesi</div>
                <div className="gp-nisab-value">Rp {fmt(Math.round(nisabProfesi))}</div>
                <div className="gp-nisab-sub">Nisab mal ÷ 12 bulan</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}