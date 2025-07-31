// LoginForm.jsx - FIXED with your actual themes and proper background
import React from 'react';
import { User, Lock, Sun, Moon, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';
import FloatingParticles from '../shared/FloatingParticles';

const LoginForm = ({ 
  theme, 
  setTheme, 
  authData, 
  onSubmit 
}) => {
  const {
    authForm,
    setAuthForm,
    authError,
    isLoading,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    welcomeMessage,
    loginSuccess,
    usernameRef,
    passwordRef,
    submitRef
  } = authData;

  const currentTheme = LUXURY_THEMES_2025[theme];

  return (
    <div className={`min-h-screen ${currentTheme.background} flex relative overflow-hidden`}>
      {/* Floating Particles */}
      <FloatingParticles theme={theme} />
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/login.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px) brightness(0.6)'
          }}
        />
        {/* Additional blur overlay if image doesn't fit perfectly */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={`fixed top-6 right-6 z-50 p-3 rounded-xl ${currentTheme.glass} 
          ${currentTheme.border} hover:scale-110 transition-all duration-300 shadow-lg`}
      >
        {theme === 'dark' ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-blue-600" size={20} />}
      </button>

      {/* Left Side - Spacer for background image */}
      <div className="flex-1 relative z-10">
        {/* This allows the background to show through */}
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full max-w-md flex items-center justify-end p-8 relative z-20">
        <div className={`w-full ${currentTheme.modal} rounded-2xl p-8 shadow-2xl`}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mb-4">
              <h2 className={`text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent`}>
                CONNEXION
              </h2>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            </div>
            <p className={`${currentTheme.textSecondary} text-sm opacity-90`}>
              Bonjour Ridha, veuillez saisir vos identifiants ci-dessous pour vous connecter
            </p>
          </div>

          {/* Welcome Message */}
          {welcomeMessage && (
            <div className={`mb-6 p-4 rounded-lg ${currentTheme.glass} border-l-4 border-blue-500 animate-slideIn`}>
              <span className={`${currentTheme.text} text-sm font-medium`}>
                {welcomeMessage}
              </span>
            </div>
          )}

          {/* Error Message */}
          {authError && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
              {authError}
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-6">
            {/* Username Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className={`${currentTheme.textSecondary} group-focus-within:text-blue-400 transition-colors`} size={18} />
              </div>
              <input
                ref={usernameRef}
                type="text"
                value={authForm.username}
                onChange={(e) => setAuthForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Nom d'utilisateur"
                required
                autoComplete="username"
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-3 rounded-lg ${currentTheme.glass} ${currentTheme.border} 
                  transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                  disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.text}`}
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`${currentTheme.textSecondary} group-focus-within:text-blue-400 transition-colors`} size={18} />
              </div>
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                value={authForm.password}
                onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mot de passe"
                required
                autoComplete="current-password"
                disabled={isLoading}
                className={`w-full pl-10 pr-12 py-3 rounded-lg ${currentTheme.glass} ${currentTheme.border} 
                  transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                  disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.text}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
              >
                {showPassword ? (
                  <EyeOff className={`${currentTheme.textSecondary} hover:text-blue-400 transition-colors`} size={18} />
                ) : (
                  <Eye className={`${currentTheme.textSecondary} hover:text-blue-400 transition-colors`} size={18} />
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 bg-transparent border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 accent-blue-500"
                />
                <label htmlFor="remember" className={`text-sm font-medium ${currentTheme.textSecondary}`}>
                  Se souvenir de moi
                </label>
              </div>
              <button
                type="button"
                onClick={() => alert('Veuillez contacter Seif pour réinitialiser votre mot de passe.')}
                disabled={isLoading}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
              >
                Mot de passe oublié?
              </button>
            </div>

            {/* Success Message */}
            {loginSuccess && (
              <div className="p-4 rounded-lg bg-green-500/10 border-2 border-green-500/30 text-green-400 shadow-md animate-slideIn" role="alert">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} />
                  <span className="font-bold text-sm">Connexion réussie! Chargement...</span>
                  <Loader2 className="animate-spin ml-auto" size={16} />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              ref={submitRef}
              onClick={onSubmit}
              disabled={isLoading || !authForm.username || !authForm.password}
              className="w-full py-3.5 px-6 rounded-lg font-bold text-white text-base bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-800 hover:scale-[1.02] transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/10 hover:border-white/20"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Connexion en cours...</span>
                </div>
              ) : (
                'CONNEXION'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;