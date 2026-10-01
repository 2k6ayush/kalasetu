import Link from 'next/link';

export default function ArtistCard({ artist, large }) {
  const displayImage = artist.profilePhoto || artist.representativeArtwork || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="artist-card" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', display: 'flex', flexDirection: 'column' }}>
      <Link href={`/artist/${artist._id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: large ? '400px' : '250px', width: '100%', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
          <img 
            src={displayImage.startsWith('http') ? displayImage : `http://localhost:5000${displayImage}`} 
            alt={artist.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: large ? '2rem' : '1.5rem', fontFamily: 'var(--font-display)', fontWeight: '500' }}>
            {artist.name}
          </h3>
          {artist.username && (
            <p style={{ margin: '0 0 12px 0', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              @{artist.username}
            </p>
          )}
          
          <p style={{ 
            margin: '0 0 16px 0', 
            fontSize: '0.95rem', 
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: large ? 5 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {artist.bio || 'Independent creator on Kalāsetu.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <div>
              {artist.contentTypes && artist.contentTypes.length > 0 && (
                <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>
                  {artist.contentTypes.join(' • ')}
                </p>
              )}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {artist.artworkCount} {artist.artworkCount === 1 ? 'WORK' : 'WORKS'}
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>View Profile →</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
