export function IndianSweetsPictogram() {
  return (
    <div className="grid grid-cols-3 gap-6 max-w-md">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary/20 flex items-center justify-center shadow-lg">
        {/* Traditional sweet symbol */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.3" />
          <circle cx="20" cy="20" r="12" fill="currentColor" opacity="0.6" />
          <circle cx="20" cy="20" r="6" fill="currentColor" />
        </svg>
      </div>
      
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 border-4 border-accent/20 flex items-center justify-center shadow-lg">
        {/* Laddu symbol */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-accent"
        >
          <path
            d="M20 4 C30 4, 36 10, 36 20 C36 30, 30 36, 20 36 C10 36, 4 30, 4 20 C4 10, 10 4, 20 4 Z"
            fill="currentColor"
            opacity="0.8"
          />
          <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.6" />
          <circle cx="24" cy="16" r="2" fill="currentColor" opacity="0.6" />
          <circle cx="20" cy="24" r="2" fill="currentColor" opacity="0.6" />
        </svg>
      </div>
      
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 border-4 border-secondary/20 flex items-center justify-center shadow-lg">
        {/* Snacks symbol */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-secondary"
        >
          <path
            d="M6 20 L20 6 L34 20 L20 34 Z"
            fill="currentColor"
            opacity="0.4"
          />
          <path
            d="M10 20 L20 10 L30 20 L20 30 Z"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>
      </div>
      
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-primary/20 flex items-center justify-center shadow-lg">
        {/* Variety sweets symbol */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          <rect x="8" y="8" width="24" height="24" rx="4" fill="currentColor" opacity="0.3" />
          <rect x="12" y="12" width="16" height="16" rx="2" fill="currentColor" opacity="0.6" />
          <rect x="16" y="16" width="8" height="8" rx="1" fill="currentColor" />
        </svg>
      </div>
      
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 border-4 border-accent/20 flex items-center justify-center shadow-lg">
        {/* Traditional mithai symbol */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-accent"
        >
          <ellipse cx="20" cy="12" rx="12" ry="6" fill="currentColor" opacity="0.4" />
          <ellipse cx="20" cy="20" rx="10" ry="5" fill="currentColor" opacity="0.6" />
          <ellipse cx="20" cy="28" rx="8" ry="4" fill="currentColor" opacity="0.8" />
        </svg>
      </div>
      
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 border-4 border-secondary/20 flex items-center justify-center shadow-lg">
        {/* Festive sweets symbol */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-secondary"
        >
          <path
            d="M20 4 L24 16 L36 16 L27 24 L31 36 L20 28 L9 36 L13 24 L4 16 L16 16 Z"
            fill="currentColor"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
}
