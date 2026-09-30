import { useState } from 'react';
import { API } from '@/lib/api';

export default function UploadForm() {
  const [artistId, setArtistId]     = useState('');
  const [artistNote, setArtistNote] = useState('');
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');

  // ── New artist quick-create state ──
  const [showCreate, setShowCreate]       = useState(false);
  const [newName, setNewName]             = useState('');
  const [newBio, setNewBio]               = useState('');
  const [newSocial, setNewSocial]         = useState('');
  const [createdArtist, setCreatedArtist] = useState(null);

  // ── Tag review & editing state ──
  const [editMedium, setEditMedium]                       = useState('');
  const [editTechnique, setEditTechnique]                 = useState('');
  const [editCulturalInfluence, setEditCulturalInfluence] = useState('');
  const [editMood, setEditMood]                           = useState('');
  const [tagSaveLoading, setTagSaveLoading]               = useState(false);
  const [tagSaveSuccess, setTagSaveSuccess]               = useState(false);
  const [tagSaveError, setTagSaveError]                   = useState('');

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
    setTagSaveSuccess(false);

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

      if (data.tags) {
        setEditMedium(data.tags.medium || '');
        setEditTechnique(data.tags.technique || '');
        setEditCulturalInfluence(data.tags.culturalInfluence || '');
        setEditMood(Array.isArray(data.tags.mood) ? data.tags.mood.join(', ') : '');
      }
    } catch (err) {
      setError(err.message || 'Upload failed — please try again');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTags() {
    if (!result?.artwork?._id) return;
    setTagSaveLoading(true);
    setTagSaveSuccess(false);
    setTagSaveError('');

    try {
      const res = await fetch(`${API}/api/artworks/${result.artwork._id}/tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medium: editMedium,
          technique: editTechnique,
          culturalInfluence: editCulturalInfluence,
          mood: editMood,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update tags');
      }

      setTagSaveSuccess(true);
    } catch (err) {
      setTagSaveError(err.message || 'Failed to save tags');
    } finally {
      setTagSaveLoading(false);
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
          ) : result.moderation === 'pending' ? (
            <div className="alert" style={{ background: 'rgba(234, 179, 8, 0.15)', borderColor: 'rgba(234, 179, 8, 0.4)', color: '#fef08a' }}>
              ⏳ <strong>Submission Under Review:</strong> {result.reason || 'AI moderation service is temporarily unavailable. Your artwork has been saved as pending.'}
            </div>
          ) : (
            <>
              <div className="alert alert-success">
                ✓ Artwork uploaded and approved!
              </div>

              {result.tags && (
                <div style={{ marginTop: 20, padding: 20, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                    Review & Refine Tags <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(217, 119, 6, 0.2)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI-Suggested</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                    Review the AI-extracted metadata below. You can refine or edit any tag before confirming.
                  </p>

                  <div className="form-group">
                    <label htmlFor="edit-medium">Medium (AI-suggested)</label>
                    <input id="edit-medium" value={editMedium} onChange={e => setEditMedium(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-technique">Technique (AI-suggested)</label>
                    <input id="edit-technique" value={editTechnique} onChange={e => setEditTechnique(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-culture">Cultural Influence (AI-suggested)</label>
                    <input id="edit-culture" value={editCulturalInfluence} onChange={e => setEditCulturalInfluence(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-mood">Mood (AI-suggested, comma-separated)</label>
                    <input id="edit-mood" value={editMood} onChange={e => setEditMood(e.target.value)} />
                  </div>

                  {tagSaveSuccess && <div className="alert alert-success" style={{ marginBottom: 12 }}>✓ Tags updated and confirmed!</div>}
                  {tagSaveError && <div className="alert alert-error" style={{ marginBottom: 12 }}>{tagSaveError}</div>}

                  <button type="button" className="btn btn-primary" onClick={handleSaveTags} disabled={tagSaveLoading} id="save-tags-btn">
                    {tagSaveLoading && <span className="spinner" />}
                    {tagSaveLoading ? 'Saving Tags…' : 'Confirm & Save Tags'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
