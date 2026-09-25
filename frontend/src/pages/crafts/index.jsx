import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
      <main className="container page">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="page-title">Craft Archive</h1>
          <p className="page-subtitle">Preserving traditional techniques — step-by-step breakdowns of fading crafts.</p>
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner" /></div>
        ) : crafts.length === 0 ? (
          <div className="empty-state"><h3>No craft entries yet</h3></div>
        ) : (
          <div className="blog-list">
            {crafts.map(c => (
              <Link href={`/crafts/${c._id}`} key={c._id} style={{ textDecoration: 'none' }}>
                <div className="blog-card">
                  <h3>{c.craftName}</h3>
                  <div className="meta">
                    by {c.practitionerName} · {c.steps?.length || 0} steps
                    {c.aiProvider && <span className="provider-badge" style={{ marginLeft: 12 }}>via {c.aiProvider}</span>}
                  </div>
                  <p>{c.description?.substring(0, 200)}…</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
