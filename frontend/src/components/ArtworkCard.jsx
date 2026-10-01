import Link from 'next/link';
import { API } from '@/lib/api';

export default function ArtworkCard({ artwork }) {
  const artistName = artwork.artistId?.name || 'Unknown Artist';
  const hasImage = artwork.imagePath && artwork.imagePath.length > 1;
  const imgSrc = hasImage
    ? (artwork.imagePath.startsWith('http') ? artwork.imagePath : `${API}${artwork.imagePath}`)
    : null;

  // Generate a unique gradient from the artwork's tags for visual variety
  const hue1 = ((artwork.tags?.medium?.length || 3) * 37) % 360;
  const hue2 = (hue1 + 60) % 360;

  return (
    <Link href={`/artist/${artwork.artistId?._id || artwork.artistId}`} className="artwork-card" id={`artwork-${artwork._id}`}>
      <div style={{ overflow: 'hidden' }}>
        {imgSrc ? (
          <img src={imgSrc} alt={artwork.artistNote || 'Artwork'} loading="lazy" />
        ) : (
          <div style={{
            width: '100%', aspectRatio: '4/3',
            background: `linear-gradient(135deg, hsl(${hue1}, 50%, 20%), hsl(${hue2}, 60%, 15%))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8, padding: 24,
          }}>
            <span style={{ fontSize: '2rem', opacity: 0.3 }}>🎨</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontStyle: 'italic' }}>
              {artwork.tags?.medium || 'Artwork'}
            </span>
          </div>
        )}
      </div>
      <div className="artwork-card-body">
        {artwork.zkProofHash && (
          <div style={{ marginBottom: '8px' }}>
            <span 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(217, 119, 6, 0.15)', color: 'var(--accent-primary)', borderRadius: '4px', border: '1px solid rgba(217, 119, 6, 0.3)', cursor: 'pointer', fontFamily: 'monospace' }}
              title={`Digital Fingerprint: ${artwork.zkProofHash}`}
              onClick={(e) => {
                e.preventDefault();
                alert(`🔒 ZK Copyright Fingerprint:\n\n${artwork.zkProofHash}\n\nThis hash mathematically proves the artist possesses the heavy original source file without revealing it.`);
              }}
            >
              🔒 ZK Copyright Locked
            </span>
          </div>
        )}
        {artwork.artistNote && (
          <p className="artwork-card-title">{artwork.artistNote}</p>
        )}
        <p className="artwork-card-artist">by {artistName}</p>
        <div className="tag-list">
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
