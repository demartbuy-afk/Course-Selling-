import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Zap, LayoutDashboard } from 'lucide-react';
import { ViewState } from '../types';
import { Button } from './ui/Button';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onChangeView: (view: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onChangeView }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', action: () => onChangeView({ type: 'HOME' }) },
    { label: 'All Courses', action: () => onChangeView({ type: 'CATALOG' }) },
    { label: 'Academy Info', action: () => {} }, 
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onChangeView({ type: 'HOME' })}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className={`text-xl font-extrabold tracking-tight ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
            OmniLearn
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Instructor Dashboard */}
          <button
             onClick={() => onChangeView({ type: 'SELLER_DASHBOARD' })}
             className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors"
          >
             <LayoutDashboard size={16} />
             <span>Instructor Panel</span>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <div className="relative group">
            <button 
              onClick={onOpenCart}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={() => onChangeView({ type: 'CATALOG' })}>
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-gray-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg p-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => {
                link.action();
                setIsMobileMenuOpen(false);
              }}
              className="text-left font-medium text-gray-700 py-2"
            >
              {link.label}
            </button>
          ))}
          
          <button 
             onClick={() => { onChangeView({ type: 'SELLER_DASHBOARD' }); setIsMobileMenuOpen(false); }}
             className="flex items-center gap-2 text-left font-medium text-indigo-600 py-2"
          >
             <LayoutDashboard size={18} />
             Instructor Panel
          </button>

          <hr className="border-gray-100" />
          <div className="flex justify-between items-center">
            <button 
              onClick={() => {
                onOpenCart();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 font-medium text-gray-700"
            >
              <ShoppingCart size={20} />
              <span>Cart ({cartCount})</span>
            </button>
            <Button size="sm" onClick={() => {
              onChangeView({ type: 'CATALOG' });
              setIsMobileMenuOpen(false);
            }}>Get Started</Button>
          </div>
        </div>
      )}
    </header>
  );
};