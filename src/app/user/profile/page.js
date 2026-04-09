"use client"

import { useEffect, useState } from "react"
import apiClient from "../../api/apiClient"
import Sidebar from "../../components/Sidebar"
import "./profile.css"

const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

export default function ProfilePage() {
  const [form, setForm] = useState({ ktp: "", income: "", job: "", wealth: "" })
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/dashboard")
        const u = res.data.user
        const p = res.data.profile
        if (u) setUser(u)
        if (p) setForm({
          ktp: p.ktp || "",
          job: p.job || "",
          income: p.income || "",
          wealth: p.wealth || "",
        })
      } catch (err) {
        console.log(err)
      } finally {
        setFetching(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiClient.post("/profile", form)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      showToast("success", "Profil berhasil diperbarui!")
    } catch (err) {
      console.log(err)
      showToast("error", "Gagal memperbarui profil. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const initials = user?.name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?"

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      {toast && (
        <div className={`pf-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <main className="pf-main">
        {/* Top Bar */}
        <div className="pf-topbar">
          <div>
            <small className="pf-breadcrumb">Akun</small>
            <h1 className="pf-title">Profil Saya</h1>
          </div>
        </div>

        {fetching ? (
          <div className="pf-loading">Memuat data profil...</div>
        ) : (
          <div className="pf-layout">
            {/* Left — User Card */}
            <div className="pf-user-col">
              <div className="pf-user-card">
                <div className="pf-avatar-wrap">
                  <div className="pf-avatar">{initials}</div>
                </div>
                <div className="pf-user-name">{user?.name || "-"}</div>
                <div className="pf-user-email">{user?.email || "-"}</div>
                <div className="pf-user-role">
                  <span className="pf-role-badge">Muzakki</span>
                </div>

                <div className="pf-user-stats">
                  <div className="pf-stat">
                    <div className="pf-stat-label">Pekerjaan</div>
                    <div className="pf-stat-val">{form.job || "—"}</div>
                  </div>
                  <div className="pf-stat-divider" />
                  <div className="pf-stat">
                    <div className="pf-stat-label">Penghasilan</div>
                    <div className="pf-stat-val">
                      {form.income ? `Rp ${fmt(form.income)}` : "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info card */}
              <div className="pf-info-card">
                <div className="pf-info-icon">💡</div>
                <div className="pf-info-text">
                  Data profil digunakan untuk mempermudah perhitungan zakat secara otomatis.
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="pf-form-col">
              <div className="pf-form-card">
                <div className="pf-form-header">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Profil
                </div>

                <form className="pf-form" onSubmit={handleSubmit}>
                  {/* KTP */}
                  <div className="pf-field">
                    <label className="pf-label">Nomor KTP</label>
                    <div className="pf-input-wrap">
                      <svg className="pf-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                      <input
                        className="pf-input"
                        name="ktp"
                        type="text"
                        placeholder="16 digit nomor KTP"
                        value={form.ktp}
                        onChange={handleChange}
                        maxLength={16}
                      />
                    </div>
                    {form.ktp && form.ktp.length !== 16 && (
                      <div className="pf-field-hint warn">KTP harus 16 digit ({form.ktp.length}/16)</div>
                    )}
                  </div>

                  {/* Pekerjaan */}
                  <div className="pf-field">
                    <label className="pf-label">Pekerjaan</label>
                    <div className="pf-input-wrap">
                      <svg className="pf-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-4 0v2M12 12v4M10 14h4"/></svg>
                      <input
                        className="pf-input"
                        name="job"
                        type="text"
                        placeholder="contoh: Software Engineer"
                        value={form.job}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Penghasilan */}
                  <div className="pf-field">
                    <label className="pf-label">Penghasilan Per Bulan (Rp)</label>
                    <div className="pf-input-wrap">
                      <span className="pf-prefix">Rp</span>
                      <input
                        className="pf-input"
                        name="income"
                        type="number"
                        placeholder="0"
                        value={form.income}
                        onChange={handleChange}
                      />
                    </div>
                    {form.income && (
                      <div className="pf-field-hint">{fmt(form.income)} rupiah / bulan</div>
                    )}
                  </div>

                  {/* Kekayaan */}
                  <div className="pf-field">
                    <label className="pf-label">Total Kekayaan / Harta (Rp)</label>
                    <div className="pf-input-wrap">
                      <span className="pf-prefix">Rp</span>
                      <input
                        className="pf-input"
                        name="wealth"
                        type="number"
                        placeholder="0"
                        value={form.wealth}
                        onChange={handleChange}
                      />
                    </div>
                    {form.wealth && (
                      <div className="pf-field-hint">{fmt(form.wealth)} rupiah</div>
                    )}
                  </div>

                  <div className="pf-form-footer">
                    <button
                      className={`pf-btn ${loading ? "loading" : ""}`}
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <><span className="pf-spinner" /> Menyimpan...</>
                      ) : (
                        "💾 Simpan Perubahan"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}