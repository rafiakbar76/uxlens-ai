'use client'

import { useState } from 'react'

export default function InputForm({ onAnalyze, loading }) {
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [inputMode, setInputMode] = useState('url')
  const [context, setContext] = useState('')
  const [filePreview, setFilePreview] = useState(null)

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target?.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    
    if (inputMode === 'url') {
      onAnalyze({ url, context })
    } else if (inputMode === 'file' && file) {
      onAnalyze({ file, context })
    }
  }

  function clearFile() {
    setFile(null)
    setFilePreview(null)
  }

  return (
    <form className="input-group" onSubmit={handleSubmit}>
      <div className="input-mode-selector">
        <label className="radio-label">
          <input
            type="radio"
            value="url"
            checked={inputMode === 'url'}
            onChange={(e) => setInputMode(e.target.value)}
          />
          URL Halaman
        </label>
        <label className="radio-label">
          <input
            type="radio"
            value="file"
            checked={inputMode === 'file'}
            onChange={(e) => setInputMode(e.target.value)}
          />
          Upload Gambar
        </label>
      </div>

      {inputMode === 'url' && (
        <>
          <label className="label" htmlFor="page-url">Page URL atau URL gambar</label>
          <input
            id="page-url"
            className="input"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
            required
          />
        </>
      )}

      {inputMode === 'file' && (
        <>
          <label className="label" htmlFor="file-upload">Pilih Gambar</label>
          <input
            id="file-upload"
            className="input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required={inputMode === 'file'}
          />
          {filePreview && (
            <div className="file-preview-container">
              <img src={filePreview} alt="Preview" className="file-preview" />
              <button
                type="button"
                className="button secondary small"
                onClick={clearFile}
              >
                Hapus Gambar
              </button>
            </div>
          )}
        </>
      )}

      <label className="label" htmlFor="context">Context (opsional)</label>
      <textarea
        id="context"
        className="textarea"
        value={context}
        onChange={(event) => setContext(event.target.value)}
        placeholder="Tujuan pengguna, masalah yang diamati, atau area fokus..."
      />

      <div className="form-controls">
        <button 
          className="button primary" 
          type="submit" 
          disabled={loading || (inputMode === 'url' ? !url : !file)}
        >
          {loading ? 'Menganalisis...' : 'Analisis UX'}
        </button>
      </div>
    </form>
  )
}
