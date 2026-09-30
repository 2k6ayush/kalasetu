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
      <nav className="navbar yt-navbar">
        <div className="navbar-inner yt-layout">
          {/* LEFT: BRAND */}
          <div className="navbar-left">
            <Link href="/" className="navbar-brand">Kalāsetu</Link>
          </div>

          {/* CENTER: SEARCH */}
          <div className="navbar-center">
            <div className="search-bar">
              <span className="search-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </span>
              <input type="text" placeholder="Search" />
            </div>
            <button className="voice-search" aria-label="Voice Search">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="navbar-right">
            {user ? (
              <>
                <Link href="/upload" className="btn btn-create">+ Create</Link>
                <button className="icon-btn notification-bell">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                </button>
                <div className="profile-container" ref={profileRef}>
                  <button 
                    className="profile-avatar" 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </button>
                  {isProfileOpen && (
                    <div className="profile-dropdown">
                      <div className="dropdown-header">
                        <p className="dropdown-name">{user.handle}</p>
                        <p className="dropdown-email">Creator Account</p>
                      </div>
                      <ul>
                        <li><Link href="/dashboard" onClick={() => setIsProfileOpen(false)}>Your Channel / Dashboard</Link></li>
                        <li><Link href="/upload" onClick={() => setIsProfileOpen(false)}>Upload Artwork</Link></li>
                        <li><Link href="/crafts/new" onClick={() => setIsProfileOpen(false)}>Submit Craft</Link></li>
                        <li className="dropdown-divider"></li>
                        <li><button className="signout-btn" onClick={handleSignOut}>Sign Out</button></li>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary" style={{ padding: '8px 24px', borderRadius: '20px' }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
      {/* CATEGORY PILLS (SUB-NAV) */}
      <div className="category-pills-container">
        <div className="category-pills">
          <Link href="/" className="pill active">Gallery</Link>
          <Link href="/spotlight" className="pill">India Blog</Link>
          <Link href="/crafts" className="pill">Craft Archive</Link>
        </div>
      </div>
    </header>
  );
}
