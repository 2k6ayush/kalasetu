import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import { API } from '@/lib/api';

export default function CraftDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [craft, setCraft]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/crafts/${id}`)
      .then(r => r.json())
      .then(data => { setCraft(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Navbar />
      <main className="container page"><div className="empty-state"><span className="spinner" /></div></main>
    </>
  );

  if (!craft) return (
    <>
      <Navbar />
      <main className="container page"><div className="empty-state"><h3>Craft entry not found</h3></div></main>
    </>
  );

  return (
    <>
      <Head>
        <title>{craft.craftName} — Kalāsetu Craft Archive</title>
        <meta name="description" content={craft.description?.substring(0, 160)} />
      </Head>
      <Navbar />
      <main className="container page" style={{ paddingTop: '160px' }}>
        <div className="article" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
          <p className="editorial-caption" style={{ textAlign: 'center', marginBottom: '16px' }}>Craft Technique</p>
          <h1 className="editorial-title" style={{ textAlign: 'center', fontSize: '3.5rem', marginBottom: '24px', lineHeight: 1.1 }}>{craft.craftName}</h1>
          
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '48px', borderBottom: '1px solid var(--border-color)', paddingBottom: '32px' }}>
            BY <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{craft.practitionerName.toUpperCase()}</span>
            {' · '}
            {new Date(craft.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {craft.aiProvider && <span style={{ marginLeft: 12, padding: '2px 8px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>VIA {craft.aiProvider.toUpperCase()}</span>}
          </div>

          <div style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', marginBottom: '48px' }}>
            <p>
              <span style={{ float: 'left', fontSize: '4.5rem', lineHeight: '0.8', paddingRight: '12px', paddingBottom: '8px', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginTop: '8px' }}>
                {craft.description?.trim().charAt(0)}
              </span>
              {craft.description?.trim().substring(1)}
            </p>
          </div>

          <h2 className="editorial-title" style={{ marginBottom: '24px', fontSize: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '32px' }}>Step-by-Step Breakdown</h2>
          
          {craft.steps?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {craft.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>{(i + 1).toString().padStart(2, '0')}</div>
                  <div style={{ fontSize: '1.1rem', lineHeight: 1.6, paddingTop: '4px' }}>{step}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No steps generated yet.</p>
          )}

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '64px', paddingTop: '32px', textAlign: 'center' }}>
            <Link href="/crafts" style={{ textDecoration: 'none', border: '1px solid var(--text-primary)', padding: '12px 24px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
              ← Return to Archive
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
