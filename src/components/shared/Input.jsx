import { 
  Car, Truck, Calendar, Download, Plus, CheckCircle, Edit3, Trash2, Filter, Search, 
  Moon, Sun, Settings, Home, History, Brain, Users, Zap, AlertCircle, Star, Target, 
  Award, Phone, Eye, EyeOff, Save, X, ChevronDown, FileText, Camera, Upload, 
  PieChart, Activity, Gauge, Coins, Bell, Clock, TrendingUp, BarChart3, Shield,
  LogOut, User, Wifi, WifiOff, RefreshCw, ExternalLink, Copy, Share2, Globe,
  MapPin, Palette, Sparkles, Crown, Diamond, Heart, Flame, Layers, Database,
  DollarSign, Mic, MicOff, ArrowUp, ArrowDown, MessageCircle, Bot, Calculator,
  Receipt, FileBarChart, Banknote, CreditCard, Wallet, TrendingDown, LineChart,
  Lightbulb, Menu, ChevronRight, Maximize2, Minimize2, Timer, ChevronLeft, 
  Lock, Loader2, ArrowRight
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';


 const LuxuryInput = ({ 
  id, 
  type, 
  value, 
  onChange, 
  placeholder, 
  required, 
  autoComplete, 
  theme, 
  icon: Icon,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  error,
  loading = false,
  suggestions = [],
  showSuggestions = false,
  onSuggestionClick,
  inputRef
}) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const currentTheme = LUXURY_THEMES_2025[theme];
  
  useEffect(() => {
    setHasValue(value && value.length > 0);
  }, [value]);
  
  const shouldFloat = focused || hasValue;
  
  return (
    <div className="relative group">
      {/* Floating Label */}
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 flex items-center space-x-2 ${
          shouldFloat
            ? `top-2 text-xs ${currentTheme.textMuted} scale-90`
            : `top-1/2 -translate-y-1/2 text-base ${currentTheme.textSecondary}`
        }`}
      >
        <Icon size={shouldFloat ? 12 : 16} />
        <span className="font-medium uppercase tracking-wider">{placeholder}</span>
      </label>
      
      {/* Input Container */}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full px-4 py-6 pt-8 rounded-2xl transition-all duration-300 font-semibold text-lg
            ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} 
            ${currentTheme.ring} focus:border-transparent focus:scale-[1.02] hover:scale-[1.01]
            ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            shadow-lg group-hover:shadow-xl backdrop-blur-2xl`}
          required={required}
          autoComplete={autoComplete}
          disabled={loading}
          style={{
            background: focused 
              ? theme === 'dark' 
                ? 'rgba(55, 65, 81, 0.8)' 
                : 'rgba(255, 255, 255, 0.9)'
              : undefined
          }}
        />
        
        {/* Password Toggle Button */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg
              ${currentTheme.glass} hover:bg-gray-500/20 transition-all duration-200
              hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
            disabled={loading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-blue-500" size={20} />
          </div>
        )}
      </div>
      
      {/* Auto-complete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute top-full left-0 right-0 mt-2 ${currentTheme.glass} rounded-xl shadow-xl z-20 backdrop-blur-2xl`}>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-blue-500/20 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl ${currentTheme.text}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-500 text-sm animate-slideIn">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}; 
export default LuxuryInput;
