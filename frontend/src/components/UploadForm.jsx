import { useState, useEffect } from 'react';
import { API } from '@/lib/api';
import Link from 'next/link';

export default function UploadForm() {
  const [artistId, setArtistId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Stage 1: Artist Profile State ──
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newSocial, setNewSocial] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  // ── Stage 2: Content Creation State ──
  const [contentType, setContentType] = useState('IMAGE'); // IMAGE, VIDEO, AUDIO, TEXT
  const [title, setTitle] = useState('');
  const [artistNote, setArtistNote] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  
  const [result, setResult] = useState(null);

  // ── Tag review & editing state (IMAGE only) ──
  const [editMedium, setEditMedium] = useState('');
  const [editTechnique, setEditTechnique] = useState('');
  const [editCulturalInfluence, setEditCulturalInfluence] = useState('');
  const [editMood, setEditMood] = useState('');
  const [tagSaveLoading, setTagSaveLoading] = useState(false);
  const [tagSaveSuccess, setTagSaveSuccess] = useState(false);
  const [tagSaveError, setTagSaveError] = useState('');

  // Auto-login if artistId exists in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kalasetu_artist_id');
    if (saved) setArtistId(saved);
  }, []);

  function handleProfilePhoto(e) {
    const f = e.target.files[0];
    if (f) {
      setProfilePhotoFile(f);
      setProfilePhotoPreview(URL.createObjectURL(f));
    }
  }

  function handleMediaFile(e) {
    const f = e.target.files[0];
    if (f) {
      setMediaFile(f);
      if (contentType === 'IMAGE' || contentType === 'VIDEO') {
        setMediaPreview(URL.createObjectURL(f));
      } else {
        setMediaPreview('🎵 Audio file selected');
      }
    }
  }

  async function createArtistProfile(e) {
    e.preventDefault();
    if (!newName.trim()) return setError('Artist Name is required');
    if (!profilePhotoFile) return setError('Profile Image is required');

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('profilePhoto', profilePhotoFile);
      formData.append('name', newName);
      formData.append('username', newUsername);
      formData.append('bio', newBio);
      formData.append('socialLink', newSocial);

      const res = await fetch(`${API}/api/artists`, { method: 'POST', body: formData });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to create profile');

      setArtistId(data._id);
      localStorage.setItem('kalasetu_artist_id', data._id);
    } catch (err) {
      setError(err.message || 'Failed to create artist profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleContentSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setTagSaveSuccess(false);

    if (!artistId) return setError('Artist ID missing');
    if (contentType !== 'TEXT' && !mediaFile) return setError('Media file is required');
    if (contentType === 'TEXT' && !artistNote.trim()) return setError('Text content is required');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('artistId', artistId);
      formData.append('type', contentType);
      if (title) formData.append('title', title);
      if (artistNote) formData.append('artistNote', artistNote);
      if (mediaFile) formData.append('image', mediaFile); // Multer expects field name 'image'

      const res = await fetch(`${API}/api/artworks`, { method: 'POST', body: formData });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setResult(data);

      if (data.tags && contentType === 'IMAGE') {
        setEditMedium(data.tags.medium || '');
        setEditTechnique(data.tags.technique || '');
        setEditCulturalInfluence(data.tags.culturalInfluence || '');
        setEditMood(Array.isArray(data.tags.mood) ? data.tags.mood.join(', ') : '');
      }

      // Reset form on success if not image
      if (contentType !== 'IMAGE') {
        setTitle('');
        setArtistNote('');
        setMediaFile(null);
        setMediaPreview(null);
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

  function logoutArtist() {
    localStorage.removeItem('kalasetu_artist_id');
    setArtistId('');
    setResult(null);
  }

  // ── RENDER STAGE 1 ──
  if (!artistId) {
    return (
      <div className="form-card">
        <h2 style={{ marginBottom: 24, fontFamily: 'var(--font-display)' }}>Create Your Artist Profile</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>You only need to do this once. After your profile is created, you can upload unlimited artwork, videos, and texts.</p>

        <form onSubmit={createArtistProfile}>
          <div className="form-group" style={{ textAlign: 'center' }}>
            <div 
              style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px dashed var(--border-color)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => document.getElementById('profile-input').click()}
            >
              {profilePhotoPreview ? <img src={profilePhotoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2rem' }}>📷</span>}
            </div>
            <label style={{ cursor: 'pointer', color: 'var(--accent-primary)' }} onClick={() => document.getElementById('profile-input').click()}>
              Upload Profile Image *
            </label>
            <input type="file" id="profile-input" accept="image/*" onChange={handleProfilePhoto} style={{ display: 'none' }} />
          </div>

          <div className="form-group">
            <label htmlFor="new-artist-name">Artist Name *</label>
            <input id="new-artist-name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Your artist name" required />
          </div>
          <div className="form-group">
            <label htmlFor="new-artist-username">Username</label>
            <input id="new-artist-username" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="e.g. ayush_arts" />
          </div>
          <div className="form-group">
            <label htmlFor="new-artist-bio">Bio</label>
            <textarea id="new-artist-bio" value={newBio} onChange={e => setNewBio(e.target.value)} placeholder="Brief bio" rows={3} />
          </div>
          <div className="form-group">
            <label htmlFor="new-artist-social">Social Link</label>
            <input id="new-artist-social" value={newSocial} onChange={e => setNewSocial(e.target.value)} placeholder="https://..." />
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading && <span className="spinner" />}
            {loading ? 'Creating Profile…' : 'Create Artist Profile'}
          </button>
        </form>
      </div>
    );
  }

  // ── RENDER STAGE 2 ──
  return (
    <div className="form-card" style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>Create Content</h2>
        <button className="btn btn-secondary" onClick={logoutArtist} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Switch Account</button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 12, fontWeight: 'bold' }}>What do you want to share?</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {['IMAGE', 'VIDEO', 'AUDIO', 'TEXT'].map(type => (
            <button
              key={type}
              type="button"
              className={`btn ${contentType === type ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setContentType(type); setMediaFile(null); setMediaPreview(null); setResult(null); setError(''); }}
              style={{ padding: '12px 0', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
            >
              <span style={{ fontSize: '1.5rem' }}>
                {type === 'IMAGE' && '🎨'}
                {type === 'VIDEO' && '🎥'}
                {type === 'AUDIO' && '🎵'}
                {type === 'TEXT' && '📝'}
              </span>
              <span style={{ fontSize: '0.85rem' }}>{type}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleContentSubmit}>
        {contentType !== 'TEXT' && (
          <div className="form-group">
            <label htmlFor="file-input">
              {contentType === 'IMAGE' && 'Artwork Image'}
              {contentType === 'VIDEO' && 'Video'}
              {contentType === 'AUDIO' && 'Audio'}
            </label>
            <div className={`dropzone${mediaPreview ? ' has-image' : ''}`} onClick={() => document.getElementById('file-input').click()}>
              {mediaPreview && contentType === 'IMAGE' ? <img src={mediaPreview} alt="Preview" /> : 
               mediaPreview && contentType === 'VIDEO' ? <video src={mediaPreview} style={{ maxWidth: '100%', maxHeight: 300 }} controls /> :
               mediaPreview && contentType === 'AUDIO' ? <p>🎵 Audio file selected</p> :
               <p>Click to select a file (up to 50 MB)</p>}
            </div>
            <input 
              type="file" 
              id="file-input" 
              accept={contentType === 'IMAGE' ? 'image/*' : contentType === 'VIDEO' ? 'video/*' : 'audio/*'} 
              onChange={handleMediaFile} 
              style={{ display: 'none' }} 
            />
          </div>
        )}

        {(contentType === 'VIDEO' || contentType === 'AUDIO' || contentType === 'TEXT') && (
          <div className="form-group">
            <label htmlFor="content-title">Title</label>
            <input id="content-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Give it a title" />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="artist-note">
            {contentType === 'TEXT' ? 'Your Story / Message' : contentType === 'IMAGE' ? 'Your Note (optional)' : 'Description'}
          </label>
          <textarea 
            id="artist-note" 
            value={artistNote} 
            onChange={e => setArtistNote(e.target.value)} 
            placeholder={contentType === 'TEXT' ? 'Write your story here...' : 'Describe your piece…'} 
            rows={contentType === 'TEXT' ? 8 : 3} 
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading && <span className="spinner" />}
          {loading && contentType === 'IMAGE' ? 'Checking Artwork (AI) & Uploading…' : 
           loading ? 'Publishing…' : 
           `Upload ${contentType}`}
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
              ⏳ <strong>Submission Under Review:</strong> {result.reason}
            </div>
          ) : (
            <>
              <div className="alert alert-success">
                ✓ {contentType} uploaded successfully! <Link href={`/artist/${artistId}`} style={{ fontWeight: 'bold', textDecoration: 'underline' }}>View Profile</Link>
              </div>

              {result.tags && contentType === 'IMAGE' && (
                <div style={{ marginTop: 20, padding: 20, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                    Review & Refine Tags <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(217, 119, 6, 0.2)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase' }}>AI-Suggested</span>
                  </h3>
                  
                  <div className="form-group"><label>Medium</label><input value={editMedium} onChange={e => setEditMedium(e.target.value)} /></div>
                  <div className="form-group"><label>Technique</label><input value={editTechnique} onChange={e => setEditTechnique(e.target.value)} /></div>
                  <div className="form-group"><label>Cultural Influence</label><input value={editCulturalInfluence} onChange={e => setEditCulturalInfluence(e.target.value)} /></div>
                  <div className="form-group"><label>Mood</label><input value={editMood} onChange={e => setEditMood(e.target.value)} /></div>

                  {tagSaveSuccess && <div className="alert alert-success" style={{ marginBottom: 12 }}>✓ Tags confirmed!</div>}
                  {tagSaveError && <div className="alert alert-error" style={{ marginBottom: 12 }}>{tagSaveError}</div>}

                  <button type="button" className="btn btn-primary" onClick={handleSaveTags} disabled={tagSaveLoading}>
                    {tagSaveLoading ? 'Saving…' : 'Confirm & Save Tags'}
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
