import Link from 'next/link';
import { API } from '@/lib/api';

export default function ArtworkCard({ artwork }) {
  const artistName = artwork.artistId?.name || 'Unknown Artist';
  const hasImage = artwork.imagePath && artwork.imagePath.length > 1;
  const imgSrc = hasImage
    ? (artwork.imagePath.startsWith('http') ? artwork.imagePath : `${API}${artwork.imagePath}`)
    : null;

  return (
    <Link href={`/artist/${artwork.artistId?._id || artwork.artistId}`} className="artwork-card" id={`artwork-${artwork._id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div className="artwork-card-img-wrapper">
        {imgSrc ? (
          <img src={imgSrc} alt={artwork.artistNote || 'Artwork'} loading="lazy" />
        ) : (
          <div style={{
            width: '100%', aspectRatio: '4/3',
            background: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8, padding: 24,
          }}>
            <span style={{ fontSize: '2rem', opacity: 0.3, filter: 'grayscale(100%)' }}>🎨</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
              {artwork.tags?.medium || 'Artwork'}
            </span>
          </div>
        )}
      </div>
      
      <div className="artwork-card-info" style={{ paddingTop: '12px' }}>
        {artwork.artistNote && (
          <p className="artwork-card-title">{artwork.artistNote}</p>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <p className="artwork-card-meta" style={{ margin: 0, fontWeight: 500 }}>BY {artistName}</p>
          
          {artwork.zkProofHash && (
            <span 
              style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.65rem', padding: '2px 0', color: 'var(--text-muted)', cursor: 'pointer' }}
              title={`Digital Fingerprint: ${artwork.zkProofHash}`}
              onClick={(e) => {
                e.preventDefault();
                alert(`🔒 PRIVACY-PRESERVING VERIFICATION COMPLETED ✓\n\nReference: ${artwork.zkProofHash.substring(0,20)}...`);
              }}
            >
              ✓ VERIFIED
            </span>
          )}
        </div>

        <div className="tag-list" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
          {artwork.tags?.medium && <span className="tag">{artwork.tags.medium}</span>}
          {artwork.tags?.technique && <span className="tag">{artwork.tags.technique}</span>}
          {artwork.tags?.culturalInfluence && <span className="tag">{artwork.tags.culturalInfluence}</span>}
          {artwork.tags?.mood?.map((m, i) => (
            <span key={i} className="tag">{m}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
