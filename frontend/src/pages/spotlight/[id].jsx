import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import { API } from '@/lib/api';

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
      <main className="container page" style={{ paddingTop: '160px' }}>
        <div className="article" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
          <p className="editorial-caption" style={{ textAlign: 'center', marginBottom: '16px' }}>Artist Spotlight</p>
          <h1 className="editorial-title" style={{ textAlign: 'center', fontSize: '3.5rem', marginBottom: '24px', lineHeight: 1.1 }}>{spotlight.title}</h1>
          <div className="meta" style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '48px', borderBottom: '1px solid var(--border-color)', paddingBottom: '32px' }}>
            {spotlight.artistId?.name && (
              <Link href={`/artist/${spotlight.artistId._id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                {spotlight.artistId.name}
              </Link>
            )}
            {' · '}
            {new Date(spotlight.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {spotlight.aiProvider && <span className="provider-badge" style={{ marginLeft: 12, padding: '2px 8px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>via {spotlight.aiProvider}</span>}
          </div>
          
          <div style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
            {spotlight.body.split('\n').map((para, i) => {
              if (!para.trim()) return null;
              
              // Basic drop cap on first paragraph
              if (i === 0 || (i === 1 && !spotlight.body.split('\n')[0].trim())) {
                return (
                  <p key={i} style={{ marginBottom: '24px' }}>
                    <span style={{ float: 'left', fontSize: '4.5rem', lineHeight: '0.8', paddingRight: '12px', paddingBottom: '8px', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginTop: '8px' }}>
                      {para.trim().charAt(0)}
                    </span>
                    {para.trim().substring(1)}
                  </p>
                );
              }
              
              return <p key={i} style={{ marginBottom: '24px' }}>{para}</p>;
            })}
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '64px', paddingTop: '32px', textAlign: 'center' }}>
            <Link href="/spotlight" style={{ textDecoration: 'none', border: '1px solid var(--text-primary)', padding: '12px 24px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
              ← Return to Archive
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
