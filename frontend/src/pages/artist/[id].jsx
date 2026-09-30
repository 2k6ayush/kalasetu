import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import ArtworkCard from '@/components/ArtworkCard';
import { API } from '@/lib/api';

export default function ArtistProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSpotlight, setGeneratingSpotlight] = useState(false);
  const [spotlightError, setSpotlightError] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/artists/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleGenerateSpotlight() {
    setSpotlightError('');
    setGeneratingSpotlight(true);
    try {
      const res = await fetch(`${API}/api/spotlights/${id}`, { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate spotlight story.');
      }
      const spotlight = await res.json();
      router.push(`/spotlight/${spotlight._id}`);
    } catch (err) {
      setSpotlightError(err.message || 'Spotlight generation failed.');
      setGeneratingSpotlight(false);
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <main className="container page"><div className="empty-state"><span className="spinner" /></div></main>
    </>
  );

  if (!data?.artist) return (
    <>
      <Navbar />
      <main className="container page"><div className="empty-state"><h3>Artist not found</h3></div></main>
    </>
  );

  const { artist, artworks, spotlight } = data;
  
  const filteredArtworks = filterType === 'ALL' ? artworks : artworks.filter(a => (a.type || 'IMAGE') === filterType);
  
  // Derive content types from approved artworks
  const contentTypes = Array.from(new Set(artworks.map(a => a.type === 'IMAGE' && a.tags?.medium ? a.tags.medium : a.type || 'IMAGE').filter(Boolean)));
  
  const displayImage = artist.profilePhoto || (artworks.length > 0 ? artworks[0].imagePath : null);
  const initial = artist.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <Head>
        <title>{artist.name} — Kalāsetu</title>
        <meta name="description" content={artist.bio || `Artist profile for ${artist.name} on Kalāsetu.`} />
      </Head>
      <Navbar />
      
      {/* CHANNEL BANNER (Placeholder gradient) */}
      <div style={{ height: '200px', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #1e1e1e 100%)', width: '100%' }} />

      <main className="container page" style={{ marginTop: '-60px' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', marginBottom: '32px' }}>
          {displayImage ? (
            <img 
              src={displayImage.startsWith('http') ? displayImage : `http://localhost:5000${displayImage}`}
              alt={artist.name}
              style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-primary)' }}
            />
          ) : (
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', border: '4px solid var(--bg-primary)', color: 'var(--accent-primary)' }}>
              {initial}
            </div>
          )}
          
          <div style={{ paddingBottom: '8px' }}>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '2.5rem' }}>{artist.name}</h1>
            
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '1rem', flexWrap: 'wrap', marginBottom: '8px' }}>
              {artist.username && <span>@{artist.username}</span>}
              {contentTypes.length > 0 && (
                <span>• {contentTypes.join(', ')}</span>
              )}
              <span>• {artworks.length} approved {artworks.length === 1 ? 'artwork' : 'artworks'}</span>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '40px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 12px 0' }}>About the Artist</h3>
          <p style={{ margin: '0 0 16px 0', lineHeight: 1.6 }}>{artist.bio || 'Independent creator on Kalasetu.'}</p>
          
          {artist.socialLink && (
            <div style={{ marginBottom: '24px' }}>
              <strong>Links: </strong>
              <a href={artist.socialLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
                {artist.socialLink}
              </a>
            </div>
          )}

          <div>
            {spotlight ? (
              <Link href={`/spotlight/${spotlight._id}`} className="btn btn-secondary">
                📖 Read Artist Spotlight
              </Link>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleGenerateSpotlight}
                  disabled={generatingSpotlight}
                  id="generate-spotlight-btn"
                >
                  {generatingSpotlight && <span className="spinner" />}
                  {generatingSpotlight ? 'Generating Editorial Story…' : '✨ Generate Artist Spotlight'}
                </button>
                {spotlightError && <span style={{ color: 'var(--color-error)' }}>{spotlightError}</span>}
              </div>
            )}
          </div>
        </div>

        {/* WORKS */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', overflowX: 'auto' }}>
          {['ALL', 'IMAGE', 'VIDEO', 'AUDIO', 'TEXT'].map(t => (
            <button 
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                background: filterType === t ? 'var(--text-primary)' : 'transparent',
                color: filterType === t ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: filterType === t ? 'none' : '1px solid var(--border-color)',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {filteredArtworks.length === 0 ? (
          <div className="empty-state"><h3>Nothing published yet in this category.</h3></div>
        ) : (
          <div className="artwork-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filteredArtworks.map(a => {
              if (a.type === 'VIDEO') {
                return (
                  <div key={a._id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <video src={`http://localhost:5000${a.imagePath}`} controls style={{ width: '100%', height: 200, objectFit: 'cover', background: '#000' }} />
                    <div style={{ padding: 16 }}>
                      <h3 style={{ margin: '0 0 8px 0' }}>{a.title || 'Untitled Video'}</h3>
                      {a.artistNote && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{a.artistNote}</p>}
                    </div>
                  </div>
                );
              }
              if (a.type === 'AUDIO') {
                return (
                  <div key={a._id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 20, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ fontSize: '3rem', textAlign: 'center', color: 'var(--accent-primary)' }}>🎵</div>
                    <h3 style={{ margin: 0, textAlign: 'center' }}>{a.title || 'Untitled Audio'}</h3>
                    <audio src={`http://localhost:5000${a.imagePath}`} controls style={{ width: '100%' }} />
                    {a.artistNote && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{a.artistNote}</p>}
                  </div>
                );
              }
              if (a.type === 'TEXT') {
                return (
                  <div key={a._id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 20, border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 12, color: 'var(--accent-primary)' }}>📝</div>
                    <h3 style={{ margin: '0 0 12px 0' }}>{a.title || 'Untitled Text'}</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{a.artistNote}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 16 }}>Published {new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                );
              }
              
              // Default IMAGE fallback
              return <ArtworkCard key={a._id} artwork={{ ...a, artistId: { _id: artist._id, name: artist.name } }} />;
            })}
          </div>
        )}
      </main>
    </>
  );
}
