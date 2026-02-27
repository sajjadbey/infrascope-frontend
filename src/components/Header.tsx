import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Map as MapIcon, Search, LayoutGrid } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Topology', path: '/topology', icon: <LayoutGrid size={18} /> },
    { name: 'Network Map', path: '/map', icon: <MapIcon size={18} /> },
    { name: 'IP Lookup', path: '/lookup', icon: <Search size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a] border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-xl">🌐</span>
          <span className="text-lg font-bold text-white tracking-tight">
            Infra<span className="text-sky-500">Scope</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'text-white bg-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Overlay/Panel */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#1e293b] border-t border-white/10 p-4 shadow-xl">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive(item.path)
                    ? 'text-white bg-sky-500/20 border border-sky-500/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
