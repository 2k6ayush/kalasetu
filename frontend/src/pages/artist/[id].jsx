import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import ArtworkCard from '@/components/ArtworkCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ArtistProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/artists/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

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

  const { artist, artworks } = data;
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
