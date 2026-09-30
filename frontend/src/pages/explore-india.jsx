import { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { AuthContext } from '@/context/AuthContext';

import { API } from '@/lib/api';

// Dynamic import for Leaflet map to avoid Next.js SSR window errors
const DynamicMap = dynamic(() => import('@/components/Map/DynamicMap'), {
  ssr: false,
  loading: () => <div className="map-loading">Loading interactive map...</div>
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
  const [ambiguousResults, setAmbiguousResults] = useState([]);
  
  // Knowledge states
  const [knowledge, setKnowledge] = useState(null);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState(false);
  
  // Environment state
  const [environment, setEnvironment] = useState(null);

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
    
    // Fetch Knowledge from Gemini
    setKnowledge(null);
    setKnowledgeError(false);
    setKnowledgeLoading(true);
    
    // Environment States
    setEnvironment(null);
    
    // Run both Knowledge and Environment fetches in parallel
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
          
          // Mark as explored if logged in
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
                     // Check if already in state, if so don't duplicate
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
        // Silently fail, UI handles null environment safely
      }
    };

    fetchKnowledge();
    fetchEnvironment();
  };

  const handleExampleClick = (place) => {
    setSearchQuery(place);
    // Optionally auto-submit if desired, but user can just click Explore
  };

  const examples = ["Hampi", "Mysuru", "Varanasi", "Jaipur", "Darjeeling", "Munnar", "Goa", "Leh"];

  return (
    <>
      <Head>
        <title>Explore India | Kalāsetu</title>
        <meta name="description" content="Discover the history, culture, food, geography and places of India." />
      </Head>
      <Navbar />
      
      <main className="container page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', padding: '20px' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-color)', marginBottom: '8px' }}>EXPLORE INDIA</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Discover the history, culture, food, geography and places of India.
          </p>
        </div>

        {/* Search Section */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ maxWidth: '500px', width: '100%', border: '1px solid var(--border-color)', borderRadius: '24px', background: 'var(--card-bg)' }}>
             <span className="search-icon" style={{ paddingLeft: '16px' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--text-secondary)">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 14z" />
                </svg>
              </span>
            <input 
              type="text" 
              placeholder="Search a place in India..." 
              aria-label="Search a place in India"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', color: 'var(--text-color)', outline: 'none' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ borderRadius: '24px', padding: '0 24px' }}>
            {loading ? 'Searching...' : 'Explore'}
          </button>
        </form>

        {ambiguousResults.length > 0 && (
          <div style={{ maxWidth: '600px', margin: '0 auto 20px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--text-color)' }}>Multiple locations found. Please select one:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ambiguousResults.map((place, idx) => (
                <button
                  key={`${place.id}-${idx}`}
                  onClick={() => selectLocation(place)}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <strong>{place.name}</strong> <span style={{ color: 'var(--text-secondary)' }}>— {place.state}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
           <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', alignSelf: 'center' }}>Examples:</span>
           {examples.map(ex => (
             <button 
                key={ex} 
                onClick={() => handleExampleClick(ex)}
                style={{ 
                  background: 'var(--hover-bg)', border: '1px solid var(--border-color)', 
                  color: 'var(--text-color)', padding: '4px 12px', borderRadius: '16px', 
                  fontSize: '0.85rem', cursor: 'pointer'
                }}
             >
               {ex}
             </button>
           ))}
        </div>

        {/* Content Section (Map + Info Panel) */}
        <div style={{ 
          display: 'flex', 
          flex: 1, 
          gap: '24px', 
          flexDirection: 'row',
          minHeight: '400px'
        }}>
          {/* LEFT: MAP */}
          <div style={{ 
            flex: '2 1 0', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg)'
          }}>
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
          <div style={{ 
            flex: '1 1 0', 
            minWidth: '300px',
            background: 'var(--card-bg)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {selectedPlace ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'fadeIn 0.5s ease' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '2rem', marginBottom: '4px', color: 'var(--text-color)' }}>{selectedPlace.name.toUpperCase()}</h2>
                  <p style={{ color: 'var(--primary-color)', fontSize: '1rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {selectedPlace.fullName.split('—')[1]?.trim()}
                  </p>
                </div>
                
                {/* Introduction (always visible) */}
                {knowledge && !knowledgeLoading && !knowledgeError && (
                  <p style={{ color: 'var(--text-color)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px', fontStyle: 'italic', borderLeft: '4px solid var(--primary-color)', paddingLeft: '16px' }}>
                    {knowledge.introduction}
                  </p>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', fontSize: '0.9rem' }}>
                  <div style={{ background: 'var(--hover-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: 'var(--primary-color)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px' }}>Geography</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-color)' }}>
                      <div><span style={{ color: 'var(--text-secondary)' }}>State:</span> {selectedPlace.fullName.split('—')[1]?.trim() || 'Unknown'}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Country:</span> India</div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Altitude:</span>{' '}
                        {environment?.elevation != null ? `${environment.elevation} m above sea level` : (environment?.errors?.elevation ? 'Elevation unavailable' : 'Loading...')}
                      </div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Coordinates:</span> {selectedPlace.lat}° N, {selectedPlace.lon}° E</div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--hover-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: 'var(--primary-color)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px' }}>Weather</h4>
                    {environment?.weather ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-color)' }}>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Temperature:</span> {environment.weather.temperature}°C</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Feels like:</span> {environment.weather.feelsLike}°C</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Humidity:</span> {environment.weather.humidity}%</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Wind:</span> {environment.weather.windSpeed} km/h</div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Condition:</span> {environment.weather.description}</div>
                      </div>
                    ) : environment?.errors?.weather ? (
                      <div style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>Weather information unavailable.</div>
                    ) : (
                      <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
                    )}
                  </div>
                </div>


                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column' }} className="custom-scrollbar">
                  {knowledgeLoading ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <span className="spinner" style={{ display: 'inline-block', marginBottom: '16px' }} />
                      <p>Consulting Gemini AI for cultural insights...</p>
                    </div>
                  ) : knowledgeError ? (
                    <div style={{ padding: '20px', background: 'var(--hover-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
                      <p style={{ color: '#ff6b6b' }}>
                        Detailed information is temporarily unavailable.
                      </p>
                    </div>
                  ) : knowledge ? (
                    <div className="knowledge-tabs-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, animation: 'slideUp 0.4s ease' }}>
                      
                      {/* Tab Navigation */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }} className="custom-scrollbar">
                        {['history', 'culture', 'food', 'places', 'travel'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '20px',
                              border: 'none',
                              background: activeTab === tab ? 'var(--primary-color)' : 'var(--hover-bg)',
                              color: activeTab === tab ? '#fff' : 'var(--text-color)',
                              cursor: 'pointer',
                              fontWeight: activeTab === tab ? 'bold' : 'normal',
                              textTransform: 'capitalize',
                              transition: 'all 0.2s ease',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {tab === 'places' ? 'Places to Visit' : tab}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      <div style={{ flex: 1, padding: '16px', background: 'var(--hover-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        {activeTab === 'history' && (
                          <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h4 style={{ color: 'var(--primary-color)', fontSize: '1rem', marginBottom: '12px' }}>Historical Significance</h4>
                            <p style={{ color: 'var(--text-color)', lineHeight: 1.7 }}>{knowledge.history}</p>
                          </div>
                        )}
                        
                        {activeTab === 'culture' && (
                          <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h4 style={{ color: 'var(--primary-color)', fontSize: '1rem', marginBottom: '12px' }}>Cultural Heritage</h4>
                            <p style={{ color: 'var(--text-color)', lineHeight: 1.7, marginBottom: '16px' }}>{knowledge.culture}</p>
                            
                            {knowledge.localTraditions && knowledge.localTraditions.length > 0 && (
                              <>
                                <h5 style={{ color: 'var(--text-secondary)', marginTop: '16px', marginBottom: '8px' }}>Local Traditions:</h5>
                                <ul style={{ paddingLeft: '20px', color: 'var(--text-color)', lineHeight: 1.6 }}>
                                  {knowledge.localTraditions.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                              </>
                            )}
                          </div>
                        )}

                        {activeTab === 'food' && (
                          <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h4 style={{ color: 'var(--primary-color)', fontSize: '1rem', marginBottom: '12px' }}>Culinary Delights</h4>
                            {knowledge.famousFoods && knowledge.famousFoods.length > 0 ? (
                              <ul style={{ paddingLeft: '20px', color: 'var(--text-color)', lineHeight: 1.8 }}>
                                {knowledge.famousFoods.map((f, i) => <li key={i}>{f}</li>)}
                              </ul>
                            ) : <p style={{ color: 'var(--text-secondary)' }}>No specific food information available.</p>}
                          </div>
                        )}

                        {activeTab === 'places' && (
                          <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h4 style={{ color: 'var(--primary-color)', fontSize: '1rem', marginBottom: '16px' }}>Must-Visit Attractions</h4>
                            {knowledge.placesToVisit && knowledge.placesToVisit.length > 0 ? (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                {knowledge.placesToVisit.map((p, i) => (
                                  <div key={i} style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <strong style={{ color: 'var(--primary-color)', display: 'block', marginBottom: '4px' }}>{p.name}</strong>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-color)', lineHeight: 1.5 }}>{p.description}</p>
                                  </div>
                                ))}
                              </div>
                            ) : <p style={{ color: 'var(--text-secondary)' }}>No specific attractions listed.</p>}
                          </div>
                        )}

                        {activeTab === 'travel' && (
                          <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            <div>
                              <h4 style={{ color: 'var(--primary-color)', fontSize: '1rem', marginBottom: '12px' }}>How to Reach</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-color)', fontSize: '0.95rem' }}>
                                {knowledge.howToReach?.air && <div style={{ display: 'flex', gap: '8px' }}><span>✈️</span> <span><strong>Air:</strong> {knowledge.howToReach.air}</span></div>}
                                {knowledge.howToReach?.rail && <div style={{ display: 'flex', gap: '8px' }}><span>🚆</span> <span><strong>Train:</strong> {knowledge.howToReach.rail}</span></div>}
                                {knowledge.howToReach?.road && <div style={{ display: 'flex', gap: '8px' }}><span>🚗</span> <span><strong>Road:</strong> {knowledge.howToReach.road}</span></div>}
                              </div>
                            </div>
                            
                            <hr style={{ borderColor: 'var(--border-color)', opacity: 0.3 }} />

                            <div>
                              <h4 style={{ color: 'var(--primary-color)', fontSize: '1rem', marginBottom: '8px' }}>Best Time to Visit</h4>
                              <p style={{ color: 'var(--text-color)', lineHeight: 1.6 }}>{knowledge.bestTimeToVisit}</p>
                            </div>

                            {knowledge.travelTips && knowledge.travelTips.length > 0 && (
                              <>
                                <hr style={{ borderColor: 'var(--border-color)', opacity: 0.3 }} />
                                <div>
                                  <h4 style={{ color: 'var(--primary-color)', fontSize: '1rem', marginBottom: '8px' }}>Travel Tips</h4>
                                  <ul style={{ paddingLeft: '20px', color: 'var(--text-color)', lineHeight: 1.6 }}>
                                    {knowledge.travelTips.map((t, i) => <li key={i}>{t}</li>)}
                                  </ul>
                                </div>
                              </>
                            )}

                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '20px', background: 'var(--hover-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Select a location to explore its heritage.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--border-color)" style={{ marginBottom: '16px' }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No place selected</h3>
                <p style={{ color: 'var(--border-color)' }}>Search for a location to begin exploring India's heritage.</p>
              </div>
            )}
          </div>
        </div>

      </main>
      
      {/* Basic Mobile Responsive Styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .page > div:last-child {
            flex-direction: column !important;
          }
          .page > div:last-child > div:first-child {
            min-height: 400px;
          }
        }
        .map-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
          background: var(--hover-bg);
          color: var(--text-secondary);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--border-color);
          border-radius: 10px;
        }
      `}</style>
    </>
  );
}
