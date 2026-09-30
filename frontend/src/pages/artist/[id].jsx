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
  const [data, setData]                 = useState(null);
  const [loading, setLoading]             = useState(true);
  const [generatingSpotlight, setGeneratingSpotlight] = useState(false);
  const [spotlightError, setSpotlightError]           = useState('');

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
  const initial = artist.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <Head>
        <title>{artist.name} — Kalāsetu</title>
        <meta name="description" content={artist.bio || `Artist profile for ${artist.name} on Kalāsetu.`} />
      </Head>
      <Navbar />
      <main className="container page">
        <div className="artist-header">
          <div className="artist-avatar">{initial}</div>
          <div className="artist-info">
            <h1>{artist.name}</h1>
            {artist.bio && <p>{artist.bio}</p>}
            {artist.socialLink && (
              <a href={artist.socialLink} target="_blank" rel="noopener noreferrer" className="artist-social">
                {artist.socialLink}
              </a>
            )}

            <div style={{ marginTop: 20 }}>
              {spotlight ? (
                <Link href={`/spotlight/${spotlight._id}`} className="btn btn-secondary">
                  📖 Read Artist Spotlight
                </Link>
              ) : (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerateSpotlight}
                    disabled={generatingSpotlight}
                    id="generate-spotlight-btn"
                  >
                    {generatingSpotlight && <span className="spinner" />}
                    {generatingSpotlight ? 'Generating Editorial Story…' : '✨ Generate Artist Spotlight'}
                  </button>
                  {spotlightError && (
                    <div className="alert alert-error" style={{ marginTop: 12 }}>
                      {spotlightError}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <h2 style={{ marginBottom: 24 }}>Artworks</h2>
        {artworks.length === 0 ? (
          <div className="empty-state"><h3>No artworks yet</h3></div>
        ) : (
          <div className="artwork-grid">
            {artworks.map(a => <ArtworkCard key={a._id} artwork={{ ...a, artistId: { _id: artist._id, name: artist.name } }} />)}
          </div>
        )}
      </main>
    </>
  );
}
