/**
 * UserLayout — layout wrapper untuk semua halaman di area user (/user/*).
 * Berfungsi sebagai route guard:
 * - Mengecek apakah user sudah login (ada token di localStorage)
 * - Jika belum login, redirect paksa ke halaman /login
 * - Jika sudah login, render children (halaman user)
 */
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "../components/Sidebar"

export default function UserLayout({ children }) {
  const router = useRouter()

  // Cek autentikasi saat layout pertama kali dimuat
  useEffect(() => {
    const token = localStorage.getItem("token")

    // Jika tidak ada token, user belum login → redirect ke login
    if (!token) {
      router.replace("/login")
    }
  }, [])

  // Render children tanpa sidebar tambahan (Sidebar sudah di-include di masing-masing page)
  return (
    <>
      {children}
    </>
  )
}