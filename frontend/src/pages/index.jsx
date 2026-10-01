import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ArtistCard from '@/components/ArtistCard';
import { API } from '@/lib/api';

export default function Home() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <Head>
        <title>Kalāsetu — A Bridge to India's Heritage</title>
        <meta name="description" content="Discover independent artists and their traditional crafts." />
      </Head>
      <Navbar />
      <main className="container page" style={{ paddingTop: '160px' }}>
        
        {/* HERO SECTION */}
        <div className="editorial-grid" style={{ marginBottom: '80px', alignItems: 'center' }}>
          <div style={{ gridColumn: 'span 6' }}>
            <p className="editorial-caption" style={{ marginBottom: '16px' }}>The Cultural Archive</p>
            <h1 className="editorial-title">
              Discover<br/>India
            </h1>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '24px', fontWeight: '400' }}>
              Through its people,<br/>places, and art.
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '80%' }}>
              Kalāsetu is an independent digital publication and archive dedicated to preserving India's living heritage, traditional crafts, and the master artisans who keep them alive.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href="/explore-india" className="btn btn-primary">Explore India →</Link>
            </div>
          </div>
          <div style={{ gridColumn: 'span 6', display: 'flex', justifyContent: 'flex-end' }}>
            <img src="/hero_asset.png" alt="Indian Heritage Collage" style={{ width: '100%', maxHeight: '600px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </div>
        </div>

        {/* STATS SECTION */}
        <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '32px 0', marginBottom: '80px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', lineHeight: '1' }}>500+</div>
            <div className="editorial-caption">Artists</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', lineHeight: '1' }}>5K+</div>
            <div className="editorial-caption">Artworks</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', lineHeight: '1' }}>100+</div>
            <div className="editorial-caption">Places</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', lineHeight: '1' }}>10+</div>
            <div className="editorial-caption">Art Forms</div>
          </div>
        </div>

        {/* DISCOVERY SECTIONS */}
        <div className="editorial-grid" style={{ marginBottom: '80px', borderBottom: '1px solid var(--border-color)', paddingBottom: '80px' }}>
          <div style={{ gridColumn: 'span 6', borderRight: '1px solid var(--border-color)', paddingRight: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Explore India</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Discover India's places, culture and history through our interactive map.</p>
            <Link href="/explore-india" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>View →</Link>
          </div>
          <div style={{ gridColumn: 'span 6', paddingLeft: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Meet Artists</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Get to know creators keeping ancient traditions alive across the country.</p>
            <Link href="/wall-of-fame" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>View →</Link>
          </div>
        </div>

        {/* FEATURED ARTISTS */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem' }}>Featured Artists</h2>
            <Link href="/wall-of-fame" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>View All →</Link>
          </div>

          {loading ? (
            <div className="text-center" style={{ padding: '60px 0' }}><span className="spinner" /></div>
          ) : artists.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 0', border: '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '8px' }}>No artists featured yet.</h3>
              <p className="editorial-caption">The archive is still growing.</p>
            </div>
          ) : (
            <div className="editorial-grid">
              {artists.slice(0, 4).map(artist => (
                <div key={artist._id} style={{ gridColumn: 'span 3' }}>
                  <ArtistCard artist={artist} />
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </>
  );
}
