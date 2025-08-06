import { useState, useEffect, useCallback, useRef } from 'react';
import { sanitizeInput } from '../utils/validation';
import config from '../config.local.js'; 

export const useAuth = (addNotification) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Refs for form navigation
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const submitRef = useRef(null);

  // Auto-complete suggestions
  const usernameSuggestions = ['admin', 'manager', 'supervisor'];
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load remembered user
  useEffect(() => {
    const rememberedUser = localStorage.getItem('jouini_remember_user');
    if (rememberedUser) {
      setAuthForm(prev => ({ ...prev, username: rememberedUser }));
      setRememberMe(true);
      setWelcomeMessage(`Bon retour, ${rememberedUser}!`);
    }
  }, []);

  // ✅ NEW - Check for existing auth token on load
  useEffect(() => {
    const checkAuthToken = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await fetch(config.API_ENDPOINTS.VERIFY, { 
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = localStorage.getItem('user_data');
            if (userData) {
              const user = JSON.parse(userData);
              setWelcomeMessage(`Bon retour, ${user.username}!`);
              setIsAuthenticated(true);
            }
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
    };

    checkAuthToken();
  }, []);

  // Keyboard navigation for login
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault();
        if (e.target === usernameRef.current) {
          passwordRef.current?.focus();
        } else if (e.target === passwordRef.current) {
          submitRef.current?.click();
        }
      }
    };
    
    if (!isAuthenticated) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isAuthenticated]);

  // ✅ UPDATED - Secure backend authentication
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    
    try {
      const username = sanitizeInput(authForm.username, 50);
      const password = sanitizeInput(authForm.password, 50);

      // Call backend API for authentication
      const response = await fetch(config.API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Store JWT token securely
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem('jouini_remember_user', username);
        } else {
          localStorage.removeItem('jouini_remember_user');
        }
        
        setLoginSuccess(true);
        setWelcomeMessage(`Bienvenue, ${username}!`);
        
        setTimeout(() => {
          setIsAuthenticated(true);
          addNotification('Connexion réussie', `Bienvenue ${username}!`, 'success');
        }, 1000);
      } else {
        setAuthError(data.error || 'Nom d\'utilisateur ou mot de passe incorrect');
        addNotification('Échec de la connexion', 'Vérifiez vos identifiants', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Erreur de connexion au serveur');
      addNotification('Erreur', 'Impossible de contacter le serveur', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [authForm.username, authForm.password, rememberMe, addNotification]);

  // ✅ UPDATED - Secure logout with token cleanup
  const handleLogout = useCallback(() => {
    // Clear all auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('jouini_remember_user');
    
    setIsAuthenticated(false);
    setAuthForm({ username: '', password: '' });
    setWelcomeMessage('');
    setLoginSuccess(false);
    setAuthError('');
    
    addNotification('Déconnexion', 'À bientôt!', 'info');
  }, [addNotification]);

  return {
    isAuthenticated,
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
    submitRef,
    usernameSuggestions,
    showSuggestions,
    setShowSuggestions,
    handleLogin,
    handleLogout
  };
};
