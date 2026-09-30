import { useState, useEffect } from 'react';
import { API } from '@/lib/api';

export default function TagFilterBar({ onFilter }) {
  const [options, setOptions] = useState({ mediums: [], techniques: [], cultures: [] });
  const [filters, setFilters] = useState({ medium: '', technique: '', culture: '', search: '', shuffle: false });

  useEffect(() => {
    fetch(`${API}/api/artworks`)
      .then(r => r.json())
      .then(artworks => {
        if (Array.isArray(artworks)) {
          const mediums    = [...new Set(artworks.map(a => a.tags?.medium).filter(Boolean))];
          const techniques = [...new Set(artworks.map(a => a.tags?.technique).filter(Boolean))];
          const cultures   = [...new Set(artworks.map(a => a.tags?.culturalInfluence).filter(Boolean))];
          setOptions({ mediums, techniques, cultures });
        }
      })
      .catch(() => {});
  }, []);

  function handleChange(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilter(next);
  }

  function toggleShuffle() {
    const next = { ...filters, shuffle: !filters.shuffle };
    setFilters(next);
    onFilter(next);
  }

  return (
    <div className="filter-bar" id="tag-filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <div style={{ flex: '1 1 200px', minWidth: 200 }}>
        <input
          type="text"
          id="search-input"
          value={filters.search}
          onChange={e => handleChange('search', e.target.value)}
          placeholder="🔍 Search title, tag, or artist…"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        />
      </div>

      <select
        id="filter-medium"
        value={filters.medium}
        onChange={e => handleChange('medium', e.target.value)}
      >
        <option value="">All Mediums</option>
        {options.mediums.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <select
        id="filter-technique"
        value={filters.technique}
        onChange={e => handleChange('technique', e.target.value)}
      >
        <option value="">All Techniques</option>
        {options.techniques.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <select
        id="filter-culture"
        value={filters.culture}
        onChange={e => handleChange('culture', e.target.value)}
      >
        <option value="">All Cultures</option>
        {options.cultures.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <button
        type="button"
        id="shuffle-btn"
        className={`btn ${filters.shuffle ? 'btn-primary' : 'btn-secondary'}`}
        onClick={toggleShuffle}
        title="Shuffle feed to ensure equal shelf space"
        style={{ padding: '8px 16px', cursor: 'pointer' }}
      >
        🎲 {filters.shuffle ? 'Shuffled' : 'Shuffle Order'}
      </button>
    </div>
  );
}
