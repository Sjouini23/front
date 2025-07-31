import React, { useState, useEffect } from 'react'; // Import at the very top
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';
const FloatingParticles = ({ theme }) => {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        color: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'
      }));
      setParticles(newParticles);
    };
    
    generateParticles();
    const interval = setInterval(generateParticles, 10000);
    return () => clearInterval(interval);
  }, [theme]);
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            animation: `float ${particle.speed * 4}s ease-in-out infinite, 
                       pulse ${particle.speed * 2}s ease-in-out infinite alternate`
          }}
        />
      ))}
    </div>
  );
};
export default FloatingParticles;
