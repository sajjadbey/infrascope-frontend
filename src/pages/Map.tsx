import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getMapData } from '../api';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MapNode {
  name: string;
  name_fa?: string;
  asn_number: number;
  asn_name: string;
  asn_name_fa?: string;
  node_types: Array<{ id: number; name: string; name_fa?: string; color: string }>;
}

interface Feature {
  geometry: { coordinates: [number, number] };
  properties: { name: string; name_fa?: string; nodes: MapNode[] };
}

const MapPage: React.FC = () => {
  const { i18n } = useTranslation();
  const [geoData, setGeoData] = useState<{ features: Feature[] } | null>(null);

  useEffect(() => {
    getMapData().then(res => setGeoData(res.data)).catch(console.error);
  }, []);

  const datacenterIcon = L.divIcon({
    className: 'datacenter-icon',
    html: `
        <div class="relative w-10 h-10 group marker-pulse">
            <div class="absolute inset-0 bg-sky-500 rounded-full rounded-bl-none -rotate-45 border-2 border-white shadow-xl shadow-sky-500/40 group-hover:scale-110 group-hover:bg-sky-600 transition-all duration-300"></div>
            <div class="absolute inset-0 flex items-center justify-center rotate-90">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 relative z-10 rotate-90">
                    <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
                    <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
                    <line x1="6" x2="6.01" y1="6" y2="6"/>
                    <line x1="6" x2="6.01" y1="18" y2="18"/>
                </svg>
            </div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  return (
    <div className="relative h-[calc(100vh-140px)] -m-4 md:-m-6 flex flex-col overflow-hidden bg-slate-50 border border-slate-200 shadow-inner rounded-3xl">
      {/* Map Header Overlay */}

      <MapContainer 
        center={[32.4278, 53.688]} 
        zoom={6} 
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {geoData && geoData.features.map((feature, idx: number) => (
          <Marker 
            key={idx} 
            position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
            icon={datacenterIcon}
          >
            <Popup className="custom-leaflet-popup">
              <div className="w-[300px] p-4 space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <MapPin size={16} className="text-sky-500" /> 
                         {i18n.language === 'fa' ? (feature.properties.name_fa || feature.properties.name) : feature.properties.name}
                    </h3>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
                  {feature.properties.nodes.map((node, nIdx: number) => (
                    <div key={nIdx} className="group p-3 bg-slate-50 rounded-2xl hover:bg-sky-50 transition-colors border border-transparent hover:border-sky-100">
                      <div className="text-sm font-black text-slate-800 mb-2">
                        {i18n.language === 'fa' ? (node.name_fa || node.name) : node.name}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {node.node_types?.map((nt) => (
                          <span key={nt.id} className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded text-white shadow-sm" style={{ background: nt.color }}>
                            {i18n.language === 'fa' ? (nt.name_fa || nt.name) : nt.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">ASN Network</span>
                        <div className="text-[11px] font-bold text-slate-600">AS{node.asn_number} <span className="font-medium text-slate-400">— {i18n.language === 'fa' ? (node.asn_name_fa || node.asn_name) : node.asn_name}</span></div>
                      </div>
                      <Link 
                        to={`/asn/${node.asn_number}`} 
                        className="mt-3 flex items-center gap-1.5 text-sky-500 text-[11px] font-bold hover:gap-2 transition-all no-underline"
                      >
                        ASN Intelligence <ExternalLink size={12} className={i18n.language === 'fa' ? 'rotate-180' : ''} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Custom Styles for Leaflet */}
      <style>{`
        .marker-pulse::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50% 50% 50% 0;
            background: #0ea5e9;
            opacity: 0.4;
            transform: rotate(-45deg);
            animation: pulse-pin 2s infinite;
            z-index: -1;
        }
        @keyframes pulse-pin {
            0% { transform: rotate(-45deg) scale(1); opacity: 0.4; }
            100% { transform: rotate(-45deg) scale(2.4); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
            border-radius: 2rem !important;
            padding: 0 !important;
            overflow: hidden !important;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
        }
        .leaflet-popup-content {
            margin: 0 !important;
        }
        .leaflet-popup-close-button {
            top: 24px !important;
            right: 24px !important;
            color: #94a3b8 !important;
            font-size: 20px !important;
            transition: color 0.2s !important;
        }
        .leaflet-popup-close-button:hover {
            color: #475569 !important;
        }
        .leaflet-popup-tip-container {
            display: none;
        }
      `}</style>
    </div>
  );
};

export default MapPage;
