
import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Text as SvgText, G } from 'react-native-svg';

interface FeatureGraphicSVGProps {
  width?: number;
  height?: number;
}

export const FeatureGraphicSVG: React.FC<FeatureGraphicSVGProps> = ({ 
  width = 1024, 
  height = 500 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 1024 500">
      <Defs>
        <LinearGradient id="featureBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0f172a" stopOpacity="1" />
          <Stop offset="50%" stopColor="#1e293b" stopOpacity="1" />
          <Stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FCD34D" stopOpacity="0.3" />
          <Stop offset="50%" stopColor="#FCD34D" stopOpacity="1" />
          <Stop offset="100%" stopColor="#FCD34D" stopOpacity="0.3" />
        </LinearGradient>
      </Defs>
      
      {/* Background */}
      <Rect width="1024" height="500" fill="url(#featureBg)" />
      
      {/* Car silhouette (subtle, large) */}
      <G transform="translate(200, 250)" opacity="0.15">
        <Path
          d="M -120 -30 L -90 -75 L 90 -75 L 120 -30 L 120 60 L -120 60 Z"
          fill="#FCD34D"
        />
        <Path
          d="M -75 -70 L -60 -40 L 60 -40 L 75 -70 Z"
          fill="#0f172a"
        />
        <Path
          d="M -90 60 A 22 22 0 1 1 -90 60.1"
          fill="#0f172a"
          stroke="#FCD34D"
          strokeWidth="4"
        />
        <Path
          d="M 90 60 A 22 22 0 1 1 90 60.1"
          fill="#0f172a"
          stroke="#FCD34D"
          strokeWidth="4"
        />
      </G>
      
      {/* Sound waves emanating from car */}
      <G transform="translate(512, 250)">
        {/* Wave 1 */}
        <Path
          d="M -400 0 Q -350 -80, -300 0 T -200 0 T -100 0 T 0 0 T 100 0 T 200 0 T 300 0 Q 350 80, 400 0"
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        
        {/* Wave 2 */}
        <Path
          d="M -400 -40 Q -350 -100, -300 -40 T -200 -40 T -100 -40 T 0 -40 T 100 -40 T 200 -40 T 300 -40 Q 350 20, 400 -40"
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />
        
        {/* Wave 3 */}
        <Path
          d="M -400 40 Q -350 100, -300 40 T -200 40 T -100 40 T 0 40 T 100 40 T 200 40 T 300 40 Q 350 -20, 400 40"
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />
        
        {/* ECG-style pulse */}
        <Path
          d="M -200 0 L -180 0 L -170 -60 L -160 80 L -150 0 L -130 0 L -120 -40 L -110 40 L -100 0"
          fill="none"
          stroke="#FCD34D"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      
      {/* Title text */}
      <SvgText
        x="512"
        y="120"
        fontSize="72"
        fontWeight="800"
        fill="#FFFFFF"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Vroomie Health Checkup
      </SvgText>
      
      {/* Subtitle text */}
      <SvgText
        x="512"
        y="400"
        fontSize="36"
        fontWeight="600"
        fill="#FCD34D"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        AI-powered vehicle sound diagnostics
      </SvgText>
      
      {/* Decorative glow lines */}
      <Path
        d="M 100 250 L 924 250"
        stroke="#FCD34D"
        strokeWidth="1"
        opacity="0.2"
      />
    </Svg>
  );
};
