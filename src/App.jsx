import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ResultCard from './components/ResultCard.jsx'
import Loader from './components/Loader.jsx'
import { useState, useEffect } from 'react'

function HomePage() {
  return (
    <main className="page page-home">
      <Navbar />
      <section className="hero">
        <div>
          <span className="eyebrow">ReviewLens AI</span>
          <h1>Analisis UX dari ulasan pengguna</h1>
          <p>Analisis sentimen, masalah UX, dan rekomendasi perbaikan dari ulasan pengguna Play Store atau App Store untuk meningkatkan pengalaman aplikasi Anda.</p>
          <div className="hero-actions">
            <Link to="/analyze" className="button primary">Mulai Analisis</Link>
            <Link to="/result" className="button secondary">Lihat Contoh Hasil</Link>
          </div>
        </div>

        <div className="hero-card">
          <h2>ReviewLens AI membantu Anda:</h2>
          <ul>
            <li>Menganalisis sentimen positif dan negatif dari ulasan</li>
            <li>Mengidentifikasi masalah UX utama yang dilaporkan pengguna</li>
            <li>Mendapatkan rekomendasi perbaikan yang dapat ditindaklanjuti</li>
          </ul>
          <p className="feature-badge">Dibuat untuk developer dan tim produk yang ingin memahami feedback pengguna dengan cepat.</p>
        </div>
      </section>
    </main>
  )
}

function AnalyzePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState('')
  const navigate = useNavigate()

  async function handleAnalyze(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!reviews.trim()) {
        setError('Mohon masukkan ulasan pengguna')
        setLoading(false)
        return
      }

      const headers = { 'Content-Type': 'application/json' }
      const body = JSON.stringify({ reviews })

      // Use environment variable for API URL, fallback to Railway URL
      const apiUrl = import.meta.env.VITE_API_URL || 'https://uxlens-ai-production.up.railway.app'

      const res = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers,
        body,
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan saat memproses analisis.')
        return
      }

      if (data.error) {
        setError(data.error)
        return
      }

      window.localStorage.setItem('uxlens_insight', JSON.stringify(data))
      navigate('/result')
    } catch (err) {
      setError(err.message || 'Gagal terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page page-analyze">
      <Navbar />
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Analisis UX</p>
            <h1>Paste ulasan pengguna untuk dianalisis</h1>
          </div>
        </div>
        <div className="panel-content">
          <form className="input-group" onSubmit={handleAnalyze}>
            <label className="label" htmlFor="reviews">Ulasan Pengguna</label>
            <textarea
              id="reviews"
              className="textarea"
              value={reviews}
              onChange={(event) => setReviews(event.target.value)}
              placeholder="Paste ulasan dari Play Store, App Store, atau sumber lainnya di sini..."
              rows={10}
            />

            <div className="form-controls">
              <button 
                className="button primary" 
                type="submit" 
                disabled={loading || !reviews.trim()}
              >
                {loading ? 'Menganalisis...' : 'Analyze UX'}
              </button>
            </div>
          </form>
          {error ? <div className="message error">{error}</div> : null}
          {loading ? <Loader /> : null}
        </div>
      </section>
    </main>
  )
}

function ResultPage() {
  const [insight, setInsight] = useState(null)

  useEffect(() => {
    const stored = window.localStorage.getItem('uxlens_insight')
    if (stored) {
      setInsight(JSON.parse(stored))
    }
  }, [])

  return (
    <main className="page page-result">
      <Navbar />
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Hasil Analisis</p>
            <h1>Ringkasan dan rekomendasi UX</h1>
          </div>
          <Link to="/analyze" className="button secondary">Analisis Halaman Lain</Link>
        </div>
        <div className="panel-content">
          {insight ? <ResultCard insight={insight} /> : <p className="muted">Memuat hasil...</p>}
        </div>
      </section>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
