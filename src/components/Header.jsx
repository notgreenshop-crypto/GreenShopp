import React from 'react';
import { ShoppingCart, Search, Facebook } from 'lucide-react';

const Header = ({ searchQuery, setSearchQuery, cart, setCurrentPage, facebookPage }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setCurrentPage('home')}
          >
            FENZO
          </h1>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-full bg-white/50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <a 
              href={`https://facebook.com/${facebookPage}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-full transition-all transform hover:scale-110"
              aria-label="Facebook Page"
            >
              <Facebook size={24} className="text-blue-600" />
            </a>
            
            <button
              onClick={() => setCurrentPage('cart')}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-all transform hover:scale-110"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={24} className="text-gray-700" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;