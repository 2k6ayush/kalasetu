import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import ArtistCard from '@/components/ArtistCard';
import { API } from '@/lib/api';

export default function WallOfFame() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  function fetchArtists() {
    setLoading(true);
    fetch(`${API}/api/artists`)
      .then(r => r.json())
      .then(data => { 
        setArtists(Array.isArray(data) ? data : []); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { fetchArtists(); }, []);

  const filters = ['All', 'Painters', 'Crafts', 'Photography', 'Folk Art', 'Music', 'Digital Art'];

  // This is a naive filter implementation for the UI demo.
  // Ideally, backend would support filtering by medium/category.
  const filteredArtists = artists.filter(a => {
    if (filter === 'All') return true;
    const allTags = a.contentTypes?.join(' ').toLowerCase() || '';
    return allTags.includes(filter.toLowerCase());
  });

  return (
    <>
      <Head>
        <title>Wall of Fame — Kalāsetu</title>
      </Head>
      <Navbar />
      <main className="container page" style={{ paddingTop: '160px' }}>
        
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '40px', marginBottom: '40px' }}>
          <h1 className="editorial-title">Wall of Fame</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Meet the people keeping creativity alive.</p>
        </div>

        {/* EDITORIAL FILTERS */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: filter === f ? '600' : '400',
                padding: '4px 0',
                borderBottom: filter === f ? '1px solid var(--text-primary)' : '1px solid transparent'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: '60px 0' }}><span className="spinner" /></div>
        ) : filteredArtists.length === 0 ? (
          <div className="text-center" style={{ padding: '60px 0', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '8px' }}>No artists found in this category.</h3>
            <p className="editorial-caption">The archive is still growing.</p>
          </div>
        ) : (
          <div className="editorial-grid">
            {filteredArtists.map((artist, i) => {
              // Creating a varied editorial grid
              let span = 'span 3';
              if (i === 0 || i % 7 === 0) span = 'span 6';
              if (i % 5 === 0 && i !== 0) span = 'span 4';

              return (
                <div key={artist._id} style={{ gridColumn: span }}>
                  <ArtistCard artist={artist} large={span === 'span 6'} />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
