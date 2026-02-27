import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

const Home = lazy(() => import('./pages/Home'));
const Lookup = lazy(() => import('./pages/Lookup'));
const ASNDetail = lazy(() => import('./pages/ASNDetail'));
const Topology = lazy(() => import('./pages/Topology'));
const Map = lazy(() => import('./pages/Map'));

const PageLoader = () => (
    <div className="flex h-[calc(100vh-140px)] w-full items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-sky-500" size={48} />
    </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lookup" element={<Lookup />} />
                <Route path="/asn/:asnNumber" element={<ASNDetail />} />
                <Route path="/topology" element={<Topology />} />
                <Route path="/map" element={<Map />} />
            </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
