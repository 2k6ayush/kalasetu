import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import ArtworkCard from '@/components/ArtworkCard';
import TagFilterBar from '@/components/TagFilterBar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading]   = useState(true);

  function fetchArtworks(filters = {}) {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.medium)    params.set('medium', filters.medium);
    if (filters.technique) params.set('technique', filters.technique);
    if (filters.culture)   params.set('culture', filters.culture);
    if (filters.search)    params.set('search', filters.search);
    if (filters.shuffle)   params.set('shuffle', 'true');

    fetch(`${API}/api/artworks?${params}`)
      .then(r => r.json())
      .then(data => { setArtworks(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { fetchArtworks(); }, []);

  return (
    <>
      <Head>
        <title>Kalāsetu — Wall of Fame</title>
        <meta name="description" content="Discover independent art filtered by medium, technique, and cultural influence. No popularity ranking — just art." />
      </Head>
      <Navbar />
      <main className="container page">
        <div className="hero" style={{ padding: '40px 0' }}>
          <h1>Wall of Fame</h1>
          <p>Discover art beyond boundaries — filtered by what it is, not how popular it is.</p>
        </div>

        <TagFilterBar onFilter={fetchArtworks} />

        {loading ? (
          <div className="empty-state"><span className="spinner" /></div>
        ) : artworks.length === 0 ? (
          <div className="empty-state">
            <h3>No artworks found</h3>
            <p>Try clearing filters or be the first to <a href="/upload">upload</a> your art!</p>
          </div>
        ) : (
          <div className="artwork-grid">
            {artworks.map(a => <ArtworkCard key={a._id} artwork={a} />)}
          </div>
        )}
      </main>
    </>
  );
}
