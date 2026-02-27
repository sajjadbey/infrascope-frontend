import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Map as MapIcon, Search, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  React.useEffect(() => {
    const dir = i18n.language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const navItems = [
    { name: t('nav.home'), path: '/', icon: <Home size={18} /> },
    { name: t('nav.topology'), path: '/topology', icon: <LayoutGrid size={18} /> },
    { name: t('nav.map'), path: '/map', icon: <MapIcon size={18} /> },
    { name: t('nav.lookup'), path: '/lookup', icon: <Search size={18} /> },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fa' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

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
        <div className="hidden lg:flex items-center gap-6">
          <nav className="flex items-center gap-1">
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

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold text-white hover:bg-white/5 transition-all select-none"
          >
             {i18n.language === 'en' ? 'FA' : 'EN'}
             <span className="opacity-40 font-normal">|</span>
             <span className={i18n.language === 'fa' ? 'text-sky-400' : ''}>FA</span>
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold text-white"
          >
              {i18n.language === 'en' ? 'FA' : 'EN'}
          </button>
          <button
            className="p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay/Panel */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#1e293b] border-t border-white/10 p-4 shadow-xl animate-in fade-in slide-in-from-top-2">
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
