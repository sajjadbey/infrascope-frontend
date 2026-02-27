import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { getTopologyData } from '../api';
import { Loader2, Info, Maximize2, ZoomIn, ZoomOut, RotateCcw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topology: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getTopologyData().then(res => {
      const { nodes, edges } = res.data;
      
      const cyElements = [
        ...nodes.map((n: { id: number; label: string; role: string; name: string; asn_number: number }) => ({
          data: { 
            id: `n${n.id}`, 
            label: n.label, 
            role: n.role,
            name: n.name,
            asn: n.asn_number
          }
        })),
        ...edges.map((e: { from: number; to: number }, idx: number) => ({
          data: { id: `e${idx}`, source: `n${e.from}`, target: `n${e.to}` }
        }))
      ];

      if (containerRef.current) {
        cyRef.current = cytoscape({
          container: containerRef.current,
          elements: cyElements,
          style: [
            {
              selector: 'node',
              style: {
                'label': 'data(label)',
                'text-wrap': 'wrap',
                'text-max-width': '100px',
                'font-size': '10px',
                'text-valign': 'center',
                'text-halign': 'center',
                'width': '120px',
                'height': '40px',
                'shape': 'round-rectangle',
                'background-color': '#ffffff',
                'border-width': 2,
                'border-color': '#94a3b8',
                'color': '#1e293b',
                'font-weight': 'bold',
                'transition-property': 'background-color, border-color, width, height',
                'transition-duration': 0.2
              }
            },
            {
              selector: 'node[role="tier1"]',
              style: { 
                'background-color': '#fff1f2', 
                'border-color': '#f43f5e',
                'border-width': 3
              }
            },
            {
              selector: 'node[role="origin"]',
              style: { 
                'background-color': '#f0fdf4', 
                'border-color': '#22c55e' 
              }
            },
            {
                selector: 'node:hover',
                style: {
                    'border-color': '#0ea5e9',
                    'background-color': '#f0f9ff'
                }
            },
            {
                selector: 'node.highlighted',
                style: {
                    'border-color': '#f59e0b',
                    'border-width': 6,
                    'width': '140px',
                    'height': '50px',
                    'background-color': '#fffbeb',
                    'z-index': 9999
                }
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
                'line-color': '#e2e8f0',
                'target-arrow-color': '#cbd5e1',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'opacity': 0.8
              }
            },
            {
                selector: 'edge:hover',
                style: {
                    'width': 4,
                    'line-color': '#0ea5e9',
                    'target-arrow-color': '#0ea5e9',
                    'opacity': 1
                }
            }
          ],
          layout: {
            name: 'cose',
            padding: 100,
            animate: true,
            animationDuration: 1000,
            nodeOverlap: 20,
            componentSpacing: 100
          }
        });

        cyRef.current.on('tap', 'node', (evt) => {
          const asn = evt.target.data('asn');
          navigate(`/asn/${asn}`);
        });

        setLoading(false);
      }
    }).catch(console.error);

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (cyRef.current) {
        cyRef.current.nodes().removeClass('highlighted');
        if (searchTerm.length >= 2) {
            const found = cyRef.current.nodes().filter((node) => {
                const name = node.data('name').toLowerCase();
                const asn = node.data('asn').toString();
                return name.includes(searchTerm.toLowerCase()) || asn.includes(searchTerm);
            });
            found.addClass('highlighted');
            if (found.length > 0) {
                cyRef.current.animate({
                    center: { eles: found },
                    zoom: 1.5,
                    duration: 500
                });
            }
        }
    }
  }, [searchTerm]);

  const handleFit = () => cyRef.current?.fit(undefined, 50);
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() / 1.2);
  const handleReset = () => {
      cyRef.current?.layout({ name: 'cose', animate: true }).run();
  };

  return (
    <div className="relative h-[calc(100vh-140px)] -m-4 md:-m-6 bg-slate-50 overflow-hidden border border-slate-200 shadow-inner rounded-3xl">
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm gap-4">
          <Loader2 className="animate-spin text-sky-500" size={48} />
          <p className="text-slate-600 font-bold tracking-tight">Computing Neural Network Paths...</p>
        </div>
      )}
      
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Search Overlay */}
      <div className="absolute top-8 left-8 z-10">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-2 rounded-2xl shadow-xl flex items-center gap-2 group focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
              <div className="p-2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Find ASN or Provider..." 
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-48 md:w-64 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="p-2 text-slate-400 hover:text-slate-600">×</button>
              )}
          </div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-2">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-1 rounded-2xl shadow-xl flex flex-col gap-1">
            <button onClick={handleZoomIn} className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-600" title="Zoom In"><ZoomIn size={20} /></button>
            <button onClick={handleZoomOut} className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-600" title="Zoom Out"><ZoomOut size={20} /></button>
            <div className="h-px bg-slate-200 mx-2" />
            <button onClick={handleFit} className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-600" title="Fit to Screen"><Maximize2 size={20} /></button>
            <button onClick={handleReset} className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-600" title="Re-Layout"><RotateCcw size={20} /></button>
        </div>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-8 right-8 bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-4xl shadow-xl w-64 space-y-4">
        <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
            <Info size={14} className="text-sky-500" /> Infrastructure Legend
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-rose-50 border-2 border-rose-500 shadow-sm" />
            <span className="text-sm font-bold text-slate-700">Tier-1 / Backbone</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-white border-2 border-slate-400 shadow-sm" />
            <span className="text-sm font-bold text-slate-700">Transit / Provider</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-emerald-50 border-2 border-emerald-500 shadow-sm" />
            <span className="text-sm font-bold text-slate-700">Access / Origin</span>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                Tap on any node to view deep intelligence and prefix assignments for that ASN.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Topology;
