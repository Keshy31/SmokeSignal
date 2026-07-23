import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import logoImg from '../assets/smokesignal_logo.png';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="bg-app-dark backdrop-blur-sm w-full px-4 py-3 fixed top-0 left-0 z-50 shadow-lg border-b border-app-dark-lighter">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img 
              src={logoImg} 
              alt="SmokeSignal Logo" 
              className="h-10 w-auto" 
            />
          </div>
          <h1 className="ml-3 text-xl font-bold font-rubik text-white">
            {t('app.name', 'SmokeSignal')}
          </h1>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          <a href="/" className="text-white hover:text-fire-red transition duration-150">
            {t('nav.home', 'Home')}
          </a>
          <a href="/safety" className="text-white hover:text-fire-red transition duration-150">
            {t('nav.safety', 'Safety Tips')}
          </a>
          <a href="/about" className="text-white hover:text-fire-red transition duration-150">
            {t('nav.about', 'About')}
          </a>
        </div>
        
        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button 
            type="button"
            className="text-white hover:text-fire-red transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">{t('nav.menu', 'Open menu')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on state */}
      {isMenuOpen && (
        <div className="md:hidden pt-2 pb-3 space-y-1 bg-app-dark border-t border-app-dark-lighter mt-2">
          <a href="/" className="block px-3 py-2 text-white hover:bg-app-dark-lighter hover:text-fire-red transition">
            {t('nav.home', 'Home')}
          </a>
          <a href="/safety" className="block px-3 py-2 text-white hover:bg-app-dark-lighter hover:text-fire-red transition">
            {t('nav.safety', 'Safety Tips')}
          </a>
          <a href="/about" className="block px-3 py-2 text-white hover:bg-app-dark-lighter hover:text-fire-red transition">
            {t('nav.about', 'About')}
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;