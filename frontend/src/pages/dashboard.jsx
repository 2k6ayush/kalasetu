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
      <main className="container page" style={{ paddingTop: '140px' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '24px' }}>Channel Dashboard</h1>
        
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'PUBLISHED' ? 'active' : ''}`}
            onClick={() => setActiveTab('PUBLISHED')}
          >
            PUBLISHED
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ARCHIVED' ? 'active' : ''}`}
            onClick={() => setActiveTab('ARCHIVED')}
          >
            ARCHIVED
          </button>
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner" /></div>
        ) : displayedArtworks.length === 0 ? (
          <div className="empty-state">
            <h3>No artworks found in {activeTab.toLowerCase()}.</h3>
          </div>
        ) : (
          <div className="dashboard-grid">
            {displayedArtworks.map(aw => (
              <div key={aw._id} className="dashboard-card">
                <div className="card-media">
                  {aw.imagePath ? (
                    <img src={aw.imagePath.startsWith('http') ? aw.imagePath : `${API}${aw.imagePath}`} alt={aw.title} />
                  ) : (
                    <div className="placeholder-img">No Image</div>
                  )}
                </div>
                <div className="card-info">
                  <h4>{aw.title || 'Untitled'}</h4>
                  <p className="status-text">{aw.visibility === 'public' ? 'Public' : 'Private'}</p>
                </div>
                <div className="card-actions">
                  <select 
                    value={aw.visibility || 'public'} 
                    onChange={() => handleVisibilityToggle(aw._id, aw.visibility || 'public')}
                    className="visibility-select"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                  <button onClick={() => handleDelete(aw._id)} className="btn-delete" aria-label="Delete">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
