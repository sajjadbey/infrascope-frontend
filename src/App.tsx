import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Lookup from './pages/Lookup';
import ASNDetail from './pages/ASNDetail';
import Topology from './pages/Topology';
import Map from './pages/Map';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lookup" element={<Lookup />} />
          <Route path="/asn/:asnNumber" element={<ASNDetail />} />
          <Route path="/topology" element={<Topology />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
