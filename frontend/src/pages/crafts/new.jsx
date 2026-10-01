import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import { API } from '@/lib/api';

export default function NewCraft() {
  const router = useRouter();
  const [craftName, setCraftName]               = useState('');
  const [practitionerName, setPractitionerName] = useState('');
  const [region, setRegion]                     = useState('');
  const [description, setDescription]           = useState('');
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!craftName.trim() || !practitionerName.trim() || !description.trim()) {
      return setError('Craft name, practitioner name, and description are required.');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/crafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          craftName,
          practitionerName,
          region,
          description,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit craft technique.');
      }

      const data = await res.json();
      router.push(`/crafts/${data._id}`);
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Archive a Craft — Kalāsetu</title>
        <meta name="description" content="Submit details of a traditional craft technique to generate a step-by-step preservation guide." />
      </Head>
      <Navbar />
      <main className="container page" style={{ paddingTop: '160px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, borderBottom: '1px solid var(--border-color)', paddingBottom: '32px' }}>
          <p className="editorial-caption" style={{ marginBottom: '8px' }}>The Kalāsetu Archive</p>
          <h1 className="editorial-title" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>Preserve a Traditional Craft</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Document a fading technique. AI will help structure your knowledge into an accessible step-by-step guide.</p>
        </div>

        <div className="form-card" style={{ maxWidth: '600px', border: '1px solid var(--border-color)', padding: '40px' }}>
          <h2 className="editorial-title" style={{ fontSize: '2rem', marginBottom: '32px', textAlign: 'center' }}>Technique Submission</h2>

          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="craft-name">Craft Name *</label>
              <input
                id="craft-name"
                value={craftName}
                onChange={e => setCraftName(e.target.value)}
                placeholder="e.g. Toda Embroidery, Rogan Painting"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="practitioner-name">Practitioner / Community Name *</label>
              <input
                id="practitioner-name"
                value={practitionerName}
                onChange={e => setPractitionerName(e.target.value)}
                placeholder="e.g. Master Artisan K. Raman"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="region">Region / Origin (optional)</label>
              <input
                id="region"
                value={region}
                onChange={e => setRegion(e.target.value)}
                placeholder="e.g. Kutch, Gujarat"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Technique Description & Method Details *</label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the raw materials, tools, preparation, and step-by-step process used in this tradition…"
                rows={6}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-craft-btn">
              {loading && <span className="spinner" />}
              {loading ? 'Generating AI Guide…' : 'Submit & Generate Preservation Guide'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
