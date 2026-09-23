import { memo } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'play'
  | 'pause'
  | 'settings'
  | 'trophy'
  | 'lift'
  | 'help'
  | 'back'
  | 'home'
  | 'replay'
  | 'coin'
  | 'check'
  | 'lock'
  | 'sound'
  | 'music'
  | 'vibration'
  | 'motion'
  | 'globe'
  | 'shield'
  | 'info'
  | 'crown'
  | 'box'
  | 'cane'
  | 'camera'
  | 'duo'
  | 'up'
  | 'down'
  | 'bolt'
  | 'wrench'
  | 'users'
  | 'star'
  | 'leaf'
  | 'spark'
  | 'expand'
  | 'trash';

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

/** Original stroke icon set on a 24 px grid. */
export const Icon = memo(function Icon({ name, size = 24, color, strokeWidth = 2 }: IconProps) {
  const stroke = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const fill = { fill: color };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderShape(name, stroke, fill)}
    </Svg>
  );
});

type StrokeProps = {
  stroke: string;
  strokeWidth: number;
  strokeLinecap: 'round';
  strokeLinejoin: 'round';
  fill: string;
};

function renderShape(name: IconName, s: StrokeProps, f: { fill: string }) {
  switch (name) {
    case 'play':
      return <Path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" {...f} />;
    case 'pause':
      return (
        <>
          <Rect x="6" y="5" width="4" height="14" rx="1.2" {...f} />
          <Rect x="14" y="5" width="4" height="14" rx="1.2" {...f} />
        </>
      );
    case 'settings':
      return (
        <>
          <Circle cx="12" cy="12" r="3.2" {...s} />
          <Path
            d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2L5.5 5.5"
            {...s}
          />
          <Circle cx="12" cy="12" r="6.6" {...s} />
        </>
      );
    case 'trophy':
      return (
        <>
          <Path d="M7 4h10v5a5 5 0 0 1-10 0V4z" {...s} />
          <Path d="M7 6H4.5v1.5A3.5 3.5 0 0 0 8 11M17 6h2.5v1.5A3.5 3.5 0 0 1 16 11M12 14v4M8.5 20.5h7" {...s} />
        </>
      );
    case 'lift':
      return (
        <>
          <Rect x="4" y="3" width="16" height="18" rx="2.5" {...s} />
          <Path d="M12 7v14M8 9.5l1.5-2 1.5 2M13 7.5l1.5 2 1.5-2" {...s} />
        </>
      );
    case 'help':
      return (
        <>
          <Circle cx="12" cy="12" r="9" {...s} />
          <Path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.24c-.7.35-1.1.9-1.1 1.66V14" {...s} />
          <Circle cx="12" cy="17.2" r="1.1" {...f} />
        </>
      );
    case 'back':
      return <Path d="M15 5l-7 7 7 7" {...s} />;
    case 'home':
      return <Path d="M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19.5V11z" {...s} />;
    case 'replay':
      return (
        <>
          <Path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" {...s} />
          <Path d="M4 4v4.5h4.5" {...s} />
        </>
      );
    case 'coin':
      return (
        <>
          <Circle cx="12" cy="12" r="9" {...f} />
          <Path d="M12 7.5v9M9.8 9.3h3.4a1.6 1.6 0 0 1 0 3.2h-2.4a1.6 1.6 0 0 0 0 3.2h3.4" stroke="#6B4E00" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </>
      );
    case 'check':
      return <Path d="M5 12.5l4.5 4.5L19 7.5" {...s} />;
    case 'lock':
      return (
        <>
          <Rect x="5" y="10.5" width="14" height="10" rx="2.5" {...s} />
          <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...s} />
        </>
      );
    case 'sound':
      return (
        <>
          <Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" {...s} />
          <Path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" {...s} />
        </>
      );
    case 'music':
      return (
        <>
          <Path d="M9 18V6l10-2v12" {...s} />
          <Circle cx="6.5" cy="18" r="2.5" {...s} />
          <Circle cx="16.5" cy="16" r="2.5" {...s} />
        </>
      );
    case 'vibration':
      return (
        <>
          <Rect x="7.5" y="3.5" width="9" height="17" rx="2" {...s} />
          <Path d="M4 8.5v7M20 8.5v7" {...s} />
        </>
      );
    case 'motion':
      return (
        <>
          <Circle cx="15" cy="12" r="5" {...s} />
          <Path d="M3 8h5M2 12h6M3 16h5" {...s} />
        </>
      );
    case 'globe':
      return (
        <>
          <Circle cx="12" cy="12" r="9" {...s} />
          <Path d="M3 12h18M12 3c2.5 2.6 3.6 5.6 3.6 9s-1.1 6.4-3.6 9c-2.5-2.6-3.6-5.6-3.6-9S9.5 5.6 12 3z" {...s} />
        </>
      );
    case 'shield':
      return (
        <>
          <Path d="M12 3l7.5 3v5.5c0 4.4-3.1 8.2-7.5 9.5-4.4-1.3-7.5-5.1-7.5-9.5V6z" {...s} />
          <Path d="M9 12l2.2 2.2L15.5 10" {...s} />
        </>
      );
    case 'info':
      return (
        <>
          <Circle cx="12" cy="12" r="9" {...s} />
          <Path d="M12 11v5.5" {...s} />
          <Circle cx="12" cy="7.8" r="1.1" {...f} />
        </>
      );
    case 'crown':
      return <Path d="M4 17.5L3 8l5 3.5L12 5l4 6.5L21 8l-1 9.5z" {...f} />;
    case 'box':
      return (
        <>
          <Rect x="4" y="7" width="16" height="13" rx="1.5" {...s} />
          <Path d="M4 11h16M10 7v4M14 7v4" {...s} />
        </>
      );
    case 'cane':
      return <Path d="M9 21V8.5a3.5 3.5 0 0 1 7 0V10" {...s} />;
    case 'camera':
      return (
        <>
          <Rect x="3.5" y="7" width="17" height="12" rx="2.5" {...s} />
          <Path d="M9 7l1.5-2.5h3L15 7" {...s} />
          <Circle cx="12" cy="13" r="3" {...s} />
        </>
      );
    case 'duo':
      return (
        <>
          <Circle cx="8.5" cy="8" r="3" {...s} />
          <Circle cx="16" cy="9" r="2.6" {...s} />
          <Path d="M3 19.5a5.5 5.5 0 0 1 11 0M13.5 19.5a4.2 4.2 0 0 1 7.5-2.6" {...s} />
        </>
      );
    case 'up':
      return <Path d="M12 5l7 8h-4.5v6h-5v-6H5z" {...f} />;
    case 'down':
      return <Path d="M12 19l-7-8h4.5V5h5v6H19z" {...f} />;
    case 'bolt':
      return <Path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" {...f} />;
    case 'wrench':
      return <Path d="M14.5 4a5 5 0 0 0-4.7 6.7L4 16.5 7.5 20l5.8-5.8A5 5 0 0 0 20 9.5l-3 3-3.5-1-1-3.5 3-3a5 5 0 0 0-1-1z" {...s} />;
    case 'users':
      return (
        <>
          <Circle cx="9" cy="8" r="3.2" {...s} />
          <Path d="M3 20a6 6 0 0 1 12 0M16 4.8a3.2 3.2 0 0 1 0 6.4M18 14.5a6 6 0 0 1 3 5.5" {...s} />
        </>
      );
    case 'star':
      return <Path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" {...f} />;
    case 'leaf':
      return (
        <>
          <Path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z" {...s} />
          <Path d="M5 19l7-7" {...s} />
        </>
      );
    case 'spark':
      return <Path d="M12 2.5l1.8 6.2 6.2 1.8-6.2 1.8L12 18.5l-1.8-6.2L4 10.5l6.2-1.8z" {...f} />;
    case 'expand':
      return (
        <>
          <Rect x="4" y="4" width="16" height="16" rx="2.5" {...s} />
          <Path d="M12 8.5v7M8.5 12h7" {...s} />
        </>
      );
    case 'trash':
      return (
        <>
          <Path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" {...s} />
        </>
      );
  }
}
