import { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { AuthContext } from '@/context/AuthContext';
import { API } from '@/lib/api';

const DynamicMap = dynamic(() => import('@/components/Map/DynamicMap'), {
  ssr: false,
  loading: () => <div className="map-loading" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>Loading interactive map...</div>
});

const INDIA_CENTER = [22.9, 79.6];
const INITIAL_ZOOM = 5;

export default function ExploreIndia() {
  const { user } = useContext(AuthContext) || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [mapState, setMapState] = useState({
    center: INDIA_CENTER,
    zoom: INITIAL_ZOOM,
    marker: null
  });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [exploredPlaces, setExploredPlaces] = useState([]);
  const [ambiguousResults, setAmbiguousResults] = useState([]);
  
  const [knowledge, setKnowledge] = useState(null);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState(false);
  
  const [environment, setEnvironment] = useState(null);

  useEffect(() => {
    if (user && user.token) {
      fetch(`${API}/api/explore/history`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setExploredPlaces(data.data);
        }
      })
      .catch(err => console.error("History fetch error:", err));
    }
  }, [user]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setAmbiguousResults([]);
    
    try {
      const q = encodeURIComponent(searchQuery);
      const res = await fetch(`${API}/api/explore/geocode?q=${q}`);
      const resultData = await res.json();

      if (!res.ok) {
        alert(resultData.error || "Search failed. Please try again later.");
        return;
      }

      const results = resultData.data;

      if (results && results.length === 1) {
        selectLocation(results[0]);
      } else if (results && results.length > 1) {
        setAmbiguousResults(results);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      alert("Search failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const selectLocation = async (place) => {
    const lat = parseFloat(place.latitude);
    const lon = parseFloat(place.longitude);
    
    setActiveTab('history');
    
    setMapState({
      center: [lat, lon],
      zoom: 12,
      marker: {
        position: [lat, lon],
        label: place.name
      }
    });

    setSelectedPlace({
      name: place.name,
      fullName: `${place.name} — ${place.state}`,
      lat: lat.toFixed(4),
      lon: lon.toFixed(4),
    });
    
    setAmbiguousResults([]);
    setKnowledge(null);
    setKnowledgeError(false);
    setKnowledgeLoading(true);
    setEnvironment(null);
    
    const nameEnc = encodeURIComponent(place.name);
    const stateEnc = encodeURIComponent(place.state);
    const latEnc = encodeURIComponent(place.latitude);
    const lonEnc = encodeURIComponent(place.longitude);
    
    const fetchKnowledge = async () => {
      try {
        const res = await fetch(`${API}/api/explore/knowledge?name=${nameEnc}&state=${stateEnc}&lat=${latEnc}&lon=${lonEnc}`);
        const resultData = await res.json();
        if (res.ok && resultData.success) {
          setKnowledge(resultData.data);
          
          if (user && user.token) {
            fetch(`${API}/api/explore/history`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}` 
              },
              body: JSON.stringify({
                placeName: place.name,
                state: place.state,
                country: place.country || 'India',
                lat: place.latitude,
                lon: place.longitude
              })
            })
            .then(r => r.json())
            .then(data => {
               if (data.success) {
                  setExploredPlaces(prev => {
                     const existing = prev.find(p => p.placeKey === data.data.placeKey);
                     if (existing) return prev;
                     return [data.data, ...prev];
                  });
               }
            })
            .catch(err => console.error("Error saving history:", err));
          }
        } else {
          setKnowledgeError(true);
        }
      } catch (err) {
        setKnowledgeError(true);
      } finally {
        setKnowledgeLoading(false);
      }
    };

    const fetchEnvironment = async () => {
      try {
        const res = await fetch(`${API}/api/explore/environment?lat=${latEnc}&lon=${lonEnc}`);
        const resultData = await res.json();
        if (res.ok && resultData.success) {
          setEnvironment(resultData.data);
        }
      } catch (err) {
        console.error("Environment fetch error:", err);
      }
    };

    fetchKnowledge();
    fetchEnvironment();
  };

  const handleExampleClick = (place) => {
    setSearchQuery(place);
  };

  const examples = ["Hampi", "Mysuru", "Varanasi", "Jaipur", "Darjeeling", "Munnar", "Goa", "Leh"];

  return (
    <>
      <Head>
        <title>Explore India | Kalāsetu</title>
        <meta name="description" content="Discover the history, culture, food, geography and places of India." />
      </Head>
      <Navbar />
      
      <main className="container page" style={{ paddingTop: '160px', paddingBottom: '40px' }}>
        
        {/* Header Section */}
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '40px', marginBottom: '40px', textAlign: 'center' }}>
          <p className="editorial-caption" style={{ marginBottom: '16px' }}>The India Journal</p>
          <h1 className="editorial-title">Explore India</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Discover the history, culture, food, geography and places of India.
          </p>
        </div>

        {/* Search Section */}
        <div style={{ marginBottom: '40px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--text-primary)', width: '100%', maxWidth: '600px', paddingBottom: '8px' }}>
              <input 
                type="text" 
                placeholder="Search a place in India..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.2rem', fontFamily: 'var(--font-display)', outline: 'none' }}
              />
              <button type="submit" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }} disabled={loading}>
                {loading ? 'Searching...' : 'Search →'}
              </button>
            </div>
          </form>

          {ambiguousResults.length > 0 && (
            <div style={{ maxWidth: '600px', margin: '0 auto 24px', border: '1px solid var(--border-color)', padding: '24px' }}>
              <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Multiple locations found:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ambiguousResults.map((place, idx) => (
                  <button
                    key={`${place.id}-${idx}`}
                    onClick={() => selectLocation(place)}
                    style={{
                      padding: '8px 0',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)'
                    }}
                  >
                    <strong>{place.name}</strong> <span style={{ color: 'var(--text-muted)' }}>— {place.state}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
             <span className="editorial-caption" style={{ alignSelf: 'center' }}>Examples:</span>
             {examples.map(ex => (
               <button 
                  key={ex} 
                  onClick={() => handleExampleClick(ex)}
                  style={{ 
                    background: 'transparent', border: '1px solid var(--border-color)', 
                    color: 'var(--text-muted)', padding: '4px 12px', 
                    fontSize: '0.85rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}
               >
                 {ex}
               </button>
             ))}
          </div>
        </div>

        {/* Content Section (Map + Info Panel) */}
        <div className="editorial-grid">
          {/* LEFT: MAP */}
          <div style={{ gridColumn: 'span 7', border: '1px solid var(--border-color)', minHeight: '600px', position: 'relative' }}>
            <DynamicMap 
              center={mapState.center} 
              zoom={mapState.zoom} 
              marker={mapState.marker} 
              exploredPlaces={exploredPlaces}
              onMarkerClick={(place) => selectLocation({
                name: place.placeName,
                state: place.state,
                country: place.country,
                latitude: place.latitude,
                longitude: place.longitude
              })}
            />
          </div>

          {/* RIGHT: INFO PANEL */}
          <div style={{ gridColumn: 'span 5', border: '1px solid var(--border-color)', padding: '32px', display: 'flex', flexDirection: 'column', height: '600px', overflowY: 'auto' }}>
            {selectedPlace ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px' }}>
                  <p className="editorial-caption" style={{ marginBottom: '8px' }}>{selectedPlace.fullName.split('—')[1]?.trim()}</p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', margin: '0 0 16px 0', lineHeight: '1' }}>{selectedPlace.name.toUpperCase()}</h2>
                  <p className="editorial-caption" style={{ margin: 0 }}>
                    {selectedPlace.lat}° N · {selectedPlace.lon}° E
                  </p>
                </div>
                
                {knowledge && !knowledgeLoading && !knowledgeError && (
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '32px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    {knowledge.introduction}
                  </p>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '32px' }}>
                  <div>
                    <h4 className="editorial-caption" style={{ marginBottom: '12px' }}>Geography</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>State:</span> {selectedPlace.fullName.split('—')[1]?.trim() || 'Unknown'}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Country:</span> India</div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Altitude:</span>{' '}
                        {environment?.elevation != null ? `${environment.elevation}m` : (environment?.errors?.elevation ? 'N/A' : 'Loading...')}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="editorial-caption" style={{ marginBottom: '12px' }}>Weather</h4>
                    {environment?.weather ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Temp:</span> {environment.weather.temperature}°C</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Condition:</span> {environment.weather.description}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Humidity:</span> {environment.weather.humidity}%</div>
                      </div>
                    ) : environment?.errors?.weather ? (
                      <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>Unavailable.</div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</div>
                    )}
                  </div>
                </div>

                <div>
                  {knowledgeLoading ? (
                    <div className="text-center" style={{ padding: '40px 0' }}>
                      <span className="spinner" style={{ marginBottom: '16px' }} />
                      <p className="editorial-caption">Consulting the archive...</p>
                    </div>
                  ) : knowledgeError ? (
                    <div style={{ padding: '20px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <p style={{ color: 'var(--danger)' }}>Detailed information is temporarily unavailable.</p>
                    </div>
                  ) : knowledge ? (
                    <div>
                      {/* Tab Navigation */}
                      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
                        {['history', 'culture', 'food', 'places', 'travel'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                              cursor: 'pointer',
                              fontFamily: 'var(--font-body)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontSize: '0.85rem',
                              fontWeight: activeTab === tab ? '600' : '400',
                              borderBottom: activeTab === tab ? '1px solid var(--text-primary)' : '1px solid transparent',
                              padding: '0 0 4px 0'
                            }}
                          >
                            {tab === 'places' ? 'Visit' : tab}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      <div>
                        {activeTab === 'history' && (
                          <div>
                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>Historical Significance</h4>
                            <p style={{ lineHeight: 1.7 }}>{knowledge.history}</p>
                          </div>
                        )}
                        
                        {activeTab === 'culture' && (
                          <div>
                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>Cultural Heritage</h4>
                            <p style={{ lineHeight: 1.7, marginBottom: '24px' }}>{knowledge.culture}</p>
                            
                            {knowledge.localTraditions && knowledge.localTraditions.length > 0 && (
                              <>
                                <h5 className="editorial-caption" style={{ marginBottom: '12px' }}>Local Traditions</h5>
                                <ul style={{ paddingLeft: '20px', lineHeight: 1.6 }}>
                                  {knowledge.localTraditions.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                              </>
                            )}
                          </div>
                        )}

                        {activeTab === 'food' && (
                          <div>
                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>Culinary Delights</h4>
                            {knowledge.famousFoods && knowledge.famousFoods.length > 0 ? (
                              <ul style={{ paddingLeft: '20px', lineHeight: 1.8 }}>
                                {knowledge.famousFoods.map((f, i) => <li key={i}>{f}</li>)}
                              </ul>
                            ) : <p style={{ color: 'var(--text-muted)' }}>No specific food information available.</p>}
                          </div>
                        )}

                        {activeTab === 'places' && (
                          <div>
                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '24px' }}>Must-Visit Attractions</h4>
                            {knowledge.placesToVisit && knowledge.placesToVisit.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {knowledge.placesToVisit.map((p, i) => (
                                  <div key={i}>
                                    <strong style={{ display: 'block', marginBottom: '8px', fontSize: '1.1rem' }}>{p.name}</strong>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{p.description}</p>
                                  </div>
                                ))}
                              </div>
                            ) : <p style={{ color: 'var(--text-muted)' }}>No specific attractions listed.</p>}
                          </div>
                        )}

                        {activeTab === 'travel' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div>
                              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>How to Reach</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                                {knowledge.howToReach?.air && <div><span className="editorial-caption">Air:</span> {knowledge.howToReach.air}</div>}
                                {knowledge.howToReach?.rail && <div><span className="editorial-caption">Train:</span> {knowledge.howToReach.rail}</div>}
                                {knowledge.howToReach?.road && <div><span className="editorial-caption">Road:</span> {knowledge.howToReach.road}</div>}
                              </div>
                            </div>

                            <div>
                              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>Best Time to Visit</h4>
                              <p style={{ lineHeight: 1.6 }}>{knowledge.bestTimeToVisit}</p>
                            </div>

                            {knowledge.travelTips && knowledge.travelTips.length > 0 && (
                              <div>
                                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>Travel Tips</h4>
                                <ul style={{ paddingLeft: '20px', lineHeight: 1.6 }}>
                                  {knowledge.travelTips.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '40px 0', textAlign: 'center', margin: 'auto' }}>
                      <p className="editorial-caption">Select a location on the map.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--border-color)', marginBottom: '16px' }}>⌘</div>
                <h3 style={{ marginBottom: '8px', fontFamily: 'var(--font-display)' }}>No Place Selected</h3>
                <p style={{ color: 'var(--text-muted)' }}>Search or select a marker to explore.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
