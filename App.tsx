
import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, Mail, Phone, Globe, Star, ExternalLink, Map as MapIcon, Compass } from 'lucide-react';
import { searchBusinesses } from './services/geminiService';
import { BusinessInfo, GroundingLink, LocationState } from './types';

// Icons are from lucide-react (simulated with SVG if needed, but assuming it exists as a standard library)
// If not, I'll provide standard SVG paths.

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<BusinessInfo[]>([]);
  const [sources, setSources] = useState<GroundingLink[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationState | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setLocation({ lat: 0, lng: 0, error: err.message })
      );
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    try {
      const { businesses, sources } = await searchBusinesses(query, location || undefined);
      setResults(businesses);
      setSources(sources);
    } catch (err: any) {
      setError(err.message || "An error occurred while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">MapScout<span className="text-indigo-600">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-all">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
            The Intelligent Way to <br />
            <span className="text-indigo-600">Scrape Maps Leads</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Search for any business type globally. Our AI extracts contact details, phone numbers, and location info directly using real-time Google Maps grounding.
          </p>

          <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for 'Event Planners in New York'..."
              className="block w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-slate-800 text-lg shadow-sm"
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </form>

          {location && !location.error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              <span>Using your current location for better results</span>
            </div>
          )}
        </div>
      </section>

      {/* Results Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
            <span className="flex-shrink-0 bg-red-100 p-1 rounded-full">!</span>
            {error}
          </div>
        )}

        {!isSearching && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <MapIcon className="w-16 h-16 mb-4" />
            <p className="text-xl font-medium">Search results will appear here</p>
            <p className="text-sm">Try searching for local services, retailers, or professionals</p>
          </div>
        )}

        {isSearching && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse">
                <div className="h-6 w-2/3 bg-slate-100 rounded mb-4"></div>
                <div className="h-4 w-full bg-slate-50 rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-slate-50 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-slate-100 rounded-lg"></div>
                  <div className="h-8 w-20 bg-slate-100 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Results Found ({results.length})</h2>
              <div className="flex items-center gap-4 text-sm">
                <button className="text-indigo-600 font-semibold hover:underline">Export CSV</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((biz, idx) => (
                <BusinessCard key={idx} business={biz} />
              ))}
            </div>

            {sources.length > 0 && (
              <div className="mt-16 pt-8 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Sources Referenced</h3>
                <div className="flex flex-wrap gap-4">
                  {sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 transition-colors"
                    >
                      <MapIcon className="w-3 h-3" />
                      {source.title}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Compass className="w-5 h-5 text-slate-800" />
            <span className="font-bold tracking-tight text-slate-800">MapScout Pro</span>
          </div>
          <p className="text-sm text-slate-400">© 2024 MapScout Leads. All rights reserved.</p>
          <div className="flex gap-6 text-slate-400 text-sm">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const BusinessCard: React.FC<{ business: BusinessInfo }> = ({ business }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all group flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
          {business.name}
        </h3>
        {business.rating && (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            {business.rating}
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6 flex-1">
        <div className="flex items-start gap-3 text-sm text-slate-600">
          <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
          <span>{business.address}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <a href={`tel:${business.phone}`} className="hover:text-indigo-600 transition-colors">
            {business.phone}
          </a>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className={`${business.email === 'Not found' ? 'text-slate-400' : 'text-indigo-600 font-medium'}`}>
            {business.email}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
        {business.website && (
          <a
            href={business.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-colors border border-slate-200"
          >
            <Globe className="w-3.5 h-3.5" />
            Website
          </a>
        )}
        <button className="flex-1 bg-indigo-50 text-indigo-600 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
          View Leads
        </button>
      </div>
    </div>
  );
};

export default App;
