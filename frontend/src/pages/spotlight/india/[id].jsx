import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import { API } from '@/lib/api';

function exactTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function IndiaSpotlightDetail() {
  const router = useRouter();
  const { id }  = router.query;
  const [post, setPost]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/india-spotlights/${id}`)
      .then(r => r.json())
      .then(data => { setPost(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Navbar />
      <main className="container page"><div className="empty-state"><span className="spinner" /></div></main>
    </>
  );

  if (!post || post.error) return (
    <>
      <Navbar />
      <main className="container page">
        <div className="empty-state">
          <h3>Article not found</h3>
          <Link href="/spotlight" className="btn btn-secondary" style={{ marginTop: 20 }}>← Back to Blog</Link>
        </div>
      </main>
    </>
  );

  return (
    <>
      <Head>
        <title>{post.title} — Kalāsetu India Culture Blog</title>
        <meta name="description" content={post.body?.substring(0, 160)} />
      </Head>
      <Navbar />
      <main className="container page">
        <div className="article">
          {/* Breadcrumb */}
          <div style={{ marginBottom: 28 }}>
            <Link href="/spotlight" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              ← India Culture Blog
            </Link>
          </div>

          {/* Hero Image */}
          {post.imageUrl && (
            <div style={{ marginBottom: 32 }}>
              <img 
                src={post.imageUrl} 
                alt={post.artType}
                style={{ 
                  width: '100%', 
                  maxHeight: '480px', 
                  objectFit: 'cover', 
                  borderRadius: 'var(--radius-md)' 
                }} 
              />
            </div>
          )}

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa' }}>
              {post.state}
            </span>
            <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: 'rgba(108,138,255,0.1)', border: '1px solid rgba(108,138,255,0.25)', color: 'var(--accent-blue)' }}>
              {post.artType}
            </span>
          </div>

          <h1 style={{ marginBottom: 16 }}>{post.title}</h1>

          <div className="meta" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>🕐 {exactTime(post.publishedAt)}</span>
            {post.aiProvider && <span className="provider-badge">via {post.aiProvider}</span>}
          </div>

          <div style={{ marginTop: 36 }}>
            {post.body.split('\n').map((para, i) =>
              para.trim()
                ? <p key={i} style={{ marginBottom: 20, lineHeight: 1.85, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{para}</p>
                : null
            )}
          </div>

          <div className="section-divider" />

          <div style={{ textAlign: 'center' }}>
            <Link href="/spotlight" className="btn btn-secondary">← Back to India Culture Blog</Link>
          </div>
        </div>
      </main>
    </>
  );
}
