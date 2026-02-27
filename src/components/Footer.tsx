import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#1e293b] border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-slate-400 text-sm font-medium">
            {t('footer.title')}
          </span>
          <span className="text-slate-500 text-xs">
            © {new Date().getFullYear()} {t('footer.rights')}
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link to="/" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">{t('nav.home')}</Link>
          <Link to="/topology" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">{t('nav.topology')}</Link>
          <Link to="/lookup" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">{t('nav.lookup')}</Link>
          <Link to="/map" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">{t('nav.map')}</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
