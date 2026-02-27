import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f1f5f9]">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
