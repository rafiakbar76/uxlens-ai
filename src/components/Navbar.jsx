import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand" aria-label="UXLens Home">
        <img src="/logo.svg" alt="UXLens logo" width="36" height="36" />
        <strong>UXLens AI</strong>
      </Link>
      <nav className="nav-links" aria-label="Main navigation">
        <Link to="/analyze">Analisis</Link>
        <Link to="/result">Hasil</Link>
      </nav>
    </header>
  )
}
