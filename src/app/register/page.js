/**
 * RegisterPage — halaman registrasi akun baru ZakatKu.
 * Menampilkan form nama, email, dan password dengan panel kiri berisi langkah pendaftaran.
 * 
 * Fitur:
 * - Auto-redirect jika sudah login (ada token)
 * - Validasi client-side (nama wajib, email wajib, password min 6 karakter)
 * - Password strength indicator (lemah/cukup/kuat)
 * - Toggle show/hide password
 * - Loading state dan error handling
 */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import apiClient from "../api/apiClient"
import "./register.css"

export default function RegisterPage() {
  // State untuk menyimpan input form registrasi
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // State toggle visibilitas password
  const [showPassword, setShowPassword] = useState(false)
  // State loading saat proses registrasi berlangsung
  const [loading, setLoading] = useState(false)
  // State pesan error dari server
  const [error, setError] = useState("")

  /**
   * Auto-redirect: Jika user sudah login (ada token),
   * langsung redirect ke dashboard user.
   */
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) window.location.href = "/user/dashboard"
  }, [])

  /**
   * Handler submit form register.
   * Mengirim data ke API /register, menyimpan token & user ke localStorage,
   * lalu redirect ke dashboard user.
   */
  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      // Kirim data registrasi ke backend
      const res = await apiClient.post("/register", { name, email, password })
      // Simpan token dan data user ke localStorage
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      // Redirect ke dashboard user setelah berhasil daftar
      window.location.href = "/user/dashboard"
    } catch (err) {
      console.log(err)
      // Tampilkan pesan error dari server atau pesan default
      setError(err.response?.data?.message || "Server error. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  // Validasi form — tombol submit aktif hanya jika semua field valid
  const isValid = name && email && password.length >= 6

  return (
    <div className="reg-page">
      {/* Left Panel — informasi langkah registrasi */}
      <div className="reg-left">
        <div className="reg-left-content">
          {/* Logo Brand */}
          <div className="reg-brand">
            <div className="reg-logo">Zakat<span>Ku</span></div>
          </div>
          {/* Judul dan deskripsi panel kiri */}
          <h2 className="reg-left-title">
            Mulai Perjalanan<br />Zakat Anda
          </h2>
          <p className="reg-left-desc">
            Daftarkan akun dan mulai hitung zakat profesi
            serta zakat mal Anda dengan akurat berdasarkan
            nisab terkini.
          </p>

          {/* Langkah-langkah pendaftaran (visual stepper) */}
          <div className="reg-steps">
            {/* Langkah 1: Buat Akun */}
            <div className="reg-step">
              <div className="reg-step-num">1</div>
              <div>
                <div className="reg-step-title">Buat Akun</div>
                <div className="reg-step-sub">Daftar dengan email Anda</div>
              </div>
            </div>
            <div className="reg-step-line" />
            {/* Langkah 2: Hitung Zakat */}
            <div className="reg-step">
              <div className="reg-step-num">2</div>
              <div>
                <div className="reg-step-title">Hitung Zakat</div>
                <div className="reg-step-sub">Masukkan penghasilan atau harta</div>
              </div>
            </div>
            <div className="reg-step-line" />
            {/* Langkah 3: Tunaikan */}
            <div className="reg-step">
              <div className="reg-step-num">3</div>
              <div>
                <div className="reg-step-title">Tunaikan</div>
                <div className="reg-step-sub">Pantau dan catat pembayaran</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative blobs — elemen dekorasi visual */}
        <div className="reg-blob blob-1" />
        <div className="reg-blob blob-2" />
      </div>

      {/* Right Panel — Form registrasi */}
      <div className="reg-right">
        <div className="reg-form-wrap">
          {/* Header form */}
          <div className="reg-form-header">
            <div className="reg-form-logo">Zakat<span>Ku</span></div>
            <h1 className="reg-form-title">Buat Akun Baru</h1>
            <p className="reg-form-sub">Isi data diri Anda untuk memulai</p>
          </div>

          <form className="reg-form" onSubmit={handleRegister}>
            {/* Pesan error — ditampilkan jika registrasi gagal */}
            {error && (
              <div className="reg-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                {error}
              </div>
            )}

            {/* Input Nama Lengkap */}
            <div className="reg-field">
              <label className="reg-label">Nama Lengkap</label>
              <div className="reg-input-wrap">
                <svg className="reg-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input
                  className="reg-input"
                  type="text"
                  placeholder="Ahmad Fauzi"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Input Email */}
            <div className="reg-field">
              <label className="reg-label">Email</label>
              <div className="reg-input-wrap">
                <svg className="reg-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                  className="reg-input"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Input Password dengan toggle show/hide dan strength indicator */}
            <div className="reg-field">
              <label className="reg-label">Password</label>
              <div className="reg-input-wrap">
                <svg className="reg-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <input
                  className="reg-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                {/* Tombol toggle show/hide password */}
                <button
                  type="button"
                  className="reg-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {/* Password strength indicator — muncul saat user mulai mengetik */}
              {password && (
                <div className="reg-strength">
                  <div className={`reg-strength-bar ${password.length >= 8 ? "strong" : password.length >= 6 ? "medium" : "weak"}`} />
                  <span className={`reg-strength-label ${password.length >= 8 ? "strong" : password.length >= 6 ? "medium" : "weak"}`}>
                    {password.length >= 8 ? "Kuat" : password.length >= 6 ? "Cukup" : "Terlalu pendek"}
                  </span>
                </div>
              )}
            </div>

            {/* Tombol submit register — disabled saat loading atau validasi gagal */}
            <button
              className={`reg-btn ${loading ? "loading" : ""}`}
              type="submit"
              disabled={!isValid || loading}
            >
              {loading ? (
                <><span className="reg-spinner" /> Mendaftar...</>
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          </form>

          {/* Link ke halaman login */}
          <p className="reg-footer-note">
            Sudah punya akun?{" "}
            <Link href="/login" className="reg-login-link">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  )
}