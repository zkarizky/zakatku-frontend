"use client"

import { useState, useEffect } from "react"
import apiClient from "../api/apiClient"
import "./login.css"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    if (token && user) {
      window.location.href = user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await apiClient.post("/login", { email, password })

      const { token, user } = res.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      // 🔥 redirect berdasarkan role
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/user/dashboard")
      }

    } catch (err) {
      console.log(err)
      setError("Email atau password salah")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-brand">
            <div className="login-logo">Zakat<span>Ku</span></div>
          </div>
          <h2 className="login-left-title">
            Kelola Zakat<br />dengan Mudah & Tepat
          </h2>
          <p className="login-left-desc">
            Hitung zakat profesi dan zakat mal secara otomatis
            sesuai nisab terkini. Catat, pantau, dan tunaikan
            kewajiban zakat Anda dengan lebih teratur.
          </p>

          <div className="login-features">
            <div className="login-feature-item">
              <div className="login-feature-icon">🧮</div>
              <div>
                <div className="login-feature-title">Kalkulator Otomatis</div>
                <div className="login-feature-sub">Zakat profesi & mal sesuai nisab</div>
              </div>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">📊</div>
              <div>
                <div className="login-feature-title">Riwayat Lengkap</div>
                <div className="login-feature-sub">Pantau semua transaksi zakat</div>
              </div>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">🪙</div>
              <div>
                <div className="login-feature-title">Harga Emas Terkini</div>
                <div className="login-feature-sub">Nisab selalu up to date</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="login-blob blob-1" />
        <div className="login-blob blob-2" />
      </div>

      {/* Right Panel - Form */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <div className="login-form-logo">Zakat<span>Ku</span></div>
            <h1 className="login-form-title">Selamat Datang</h1>
            <p className="login-form-sub">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            {error && (
              <div className="login-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="login-field">
              <label className="login-label">Email</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                  className="login-input"
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
            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <input
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
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
            </div>

            <button
              className={`login-btn ${loading ? "loading" : ""}`}
              type="submit"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <><span className="login-spinner" /> Masuk...</>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <p className="reg-footer-note">
            Belum punya akun?{" "}
            <Link href="/register" className="reg-login-link">Daftar di sini</Link>
          </p>
        </div>
      </div>
    </div>
  )
}