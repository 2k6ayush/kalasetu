import Link from 'next/link';
import { useState, useRef, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '@/context/AuthContext';

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const router = useRouter();
  
  const { user, logout } = useContext(AuthContext) || {};

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef]);

  const handleSignOut = () => {
    logout();
    setIsProfileOpen(false);
    router.push('/');
  };

  return (
    <header className="navbar-wrapper">
      {/* MASTHEAD TOP */}
      <div className="masthead-top">
        <span>KALASETU</span>
        <span>A bridge to India's heritage</span>
        <span>EST. 2024</span>
      </div>
      
      {/* MASTHEAD MAIN */}
      <div className="masthead-main">
        <Link href="/" className="navbar-brand">KALĀSETU</Link>
        
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/explore-india">Explore India</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/wall-of-fame">Wall of Fame</Link>
          <Link href="/spotlight">Blog</Link>
          <Link href="/crafts">Archive</Link>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className="search-bar">
            <span className="search-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </span>
            <input type="text" placeholder="Search..." />
          </div>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href="/upload" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>Create +</Link>
              <div style={{ position: 'relative' }} ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </button>
                {isProfileOpen && (
                  <div style={{ position: 'absolute', top: '100%', right: '0', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', width: '200px', padding: '16px', marginTop: '8px', zIndex: 10 }}>
                    <div style={{ marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <p style={{ margin: 0, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{user.handle}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Creator</p>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                      <li style={{ marginBottom: '8px' }}><Link href="/dashboard" onClick={() => setIsProfileOpen(false)}>Profile / Dashboard</Link></li>
                      <li style={{ marginBottom: '8px' }}><Link href="/upload" onClick={() => setIsProfileOpen(false)}>Upload Artwork</Link></li>
                      <li style={{ marginBottom: '12px' }}><Link href="/crafts/new" onClick={() => setIsProfileOpen(false)}>Submit Craft</Link></li>
                      <li style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}><button onClick={handleSignOut} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--danger)', width: '100%', textAlign: 'left', fontSize: '0.85rem' }}>Sign Out</button></li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
}
