/**
 * ProfilePage — halaman edit profil user (muzakki).
 * Menampilkan informasi user (nama, email, role) dan form edit profil.
 * 
 * Data profil yang bisa diubah:
 * - Nomor KTP (16 digit)
 * - Pekerjaan / Profesi
 * - Penghasilan per bulan (Rp)
 * - Total kekayaan / harta (Rp)
 * 
 * Data ini digunakan oleh kalkulator zakat untuk menghitung secara otomatis.
 */
"use client"

import { useEffect, useState } from "react"
import apiClient from "../../api/apiClient"
import Sidebar from "../../components/Sidebar"
import "./profile.css"

// Fungsi utilitas format angka ke format Indonesia
const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

export default function ProfilePage() {
  // State form — menyimpan data profil yang sedang diedit
  const [form, setForm] = useState({ ktp: "", income: "", job: "", wealth: "" })
  // State data user (nama, email)
  const [user, setUser] = useState(null)
  // State loading saat proses simpan profil
  const [loading, setLoading] = useState(false)
  // State loading awal saat mengambil data profil
  const [fetching, setFetching] = useState(true)
  // State toast notification (success/error)
  const [toast, setToast] = useState(null)

  /**
   * Mengambil data profil user saat komponen pertama kali dimuat.
   * Menggunakan endpoint /dashboard yang mengembalikan user + profile.
   */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/dashboard")
        const u = res.data.user
        const p = res.data.profile
        // Set data user (nama, email)
        if (u) setUser(u)
        // Set data form dengan nilai profil yang sudah ada dari database
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

  // Handler perubahan input form — update state sesuai nama field
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  /**
   * Menampilkan toast notification selama 3 detik.
   * @param {string} type - "success" atau "error"
   * @param {string} msg - pesan yang ditampilkan
   */
  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  /**
   * Handler submit form — mengirim data profil ke API /profile.
   * Menggunakan method POST dengan data dari state form.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Kirim data profil ke backend
      const res = await apiClient.post("/profile", form)
      // Update data user di localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user))
      showToast("success", "Profil berhasil diperbarui!")
    } catch (err) {
      console.log(err)
      showToast("error", "Gagal memperbarui profil. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  // Generate inisial nama untuk avatar (misal: "Ahmad Fauzi" → "AF")
  const initials = user?.name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?"

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar navigasi kiri */}
      <Sidebar />

      {/* Toast Notification — muncul di atas saat simpan berhasil/gagal */}
      {toast && (
        <div className={`pf-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <main className="pf-main">
        {/* Top Bar — breadcrumb dan judul halaman */}
        <div className="pf-topbar">
          <div>
            <small className="pf-breadcrumb">Akun</small>
            <h1 className="pf-title">Profil Saya</h1>
          </div>
        </div>

        {/* Loading state saat mengambil data profil */}
        {fetching ? (
          <div className="pf-loading">Memuat data profil...</div>
        ) : (
          <div className="pf-layout">
            {/* Kolom kiri — Card informasi user */}
            <div className="pf-user-col">
              <div className="pf-user-card">
                {/* Avatar dengan inisial nama */}
                <div className="pf-avatar-wrap">
                  <div className="pf-avatar">{initials}</div>
                </div>
                {/* Nama dan email user */}
                <div className="pf-user-name">{user?.name || "-"}</div>
                <div className="pf-user-email">{user?.email || "-"}</div>
                {/* Badge role */}
                <div className="pf-user-role">
                  <span className="pf-role-badge">Muzakki</span>
                </div>

                {/* Statistik singkat — pekerjaan dan penghasilan */}
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

              {/* Info card — menjelaskan kegunaan data profil */}
              <div className="pf-info-card">
                <div className="pf-info-icon">💡</div>
                <div className="pf-info-text">
                  Data profil digunakan untuk mempermudah perhitungan zakat secara otomatis.
                </div>
              </div>
            </div>

            {/* Kolom kanan — Form edit profil */}
            <div className="pf-form-col">
              <div className="pf-form-card">
                {/* Header form */}
                <div className="pf-form-header">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Profil
                </div>

                <form className="pf-form" onSubmit={handleSubmit}>
                  {/* Input: Nomor KTP */}
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
                    {/* Validasi KTP — harus 16 digit */}
                    {form.ktp && form.ktp.length !== 16 && (
                      <div className="pf-field-hint warn">KTP harus 16 digit ({form.ktp.length}/16)</div>
                    )}
                  </div>

                  {/* Input: Pekerjaan */}
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

                  {/* Input: Penghasilan per bulan */}
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
                    {/* Hint format angka yang sudah diformat */}
                    {form.income && (
                      <div className="pf-field-hint">{fmt(form.income)} rupiah / bulan</div>
                    )}
                  </div>

                  {/* Input: Total Kekayaan */}
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
                    {/* Hint format angka yang sudah diformat */}
                    {form.wealth && (
                      <div className="pf-field-hint">{fmt(form.wealth)} rupiah</div>
                    )}
                  </div>

                  {/* Tombol simpan profil */}
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