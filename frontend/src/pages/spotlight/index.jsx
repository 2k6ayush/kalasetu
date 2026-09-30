import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import { API } from '@/lib/api';

// ── Relative time helper ──────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Format exact time for tooltip ────────────────────────────────
function exactTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function IndiaSpotlightList() {
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [newCount, setNewCount]   = useState(0);
  const [stateFilter, setStateFilter]     = useState('');
  const [artFilter, setArtFilter]         = useState('');
  const [allStates, setAllStates]   = useState([]);
  const [allArtTypes, setAllArtTypes] = useState([]);
  const latestIdRef = useRef(null);
  const [tick, setTick] = useState(0); // forces re-render for relative time

  // ── Fetch filter options once ────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/india-spotlights/meta`)
      .then(r => r.json())
      .then(({ states, artTypes }) => {
        setAllStates(states || []);
        setAllArtTypes(artTypes || []);
      })
      .catch(() => {});
  }, []);

  // ── Fetch posts ───────────────────────────────────────────────
  const fetchPosts = useCallback((isBackground = false) => {
    const params = new URLSearchParams();
    if (stateFilter) params.set('state', stateFilter);
    if (artFilter)   params.set('artType', artFilter);

    fetch(`${API}/api/india-spotlights?${params}`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        if (isBackground) {
          // Check if there are genuinely new posts since last fetch
          const newest = data[0]?._id;
          if (newest && latestIdRef.current && newest !== latestIdRef.current) {
            const count = data.findIndex(p => p._id === latestIdRef.current);
            setNewCount(count > 0 ? count : 1);
          } else {
            setPosts(data);
            setLoading(false);
            if (data[0]) latestIdRef.current = data[0]._id;
          }
        } else {
          setPosts(data);
          setLoading(false);
          setNewCount(0);
          if (data[0]) latestIdRef.current = data[0]._id;
        }
      })
      .catch(() => setLoading(false));
  }, [stateFilter, artFilter]);

  // Refresh posts when filters change
  useEffect(() => {
    setLoading(true);
    fetchPosts(false);
  }, [fetchPosts]);

  // ── Poll for new posts every 30s ──────────────────────────────
  useEffect(() => {
    const poll = setInterval(() => fetchPosts(true), 30 * 1000);
    return () => clearInterval(poll);
  }, [fetchPosts]);

  // ── Update relative timestamps every 30s ──────────────────────
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  function loadNewPosts() {
    setLoading(true);
    fetchPosts(false);
  }

  const newestPost = posts[0];

  return (
    <>
      <Head>
        <title>India Culture Blog — Kalāsetu</title>
        <meta name="description" content="Live AI-curated blog about India's hidden traditional arts, endangered crafts, and cultural heritage — updated every 2 minutes." />
      </Head>
      <Navbar />
      <main className="container page">

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
            <span className="live-badge">🔴 LIVE</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>New post every 2 minutes</span>
          </div>
          <h1 className="page-title">India Culture Blog</h1>
          <p className="page-subtitle">
            AI-curated stories on India's hidden traditional arts, endangered crafts,<br />
            and living cultural heritage — from every corner of the subcontinent.
          </p>
        </div>

        {/* ── New posts banner ── */}
        {newCount > 0 && (
          <div className="new-posts-banner" onClick={loadNewPosts}>
            ✨ {newCount} new {newCount === 1 ? 'post' : 'posts'} — click to load
          </div>
        )}

        {/* ── Filter Bar ── */}
        <div className="filter-bar" id="india-filter-bar" style={{ marginBottom: 32 }}>
          <select
            id="filter-state"
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
          >
            <option value="">🗺 All States</option>
            {allStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            id="filter-art-type"
            value={artFilter}
            onChange={e => setArtFilter(e.target.value)}
          >
            <option value="">🎨 All Art Forms</option>
            {allArtTypes.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {(stateFilter || artFilter) && (
            <button
              className="btn btn-secondary"
              onClick={() => { setStateFilter(''); setArtFilter(''); }}
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              ✕ Clear filters
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            {(stateFilter || artFilter) && ' (filtered)'}
          </div>
        </div>

        {/* ── Posts list ── */}
        {loading ? (
          <div className="empty-state"><span className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <h3>No posts found</h3>
            <p style={{ marginTop: 8 }}>
              {stateFilter || artFilter
                ? 'Try clearing the filters — more posts are being generated.'
                : 'The AI is writing the first posts… refresh in a moment.'}
            </p>
          </div>
        ) : (
          <div className="blog-list">
            {posts.map((post, idx) => (
              <Link
                href={`/spotlight/india/${post._id}`}
                key={post._id}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className={`blog-card india-card ${idx === 0 && post._id === newestPost?._id ? 'newest-card' : ''}`}
                >
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt={post.artType} 
                      style={{ 
                        width: '100%', 
                        height: '240px', 
                        objectFit: 'cover', 
                        borderRadius: 'var(--radius-sm)', 
                        marginBottom: '20px' 
                      }} 
                    />
                  )}

                  {/* Tags row */}
                  <div className="india-tags" style={{ marginBottom: 12 }}>
                    <span className="india-tag state-tag">{post.state}</span>
                    <span className="india-tag art-tag">{post.artType}</span>
                    {idx === 0 && <span className="india-tag new-tag">✨ Latest</span>}
                  </div>

                  <h3 style={{ marginBottom: 10, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                    {post.title}
                  </h3>

                  <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span title={exactTime(post.publishedAt)} style={{ cursor: 'default' }}>
                      🕐 {exactTime(post.publishedAt)}
                    </span>
                    <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                      {timeAgo(post.publishedAt)}
                    </span>
                    {post.aiProvider && (
                      <span className="provider-badge">via {post.aiProvider}</span>
                    )}
                  </div>

                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                    {post.body?.substring(0, 220)}…
                  </p>

                  <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                    Read full article →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(255, 80, 80, 0.12);
          border: 1px solid rgba(255, 80, 80, 0.3);
          border-radius: 999px;
          color: #ff6b6b;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          animation: pulse-live 2s ease-in-out infinite;
        }
        @keyframes pulse-live {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.65; }
        }
        .new-posts-banner {
          background: linear-gradient(135deg, rgba(108,138,255,0.15), rgba(167,139,250,0.1));
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-md);
          padding: 14px 24px;
          text-align: center;
          color: var(--accent-blue);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          margin-bottom: 20px;
          animation: fadeUp 0.4s var(--ease-out);
          transition: background 0.2s;
        }
        .new-posts-banner:hover {
          background: linear-gradient(135deg, rgba(108,138,255,0.25), rgba(167,139,250,0.18));
        }
        .india-card {
          transition: transform 0.3s var(--ease-out), border-color 0.3s, box-shadow 0.3s;
        }
        .india-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(108, 138, 255, 0.1);
        }
        .newest-card {
          border-color: rgba(108, 138, 255, 0.4);
          box-shadow: 0 0 0 1px rgba(108, 138, 255, 0.15);
          animation: slideIn 0.5s var(--ease-out);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .india-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .india-tag {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .state-tag {
          background: rgba(167, 139, 250, 0.12);
          border: 1px solid rgba(167, 139, 250, 0.3);
          color: #a78bfa;
        }
        .art-tag {
          background: rgba(108, 138, 255, 0.1);
          border: 1px solid rgba(108, 138, 255, 0.25);
          color: var(--accent-blue);
        }
        .new-tag {
          background: rgba(107, 240, 168, 0.1);
          border: 1px solid rgba(107, 240, 168, 0.25);
          color: #6bf0a8;
        }
      `}</style>
    </>
  );
}
