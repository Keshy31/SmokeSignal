import React, { useState, useEffect } from 'react';
import { useFireDanger } from '@/hooks/useFireDanger';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useMapContext } from '@/contexts/MapContext';

const FireDangerIndex: React.FC = () => {
  const { map } = useMapContext();
  const [center, setCenter] = useState<[number, number]>([18.4241, -33.9249]);
  
  useEffect(() => {
    if (map) {
      const mapCenter = map.getCenter();
      setCenter([mapCenter.lng, mapCenter.lat]);
      
      const moveHandler = () => {
        const newCenter = map.getCenter();
        setCenter([newCenter.lng, newCenter.lat]);
      };
      
      map.on('moveend', moveHandler);
      return () => map.off('moveend', moveHandler);
    }
  }, [map]);

  const { fireDanger, isLoading } = useFireDanger(center[1], center[0]);
  const { t } = useTranslation();

  // Calculate the stroke-dasharray for the gauge
  const calculateStrokeDashArray = () => {
    if (isLoading || !fireDanger) return '0, 100';
    return `${fireDanger.value}, 100`;
  };

  // Determine the stroke color based on danger level
  const getStrokeColor = () => {
    if (isLoading || !fireDanger) return '#777';
    
    switch (fireDanger.level) {
      case 'Low': return 'hsl(var(--danger-safe))';
      case 'Moderate': return 'hsl(var(--danger-moderate))';
      case 'High': return 'hsl(var(--danger-high))';
      case 'Severe': 
      case 'Extreme': 
      default: return 'hsl(var(--danger-severe))';
    }
  };

  // Get translated danger level
  const getDangerLevelText = () => {
    if (isLoading || !fireDanger) return t('danger.moderate');
    
    switch (fireDanger.level) {
      case 'Low': return t('danger.low');
      case 'Moderate': return t('danger.moderate');
      case 'High': return t('danger.high');
      case 'Severe': return t('danger.severe');
      case 'Extreme': return t('danger.extreme');
      default: return t('danger.moderate');
    }
  };

  // Get gradient color values for background
  const getGradientColors = () => {
    if (isLoading || !fireDanger) {
      return { start: 'rgba(0, 0, 0, 0.85)', end: 'rgba(30, 30, 30, 0.7)' };
    }
    
    switch (fireDanger.level) {
      case 'Low': 
        return { start: 'rgba(10, 10, 10, 0.9)', end: 'rgba(34, 197, 94, 0.15)' };
      case 'Moderate': 
        return { start: 'rgba(10, 10, 10, 0.9)', end: 'rgba(255, 193, 7, 0.15)' };
      case 'High': 
        return { start: 'rgba(10, 10, 10, 0.9)', end: 'rgba(249, 115, 22, 0.2)' };
      case 'Severe': 
      case 'Extreme': 
      default: 
        return { start: 'rgba(10, 10, 10, 0.9)', end: 'rgba(239, 68, 68, 0.25)' };
    }
  };

  // Get outer glow effect for severe levels
  const getGlowEffect = () => {
    if (isLoading || !fireDanger) return '';
    
    if (fireDanger.level === 'Severe' || fireDanger.level === 'Extreme') {
      return '0 0 20px rgba(239, 68, 68, 0.4)';
    } else if (fireDanger.level === 'High') {
      return '0 0 15px rgba(249, 115, 22, 0.3)';
    }
    return '';
  };

  // Animation class based on danger level
  const getPulseAnimation = () => {
    if (isLoading || !fireDanger) return '';
    
    if (fireDanger.level === 'Severe' || fireDanger.level === 'Extreme') {
      return 'animate-pulse-fire';
    }
    return '';
  };

  // Get gauge inner circle color
  const getInnerCircleColor = () => {
    return 'rgba(0, 0, 0, 0.6)';
  };

  const gradientColors = getGradientColors();

  return (
    <div className="absolute top-20 left-4 z-10">
      <div 
        className={cn(
          "fire-danger-card relative p-6 rounded-xl shadow-xl overflow-hidden",
          getPulseAnimation()
        )}
        style={{
          background: `linear-gradient(180deg, ${gradientColors.start} 0%, ${gradientColors.end} 100%)`,
          boxShadow: getGlowEffect(),
        }}
      >
        <div 
          className="absolute -z-20 left-[-50%] top-[-50%] w-[200%] h-[200%]"
          style={{
            background: `linear-gradient(var(--angle), ${getStrokeColor()}, ${getStrokeColor()}70)`,
            animation: 'rotate 8s linear infinite'
          }}
        />
        <div 
          className="absolute -z-10 left-[1px] top-[1px] w-[calc(100%-2px)] h-[calc(100%-2px)] rounded-xl"
          style={{
            background: `linear-gradient(180deg, ${gradientColors.start} 0%, ${gradientColors.end} 100%)`
          }}
        />
        <header className="text-white font-semibold mb-2 flex items-center gap-2 px-1">
          {/* Animated flame icon */}
          <div className={cn(
            "relative",
            (fireDanger?.level === 'Severe' || fireDanger?.level === 'Extreme') ? 'fire-pulse' : ''
          )}>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 612 612" 
              fill="currentColor"
              stroke="none"
              className="text-orange-500"
            >
              <path d="M216.02,611.195c5.978,3.178,12.284-3.704,8.624-9.4c-19.866-30.919-38.678-82.947-8.706-149.952 c49.982-111.737,80.396-169.609,80.396-169.609s16.177,67.536,60.029,127.585c42.205,57.793,65.306,130.478,28.064,191.029 c-3.495,5.683,2.668,12.388,8.607,9.349c46.1-23.582,97.806-70.885,103.64-165.017c2.151-28.764-1.075-69.034-17.206-119.851 c-20.741-64.406-46.239-94.459-60.992-107.365c-4.413-3.861-11.276-0.439-10.914,5.413c4.299,69.494-21.845,87.129-36.726,47.386 c-5.943-15.874-9.409-43.33-9.409-76.766c0-55.665-16.15-112.967-51.755-159.531c-9.259-12.109-20.093-23.424-32.523-33.073 c-4.5-3.494-11.023,0.018-10.611,5.7c2.734,37.736,0.257,145.885-94.624,275.089c-86.029,119.851-52.693,211.896-40.864,236.826 C153.666,566.767,185.212,594.814,216.02,611.195z" />
            </svg>
          </div>
          <span className="text-sm tracking-wide font-medium">{t('danger.title')}</span>
        </header>

        <div className="flex items-center justify-center mx-auto relative mt-4">
          {/* Smaller circle for more compact display */}
          <div className="w-[96px] h-[96px] relative overflow-hidden rounded-full">
            {/* Dark glass effect background */}
            <div className="absolute inset-0 rounded-full bg-black/60"></div>
            
            {/* Glow effect behind gauge for severe/extreme levels */}
            {(fireDanger?.level === 'Severe' || fireDanger?.level === 'Extreme') && (
              <div 
                className="absolute inset-0 rounded-full blur-md" 
                style={{ background: `radial-gradient(circle, ${getStrokeColor()}70 30%, transparent 70%)`, opacity: 0.6 }}
              ></div>
            )}
            
            <svg className="w-full h-full relative z-10" viewBox="0 0 36 36">
              {/* Define all gradients */}
              <defs>
                <linearGradient id="darkCircleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#333" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#222" stopOpacity="0.8" />
                </linearGradient>
                
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={getStrokeColor()} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={getStrokeColor()} stopOpacity="1" />
                </linearGradient>
                
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Dark base circle */}
              <path 
                className="gauge-circle" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="url(#darkCircleGradient)" 
                strokeWidth="3" 
                strokeDasharray="100, 100" 
              />
              
              {/* Tick marks - more subtle and elegant */}
              {[0, 25, 50, 75, 100].map((position) => {
                const angle = (position * 3.6 - 90) * (Math.PI / 180);
                const x1 = 18 + 13.5 * Math.cos(angle);
                const y1 = 18 + 13.5 * Math.sin(angle);
                const x2 = 18 + 15 * Math.cos(angle);
                const y2 = 18 + 15 * Math.sin(angle);
                
                return (
                  <line 
                    key={position}
                    x1={x1} 
                    y1={y1} 
                    x2={x2} 
                    y2={y2} 
                    stroke={position === 0 || position === 100 ? '#777' : '#555'} 
                    strokeWidth={position === 0 || position === 100 ? "0.7" : "0.4"}
                  />
                );
              })}
              
              {/* Color gauge progress with enhanced gradient and better glow */}
              <path 
                className="gauge-circle" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="url(#gaugeGradient)" 
                strokeWidth="3.2" 
                strokeDasharray={calculateStrokeDashArray()} 
                strokeLinecap="round"
                filter={fireDanger?.level === 'Severe' || fireDanger?.level === 'Extreme' ? 'url(#glow)' : ''}
              />
              
              {/* Smaller central circle with improved glass effect */}
              <circle 
                cx="18" 
                cy="18" 
                r="10" 
                fill={getInnerCircleColor()} 
              />
              
              {/* Single central text for improved clarity */}
              <text 
                x="18" 
                y="19" 
                textAnchor="middle" 
                fontSize="7" 
                fill="white" 
                fontWeight="bold"
                letterSpacing="0.1"
                filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.7))"
              >
                {isLoading ? '...' : getDangerLevelText()}
              </text>
            </svg>
          </div>
        </div>
        
        {/* Scale indicators below gauge */}
        <div className="flex justify-between items-center px-2 pt-2 pb-0.5">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-green-400 rounded-full"></span>
            <span className="text-green-400 font-medium text-[10px] drop-shadow-md">{t('danger.low')}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
            <span className="text-red-500 font-medium text-[10px] drop-shadow-md">{t('danger.severe')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FireDangerIndex;
