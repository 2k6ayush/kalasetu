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
