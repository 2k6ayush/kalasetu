import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SpotlightDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [spotlight, setSpotlight] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/spotlights/${id}`)
      .then(r => r.json())
      .then(data => { setSpotlight(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Navbar />
      <main className="container page"><div className="empty-state"><span className="spinner" /></div></main>
    </>
  );

  if (!spotlight) return (
    <>
      <Navbar />
      <main className="container page"><div className="empty-state"><h3>Spotlight not found</h3></div></main>
    </>
  );

  return (
    <>
      <Head>
        <title>{spotlight.title} — Kalāsetu Spotlight</title>
        <meta name="description" content={spotlight.body?.substring(0, 160)} />
      </Head>
      <Navbar />
      <main className="container page">
        <div className="article">
          <h1>{spotlight.title}</h1>
          <div className="meta">
            {spotlight.artistId?.name && (
              <Link href={`/artist/${spotlight.artistId._id}`}>
                {spotlight.artistId.name}
              </Link>
            )}
            {' · '}
            {new Date(spotlight.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {spotlight.aiProvider && <span className="provider-badge" style={{ marginLeft: 12 }}>via {spotlight.aiProvider}</span>}
          </div>
          {spotlight.body.split('\n').map((para, i) => (
            para.trim() ? <p key={i} style={{ marginBottom: 16 }}>{para}</p> : null
          ))}
          <div className="section-divider" />
          <p style={{ textAlign: 'center' }}>
            <Link href="/spotlight" className="btn btn-secondary">← All Spotlights</Link>
          </p>
        </div>
      </main>
    </>
  );
}
