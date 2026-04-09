"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import apiClient from "../api/apiClient"
import "./register.css"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) window.location.href = "/user/dashboard"
  }, [])

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await apiClient.post("/register", { name, email, password })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      window.location.href = "/user/dashboard"
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.message || "Server error. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const isValid = name && email && password.length >= 6

  return (
    <div className="reg-page">
      {/* Left Panel */}
      <div className="reg-left">
        <div className="reg-left-content">
          <div className="reg-brand">
            <div className="reg-logo">Zakat<span>Ku</span></div>
          </div>
          <h2 className="reg-left-title">
            Mulai Perjalanan<br />Zakat Anda
          </h2>
          <p className="reg-left-desc">
            Daftarkan akun dan mulai hitung zakat profesi
            serta zakat mal Anda dengan akurat berdasarkan
            nisab terkini.
          </p>

          <div className="reg-steps">
            <div className="reg-step">
              <div className="reg-step-num">1</div>
              <div>
                <div className="reg-step-title">Buat Akun</div>
                <div className="reg-step-sub">Daftar dengan email Anda</div>
              </div>
            </div>
            <div className="reg-step-line" />
            <div className="reg-step">
              <div className="reg-step-num">2</div>
              <div>
                <div className="reg-step-title">Hitung Zakat</div>
                <div className="reg-step-sub">Masukkan penghasilan atau harta</div>
              </div>
            </div>
            <div className="reg-step-line" />
            <div className="reg-step">
              <div className="reg-step-num">3</div>
              <div>
                <div className="reg-step-title">Tunaikan</div>
                <div className="reg-step-sub">Pantau dan catat pembayaran</div>
              </div>
            </div>
          </div>
        </div>

        <div className="reg-blob blob-1" />
        <div className="reg-blob blob-2" />
      </div>

      {/* Right Panel */}
      <div className="reg-right">
        <div className="reg-form-wrap">
          <div className="reg-form-header">
            <div className="reg-form-logo">Zakat<span>Ku</span></div>
            <h1 className="reg-form-title">Buat Akun Baru</h1>
            <p className="reg-form-sub">Isi data diri Anda untuk memulai</p>
          </div>

          <form className="reg-form" onSubmit={handleRegister}>
            {error && (
              <div className="reg-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                {error}
              </div>
            )}

            {/* Nama */}
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

            {/* Email */}
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

            {/* Password */}
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
              {/* Password strength indicator */}
              {password && (
                <div className="reg-strength">
                  <div className={`reg-strength-bar ${password.length >= 8 ? "strong" : password.length >= 6 ? "medium" : "weak"}`} />
                  <span className={`reg-strength-label ${password.length >= 8 ? "strong" : password.length >= 6 ? "medium" : "weak"}`}>
                    {password.length >= 8 ? "Kuat" : password.length >= 6 ? "Cukup" : "Terlalu pendek"}
                  </span>
                </div>
              )}
            </div>

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

          <p className="reg-footer-note">
            Sudah punya akun?{" "}
            <Link href="/login" className="reg-login-link">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  )
}