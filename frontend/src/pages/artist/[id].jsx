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
      <div style={{ height: '30vh', background: 'var(--text-primary)', width: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, var(--bg-primary), transparent)' }} />
      </div>

      <main className="container page" style={{ marginTop: '-100px', position: 'relative', zIndex: 10 }}>
        {/* HEADER */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px' }}>
          {displayImage ? (
            <img 
              src={displayImage.startsWith('http') ? displayImage : `http://localhost:5000${displayImage}`}
              alt={artist.name}
              style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-primary)', marginBottom: '24px' }}
            />
          ) : (
            <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '4rem', border: '4px solid var(--bg-primary)', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {initial}
            </div>
          )}
          
          <div>
            <h1 className="editorial-title" style={{ margin: '0 0 8px 0', fontSize: '3rem' }}>{artist.name}</h1>
            
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {artist.username && <span>@{artist.username}</span>}
              {contentTypes.length > 0 && (
                <span>• {contentTypes.join(', ')}</span>
              )}
              <span>• {artworks.length} {artworks.length === 1 ? 'WORK' : 'WORKS'}</span>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div style={{ maxWidth: '800px', margin: '0 auto 40px', textAlign: 'center', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '32px 0' }}>
          <p className="editorial-caption" style={{ marginBottom: '16px' }}>About the Artist</p>
          <p style={{ margin: '0 auto 24px', lineHeight: 1.8, fontSize: '1.1rem', maxWidth: '600px' }}>{artist.bio || 'Independent creator on Kalasetu.'}</p>
          
          {artist.socialLink && (
            <div style={{ marginBottom: '32px' }}>
              <a href={artist.socialLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
                Visit Website
              </a>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {spotlight ? (
              <Link href={`/spotlight/${spotlight._id}`} style={{ textDecoration: 'none', border: '1px solid var(--text-primary)', padding: '12px 24px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
                📖 Read Editorial Story
              </Link>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleGenerateSpotlight}
                  disabled={generatingSpotlight}
                  id="generate-spotlight-btn"
                  style={{ background: 'transparent', border: '1px solid var(--text-primary)', padding: '12px 24px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  {generatingSpotlight ? 'Generating Editorial Story…' : '✨ Generate Artist Spotlight'}
                </button>
                {spotlightError && <span style={{ color: 'var(--danger)' }}>{spotlightError}</span>}
              </div>
            )}
          </div>
        </div>

        {/* WORKS */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', justifyContent: 'center', overflowX: 'auto' }}>
          {['ALL', 'IMAGE', 'VIDEO', 'AUDIO', 'TEXT'].map(t => (
            <button 
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                background: 'transparent',
                border: 'none',
                color: filterType === t ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '0 0 4px 0',
                borderBottom: filterType === t ? '1px solid var(--text-primary)' : '1px solid transparent',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: filterType === t ? '600' : '400',
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
