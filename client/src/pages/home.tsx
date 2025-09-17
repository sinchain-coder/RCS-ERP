import { Link } from "wouter";
import { Settings, ShoppingCart, Package } from "lucide-react";

// Scattered playful pictograms component
function ScatteredPictograms() {
  const pictograms = [
    // Gulab Jamun
    { id: 1, x: '10%', y: '15%', size: 60, rotate: 15 },
    { id: 2, x: '85%', y: '20%', size: 45, rotate: -25 },
    { id: 3, x: '15%', y: '75%', size: 50, rotate: 45 },
    // Laddu
    { id: 4, x: '75%', y: '70%', size: 55, rotate: -15 },
    { id: 5, x: '5%', y: '45%', size: 40, rotate: 30 },
    { id: 6, x: '90%', y: '45%', size: 48, rotate: -35 },
    // Samosa
    { id: 7, x: '25%', y: '25%', size: 42, rotate: 60 },
    { id: 8, x: '70%', y: '25%', size: 38, rotate: -45 },
    { id: 9, x: '30%', y: '80%', size: 44, rotate: 20 },
    // Namkeen
    { id: 10, x: '55%', y: '10%', size: 35, rotate: -20 },
    { id: 11, x: '20%', y: '55%', size: 52, rotate: 40 },
    { id: 12, x: '80%', y: '85%', size: 46, rotate: -30 },
    // More variety
    { id: 13, x: '45%', y: '35%', size: 36, rotate: 25 },
    { id: 14, x: '60%', y: '60%', size: 41, rotate: -40 },
    { id: 15, x: '35%', y: '90%', size: 39, rotate: 15 }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pictograms.map((item) => (
        <div
          key={item.id}
          className="absolute opacity-20 animate-pulse"
          style={{
            left: item.x,
            top: item.y,
            transform: `rotate(${item.rotate}deg)`,
            animationDelay: `${item.id * 0.5}s`,
            animationDuration: `${3 + (item.id % 3)}s`
          }}
        >
          {/* Different pictogram types */}
          {item.id % 4 === 0 ? (
            // Gulab Jamun - Circle
            <svg width={item.size} height={item.size} viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="#ff8c42" opacity="0.8" />
              <circle cx="30" cy="30" r="18" fill="#ff6b1a" opacity="0.6" />
              <circle cx="25" cy="25" r="3" fill="#fff" opacity="0.8" />
              <circle cx="35" cy="25" r="2" fill="#fff" opacity="0.6" />
            </svg>
          ) : item.id % 4 === 1 ? (
            // Laddu - Decorated circle
            <svg width={item.size} height={item.size} viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="#ffd700" opacity="0.8" />
              <circle cx="30" cy="30" r="15" fill="#ffed4e" opacity="0.7" />
              <circle cx="22" cy="22" r="2" fill="#ff8c42" />
              <circle cx="38" cy="22" r="2" fill="#ff8c42" />
              <circle cx="30" cy="35" r="2" fill="#ff8c42" />
              <circle cx="25" cy="35" r="1.5" fill="#ff6b1a" />
              <circle cx="35" cy="35" r="1.5" fill="#ff6b1a" />
            </svg>
          ) : item.id % 4 === 2 ? (
            // Samosa - Triangle
            <svg width={item.size} height={item.size} viewBox="0 0 60 60">
              <path d="M30 10 L50 45 L10 45 Z" fill="#d2691e" opacity="0.8" />
              <path d="M30 15 L45 40 L15 40 Z" fill="#cd853f" opacity="0.6" />
              <path d="M25 25 L35 25 L30 32 Z" fill="#8b4513" opacity="0.5" />
            </svg>
          ) : (
            // Namkeen - Square with dots
            <svg width={item.size} height={item.size} viewBox="0 0 60 60">
              <rect x="10" y="10" width="40" height="40" rx="8" fill="#ff7f50" opacity="0.8" />
              <rect x="15" y="15" width="30" height="30" rx="4" fill="#ff6347" opacity="0.6" />
              <circle cx="22" cy="22" r="2" fill="#fff" opacity="0.8" />
              <circle cx="38" cy="22" r="2" fill="#fff" opacity="0.8" />
              <circle cx="22" cy="38" r="2" fill="#fff" opacity="0.8" />
              <circle cx="38" cy="38" r="2" fill="#fff" opacity="0.8" />
              <circle cx="30" cy="30" r="3" fill="#fff" opacity="0.6" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center relative">
      {/* Scattered playful background pictograms */}
      <ScatteredPictograms />

      {/* RCS Logo */}
      <div className="mb-12 relative z-10">
        <div className="flex items-center justify-center">
          <div className="relative group">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-orange-200 rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            
            {/* Main logo container */}
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-100 text-amber-900 px-10 py-6 rounded-3xl shadow-lg border-2 border-amber-200/50 backdrop-blur-sm">
              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
              
              {/* Main text */}
              <span className="text-7xl font-bold tracking-wide font-serif bg-gradient-to-r from-amber-700 to-orange-800 bg-clip-text text-transparent drop-shadow-sm">
                RCS
              </span>
              
              {/* Subtle underline */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Buttons - Simple with names only */}
      <div className="flex flex-col gap-6 relative z-10">
        <Link 
          href="/admin" 
          data-testid="button-admin"
          className="flex items-center justify-center gap-3 px-12 py-4 text-2xl font-semibold rounded-xl shadow-lg bg-primary text-primary-foreground hover:scale-105 transition-transform duration-200 min-w-[200px] no-underline"
        >
          <Settings size={28} />
          Admin
        </Link>

        <Link 
          href="/pos" 
          data-testid="button-pos"
          className="flex items-center justify-center gap-3 px-12 py-4 text-2xl font-semibold rounded-xl shadow-lg bg-accent text-accent-foreground hover:scale-105 transition-transform duration-200 min-w-[200px] no-underline"
        >
          <ShoppingCart size={28} />
          POS
        </Link>

        <Link 
          href="/wholesale" 
          data-testid="button-wholesale"
          className="flex items-center justify-center gap-3 px-12 py-4 text-2xl font-semibold rounded-xl shadow-lg bg-secondary text-secondary-foreground hover:scale-105 transition-transform duration-200 min-w-[200px] no-underline"
        >
          <Package size={28} />
          Wholesale
        </Link>
      </div>
    </div>
  );
}