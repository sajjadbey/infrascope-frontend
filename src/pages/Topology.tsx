import React, { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import { getTopologyData, lookupIP, getASNSummary } from '../api';
import { Loader2, Info, Maximize2, ZoomIn, ZoomOut, RotateCcw, Search, X, ArrowRight, CornerDownRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NodeData {
  id: number;
  asn_number: number;
  name: string;
  label: string;
  role: string;
}

interface EdgeData {
  from: number;
  to: number;
}

interface PathInfo {
  type: 'search' | 'tier1' | 'a2b';
  title: string;
  paths: string[][];
  hops?: number;
}

interface SearchStatus {
  message: string;
  type: 'error' | 'success' | 'info';
}

interface ASNSummary {
  asn_number?: number;
  name?: string;
  network_type?: string;
  network_status?: string;
  registrar?: string;
  registered_to?: string;
  upstreams_count?: number;
  downstreams_count?: number;
  prefixes_v4?: number;
  prefixes_v6?: number;
  error?: boolean;
}

type CytoscapeStyle = Record<string, string | number | number[] | undefined>;

const PATH_COLORS = [
  '#f97316', '#38bdf8', '#a78bfa', '#facc15', '#f472b6',
  '#2dd4bf', '#fb923c', '#818cf8', '#4ade80', '#e879f9',
];

const Topology: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [loading, setLoading] = useState(true);
  const [originInput, setOriginInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [pathInfo, setPathInfo] = useState<PathInfo | null>(null);
  const [searchStatus, setSearchStatus] = useState<SearchStatus | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(window.innerWidth > 768);
  const [popupData, setPopupData] = useState<ASNSummary | null>(null);
  const [isPopupLoading, setIsPopupLoading] = useState(false);

  const rawNodesRef = useRef<NodeData[]>([]);
  const upstreamAdjRef = useRef<Record<string, string[]>>({});
  const biAdjRef = useRef<Record<string, string[]>>({});
  const edgeLookupRef = useRef<Record<string, string>>({});
  const asnNumToNodeIdRef = useRef<Record<number, string>>({});
  const nodeRoleMapRef = useRef<Record<string, string>>({});

  const showStatus = (message: string, type: 'error' | 'success' | 'info') => {
    setSearchStatus({ message, type });
    setTimeout(() => setSearchStatus(null), 5000);
  };

  const resetHighlights = useCallback(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    cy.batch(() => {
      cy.elements().removeClass('highlighted highlight-origin highlight-dest highlight-tier1 dimmed');
      cy.edges().removeStyle();
    });
    setPathInfo(null);
  }, []);

  const resolveQueryToNodeId = (query: string) => {
    if (!query) return null;
    const numQuery = query.replace(/^as/i, '');
    if (/^\d+$/.test(numQuery)) {
      return asnNumToNodeIdRef.current[parseInt(numQuery, 10)] || null;
    }
    const nodes = rawNodesRef.current;
    for (const n of nodes) {
      if ((n.name || '').toLowerCase().includes(query.toLowerCase()) ||
          (n.label || '').toLowerCase().includes(query.toLowerCase())) {
        return 'n' + n.id;
      }
    }
    return null;
  };

  const looksLikeIP = (str: string) => {
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(str)) return true;
    if (str.includes(':') && (str.match(/:/g) || []).length >= 2) return true;
    return false;
  };

  const looksLikeDomain = (str: string) => {
    if (/^\d+$/.test(str)) return false;
    if (/^as\d+$/i.test(str)) return false;
    if (looksLikeIP(str)) return false;
    return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(str);
  };

  const findAllPathsToTier1 = (startCyId: string, maxDepth = 10) => {
    const allPaths: string[][] = [];
    const upstreamAdj = upstreamAdjRef.current;
    const nodeRoleMap = nodeRoleMapRef.current;

    function dfs(current: string, currentPath: string[], visitedOnPath: Record<string, boolean>) {
      if (nodeRoleMap[current] === 'tier1' && current !== startCyId) {
        allPaths.push([...currentPath]);
        return;
      }
      if (currentPath.length > maxDepth) return;
      const neighbors = upstreamAdj[current] || [];
      for (const next of neighbors) {
        if (visitedOnPath[next]) continue;
        currentPath.push(next);
        visitedOnPath[next] = true;
        dfs(next, currentPath, visitedOnPath);
        currentPath.pop();
        visitedOnPath[next] = false;
      }
    }
    dfs(startCyId, [startCyId], { [startCyId]: true });
    return allPaths;
  };

  const bfsAllShortestPaths = (startId: string, endId: string, maxPaths = 10) => {
    if (startId === endId) return [[startId]];
    const biAdj = biAdjRef.current;
    const queue: string[][] = [[startId]];
    const visited: Record<string, boolean> = { [startId]: true };
    const allPaths: string[][] = [];
    let shortestLen = Infinity;

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];
      if (path.length > shortestLen) break;
      if (current === endId) {
        shortestLen = path.length;
        allPaths.push(path);
        if (allPaths.length >= maxPaths) break;
        continue;
      }
      const neighbors = biAdj[current] || [];
      for (const next of neighbors) {
        if (visited[next] && path.length + 1 > shortestLen) continue;
        const newPath = [...path, next];
        if (newPath.length <= shortestLen) {
          if (next === endId) {
            shortestLen = newPath.length;
            allPaths.push(newPath);
            if (allPaths.length >= maxPaths) break;
          } else {
            queue.push(newPath);
          }
        }
      }
      visited[current] = true;
    }
    return allPaths;
  };

  const displayA2BPaths = useCallback((startCyId: string, endCyId: string) => {
    resetHighlights();
    const cy = cyRef.current;
    if (!cy) return;

    if (startCyId === endCyId) {
      const node = cy.getElementById(startCyId);
      cy.batch(() => {
        cy.elements().addClass('dimmed');
        node.removeClass('dimmed').addClass('highlight-origin');
      });
      setPathInfo({ type: 'a2b', title: 'Same Node', paths: [[startCyId]] });
      cy.animate({ center: { eles: node }, zoom: 1.5 }, { duration: 500 });
      showStatus('Origin and destination are the same ASN.', 'info');
      return;
    }

    const allPaths = bfsAllShortestPaths(startCyId, endCyId, 10);
    if (!allPaths || allPaths.length === 0) {
      showStatus('No path found between these two ASNs.', 'error');
      return;
    }

    let allPathEles = cy.collection();
    for (const path of allPaths) {
      for (const id of path) allPathEles = allPathEles.union(cy.getElementById(id));
      for (let i = 0; i < path.length - 1; i++) {
        const eid = edgeLookupRef.current[`${path[i]}→${path[i + 1]}`] || edgeLookupRef.current[`${path[i + 1]}→${path[i]}`];
        if (eid) allPathEles = allPathEles.union(cy.getElementById(eid));
      }
    }

    cy.batch(() => {
      cy.elements().addClass('dimmed');
      allPathEles.removeClass('dimmed').addClass('highlighted');
      allPaths.forEach((path, p) => {
        const color = PATH_COLORS[p % PATH_COLORS.length];
        for (let i = 0; i < path.length - 1; i++) {
          const eid = edgeLookupRef.current[`${path[i]}→${path[i + 1]}`] || edgeLookupRef.current[`${path[i + 1]}→${path[i]}`];
          if (eid) cy.getElementById(eid).style({ 'line-color': color, 'target-arrow-color': color });
        }
      });
      cy.getElementById(startCyId).removeClass('highlighted').addClass('highlight-origin');
      cy.getElementById(endCyId).removeClass('highlighted').addClass('highlight-dest');
    });

    setPathInfo({
      type: 'a2b',
      title: `${allPaths.length} Path${allPaths.length > 1 ? 's' : ''}`,
      paths: allPaths,
      hops: allPaths[0].length - 1
    });

    cy.animate({ fit: { eles: allPathEles, padding: 60 } }, { duration: 500 });
    showStatus(`${allPaths.length} shortest path(s), ${allPaths[0].length - 1} hop(s).`, 'success');
  }, [resetHighlights]);

  const displayTier1Paths = useCallback((startCyId: string) => {
    resetHighlights();
    const cy = cyRef.current;
    if (!cy) return;
    const startNode = cy.getElementById(startCyId);

    if (nodeRoleMapRef.current[startCyId] === 'tier1') {
      cy.batch(() => {
        cy.elements().addClass('dimmed');
        startNode.removeClass('dimmed').addClass('highlight-tier1');
      });
      setPathInfo({ type: 'tier1', title: 'Paths to Tier-1', paths: [[startCyId]] });
      cy.animate({ center: { eles: startNode }, zoom: 1.5 }, { duration: 500 });
      showStatus('This ASN is already a Tier-1 provider.', 'success');
      return;
    }

    const allPaths = findAllPathsToTier1(startCyId);
    if (!allPaths || allPaths.length === 0) {
      showStatus('No path to Tier-1 found for this ASN.', 'error');
      return;
    }

    let allPathEles = cy.collection();
    for (const path of allPaths) {
      for (const id of path) allPathEles = allPathEles.union(cy.getElementById(id));
      for (let i = 0; i < path.length - 1; i++) {
        const eid = edgeLookupRef.current[`${path[i]}→${path[i + 1]}`];
        if (eid) allPathEles = allPathEles.union(cy.getElementById(eid));
      }
    }

    allPaths.sort((a, b) => a.length - b.length);
    const tier1NodeIds: Record<string, boolean> = {};
    allPaths.forEach(p => tier1NodeIds[p[p.length - 1]] = true);

    const lastHopColorMap: Record<string, string> = {};
    let lastHopIndex = 0;
    allPaths.forEach(path => {
      const edgeKey = `${path[path.length - 2]}→${path[path.length - 1]}`;
      if (!lastHopColorMap[edgeKey]) {
        lastHopColorMap[edgeKey] = PATH_COLORS[lastHopIndex % PATH_COLORS.length];
        lastHopIndex++;
      }
    });

    const defaultPathColor = '#f97316';
    cy.batch(() => {
      cy.elements().addClass('dimmed');
      allPathEles.removeClass('dimmed').addClass('highlighted');
      allPaths.forEach(path => {
        for (let i = 0; i < path.length - 1; i++) {
          const isLastHop = (i === path.length - 2);
          const color = isLastHop ? lastHopColorMap[`${path[i]}→${path[i + 1]}`] : defaultPathColor;
          const eid = edgeLookupRef.current[`${path[i]}→${path[i + 1]}`];
          if (eid) cy.getElementById(eid).style({ 'line-color': color, 'target-arrow-color': color });
        }
      });
      startNode.removeClass('highlighted').addClass('highlight-origin');
      Object.keys(tier1NodeIds).forEach(id => {
        cy.getElementById(id).removeClass('highlighted').addClass('highlight-tier1');
      });
    });

    setPathInfo({
      type: 'tier1',
      title: `${allPaths.length} Path${allPaths.length > 1 ? 's' : ''} to Tier-1`,
      paths: allPaths
    });

    cy.animate({ fit: { eles: allPathEles, padding: 60 } }, { duration: 500 });
    showStatus(`${allPaths.length} path(s) to ${Object.keys(tier1NodeIds).length} Tier-1 provider(s).`, 'success');
  }, [resetHighlights]);

  const handleSearch = async () => {
    if (!cyRef.current) return;
    const originRaw = originInput.trim();
    const destRaw = destInput.trim();
    if (!originRaw) { showStatus('Please enter an origin ASN, IP address, or domain.', 'error'); return; }

    try {
      let originQuery = { query: originRaw.toLowerCase(), label: '' };
      if (looksLikeIP(originRaw) || looksLikeDomain(originRaw)) {
        showStatus('Resolving origin...', 'info');
        const res = await lookupIP(originRaw);
        originQuery = { 
          query: String(res.data.asn), 
          label: looksLikeDomain(originRaw) ? `${originRaw} → ${res.data.ip} → AS${res.data.asn}` : `IP ${originRaw} → AS${res.data.asn}`
        };
      }

      let destQuery: { query: string, label: string } | null = null;
      if (destRaw) {
        if (looksLikeIP(destRaw) || looksLikeDomain(destRaw)) {
          showStatus('Resolving destination...', 'info');
          const res = await lookupIP(destRaw);
          destQuery = { 
            query: String(res.data.asn), 
            label: looksLikeDomain(destRaw) ? `${destRaw} → ${res.data.ip} → AS${res.data.asn}` : `IP ${destRaw} → AS${res.data.asn}`
          };
        } else {
          destQuery = { query: destRaw.toLowerCase(), label: '' };
        }
      }

      const originId = resolveQueryToNodeId(originQuery.query);
      if (!originId) { showStatus(`Origin not found: "${originRaw}"`, 'error'); return; }
      if (originQuery.label) showStatus(originQuery.label, 'info');

      if (!destQuery) { displayTier1Paths(originId); } 
      else {
        const destId = resolveQueryToNodeId(destQuery.query);
        if (!destId) { showStatus(`Destination not found: "${destRaw}"`, 'error'); return; }
        if (destQuery.label) showStatus(destQuery.label, 'info');
        displayA2BPaths(originId, destId);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }, message?: string };
      showStatus('Failed to resolve: ' + (error.response?.data?.error || error.message || 'Unknown error'), 'error');
    }
  };

  const handleNodeClick = async (asnNumber: number) => {
    setIsPopupLoading(true);
    setPopupData(null);
    try {
      const res = await getASNSummary(asnNumber);
      setPopupData(res.data);
    } catch (err) {
      console.error(err);
      setPopupData({ error: true, asn_number: asnNumber });
    } finally {
      setIsPopupLoading(false);
    }
  };

  useEffect(() => {
    getTopologyData().then(res => {
      const { nodes, edges } = res.data;
      rawNodesRef.current = nodes;
      
      const inDeg: Record<number, number> = {};
      edges.forEach((e: EdgeData) => inDeg[e.to] = (inDeg[e.to] || 0) + 1);
      const maxIn = Math.max(1, ...Object.values(inDeg));

      const elements: cytoscape.ElementDefinition[] = [];
      nodes.forEach((n: NodeData) => {
        const cyId = 'n' + n.id;
        const role = n.role || 'standalone';
        nodeRoleMapRef.current[cyId] = role;
        asnNumToNodeIdRef.current[n.asn_number] = cyId;
        biAdjRef.current[cyId] = [];
        const size = role === 'tier1' ? 40 : Math.round(12 + ((inDeg[n.id] || 0) / maxIn) * 22);
        elements.push({
          data: { id: cyId, label: `AS${n.asn_number || n.id}\n${n.name?.substring(0, 22)}`, role, asn_number: n.asn_number, name: n.name, nodeSize: size }
        });
      });

      edges.forEach((e: EdgeData, i: number) => {
        const edgeId = 'e' + i, src = 'n' + e.from, tgt = 'n' + e.to;
        edgeLookupRef.current[`${src}→${tgt}`] = edgeId;
        if (!upstreamAdjRef.current[src]) upstreamAdjRef.current[src] = [];
        upstreamAdjRef.current[src].push(tgt);
        biAdjRef.current[src].push(tgt);
        biAdjRef.current[tgt].push(src);
        elements.push({ data: { id: edgeId, source: src, target: tgt } });
      });

      if (containerRef.current) {
        cyRef.current = cytoscape({
          container: containerRef.current,
          elements: elements as cytoscape.ElementDefinition[],
          style: [
            {
              selector: 'node',
              style: {
                'width': 'data(nodeSize)', 'height': 'data(nodeSize)',
                'label': 'data(label)', 'font-size': 9, 'color': '#475569',
                'text-wrap': 'wrap', 'text-valign': 'bottom', 'text-margin-y': 4,
                'border-width': 2, 'text-outline-color': '#f8fafc', 'text-outline-width': 2,
                'background-color': '#cbd5e1', 'border-color': '#94a3b8'
              } as CytoscapeStyle
            },
            { selector: 'node[role="tier1"]', style: { 'background-color': '#ef4444', 'border-color': '#991b1b', 'font-size': 10 } },
            { selector: 'node[role="transit"]', style: { 'background-color': '#3b82f6', 'border-color': '#1d4ed8' } },
            { selector: 'node[role="origin"]', style: { 'background-color': '#22c55e', 'border-color': '#166534' } },
            { selector: 'node[role="standalone"]', style: { 'background-color': '#eab308', 'border-color': '#a16207' } },
            { selector: 'edge', style: { 'width': 1.5, 'line-color': '#cbd5e1', 'target-arrow-color': '#cbd5e1', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'arrow-scale': 0.7, 'opacity': 0.4, 'line-style': 'dashed', 'line-dash-pattern': [6, 4] } },
            { selector: 'node.highlighted', style: { 'background-color': '#f97316', 'border-color': '#c2410c', 'border-width': 4, 'z-index': 9999, 'opacity': 1 } as CytoscapeStyle },
            { selector: 'node.highlight-origin', style: { 'background-color': '#22c55e', 'border-color': '#15803d', 'border-width': 4, 'width': 36, 'height': 36, 'z-index': 10000, 'opacity': 1 } as CytoscapeStyle },
            { selector: 'node.highlight-dest', style: { 'background-color': '#8b5cf6', 'border-color': '#6d28d9', 'border-width': 4, 'width': 36, 'height': 36, 'z-index': 10000, 'opacity': 1 } as CytoscapeStyle },
            { selector: 'node.highlight-tier1', style: { 'background-color': '#ef4444', 'border-color': '#991b1b', 'border-width': 4, 'z-index': 10000, 'opacity': 1 } as CytoscapeStyle },
            { selector: 'edge.highlighted', style: { 'line-color': '#f97316', 'target-arrow-color': '#f97316', 'width': 3, 'opacity': 1, 'z-index': 9999 } as CytoscapeStyle },
            { selector: 'node.dimmed', style: { 'opacity': 0.1 } }, { selector: 'edge.dimmed', style: { 'opacity': 0.05 } }
          ],
          layout: { name: 'cose', nodeOverlap: 40, idealEdgeLength: () => 140, nodeRepulsion: () => 900000, numIter: 300, gravity: 50, randomize: true },
          // Performance settings
          textureOnViewport: true,
          hideEdgesOnViewport: true,
          motionBlur: true,
          motionBlurOpacity: 0.1,
          wheelSensitivity: 0.2,
          pixelRatio: 'auto'
        });

        cyRef.current.on('tap', 'node', (evt) => handleNodeClick(evt.target.data('asn_number')));
        setLoading(false);
      }
    }).catch(console.error);

    return () => { if (cyRef.current) cyRef.current.destroy(); };
  }, []);

  return (
    <div className="relative h-[calc(100vh-140px)] -m-4 md:-m-6 bg-slate-50 flex flex-col overflow-hidden border border-slate-200">
      {searchStatus && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-100 px-6 py-3 rounded-2xl shadow-xl font-bold text-sm border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          searchStatus.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : searchStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-sky-50 border-sky-200 text-sky-800'
        }`}>
          {searchStatus.type === 'error' ? '❌' : searchStatus.type === 'success' ? '✅' : 'ℹ️'} {searchStatus.message}
        </div>
      )}

      <div className="bg-white border-b border-slate-200 p-4 relative z-20 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 flex items-center gap-2 w-full">
            <input type="text" placeholder="Origin (ASN / IP / Domain)" className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 transition-all font-mono text-xs text-slate-700 outline-none" value={originInput} onChange={(e) => setOriginInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            <span className="text-slate-300 font-bold">→</span>
            <input type="text" placeholder="Destination (Optional)" className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 transition-all font-mono text-xs text-slate-700 outline-none" value={destInput} onChange={(e) => setDestInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <button onClick={handleSearch} className="flex-1 md:flex-none px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-xs">Find Path</button>
            <button onClick={() => { setOriginInput(''); setDestInput(''); resetHighlights(); }} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold text-slate-500">Clear</button>
            <button onClick={() => setIsLegendOpen(!isLegendOpen)} className="md:hidden px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">Legend</button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        {loading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm gap-4">
            <Loader2 className="animate-spin text-sky-500" size={48} />
            <p className="text-slate-600 font-bold tracking-tight">Mapping National Infrastructure...</p>
            </div>
        )}
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {pathInfo && (
            <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md border border-slate-200 p-6 rounded-4xl shadow-2xl w-full max-w-[340px] max-h-[70%] flex flex-col animate-in fade-in slide-in-from-left-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 text-xs font-black text-sky-600 uppercase tracking-widest"><Search size={14} /> {pathInfo.title}</h3>
                    <button onClick={() => setPathInfo(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {pathInfo.paths.map((path, pIdx) => (
                        <div key={pIdx} className="mb-6 last:mb-0 pb-4 border-b border-slate-100 last:border-0">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full" style={{ background: PATH_COLORS[pIdx % PATH_COLORS.length] }} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Path {pIdx + 1} ({path.length - 1} hops)</span>
                            </div>
                            <ul className="space-y-3">
                                {path.map((nodeId, nIdx) => {
                                    const node = cyRef.current?.getElementById(nodeId);
                                    const isOrigin = nIdx === 0, isDest = nIdx === path.length - 1;
                                    return (
                                        <li key={nIdx} className="flex gap-3 text-xs">
                                            {nIdx > 0 && <span className="text-slate-300 font-bold"><CornerDownRight size={12} /></span>}
                                            <div className="flex flex-col">
                                                <span className={`font-bold ${isOrigin ? 'text-emerald-600' : isDest ? 'text-violet-600' : 'text-slate-700'}`}>{node?.data('label')?.replace('\n', ' – ') || nodeId}</span>
                                                {(isOrigin || isDest) && <span className="text-[9px] uppercase tracking-tighter text-slate-400 font-black">{isOrigin ? 'Origin Point' : 'Destination'}</span>}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className={`absolute bottom-6 right-6 bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-4xl shadow-xl w-64 space-y-4 transition-all z-10 ${isLegendOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Info size={14} className="text-sky-500" /> Infrastructure Node Types</h3>
            <div className="space-y-3">
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-800" /><span className="text-xs font-bold text-slate-700">Tier-1 / Backbone</span></div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-800" /><span className="text-xs font-bold text-slate-700">Transit / Provider</span></div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-800" /><span className="text-xs font-bold text-slate-700">Access / Origin</span></div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-amber-800" /><span className="text-xs font-bold text-slate-700">Standalone Node</span></div>
            </div>
        </div>

        <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-10">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-1 rounded-2xl shadow-xl flex flex-col gap-1">
                <button onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)} className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"><ZoomIn size={18} /></button>
                <button onClick={() => cyRef.current?.zoom(cyRef.current.zoom() / 1.2)} className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"><ZoomOut size={18} /></button>
                <div className="h-px bg-slate-200 mx-2" />
                <button onClick={() => cyRef.current?.fit(undefined, 50)} className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"><Maximize2 size={18} /></button>
                <button onClick={() => cyRef.current?.layout({ name: 'cose', animate: true }).run()} className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"><RotateCcw size={18} /></button>
            </div>
        </div>
      </div>

      {popupData && (
          <div className="fixed inset-0 z-200 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPopupData(null)}>
              <div className="bg-white w-full max-w-[340px] rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                      <div>
                          <h2 className="text-xl font-black text-slate-900">AS{popupData.asn_number}</h2>
                          {popupData.name && <p className="text-xs font-medium text-slate-500 line-clamp-1">{popupData.name}</p>}
                      </div>
                      <button onClick={() => setPopupData(null)} className="p-1 text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 space-y-3">
                      {popupData.error ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
                          <AlertCircle size={40} className="text-slate-200" />
                          <p className="text-xs font-bold uppercase tracking-widest text-center">Intel unavailable for this Node</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center py-2 border-b border-slate-50">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</span>
                              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">{popupData.network_type}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-50">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${popupData.network_status?.toLowerCase().includes('active') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{popupData.network_status}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-50">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner</span>
                              <span className="text-xs font-bold text-slate-700 max-w-[140px] truncate">{popupData.registered_to}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peers (U/D)</span>
                              <span className="text-xs font-mono font-black text-slate-900">{popupData.upstreams_count} / {popupData.downstreams_count}</span>
                          </div>
                        </>
                      )}
                  </div>

                  <div className="p-6 pt-0">
                      <Link to={`/asn/${popupData.asn_number}`} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all text-sm">Deep Intelligence <ArrowRight size={18} /></Link>
                  </div>
              </div>
          </div>
      )}

      {isPopupLoading && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-[2px]">
            <div className="bg-white p-8 rounded-4xl shadow-xl transition-all"><Loader2 className="animate-spin text-sky-500" size={32} /></div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default Topology;
