import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getASNDetail } from '../api';
import { ArrowLeft, Activity, Calendar, User, ShieldCheck, Share2, Loader2, List, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Upstream {
  id: number;
  asn_number: number;
  name: string;
  name_fa?: string;
}

interface Prefix {
  id: number;
  cidr: string;
  ip_version: number;
  description: string;
}

interface ASN {
  asn_number: number;
  name: string;
  name_fa?: string;
  description: string;
  description_fa?: string;
  network_type: { name: string; name_fa?: string };
  network_status: { name: string; name_fa?: string };
  registered_to: string;
  registrar: string;
  registered_on: string;
  upstreams: Upstream[];
  downstreams: Upstream[];
  prefixes: Prefix[];
}

const ASNDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { asnNumber } = useParams<{ asnNumber: string }>();
  const [asn, setAsn] = useState<ASN | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (asnNumber) {
      setLoading(true);
      getASNDetail(asnNumber)
        .then(res => setAsn(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [asnNumber]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="animate-spin text-sky-500" size={48} />
      <p className="text-slate-500 font-medium tracking-tight">Fetching ASN Intel...</p>
    </div>
  );

  if (!asn) return (
    <div className="text-center py-20 px-6">
       <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-2">ASN Not Found</h2>
          <p className="text-red-500/80 mb-6">The requested Autonomous System could not be found in our database.</p>
          <Link to="/topology" className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold">Return to Topology</Link>
       </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link 
          to="/topology" 
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} className={`text-slate-600 ${i18n.language === 'fa' ? 'rotate-180' : ''}`} />
        </Link>
        <span className="text-slate-400 font-medium">{t('nav.map')} / AS{asn.asn_number}</span>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-4xl p-8 md:p-12 shadow-sm relative overflow-hidden group">
        <div className="absolute right-0 top-0 h-full w-1/4 bg-sky-500/5 group-hover:bg-sky-500/10 transition-colors pointer-events-none" />
        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">AS{asn.asn_number}</h1>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-black uppercase tracking-widest">
                {i18n.language === 'fa' ? (asn.network_type.name_fa || asn.network_type.name) : asn.network_type.name}
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest">
                {i18n.language === 'fa' ? (asn.network_status.name_fa || asn.network_status.name) : asn.network_status.name}
              </span>
            </div>
          </div>
          <h2 className="text-xl md:text-2xl text-slate-500 font-medium leading-tight">
            {i18n.language === 'fa' ? (asn.name_fa || asn.name) : asn.name}
          </h2>
          {(asn.description || asn.description_fa) && (
            <p className={`text-slate-400 text-lg leading-relaxed max-w-3xl border-l-4 border-slate-100 pl-6 ${i18n.language === 'fa' ? 'border-l-0 border-r-4 pl-0 pr-6' : ''}`}>
              {i18n.language === 'fa' ? (asn.description_fa || asn.description) : asn.description}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {/* Registration Info */}
          <div className="bg-white border border-slate-200 rounded-4xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck size={18} className="text-sky-500" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Registration</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <User size={12} /> Registered To
                </div>
                <div className="text-slate-900 font-semibold">{asn.registered_to || '—'}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <Globe size={12} /> Registrar
                </div>
                <div className="text-slate-900 font-semibold">{asn.registrar || '—'}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <Calendar size={12} /> Registered On
                </div>
                <div className="text-slate-900 font-semibold">{asn.registered_on || '—'}</div>
              </div>
            </div>
          </div>

          {/* Relationships Card */}
          <div className="bg-white border border-slate-200 rounded-4xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Share2 size={18} className="text-sky-500" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Peering Graph</h3>
            </div>
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <Activity size={14} className="text-red-400" /> Upstreams
                </h4>
                {asn.upstreams?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {asn.upstreams.map(up => (
                      <Link 
                        key={up.id} 
                        to={`/asn/${up.asn_number}`}
                        className="p-3 bg-slate-50 hover:bg-sky-50 border border-slate-100 rounded-xl transition-all text-sm font-bold text-slate-700 hover:text-sky-600 flex justify-between items-center"
                      >
                        {up.name} <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-400">AS{up.asn_number}</span>
                      </Link>
                    ))}
                  </div>
                ) : <p className="text-slate-400 text-sm italic py-2">No upstream data available</p>}
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <Activity size={14} className="text-emerald-400 rotate-180" /> Downstreams
                </h4>
                {asn.downstreams?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {asn.downstreams.map(down => (
                      <Link 
                        key={down.id} 
                        to={`/asn/${down.asn_number}`}
                        className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-100 rounded-xl transition-all text-sm font-bold text-slate-700 hover:text-emerald-600 flex justify-between items-center"
                      >
                        {down.name} <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-400">AS{down.asn_number}</span>
                      </Link>
                    ))}
                  </div>
                ) : <p className="text-slate-400 text-sm italic py-2">No downstream dependencies</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Prefix List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-4xl overflow-hidden shadow-sm h-full">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                   <List size={22} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Prefix Inventory</h3>
                  <p className="text-xs text-slate-400 font-medium">Publicly announced IPv4 blocks</p>
                </div>
              </div>
              <span className="px-4 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
                {asn.prefixes?.filter(p => p.ip_version === 4).length || 0} Total
              </span>
            </div>
            
            <div className="overflow-x-auto">
              {asn.prefixes?.filter(p => p.ip_version === 4).length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">IPv4 Prefix</th>
                      <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Broadcast Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {asn.prefixes.filter(p => p.ip_version === 4).map(p => (
                      <tr key={p.id} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="px-8 py-5">
                          <code className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                            {p.cidr}
                          </code>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm font-medium text-slate-600">
                            {p.description || 'Generic local assignment'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-20 text-center space-y-4">
                   <div className="text-slate-200 inline-block"><Share2 size={64} /></div>
                   <p className="text-slate-400 text-sm font-medium">No direct prefixes announced from this AS.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ASNDetail;
