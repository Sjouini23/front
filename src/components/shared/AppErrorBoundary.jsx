import { useSecureLocalStorage } from '../../hooks/useSecureLocalStorages';
import { useNotifications } from '../../hooks/useNotifications1';
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('JOUINI App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <AlertCircle className="text-white" size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Erreur Application</h2>
            <p className="text-gray-600 mb-6">Une erreur inattendue s'est produite. Veuillez recharger la page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
            >
              Recharger l'Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default AppErrorBoundary;
