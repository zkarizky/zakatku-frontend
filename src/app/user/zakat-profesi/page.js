"use client" // Komponen ini dirender di sisi klien (browser) pada Next.js

import { useEffect, useState } from "react"
import apiClient from "../../api/apiClient" // Client axios yang sudah disetup (mungkin memiliki base URL dan interceptor)
import Sidebar from "../../components/Sidebar"
import "../zakat/zakat2.css"

// Fungsi utilitas untuk memformat angka menjadi format mata uang Indonesia (misal: 1.000.000)
const fmt = (n) => Number(n || 0).toLocaleString("id-ID")

export default function ZakatProfesi() {
  // --- INisialisasi State (Variabel reaktif) ---
  const [profile, setProfile] = useState(null)          // Menyimpan data profil user (pendapatan, pekerjaan, dll)
  const [period, setPeriod] = useState("bulanan")       // Opsi periode perhitungan: 'bulanan' atau 'tahunan'
  const [salaryType, setSalaryType] = useState("kotor") // Pilihan metode penghasilan: 'kotor' (bruto) atau 'bersih' (net)
  const [expenses, setExpenses] = useState("")          // Nilai pengeluaran pokok (aktif jika salaryType == 'bersih')
  const [result, setResult] = useState(null)            // Menyimpan hasil perhitungan zakat dari backend
  const [loading, setLoading] = useState(false)         // Status loading saat tombol 'Hitung' ditekan
  const [fetching, setFetching] = useState(true)        // Status loading awal ketika mengambil data profil
  const [error, setError] = useState(null)              // Menyimpan pesan error jika ada kegagalan HTTP
  const [showPay, setShowPay] = useState(false)         // Flag untuk menampilkan modal konfirmasi pembayaran
  const [paying, setPaying] = useState(false)           // Status loading saat tombol 'Bayar' di modal ditekan

  // --- Mengambil Data Profil ---
  // Hook useEffect ini akan dijalankan satu kali saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Melakukan request GET ke endpoint dashboard untuk mendapatkan profil user terkini
        const res = await apiClient.get("/dashboard")
        const p = res.data.profile
        const u = res.data.user
        // Jika profil ada, gabungkan dengan nama dari objek user lalu setel ke state
        if (p) setProfile({ ...p, name: u?.name || "" })
      } catch (err) {
        console.log(err)
      } finally {
        setFetching(false) // Menghentikan indikator loading
      }
    }
    fetchProfile()
  }, [])

  // --- Perhitungan Dasar (Client-Side Preview) ---
  const baseIncome = Number(profile?.income || 0)                          // Gaji bulanan dasar dari database profil
  const income = period === "tahunan" ? baseIncome * 12 : baseIncome         // Jika setahun, gaji bulanan dikalikan 12
  const netIncome = salaryType === "bersih"                                 
    ? income - Number(expenses || 0)                                         // Penghasilan bersih = penghasilan awal - pengeluaran
    : income                                                                 // Jika 'kotor', biarkan sama

  // --- Handler Menghitung Zakat ---
  const handleCalculate = async () => {
    setLoading(true)
    setError(null)
    try {
      // Mengirim konfigurasi ke backend untuk dihitung sesuai syariat
      const res = await apiClient.post("/zakat", {
        type: "profesi",                                                     // Tipe Zakat: Profesi
        income,                                                              // Nominal Penghasilan
        period,                                                              // Bulanan atau Tahunan
        salary_type: salaryType,                                             // Metode pendapatan
        expenses: salaryType === "bersih" ? Number(expenses || 0) : null,    // Kirim nominal pengeluaran jika gaji bersih
      })
      // Simpan objek dari backend (berisi nisab, zakat_amount, is_eligible)
      setResult(res.data)
    } catch (err) {
      setError("Gagal menghitung zakat. Coba lagi.")
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  // --- Handler Pembayaran (Integrasi Payment Gateway) ---
  const handlePay = async () => {
  try {
    const res = await apiClient.post("/midtrans/transaction", {
      amount: result.zakat_amount,
      zakat_id: result.id
    })

    window.snap.pay(res.data.snap_token, {
      onSuccess: function (result) {
        alert("Pembayaran berhasil!")
      },
      onPending: function (result) {
        alert("Menunggu pembayaran")
      },
      onError: function (result) {
        alert("Pembayaran gagal")
      }
    })

  } catch (err) {
    console.log(err)
  }
}

  // Jika kondisi masih memuat data di awal, tampilkan layar render Loading
  if (fetching) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#4A7C2F" }}>
      <p>Memuat data...</p>
    </div>
  )

  // Main UI
  return (
    <div style={{ display: "flex" }}>
      {/* Memanggil Komponen Sidebar Kiri Navigasi */}
      <Sidebar />

      {/* ── Modal Konfirmasi Pembayaran ── */}
      {/* Tampil hanya jika boolean showPay adalah true */}
      {showPay && (
        <div className="zp2-modal-overlay">
          <div className="zp2-modal">
            <div className="zp2-modal-icon">💳</div>
            <div className="zp2-modal-title">Bayar Zakat Profesi</div>
            <div className="zp2-modal-desc">
              Konfirmasi pembayaran zakat profesi Anda melalui Midtrans.
            </div>

            <div className="zp2-modal-amount-box">
              <div className="zp2-modal-amount-label">Total yang dibayarkan</div>
              {/* Tampilkan total pajak yang diambil dari state result */}
              <div className="zp2-modal-amount">Rp {fmt(result?.zakat_amount)}</div>
            </div>

            {/* Rincian item saat checkout di box abu-abu (Modal) */}
            <div className="zp2-modal-rows">
              <div className="zp2-modal-row">
                <span>Periode</span>
                <span>{period === "bulanan" ? "Bulanan" : "Tahunan"}</span>
              </div>
              <div className="zp2-modal-row">
                <span>Metode</span>
                <span>{salaryType === "kotor" ? "Gaji Kotor" : "Gaji Bersih"}</span>
              </div>
              <div className="zp2-modal-row">
                <span>Tarif</span>
                <span>2.5%</span>
              </div>
            </div>

            {/* Tombol aksi Modal */}
            <div className="zp2-modal-actions">
              <button className="zp2-modal-cancel" onClick={() => setShowPay(false)}>
                Batal
              </button>
              <button
                className={`zp2-modal-pay ${paying ? "loading" : ""}`}
                onClick={handlePay}
                disabled={paying}
              >
                {paying ? <><span className="zp2-spinner" /> Memproses...</> : "💳 Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Area Konten Utama ── */}
      <main className="zp2-main">
        {/* Top Bar Layout (Judul Halaman) */}
        <div className="zp2-topbar">
          <div>
            <small className="zp2-breadcrumb">Zakat Profesi</small>
            <h1 className="zp2-title">Kalkulator Zakat Profesi</h1>
          </div>
        </div>

        {/* Struktur Wrapper Layout Form & Result (Kolom Form Calculate) */}
        <div className="zp2-layout">
          
          {/* Card untuk Pengisian Form Zakat */}
          <div className="zp2-card">
            <div className="zp2-card-header">
              <div className="zp2-card-icon">🧮</div>
              <div>
                <div className="zp2-card-title">Hitung Zakat Profesi</div>
                <div className="zp2-card-sub">2.5% dari penghasilan yang mencapai nisab</div>
              </div>
            </div>

            <div className="zp2-card-body">

              {/* Tampilkan banner Informasi Profil / Memakai data database jika profil ditemukan */}
              {profile ? (
                <div className="zp2-profile-banner">
                  <div className="zp2-profile-avatar">
                    {/* Logika Extract dan Format Inisial Nama Depan & Belakang */}
                    {profile.name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?"}
                  </div>
                  <div className="zp2-profile-info">
                    <div className="zp2-profile-name">{profile.name}</div>
                    <div className="zp2-profile-job">{profile.job || "Pekerjaan belum diisi"}</div>
                  </div>
                  <div className="zp2-profile-income">
                    <div className="zp2-profile-income-label">Penghasilan</div>
                    <div className="zp2-profile-income-val">Rp {fmt(profile.income)}/bln</div>
                  </div>
                </div>
              ) : (
                // Peringatan jika data gaji dari profil kosong
                <div className="zp2-info-box warn">
                  ⚠️ Lengkapi profil Anda terlebih dahulu agar penghasilan terisi otomatis.
                </div>
              )}

              {/* Kotak Info Standar Nisab Pengguna */}
              <div className="zp2-info-box">
                <div>💡</div>
                <div>Nisab zakat profesi setara <strong>520 kg beras</strong> atau <strong>85 gram emas</strong>. Tarif zakat adalah <strong>2.5%</strong>.</div>
              </div>

              {/* Input Group: Pilihan Siklus Zakat (Switch Toggle Action) */}
              <div className="zp2-field">
                <label className="zp2-label">Periode Hitung</label>
                <div className="zp2-toggle">
                  {/* Memetakan button array dan apply style "active" khusus yang dipilih */}
                  {["bulanan", "tahunan"].map(p => (
                    <button
                      key={p}
                      className={`zp2-toggle-btn ${period === p ? "active" : ""}`}
                      onClick={() => { setPeriod(p); setResult(null) }}
                    >
                      {p === "bulanan" ? "📅 Bulanan" : "📆 Tahunan"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Group: Pilihan Metode Penyesuaian Pengeluaran */}
              <div className="zp2-field">
                <label className="zp2-label">Metode Penghasilan</label>
                <div className="zp2-option-group">
                  {[
                    { val: "kotor", icon: "💰", title: "Gaji Kotor", sub: "Sebelum potongan" },
                    { val: "bersih", icon: "🧾", title: "Gaji Bersih", sub: "Setelah pengeluaran" },
                  ].map(opt => (
                    <div
                      key={opt.val}
                      className={`zp2-option ${salaryType === opt.val ? "active" : ""}`}
                      onClick={() => { setSalaryType(opt.val); setResult(null) }}
                    >
                      <div className="zp2-option-icon">{opt.icon}</div>
                      <div>
                        <div className="zp2-option-title">{opt.title}</div>
                        <div className="zp2-option-sub">{opt.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tampilkan visual angka Final yang dikalkulasikan frontend (Preview) */}
              <div className="zp2-field">
                <label className="zp2-label">
                  Penghasilan {period === "bulanan" ? "Per Bulan" : "Per Tahun"}
                </label>
                <div className="zp2-income-display">
                  <span className="zp2-income-prefix">Rp</span>
                  <span className="zp2-income-value">{fmt(income)}</span>
                   {/* Note kecil memberitahu jika disetahunkan rumus matematikanya */}
                  {period === "tahunan" && (
                    <span className="zp2-income-note">({fmt(baseIncome)}/bln × 12)</span>
                  )}
                </div>
                {!profile?.income && (
                  <div className="zp2-field-hint warn">⚠️ Penghasilan belum diatur di profil</div>
                )}
              </div>

              {/* Input Text Box untuk Pengeluaran (Muncul Bersyarat hanya jika pilih 'gajian bersih') */}
              {salaryType === "bersih" && (
                <div className="zp2-field">
                  <label className="zp2-label">Total Pengeluaran Pokok (Rp)</label>
                  <div className="zp2-input-wrap">
                    <span className="zp2-prefix">Rp</span>
                    <input
                      className="zp2-input"
                      type="number"
                      placeholder="0"
                      value={expenses}
                      onChange={e => { setExpenses(e.target.value); setResult(null) }}
                    />
                  </div>
                  {expenses && income && (
                    <div className="zp2-net-hint">
                      Penghasilan bersih: <strong>Rp {fmt(netIncome)}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Meta Informasi Ringkasan di Baris Bawah Form */}
              <div className="zp2-meta-row">
                <div className="zp2-meta-item">
                  <span className="zp2-meta-label">Periode</span>
                  <span className="zp2-meta-val">{period === "bulanan" ? "Bulanan" : "Tahunan"}</span>
                </div>
                <div className="zp2-meta-item">
                  <span className="zp2-meta-label">Metode</span>
                  <span className="zp2-meta-val">{salaryType === "kotor" ? "Kotor" : "Bersih"}</span>
                </div>
                <div className="zp2-meta-item">
                  <span className="zp2-meta-label">Tarif</span>
                  <span className="zp2-meta-val green">2.5%</span>
                </div>
              </div>

              {/* Component Pesan Error HTTP (Muncul Bersyarat) */}
              {error && <div className="zp2-error">{error}</div>}

              {/* Tombol Eksekusi Posting Formulir ke Backend (Memanggil Kalkulasi Backend) */}
              <button
                className={`zp2-btn-calc ${loading ? "loading" : ""}`}
                onClick={handleCalculate}
                disabled={loading || !income} /* Disable prevent empty params */
              >
                {loading ? <><span className="zp2-spinner" /> Menghitung...</> : "🧮 Hitung Zakat"}
              </button>
            </div>
          </div>

          {/* ── Card Konfigurasi Output API (Menampilkan Hasil Perhitungan API Zakat) ── */}
          {result && (
            // Warna border dan icon disesuaikan variabel (Wajib Zakat vs Belum Wajib)
            <div className={`zp2-result-card ${result.is_eligible ? "eligible" : "not-eligible"}`}>
              <div className="zp2-result-header">
                <span>{result.is_eligible ? "✅" : "ℹ️"}</span>
                <span className="zp2-result-status">
                  {result.is_eligible ? "Wajib Zakat" : "Belum Wajib Zakat"}
                </span>
              </div>

              <div className="zp2-result-body">
                {/* Nominal Besar Zakat */}
                <div className="zp2-result-main">
                  <div className="zp2-result-label">Zakat yang harus dibayar</div>
                  <div className="zp2-result-amount">Rp {fmt(result.zakat_amount)}</div>
                </div>

                {/* Perincian Nota / Breakdown Kalkulasi Angka Math di API */}
                <div className="zp2-result-rows">
                  <div className="zp2-result-row">
                    <span>Penghasilan {salaryType === "kotor" ? "Kotor" : "Bruto"}</span>
                    <span>Rp {fmt(income)}</span>
                  </div>
                  {salaryType === "bersih" && expenses && (
                    <div className="zp2-result-row">
                      <span>Pengeluaran</span>
                      <span>- Rp {fmt(expenses)}</span>
                    </div>
                  )}
                  {salaryType === "bersih" && (
                    <div className="zp2-result-row">
                      <span>Penghasilan Bersih</span>
                      <span>Rp {fmt(netIncome)}</span>
                    </div>
                  )}
                  <div className="zp2-result-row">
                    <span>Tarif Zakat</span>
                    <span>2.5%</span>
                  </div>
                  <div className="zp2-result-divider" />
                  <div className="zp2-result-row bold">
                    <span>Total Zakat</span>
                    <span>Rp {fmt(result.zakat_amount)}</span>
                  </div>
                </div>

                {/* Tampilkan Tombol Bayar HANYA Jika Boolean Eligibilitas Adalah BENAR/TRUE */}
                {result.is_eligible ? (
                  <button className="zp2-pay-btn" onClick={() => setShowPay(true)}>
                    💳 Bayar Zakat Sekarang
                  </button>
                ) : (
                  <div className="zp2-not-eligible-note">
                    Penghasilan belum mencapai nisab. Tetap semangat! 💪
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}