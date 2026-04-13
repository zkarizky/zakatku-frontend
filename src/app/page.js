/**
 * Root Page — halaman awal aplikasi (route "/").
 * Berfungsi sebagai router guard/redirect:
 * - Jika user sudah login (ada token), redirect ke dashboard user
 * - Jika belum login, redirect ke halaman login
 * Tidak me-render UI apapun (return null).
 */
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  // Cek status autentikasi saat halaman pertama kali dimuat
  useEffect(() => {
    // Ambil token dari localStorage
    const token = localStorage.getItem("token")

    if (token) {
      // Sudah login → arahkan ke dashboard user
      router.replace("/user/dashboard")
    } else {
      // Belum login → arahkan ke halaman login
      router.replace("/login")
    }
  }, [])

  // Tidak menampilkan UI karena hanya berfungsi sebagai redirect
  return null
}