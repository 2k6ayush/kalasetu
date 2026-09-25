import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function UploadForm() {
  const [artistId, setArtistId]     = useState('');
  const [artistNote, setArtistNote] = useState('');
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');

  // ── New artist quick-create state ──
  const [showCreate, setShowCreate]     = useState(false);
  const [newName, setNewName]           = useState('');
  const [newBio, setNewBio]             = useState('');
  const [newSocial, setNewSocial]       = useState('');
  const [createdArtist, setCreatedArtist] = useState(null);

  function handleFile(e) {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }

  async function createArtist() {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`${API}/api/artists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, bio: newBio, socialLink: newSocial }),
      });
      const data = await res.json();
      setCreatedArtist(data);
      setArtistId(data._id);
      setShowCreate(false);
    } catch (err) {
      setError('Failed to create artist profile');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!file) return setError('Please select an image');
    if (!artistId.trim()) return setError('Please enter an Artist ID or create a profile');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('artistId', artistId);
      formData.append('artistNote', artistNote);

      const res = await fetch(`${API}/api/artworks`, { method: 'POST', body: formData });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Upload failed — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card">
      <h2 style={{ marginBottom: 24, fontFamily: 'var(--font-display)' }}>Upload Artwork</h2>

      {/* ── Quick Artist Creation ── */}
      {!createdArtist && (
        <div style={{ marginBottom: 20 }}>
          <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : '+ Create Artist Profile First'}
          </button>
          {showCreate && (
            <div style={{ marginTop: 16, padding: 20, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div className="form-group">
                <label htmlFor="new-artist-name">Name *</label>
                <input id="new-artist-name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Your artist name" />
              </div>
              <div className="form-group">
                <label htmlFor="new-artist-bio">Bio</label>
                <textarea id="new-artist-bio" value={newBio} onChange={e => setNewBio(e.target.value)} placeholder="Brief bio" rows={3} />
              </div>
              <div className="form-group">
                <label htmlFor="new-artist-social">Social Link</label>
                <input id="new-artist-social" value={newSocial} onChange={e => setNewSocial(e.target.value)} placeholder="https://..." />
              </div>
              <button type="button" className="btn btn-primary" onClick={createArtist}>Create Profile</button>
            </div>
          )}
        </div>
      )}
      {createdArtist && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          ✓ Profile created for <strong>{createdArtist.name}</strong> (ID: {createdArtist._id})
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="artist-id">Artist ID</label>
          <input id="artist-id" value={artistId} onChange={e => setArtistId(e.target.value)} placeholder="Paste your artist ID" />
        </div>

        <div className="form-group">
          <label htmlFor="artwork-image">Artwork Image</label>
          <div className={`dropzone${preview ? ' has-image' : ''}`} onClick={() => document.getElementById('file-input').click()}>
            {preview ? <img src={preview} alt="Preview" /> : <p>Click to select an image — JPG, PNG, WebP up to 10 MB</p>}
          </div>
          <input type="file" id="file-input" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </div>

        <div className="form-group">
          <label htmlFor="artist-note">Your Note (optional)</label>
          <textarea id="artist-note" value={artistNote} onChange={e => setArtistNote(e.target.value)} placeholder="Describe your piece, its inspiration, or technique…" rows={3} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} id="upload-btn">
          {loading && <span className="spinner" />}
          {loading ? 'Analyzing & Uploading…' : 'Upload Artwork'}
        </button>
      </form>

      {error && <div className="alert alert-error" style={{ marginTop: 20 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 24 }}>
          {result.moderation === 'rejected' ? (
            <div className="alert alert-error">
              <strong>Content not approved.</strong> Reason: {result.reason}
            </div>
          ) : (
            <>
              <div className="alert alert-success">
                ✓ Artwork uploaded and approved!
              </div>
              {result.tags && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    AI-Generated Tags
                  </p>
                  <div className="tag-list">
                    {result.tags.medium && <span className="tag">{result.tags.medium}</span>}
                    {result.tags.technique && <span className="tag">{result.tags.technique}</span>}
                    {result.tags.culturalInfluence && <span className="tag">{result.tags.culturalInfluence}</span>}
                    {result.tags.mood?.map((m, i) => <span key={i} className="tag">{m}</span>)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
