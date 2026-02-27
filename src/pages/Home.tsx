import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../api';
import { Network, Share2, Database, Globe, MapPin, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const [stats, setStats] = useState<{
    total_asns: number;
    total_prefixes_v4: number;
    total_locations: number;
  } | null>(null);

  useEffect(() => {
    getStats().then(res => setStats(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-12 -mt-8 -mx-4 md:-mx-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0f172a] text-white py-20 px-6 md:py-28 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(14,165,233,0.1),transparent_50%),radial-gradient(circle_at_70%_30%,rgba(56,189,248,0.05),transparent_40%)]" />
        
        <div className="relative max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-semibold mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            Real-time Network Analysis
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Iran's Infrastructure <br />
            <span className="text-sky-500">Under the Microscope</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A comprehensive mapping of Iran's autonomous systems, BGP relationships, 
            and geographical node distributions.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link 
              to="/topology" 
              className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-1 flex items-center gap-2 group"
            >
              Explore Topology <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/lookup" 
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold transition-all hover:-translate-y-1"
            >
              IP / Domain Lookup
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 space-y-16 pb-12">
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-sky-50 rounded-xl w-fit mb-4">
                <Share2 className="text-sky-500" size={24} />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-1">{stats.total_asns}</div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Autonomous Systems</div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-50 rounded-xl w-fit mb-4">
                <Database className="text-emerald-500" size={24} />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-1">{stats.total_prefixes_v4}</div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-xs">IPv4 Prefixes Managed</div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-indigo-50 rounded-xl w-fit mb-4">
                <MapPin className="text-indigo-500" size={24} />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-1">{stats.total_locations}</div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-xs">PoP Locations Mapping</div>
            </div>
          </div>
        )}

        {/* Feature Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Infrastructure Tools</h2>
            <p className="text-slate-500">Everything you need to analyze the Iranian internet landscape</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/topology" className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-sky-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 text-center">
              <div className="mb-6 text-4xl group-hover:scale-110 transition-transform inline-block">🗺️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Network Topology</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Interactive BGP relationship mapping showing upstreams, downstreams, and deep transit interconnections.
              </p>
            </Link>

            <Link to="/lookup" className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 text-center">
              <div className="mb-6 text-4xl group-hover:scale-110 transition-transform inline-block">🔍</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">IP / Domain Lookup</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Find exactly where any IP or domain sits within the infrastructure hierarchy, including provider and ASN.
              </p>
            </Link>

            <Link to="/map" className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-indigo-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 text-center">
              <div className="mb-6 text-4xl group-hover:scale-110 transition-transform inline-block">🌍</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Geographical Map</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Visual exploration of network nodes across the Iranian plateau, highlighting physical PoP density.
              </p>
            </Link>
          </div>
        </section>

        {/* About Card */}
        <section className="bg-[#0f172a] rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden text-white shadow-2xl">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-sky-500/10 to-transparent pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center gap-12">
            <div className="shrink-0 select-none">
              <img 
                src="https://cdn.jsdelivr.net/gh/twitter/twemoji@2.4/2/72x72/1f1ee-1f1f7.png" 
                alt="Iran Flag" 
                className="w-20 h-20 md:w-32 md:h-32 object-contain"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Deep Infrastructure Insights</h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
                InfraScope provides a technical, data-driven window into <strong>Iran's sovereign internet architecture</strong>. 
                We map the intricate web of peering relationships, prefix allocations, and upstream paths that 
                form the backbone of connection for millions. From massive state-owned ISPs to private hosting 
                farms, discover how Iran connects to itself and the world.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm text-sky-400 font-medium bg-sky-400/10 px-4 py-2 rounded-full border border-sky-400/20">
                  <Network size={16} /> AS-Level mapping
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20">
                  <Globe size={16} /> Global Connectivity
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
