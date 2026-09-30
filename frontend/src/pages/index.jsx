import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import ArtistCard from '@/components/ArtistCard';
import { API } from '@/lib/api';

export default function Home() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  function fetchArtists() {
    setLoading(true);
    fetch(`${API}/api/artists`)
      .then(r => r.json())
      .then(data => { 
        setArtists(Array.isArray(data) ? data : []); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { fetchArtists(); }, []);

  // Auto-shuffle artists every 10 seconds for fair discovery
  useEffect(() => {
    const interval = setInterval(() => {
      setArtists(prev => {
        if (prev.length <= 1) return prev;
        const shuffled = [...prev];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Kalāsetu — Wall of Fame</title>
        <meta name="description" content="Discover independent artists and their traditional crafts." />
      </Head>
      <Navbar />
      <main className="container page">
        <div className="hero" style={{ padding: '40px 0', textAlign: 'center' }}>
          <h1>Wall of Fame</h1>
          <p>Discover independent creators and the traditional art they preserve.</p>
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner" /></div>
        ) : artists.length === 0 ? (
          <div className="empty-state">
            <h3>No artists have been featured yet.</h3>
            <p>Check back soon or upload your own work!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
            padding: '20px 0'
          }}>
            {artists.map(artist => (
              <ArtistCard key={artist._id} artist={artist} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
