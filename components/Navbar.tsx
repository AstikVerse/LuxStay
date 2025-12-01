import React, { useState } from 'react';
import { User, LogOut, Building2, KeyRound, Menu, X } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onLoginClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 text-white cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Building2 className="text-amber-500" size={28} />
          <span className="text-xl font-bold serif tracking-wide">LuxStay</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {!user && (
            <div className="flex gap-6 text-sm font-medium text-slate-300">
              <button onClick={() => scrollToSection('rooms')} className="hover:text-amber-400 transition-colors">Our Rooms</button>
              <button onClick={() => scrollToSection('location')} className="hover:text-amber-400 transition-colors">Location</button>
              <button onClick={() => scrollToSection('amenities')} className="hover:text-amber-400 transition-colors">Amenities</button>
            </div>
          )}

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.role}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors border border-slate-600"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-6 py-2 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] transform hover:scale-105"
              >
                <KeyRound size={18} />
                Portal Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

       {/* Mobile Menu */}
       {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-4 flex flex-col gap-4 shadow-xl">
                 {!user && (
                    <>
                        <button onClick={() => scrollToSection('rooms')} className="text-slate-300 hover:text-amber-400 text-left py-2">Our Rooms</button>
                        <button onClick={() => scrollToSection('location')} className="text-slate-300 hover:text-amber-400 text-left py-2">Location</button>
                        <button onClick={() => scrollToSection('amenities')} className="text-slate-300 hover:text-amber-400 text-left py-2">Amenities</button>
                    </>
                 )}
                 {user ? (
                    <button onClick={onLogout} className="flex items-center gap-2 text-rose-400 py-2">
                        <LogOut size={16} /> Logout
                    </button>
                 ) : (
                    <button onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} className="bg-amber-600 text-white py-2 rounded-lg">
                        Login
                    </button>
                 )}
            </div>
       )}
    </nav>
  );
};