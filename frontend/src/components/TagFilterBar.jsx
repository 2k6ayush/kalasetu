import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TagFilterBar({ onFilter }) {
  const [options, setOptions] = useState({ mediums: [], techniques: [], cultures: [] });
  const [filters, setFilters] = useState({ medium: '', technique: '', culture: '' });

  useEffect(() => {
    // Fetch all artworks once to extract unique tag values
    fetch(`${API}/api/artworks`)
      .then(r => r.json())
      .then(artworks => {
        const mediums    = [...new Set(artworks.map(a => a.tags?.medium).filter(Boolean))];
        const techniques = [...new Set(artworks.map(a => a.tags?.technique).filter(Boolean))];
        const cultures   = [...new Set(artworks.map(a => a.tags?.culturalInfluence).filter(Boolean))];
        setOptions({ mediums, techniques, cultures });
      })
      .catch(() => {});
  }, []);

  function handleChange(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilter(next);
  }

  return (
    <div className="filter-bar" id="tag-filter-bar">
      <label>Filter by</label>

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
    </div>
  );
}
