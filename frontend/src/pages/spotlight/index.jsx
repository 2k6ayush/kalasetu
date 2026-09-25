import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SpotlightList() {
  const [spotlights, setSpotlights] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch(`${API}/api/spotlights`)
      .then(r => r.json())
      .then(data => { setSpotlights(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Head>
        <title>Artist Spotlights — Kalāsetu</title>
        <meta name="description" content="Editorial features on independent artists — magazine-quality profiles generated with AI." />
      </Head>
      <Navbar />
      <main className="container page">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="page-title">Artist Spotlights</h1>
          <p className="page-subtitle">Magazine-quality editorials introducing independent artists to the world.</p>
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner" /></div>
        ) : spotlights.length === 0 ? (
          <div className="empty-state"><h3>No spotlights yet</h3><p>Spotlights are generated for artists on the platform.</p></div>
        ) : (
          <div className="blog-list">
            {spotlights.map(s => (
              <Link href={`/spotlight/${s._id}`} key={s._id} style={{ textDecoration: 'none' }}>
                <div className="blog-card">
                  <h3>{s.title}</h3>
                  <div className="meta">
                    {s.artistId?.name || 'Artist'} · {new Date(s.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {s.aiProvider && <span className="provider-badge" style={{ marginLeft: 12 }}>via {s.aiProvider}</span>}
                  </div>
                  <p>{s.body?.substring(0, 200)}…</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
