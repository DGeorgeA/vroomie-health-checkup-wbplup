
import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, G } from 'react-native-svg';

interface AppIconSVGProps {
  size?: number;
}

export const AppIconSVG: React.FC<AppIconSVGProps> = ({ size = 512 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1e293b" stopOpacity="1" />
          <Stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FCD34D" stopOpacity="1" />
          <Stop offset="100%" stopColor="#F59E0B" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      
      {/* Background with rounded corners */}
      <Rect width="512" height="512" rx="80" fill="url(#bgGradient)" />
      
      {/* Car silhouette */}
      <G transform="translate(256, 256)">
        {/* Car body */}
        <Path
          d="M -80 -20 L -60 -50 L 60 -50 L 80 -20 L 80 40 L -80 40 Z"
          fill="url(#carGradient)"
          opacity="0.9"
        />
        
        {/* Car windows */}
        <Path
          d="M -50 -45 L -40 -25 L 40 -25 L 50 -45 Z"
          fill="#0f172a"
          opacity="0.6"
        />
        
        {/* Wheels */}
        <G>
          <Path
            d="M -60 40 A 15 15 0 1 1 -60 40.1"
            fill="#1e293b"
            stroke="#FCD34D"
            strokeWidth="3"
          />
          <Path
            d="M 60 40 A 15 15 0 1 1 60 40.1"
            fill="#1e293b"
            stroke="#FCD34D"
            strokeWidth="3"
          />
        </G>
        
        {/* ECG/Waveform line passing through car */}
        <Path
          d="M -120 0 L -90 0 L -80 -30 L -70 30 L -60 0 L -40 0 L -30 -20 L -20 20 L -10 0 L 10 0 L 20 -25 L 30 25 L 40 0 L 60 0 L 70 -30 L 80 30 L 90 0 L 120 0"
          fill="none"
          stroke="#FCD34D"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      
      {/* Glow effect */}
      <Rect
        width="512"
        height="512"
        rx="80"
        fill="none"
        stroke="#FCD34D"
        strokeWidth="2"
        opacity="0.3"
      />
    </Svg>
  );
};
