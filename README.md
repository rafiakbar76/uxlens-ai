# ReviewLens AI

ReviewLens AI — UX Insight from User Reviews

Ringkasan singkat (bahasa Indonesia):
- Produk ini adalah alat untuk menganalisis ulasan pengguna dari Play Store atau App Store menggunakan AI.
- AI menganalisis sentimen, masalah UX, dan memberikan rekomendasi perbaikan.
- Fokus pada usability, performance, UI clarity, dan user satisfaction.

## Quick Start (Local Development)

1. Install dependencies:

```bash
npm install
```

2. Buat file `.env.local` di root dan tambahkan API key:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
# atau
OPENAI_API_KEY=your_openai_api_key_here
```

3. Jalankan aplikasi React + backend Express lokal:

```bash
npm run dev
```

4. Buka aplikasi di browser:

```text
http://localhost:5173
```

## Fitur Utama

- Input: Paste ulasan pengguna dari app stores
- Output: UX Score, Sentiment Breakdown, Key Issues, AI Insight, Recommendations
- Gratis: Menggunakan OpenRouter dengan model text-only (tidak ada biaya visual)

## Deploy ke Vercel

### Setup

1. Push repo ke GitHub
2. Connect repo ke Vercel
3. Di Vercel dashboard, set environment variables:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `OPENAI_API_KEY` (opsional): Your OpenAI API key

### Otomatis

Vercel akan:
- Build frontend dengan `npm run build`
- Deploy `/api/analyze.js` sebagai serverless function
- Serve static files dari `dist/`

### Catatan

- Backend Express sudah di-convert ke serverless function (`/api/analyze.js`)
- Frontend akan otomatis call `/api/analyze` tanpa perlu config tambahan
- Environment variables diatur di Vercel dashboard, bukan di `.env.local`


Deployment

- Deploy ke Vercel: cukup hubungkan repo dan tambahkan `OPENAI_API_KEY` di Vercel Environment Variables.

Kriteria proyek:
- Frontend: React (Next.js)
- Backend: Node (API route di Next.js)
- AI: integrasi ke API AI untuk menghasilkan insight UX
- Branding: logo di `public/logo.svg`
