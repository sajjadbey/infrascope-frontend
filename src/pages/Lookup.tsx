import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { lookupIP } from '../api';
import { AlertCircle, Globe, ArrowRight, Search as SearchIcon, Loader2 } from 'lucide-react';

interface LookupResult {
  ip: string;
  prefix: string;
  asn: number;
  provider: string;
  network_type: string;
  status: string;
  resolved_domain?: string;
}

const Lookup: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('ip') || '';
  const [inputValue, setInputValue] = useState(query);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const performLookup = async (ip: string) => {
    if (!ip) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await lookupIP(ip);
      setResult(res.data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
          const resp = (err as { response: { data: { error?: string } } }).response;
          setError(resp?.data?.error || 'No matching prefix found');
      } else {
          setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      performLookup(query);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ ip: inputValue.trim() });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 bg-sky-500/10 rounded-2xl text-sky-500 mb-2">
          <SearchIcon size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">IP / Domain Analysis</h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Deep-dive into any IP address or domain to uncover its infrastructure footprint in Iran.
        </p>

        <form className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 pt-6" onSubmit={handleSubmit}>
          <div className="relative flex-1">
            <input
              className="w-full pl-4 pr-12 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-0 transition-all font-mono text-slate-700 placeholder:text-slate-400 outline-none"
              type="text"
              placeholder="e.g. 46.167.128.1 or example.ir"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
              autoComplete="off"
            />
            <button
               type="button"
               onClick={() => {
                 setLoading(true);
                 lookupIP('').then(res => {
                    setInputValue(res.data.ip);
                    setSearchParams({ ip: res.data.ip });
                 }).finally(() => setLoading(false));
               }}
               title="Use my IP"
               className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all"
            >
               <Globe size={20} />
            </button>
          </div>
          <button 
            className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
            type="submit" 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Analyze'}
          </button>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle className="text-red-500 shrink-0" size={24} />
          <div className="space-y-1">
            <h3 className="font-bold text-red-900">Analysis Failed</h3>
            <p className="text-red-700 text-sm">
              {error}{inputValue ? `: ` : ''}
              {inputValue && <span className="font-mono bg-red-100 px-1 rounded">{inputValue}</span>}
            </p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-4xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-sky-500/20">
              <Globe size={32} />
            </div>
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {result.resolved_domain && <span className="text-slate-400">{result.resolved_domain} → </span>}
                {result.ip}
              </h2>
              <p className="text-slate-500 font-medium">{result.provider}</p>
            </div>
            <div className="md:ml-auto flex gap-2">
              <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold uppercase tracking-wider">{result.network_type}</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">{result.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center group">
                <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Prefix Block</span>
                <span className="text-slate-900 font-mono font-bold group-hover:text-sky-500 transition-colors">{result.prefix}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Autonomous System</span>
                <span className="text-slate-900 font-mono font-bold group-hover:text-sky-500 transition-colors">AS{result.asn}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">IP Address</span>
                <span className="text-slate-900 font-mono font-bold group-hover:text-sky-500 transition-colors">{result.ip}</span>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50/50 flex flex-col justify-center gap-6">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                    <p className="text-slate-600 text-sm">Provider Sitz: <span className="text-slate-900 font-bold">{result.provider}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-slate-600 text-sm">Status: <span className="text-slate-900 font-bold uppercase tracking-tighter text-xs px-2 py-0.5 bg-emerald-100 rounded">{result.status}</span></p>
                  </div>
               </div>
               
               <Link 
                to={`/asn/${result.asn}`} 
                className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 group"
               >
                 View AS{result.asn} Details <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lookup;
