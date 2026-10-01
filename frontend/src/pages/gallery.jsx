import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import ArtworkCard from '@/components/ArtworkCard';
import { API } from '@/lib/api';

export default function Gallery() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/explore/feed?lat=20.5937&lon=78.9629&radius=1000`)
      .then(r => r.json())
      .then(data => {
        setArtworks(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Head>
        <title>The Art Archive — Kalāsetu</title>
      </Head>
      <Navbar />
      <main className="container page" style={{ paddingTop: '160px' }}>
        
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '40px', marginBottom: '40px', textAlign: 'center' }}>
          <p className="editorial-caption" style={{ marginBottom: '16px' }}>Volume 02</p>
          <h1 className="editorial-title">The Art Archive</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>A curated collection of traditional and contemporary works verified by the Kalāsetu archive.</p>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: '60px 0' }}><span className="spinner" /></div>
        ) : artworks.length === 0 ? (
          <div className="text-center" style={{ padding: '60px 0', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '8px' }}>No works in this collection yet.</h3>
            <p className="editorial-caption">The archive is still growing.</p>
          </div>
        ) : (
          <div style={{ columnCount: 3, columnGap: '24px' }}>
            {artworks.map(artwork => (
              <div key={artwork._id} style={{ breakInside: 'avoid', marginBottom: '24px' }}>
                <ArtworkCard artwork={artwork} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
