import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
      <main className="container page">
        <div className="article">
          <h1>{craft.craftName}</h1>
          <div className="meta">
            by {craft.practitionerName}
            {' · '}
            {new Date(craft.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {craft.aiProvider && <span className="provider-badge" style={{ marginLeft: 12 }}>via {craft.aiProvider}</span>}
          </div>

          <p style={{ marginBottom: 32 }}>{craft.description}</p>

          <h2 style={{ marginBottom: 20, fontSize: '1.3rem' }}>Step-by-Step Breakdown</h2>
          {craft.steps?.length > 0 ? (
            <ol className="craft-steps">
              {craft.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No steps generated yet.</p>
          )}

          <div className="section-divider" />
          <p style={{ textAlign: 'center' }}>
            <Link href="/crafts" className="btn btn-secondary">← All Crafts</Link>
          </p>
        </div>
      </main>
    </>
  );
}
