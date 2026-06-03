import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

const NAV_LINKS = [
  { label: "Home", to: "/" as const },
  { label: "About Us", to: "/about" as const },
  { label: "Contact Us", to: "/contact" as const },
  { label: "Disclaimer", to: "/disclaimer" as const },
  { label: "Privacy Policy", to: "/privacy-policy" as const },
  { label: "Responsible Gaming", to: "/responsible-gaming" as const },
  { label: "Terms and Conditions", to: "/terms" as const },
];

export function SiteLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="ry-root">
      <aside className={`ry-side-menu ${menuOpen ? "active" : ""}`}>
        <div className="ry-close-menu" onClick={() => setMenuOpen(false)}>
          X Close
        </div>
        <ul>
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              <Link to={l.to} onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      {menuOpen && (
        <div className="ry-menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <div className={`ry-search-overlay ${searchOpen ? "active" : ""}`}>
        <form action="/search" method="get" className="ry-search-form">
          <input
            type="text"
            name="q"
            aria-label="Search game posts"
            placeholder="Search game posts..."
          />
          <button type="submit">GO</button>
        </form>
        <div className="ry-search-close" onClick={() => setSearchOpen(false)}>
          [ Close Search ]
        </div>
      </div>

      <header className="ry-top-banner">
        <div className="ry-header-icons">
          <button
            type="button"
            aria-label="Open menu"
            className="ry-icon-btn ry-hamburger"
            onClick={() => setMenuOpen(true)}
          >
            <span className="ry-ham-line" style={{ background: "#ff0000" }} />
            <span className="ry-ham-line" style={{ background: "#ffea00" }} />
            <span className="ry-ham-line" style={{ background: "#00ff00" }} />
          </button>
          <button
            type="button"
            aria-label="Open search"
            className="ry-icon-btn ry-search-btn"
            onClick={() => setSearchOpen(true)}
          >
            <span style={{ color: "#00e5ff", fontSize: 20 }}>🔍</span>
          </button>
        </div>
        <Link to="/" className="ry-brand-overlay" aria-label="RoyalYono home" />
        <img
          alt="www.RoyalYono.com — Trending Casino Games"
          src="/images/145177.webp"
          width={1500}
          height={244}
          fetchPriority="high"
          decoding="async"
        />
      </header>

      <div className="ry-banner-divider">
        <span className="ry-glow-line" />
      </div>

      {children}

      <footer className="ry-footer">
        <div className="ry-footer-grid">
          <div className="ry-footer-col">
            <h4 className="ry-footer-brand">Yono Game Ki Chahna</h4>
            <p className="ry-footer-tagline">
              Your hub for the latest Yono Rummy, Slots, and Teen Patti APKs with daily signup bonuses.
            </p>
          </div>
          <div className="ry-footer-col">
            <h5 className="ry-footer-heading">PAGES</h5>
            <ul className="ry-footer-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div className="ry-footer-col">
            <h5 className="ry-footer-heading">LEGAL</h5>
            <ul className="ry-footer-list">
              <li><Link to="/disclaimer">Disclaimer</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
              <li><Link to="/responsible-gaming">Responsible Gaming</Link></li>
            </ul>
          </div>
        </div>
        <div className="ry-copy">© 2026 Yono Game Ki Chahna. For 18+ users only. Play responsibly.</div>
      </footer>

      <nav className="ry-bottom-nav">
        <Link to="/" aria-label="Home">🏠</Link>
        <Link to="/" aria-label="Hot" className="ry-hot">🔥</Link>
        <Link to="/contact" aria-label="Contact">✉️</Link>
      </nav>
    </div>
  );
}

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="ry-container">
      <section className="ry-content-area">
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}