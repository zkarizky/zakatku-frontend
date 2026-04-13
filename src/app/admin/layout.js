/**
 * AdminLayout — layout wrapper untuk semua halaman di area admin (/admin/*).
 * Saat ini hanya membungkus children tanpa pengecekan tambahan di sisi client.
 * Proteksi akses admin dilakukan oleh middleware backend (auth:sanctum + role:admin).
 */
import Sidebar from "../components/Sidebar"

export default function AdminLayout({ children }) {
  return (
    <>
      {/* Render halaman admin (children) */}
      {children}
    </>
  )
}