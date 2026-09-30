import Link from 'next/link';

export default function ArtistCard({ artist }) {
  const displayImage = artist.profilePhoto || artist.representativeArtwork || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="artist-card" style={{
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      background: 'var(--bg-secondary)',
      transition: 'transform 0.2s',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Link href={`/artist/${artist._id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 200, width: '100%', overflow: 'hidden' }}>
          <img 
            src={displayImage.startsWith('http') ? displayImage : `http://localhost:5000${displayImage}`} 
            alt={artist.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            {artist.name}
          </h3>
          {artist.username && (
            <p style={{ margin: '0 0 12px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              @{artist.username}
            </p>
          )}
          
          {artist.contentTypes && artist.contentTypes.length > 0 && (
            <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
              {artist.contentTypes.join(' • ')}
            </p>
          )}

          <p style={{ 
            margin: '0 0 16px 0', 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1
          }}>
            {artist.bio || 'Independent creator on Kalasetu.'}
          </p>

          <div style={{ 
            marginTop: 'auto', 
            paddingTop: '12px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}>
            {artist.artworkCount} approved {artist.artworkCount === 1 ? 'artwork' : 'artworks'}
          </div>
        </div>
      </Link>
    </div>
  );
}
