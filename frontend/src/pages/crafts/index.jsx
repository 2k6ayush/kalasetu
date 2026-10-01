import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import { API } from '@/lib/api';

export default function CraftsList() {
  const [crafts, setCrafts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/crafts`)
      .then(r => r.json())
      .then(data => { setCrafts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Head>
        <title>Craft Archive — Kalāsetu</title>
        <meta name="description" content="An archive of fading traditional crafts — step-by-step breakdowns preserving techniques for the future." />
      </Head>
      <Navbar />
      <main className="container page" style={{ paddingTop: '160px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, borderBottom: '1px solid var(--border-color)', paddingBottom: '32px' }}>
          <p className="editorial-caption" style={{ marginBottom: '8px' }}>The Kalāsetu Archive</p>
          <h1 className="editorial-title" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>Craft Archive</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Preserving traditional techniques — step-by-step breakdowns of fading crafts.</p>
          <div style={{ marginTop: 32 }}>
            <Link href="/crafts/new" style={{ textDecoration: 'none', border: '1px solid var(--text-primary)', padding: '12px 24px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
              + Document a Craft Technique
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: '60px 0' }}><span className="spinner" /></div>
        ) : crafts.length === 0 ? (
          <div className="text-center" style={{ padding: '60px 0', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '8px', fontFamily: 'var(--font-display)' }}>No craft entries yet</h3>
          </div>
        ) : (
          <div className="editorial-grid">
            {crafts.map(c => (
              <Link href={`/crafts/${c._id}`} key={c._id} style={{ textDecoration: 'none', gridColumn: 'span 4' }}>
                <div style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
                  <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{c.craftName}</h3>
                  <div style={{ marginBottom: 16, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="editorial-caption">BY {c.practitionerName.toUpperCase()}</span>
                    <span className="editorial-caption" style={{ color: 'var(--text-muted)' }}>·</span>
                    <span className="editorial-caption">{c.steps?.length || 0} STEPS</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '24px', flex: 1 }}>{c.description?.substring(0, 200)}…</p>
                  {c.aiProvider && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <span className="editorial-caption" style={{ color: 'var(--text-muted)' }}>· VIA {c.aiProvider.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
