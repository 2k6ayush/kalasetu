import { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import { API } from '@/lib/api';
import { useRouter } from 'next/router';
import { AuthContext } from '@/context/AuthContext';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(AuthContext) || {};
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PUBLISHED');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchDashboardData(user._id || user.id);
      }
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/artworks/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setArtworks(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this artwork?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/artworks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setArtworks(prev => prev.filter(aw => aw._id !== id));
      } else {
        alert("Failed to delete artwork");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting artwork");
    }
  };

  const handleVisibilityToggle = async (id, currentVisibility) => {
    const newVisibility = currentVisibility === 'public' ? 'private' : 'public';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/artworks/${id}/visibility`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ visibility: newVisibility })
      });
      if (res.ok) {
        setArtworks(prev => prev.map(aw => aw._id === id ? { ...aw, visibility: newVisibility } : aw));
      } else {
        alert("Failed to update visibility");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating visibility");
    }
  };

  const displayedArtworks = artworks.filter(aw => {
    if (activeTab === 'PUBLISHED') return aw.visibility === 'public';
    if (activeTab === 'ARCHIVED') return aw.visibility === 'private';
    return true;
  });

  return (
    <>
      <Head>
        <title>Creator Dashboard - Kalāsetu</title>
      </Head>
      <Navbar />
      <main className="container page" style={{ paddingTop: '160px' }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '32px', marginBottom: '32px' }}>
          <p className="editorial-caption" style={{ marginBottom: '8px' }}>Creator Dashboard</p>
          <h1 className="editorial-title" style={{ fontSize: '3rem' }}>Your Archive</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <button 
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', 
              fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', 
              color: activeTab === 'PUBLISHED' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'PUBLISHED' ? '1px solid var(--text-primary)' : '1px solid transparent',
              padding: '0 0 4px 0', fontWeight: activeTab === 'PUBLISHED' ? '600' : '400'
            }}
            onClick={() => setActiveTab('PUBLISHED')}
          >
            PUBLISHED
          </button>
          <button 
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', 
              fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', 
              color: activeTab === 'ARCHIVED' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'ARCHIVED' ? '1px solid var(--text-primary)' : '1px solid transparent',
              padding: '0 0 4px 0', fontWeight: activeTab === 'ARCHIVED' ? '600' : '400'
            }}
            onClick={() => setActiveTab('ARCHIVED')}
          >
            ARCHIVED
          </button>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: '60px 0' }}><span className="spinner" /></div>
        ) : displayedArtworks.length === 0 ? (
          <div className="text-center" style={{ padding: '60px 0', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '8px' }}>No artworks found in {activeTab.toLowerCase()}.</h3>
          </div>
        ) : (
          <div className="editorial-grid">
            {displayedArtworks.map(aw => (
              <div key={aw._id} style={{ gridColumn: 'span 4', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', aspectRatio: '4/3', borderBottom: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  {aw.imagePath ? (
                    <img src={aw.imagePath.startsWith('http') ? aw.imagePath : `${API}${aw.imagePath}`} alt={aw.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>No Image</div>
                  )}
                </div>
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '8px' }}>{aw.title || 'Untitled'}</h4>
                  <p className="editorial-caption" style={{ marginBottom: '16px' }}>{aw.visibility === 'public' ? 'Public' : 'Private'}</p>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <select 
                      value={aw.visibility || 'public'} 
                      onChange={() => handleVisibilityToggle(aw._id, aw.visibility || 'public')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                    <button onClick={() => handleDelete(aw._id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} aria-label="Delete">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
