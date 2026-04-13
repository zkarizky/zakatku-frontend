// Import library axios untuk HTTP requests
import axios from "axios"

/**
 * apiClient — instance Axios yang sudah dikonfigurasi untuk berkomunikasi
 * dengan API backend Laravel (http://127.0.0.1:8000/api).
 * Semua request dari frontend akan melewati instance ini.
 */
const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api"  // Base URL API backend
})

/**
 * Interceptor Request — menyisipkan token autentikasi (Bearer token)
 * secara otomatis ke setiap request yang keluar.
 * Token diambil dari localStorage yang disimpan saat login.
 */
apiClient.interceptors.request.use((config) => {
  // Ambil token dari localStorage
  const token = localStorage.getItem("token")

  // Jika token ada, tambahkan ke header Authorization
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default apiClient