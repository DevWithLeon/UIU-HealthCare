import React, { useState, useEffect, useRef } from 'react';
import { Building, MapPin, Search, ArrowLeft, Star, Phone, ArrowRight, Loader2, Navigation } from 'lucide-react';

const ALL_HOSPITALS = [
  { name: 'Dhaka Medical College Hospital', type: 'Public Hospital', rating: 4.5, beds: 2600, address: 'Secretariat Road, Dhaka', phone: '16263', lat: 23.7255, lon: 90.3976 },
  { name: 'Square Hospital', type: 'Private Hospital', rating: 4.8, beds: 400, address: 'Panthapath, Dhaka', phone: '10616', lat: 23.7531, lon: 90.3814 },
  { name: 'Apollo Hospitals', type: 'Private Hospital', rating: 4.7, beds: 450, address: 'Bashundhara R/A, Dhaka', phone: '10678', lat: 23.8105, lon: 90.4312 },
  { name: 'BSMMU', type: 'Public University Hospital', rating: 4.6, beds: 1900, address: 'Shahbag, Dhaka', phone: '02-55165760', lat: 23.7391, lon: 90.3957 },
  { name: 'Labaid Specialized Hospital', type: 'Private Hospital', rating: 4.6, beds: 250, address: 'Dhanmondi, Dhaka', phone: '10606', lat: 23.7417, lon: 90.3833 },
  { name: 'United Hospital', type: 'Private Hospital', rating: 4.8, beds: 500, address: 'Gulshan 2, Dhaka', phone: '10666', lat: 23.8052, lon: 90.4158 },
  { name: 'Ibn Sina Hospital', type: 'Private Hospital', rating: 4.5, beds: 300, address: 'Dhanmondi 2, Dhaka', phone: '09666773344', lat: 23.7461, lon: 90.3728 },
  { name: 'Popular Medical Centre', type: 'Private Hospital', rating: 4.4, beds: 200, address: 'Shyamoli, Dhaka', phone: '01755599000', lat: 23.7716, lon: 90.3579 },
  { name: 'Anwer Khan Modern Hospital', type: 'Private Hospital', rating: 4.3, beds: 250, address: 'Dhanmondi, Dhaka', phone: '10610', lat: 23.7393, lon: 90.3803 },
];

const STREET_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const SATELLITE_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// Build a standalone HTML page that uses Leaflet (no WebGL) to render map markers
function buildLeafletHTML(hospitals, userLat, userLon, focusLat, focusLon, zoom, satellite = false) {
  const tileUrl = satellite ? SATELLITE_TILES : STREET_TILES;
  const attribution = satellite ? 'Tiles © Esri' : '© OpenStreetMap contributors';
  const markers = hospitals.map(h =>
    `L.marker([${h.lat}, ${h.lon}], {icon: hospitalIcon}).addTo(map)
      .bindPopup('<b>${h.name.replace(/'/g, "\\'")}</b><br/>${h.address}<br/>📞 ${h.phone}');`
  ).join('\n');

  const userMarker = userLat ? `L.marker([${userLat}, ${userLon}], {icon: userIcon}).addTo(map).bindPopup('<b>📍 You are here</b>');` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html,body,#map{margin:0;padding:0;height:100%;width:100%;}
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([${focusLat}, ${focusLon}], ${zoom});
  L.tileLayer('${tileUrl}', {
    attribution: '${attribution}',
    maxZoom: 19
  }).addTo(map);

  var hospitalIcon = L.divIcon({
    html: '<div style="background:#EF4444;color:white;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏥</div>',
    className: '',
    iconAnchor: [16, 16]
  });

  var userIcon = L.divIcon({
    html: '<div style="background:#2563EB;color:white;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
    className: '',
    iconAnchor: [8, 8]
  });

  ${markers}
  ${userMarker}
</script>
</body>
</html>`;
}

export default function HospitalsPage({ navigate }) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);
  const [focusLat, setFocusLat] = useState(23.7719);
  const [focusLon, setFocusLon] = useState(90.3868);
  const [zoom, setZoom] = useState(12);
  const [hospitals, setHospitals] = useState(ALL_HOSPITALS);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [satellite, setSatellite] = useState(false);
  const iframeRef = useRef(null);

  // Recalculate distance from user to each hospital
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
              Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
              Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const updateMap = (hList, uLat, uLon, fLat, fLon, z, sat = false) => {
    if (iframeRef.current) {
      const html = buildLeafletHTML(hList, uLat, uLon, fLat, fLon, z, sat);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
    }
  };

  useEffect(() => {
    updateMap(hospitals, userLat, userLon, focusLat, focusLon, zoom);
  // eslint-disable-next-line
  }, []);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLat(lat);
        setUserLon(lon);

        // Sort hospitals by distance from user
        const sorted = [...ALL_HOSPITALS].map(h => ({
          ...h,
          distance: getDistance(lat, lon, h.lat, h.lon).toFixed(1)
        })).sort((a, b) => a.distance - b.distance);

        setHospitals(sorted);
        setFocusLat(lat);
        setFocusLon(lon);
        setZoom(13);
        setNearbyMode(true);
        setLoading(false);
        updateMap(sorted, lat, lon, lat, lon, 13);
        window.scrollTo({ top: 200, behavior: 'smooth' });
      },
      () => {
        alert('Could not get your location. Please allow location access in your browser.');
        setLoading(false);
      }
    );
  };

  const handleShowOnMap = (h) => {
    setFocusLat(h.lat);
    setFocusLon(h.lon);
    setZoom(16);
    updateMap(hospitals, userLat, userLon, h.lat, h.lon, 16);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: '#022C22', minHeight: '100vh', paddingBottom: 60, color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }
        .input-glass {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
        }
        .input-glass::placeholder {
          color: rgba(255,255,255,0.5);
        }
      `}</style>
      
      {/* Header */}
      <div style={{ background: 'radial-gradient(circle at 50% -20%, #059669 0%, #064E3B 40%, #022C22 100%)', padding: '40px 32px 60px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
            <button onClick={() => navigate('home')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', padding: '10px', cursor: 'pointer' }}>
              <ArrowLeft size={24}/>
            </button>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>Partner Hospitals</h1>
              {nearbyMode && <p style={{ color: '#BEF264', fontSize: '0.9rem', marginTop: 4, fontWeight: 600, margin: 0 }}>📍 Showing hospitals sorted by distance</p>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
              <Search size={20} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} />
              <input
                type="text"
                placeholder="Search hospitals by name or area..."
                className="input-glass"
                style={{ paddingLeft: 52, height: 60, fontSize: '1rem', width: '100%', borderRadius: 30, outline: 'none' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={handleNearMe}
              disabled={loading}
              style={{ background: '#BEF264', color: '#064E3B', height: 60, borderRadius: 30, padding: '0 32px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, minWidth: 160, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {loading ? <Loader2 size={20} className="animate-spin"/> : <Navigation size={20}/>}
              {loading ? 'Locating...' : 'Near Me'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1280, margin: '-20px auto 0', padding: '0 32px' }}>

        {/* Live Leaflet Map */}
        <div style={{ borderRadius: 24, overflow: 'hidden', height: 420, marginBottom: 40, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative' }}>
          <iframe
            ref={iframeRef}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Hospital Map"
            sandbox="allow-scripts allow-same-origin"
          />
          <div className="glass-card" style={{ position: 'absolute', top: 16, left: 16, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 12, background: '#EF4444', borderRadius: '50%', display: 'inline-block' }}></span> Hospital
            {userLat && <><span style={{ width: 12, height: 12, background: '#3B82F6', borderRadius: '50%', display: 'inline-block', marginLeft: 12, border: '2px solid white' }}></span> You</>}
          </div>
          {/* Satellite Toggle */}
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex' }}>
            <button
              style={{ background: satellite ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)', color: satellite ? 'white' : '#0F172A', border: 'none', borderRadius: '8px 0 0 8px', padding: '8px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', backdropFilter: 'blur(8px)' }}
              onClick={() => { setSatellite(false); updateMap(hospitals, userLat, userLon, focusLat, focusLon, zoom, false); }}
            >🗺 Map</button>
            <button
              style={{ background: satellite ? '#BEF264' : 'rgba(0,0,0,0.6)', color: satellite ? '#064E3B' : 'white', border: 'none', borderRadius: '0 8px 8px 0', padding: '8px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', backdropFilter: 'blur(8px)' }}
              onClick={() => { setSatellite(true); updateMap(hospitals, userLat, userLon, focusLat, focusLon, zoom, true); }}
            >🛰 Satellite</button>
          </div>
        </div>

        {/* Hospital Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24 }}>
          {filtered.map((h, idx) => (
            <div key={idx} className="glass-card" style={{ padding: 24, transition: 'transform 0.3s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ background: 'rgba(190,242,100,0.15)', color: '#BEF264', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building size={22}/>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', lineHeight: 1.2, margin: '0 0 8px 0' }}>{h.name}</h3>
                    <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{h.type}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(252,211,77,0.1)', color: '#FCD34D', padding: '6px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 800 }}>
                    <Star size={14} fill="#FCD34D"/> {h.rating}
                  </div>
                  {h.distance && (
                    <div style={{ fontSize: '0.75rem', color: '#BEF264', marginTop: 8, fontWeight: 700 }}>
                      📍 {h.distance} km away
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  <MapPin size={16} style={{ color: '#BEF264', flexShrink: 0 }}/> {h.address}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  <Phone size={16} style={{ color: '#BEF264', flexShrink: 0 }}/> {h.phone}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>{h.beds}</span> Beds
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '10px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => handleShowOnMap(h)}
                  >
                    <MapPin size={14}/> Show Map
                  </button>
                  <button style={{ background: '#BEF264', border: 'none', color: '#064E3B', padding: '10px 20px', borderRadius: 12, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, cursor: 'pointer' }}>
                    Details <ArrowRight size={14}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
