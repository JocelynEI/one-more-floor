import { memo } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import type { PassengerType } from '../../game/types';

export type Mood = 'happy' | 'calm' | 'worried' | 'angry';

const SKIN = ['#F3D5B5', '#E3B48C', '#C98F63', '#94603F', '#5E3B25'];
const SHIRTS = ['#6C7A96', '#8E6CC0', '#4F9D8C', '#C0746C', '#5A87C8', '#B0925A', '#7F8C5A'];
const HAIR = ['#2B2118', '#5A3A22', '#C9A06A', '#1E1E24', '#7A4A2A'];
const PANTS = '#2A3244';

export function moodFor(patienceRatio: number): Mood {
  if (patienceRatio > 0.7) return 'happy';
  if (patienceRatio > 0.4) return 'calm';
  if (patienceRatio > 0.18) return 'worried';
  return 'angry';
}

interface FigureProps {
  type: PassengerType;
  look: number;
  mood: Mood;
  height: number;
}

/** Width/height ratio of each silhouette, so layouts can reserve the right space. */
export function figureAspect(type: PassengerType): number {
  if (type === 'group') return 1.25;
  if (type === 'delivery') return 1.05;
  return 0.72;
}

/**
 * Original geometric characters. Type is readable from silhouette and prop
 * (crown, parcel, cane, camera, duo), never from colour alone.
 */
export const PassengerFigure = memo(function PassengerFigure({ type, look, mood, height }: FigureProps) {
  const aspect = figureAspect(type);
  const width = height * aspect;
  const viewWidth = 40 * aspect;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${viewWidth} 40`}>
      {type === 'group' ? (
        <>
          <G transform="translate(-2 3) scale(0.9)">
            <Person look={look} mood={mood} variant="standard" />
          </G>
          <G transform="translate(20 1) scale(0.95)">
            <Person look={look + 3} mood={mood} variant="standard" />
          </G>
        </>
      ) : (
        <Person look={look} mood={mood} variant={type} />
      )}
    </Svg>
  );
});

interface PersonProps {
  look: number;
  mood: Mood;
  variant: Exclude<PassengerType, 'group'>;
}

function Person({ look, mood, variant }: PersonProps) {
  const skin = SKIN[look % SKIN.length];
  const hair = variant === 'senior' ? '#D9DDE3' : HAIR[(look >> 3) % HAIR.length];
  const shirt = variant === 'vip' ? '#1E2433' : variant === 'tourist' ? '#FF9F5A' : SHIRTS[(look >> 5) % SHIRTS.length];
  const hairStyle = (look >> 7) % 3;
  const lean = variant === 'senior' ? 'rotate(4 14 30)' : undefined;
  return (
    <G transform={lean}>
      <Rect x="9" y="29" width="4.2" height="10" rx="2" fill={PANTS} />
      <Rect x="14.8" y="29" width="4.2" height="10" rx="2" fill={PANTS} />
      <Rect x="7" y="16" width="14" height="15" rx="5" fill={shirt} />
      {variant === 'vip' ? <Path d="M14 17l-1.4 2.4L14 27l1.4-7.6z" fill="#FFD45A" /> : null}
      {variant === 'tourist' ? <Camera /> : null}
      <Circle cx="14" cy="10" r="6.2" fill={skin} />
      <Hair style={hairStyle} color={hair} variant={variant} />
      <Face mood={mood} />
      {variant === 'vip' ? <Path d="M8.5 3.8l1.6 2.4L14 3l3.9 3.2 1.6-2.4-.6 4H9.1z" fill="#FFD45A" /> : null}
      {variant === 'delivery' ? <Parcel /> : null}
      {variant === 'senior' ? <Path d="M23.5 39V23.5a2.5 2.5 0 0 0-5 0" stroke="#C9A36A" strokeWidth={1.8} fill="none" strokeLinecap="round" /> : null}
    </G>
  );
}

function Hair({ style, color, variant }: { style: number; color: string; variant: PersonProps['variant'] }) {
  if (variant === 'delivery') {
    return (
      <>
        <Path d="M7.6 8.6a6.4 6.4 0 0 1 12.8 0z" fill="#E86A3C" />
        <Rect x="17" y="7.6" width="6" height="2" rx="1" fill="#E86A3C" />
      </>
    );
  }
  if (variant === 'tourist') {
    return <Path d="M6 8.4h16l-2.4-4.6a5.8 5.8 0 0 0-11.2 0z" fill="#F7F9FC" />;
  }
  if (style === 0) return <Path d="M7.8 9.5a6.2 6.2 0 0 1 12.4 0c-2-1.8-4.5-2.2-6.2-2.2S9.8 7.7 7.8 9.5z" fill={color} />;
  if (style === 1) return <Path d="M7.6 10.5a6.4 6.4 0 1 1 12.8 0l-1-2.4c-1.8-.6-5.4-.6-6.6-2.4-1.2 1.6-3 2.2-5.2 4.8z" fill={color} />;
  return <Path d="M7.4 12.5V9.4a6.6 6.6 0 0 1 13.2 0v3.1c-.6-2.6-1.4-4-2.4-4.6-2.6.8-5.8.8-8.4 0-1 .6-1.8 2-2.4 4.6z" fill={color} />;
}

function Face({ mood }: { mood: Mood }) {
  const eyeY = mood === 'angry' ? 10.4 : 10;
  return (
    <>
      <Circle cx="11.6" cy={eyeY} r="0.95" fill="#1B1F2A" />
      <Circle cx="16.4" cy={eyeY} r="0.95" fill="#1B1F2A" />
      {mood === 'angry' ? <Path d="M10.2 8.2l2.6 1M17.8 8.2l-2.6 1" stroke="#1B1F2A" strokeWidth={1} strokeLinecap="round" /> : null}
      <Path d={MOUTHS[mood]} stroke="#1B1F2A" strokeWidth={1} strokeLinecap="round" fill="none" />
    </>
  );
}

const MOUTHS: Record<Mood, string> = {
  happy: 'M11.8 12.8q2.2 2 4.4 0',
  calm: 'M12.2 13.4h3.6',
  worried: 'M12 14q2-1.3 4 0',
  angry: 'M11.8 14.4q2.2-2 4.4 0',
};

function Parcel() {
  return (
    <G>
      <Rect x="19" y="20" width="14" height="12" rx="1.5" fill="#C8955A" />
      <Rect x="25" y="20" width="2.2" height="12" fill="#F3E2BF" />
      <Rect x="19" y="24.6" width="14" height="1.6" fill="#A87842" />
    </G>
  );
}

function Camera() {
  return (
    <G>
      <Rect x="10" y="21" width="8" height="5.6" rx="1.2" fill="#2A3244" />
      <Circle cx="14" cy="23.8" r="1.7" fill="#9FD8FF" />
    </G>
  );
}
