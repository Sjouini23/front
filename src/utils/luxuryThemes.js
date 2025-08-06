export const LUXURY_THEMES_2025 = {
  light: {
    name: 'Apple Elegance',
    // Accessible color contrasts (WCAG AA compliant)
    primary: 'from-slate-100 via-gray-100 to-slate-200',
    secondary: 'from-gray-100 via-slate-100 to-gray-200',
    accent: 'from-blue-600 via-indigo-600 to-purple-700',
    success: 'from-emerald-500 via-green-600 to-teal-700',
    warning: 'from-amber-500 via-orange-600 to-red-600',
    danger: 'from-red-500 via-pink-600 to-rose-700',
    money: 'from-green-500 via-emerald-600 to-teal-700',
         
    // MUCH softer, warmer background - easier on eyes
    background: 'bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200',
    
    // Sidebar with better contrast and warmth
    sidebar: 'bg-gradient-to-b from-white to-slate-50 border-r border-slate-300 shadow-lg',
    
    // ENHANCED: Much better visibility and comfort
    surface: 'bg-gradient-to-br from-white to-slate-50 border border-slate-300 shadow-lg shadow-slate-400/40',
    glass: 'bg-gradient-to-br from-white/95 to-slate-100/95 backdrop-blur-lg border border-slate-300/80 shadow-md shadow-slate-300/30',
    glassDark: 'bg-gradient-to-br from-slate-200 to-slate-300 backdrop-blur-xl border border-slate-400/80',
    modal: 'bg-gradient-to-br from-white to-slate-50 border border-slate-400 shadow-2xl shadow-slate-600/50',
         
    // Enhanced text contrast for better readability
    text: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-600',
    textInverse: 'text-white',
         
    // Stronger borders for clear separation
    border: 'border-slate-300',
    hover: 'hover:bg-gradient-to-br hover:from-white hover:to-slate-100 hover:shadow-xl hover:shadow-slate-400/50 hover:border-slate-400 hover:scale-[1.01]',
    ring: 'focus:ring-blue-500/50 focus:ring-4 focus:outline-none',
    glow: 'shadow-blue-500/40',
  },
  dark: {
    name: 'Tesla Sophistication',
    // Enhanced dark mode with better contrast
    primary: 'from-gray-900 via-slate-900 to-black',
    secondary: 'from-gray-800 via-gray-900 to-slate-900',
    accent: 'from-cyan-500 via-blue-600 to-indigo-700',
    success: 'from-emerald-500 via-green-600 to-teal-500',
    warning: 'from-amber-500 via-yellow-600 to-orange-600',
    danger: 'from-red-500 via-pink-600 to-rose-500',
    money: 'from-green-500 via-emerald-500 to-teal-400',
         
    background: 'bg-gradient-to-br from-slate-900 via-gray-900 to-black',
    sidebar: 'bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/60',
    surface: 'bg-gray-900/95 backdrop-blur-xl border border-gray-700/60 shadow-xl shadow-black/25',
    glass: 'bg-gray-800/70 backdrop-blur-lg border border-gray-700/50 shadow-lg shadow-black/15',
    glassDark: 'bg-black/50 backdrop-blur-xl border border-gray-600/30',
    modal: 'bg-gray-900/98 backdrop-blur-xl border border-gray-700/70 shadow-2xl shadow-black/40',
         
    // High contrast for dark mode accessibility
    text: 'text-white',
    textSecondary: 'text-gray-200',
    textMuted: 'text-gray-400',
    textInverse: 'text-gray-900',
         
    border: 'border-gray-700/70',
    hover: 'hover:bg-gray-800/90 hover:shadow-lg hover:shadow-cyan-500/10',
    ring: 'focus:ring-cyan-400/40 focus:ring-4 focus:outline-none',
    glow: 'shadow-cyan-400/25',
  }
}; 