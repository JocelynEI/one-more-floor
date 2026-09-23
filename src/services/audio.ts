import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioSource } from 'expo-audio';
import { reportError } from './log';

export type SoundCategory = 'music' | 'ambience' | 'sfx' | 'ui';

export type SoundName =
  | 'uiTap'
  | 'uiBack'
  | 'depart'
  | 'arrive'
  | 'doors'
  | 'board'
  | 'deliver'
  | 'combo'
  | 'callout'
  | 'warning'
  | 'lost'
  | 'event'
  | 'upgrade'
  | 'gameOver'
  | 'newRecord'
  | 'coins';

interface SoundSpec {
  source: AudioSource;
  category: SoundCategory;
  /** Relative loudness so layered sounds sit well together. */
  gain: number;
  /** Players kept for this sound, so rapid repeats overlap instead of cutting each other. */
  voices: number;
}

const SOUNDS: Record<SoundName, SoundSpec> = {
  uiTap: { source: require('../../assets/audio/ui_tap.wav'), category: 'ui', gain: 0.5, voices: 2 },
  uiBack: { source: require('../../assets/audio/ui_back.wav'), category: 'ui', gain: 0.45, voices: 1 },
  depart: { source: require('../../assets/audio/depart.wav'), category: 'sfx', gain: 0.35, voices: 2 },
  arrive: { source: require('../../assets/audio/arrive.wav'), category: 'sfx', gain: 0.45, voices: 2 },
  doors: { source: require('../../assets/audio/doors.wav'), category: 'sfx', gain: 0.3, voices: 2 },
  board: { source: require('../../assets/audio/board.wav'), category: 'sfx', gain: 0.4, voices: 3 },
  deliver: { source: require('../../assets/audio/deliver.wav'), category: 'sfx', gain: 0.55, voices: 3 },
  combo: { source: require('../../assets/audio/combo.wav'), category: 'sfx', gain: 0.6, voices: 1 },
  callout: { source: require('../../assets/audio/callout.wav'), category: 'sfx', gain: 0.55, voices: 2 },
  warning: { source: require('../../assets/audio/warning.wav'), category: 'sfx', gain: 0.5, voices: 1 },
  lost: { source: require('../../assets/audio/lost.wav'), category: 'sfx', gain: 0.55, voices: 2 },
  event: { source: require('../../assets/audio/event.wav'), category: 'sfx', gain: 0.5, voices: 1 },
  upgrade: { source: require('../../assets/audio/upgrade.wav'), category: 'sfx', gain: 0.55, voices: 1 },
  gameOver: { source: require('../../assets/audio/game_over.wav'), category: 'sfx', gain: 0.6, voices: 1 },
  newRecord: { source: require('../../assets/audio/new_record.wav'), category: 'sfx', gain: 0.65, voices: 1 },
  coins: { source: require('../../assets/audio/coins.wav'), category: 'ui', gain: 0.5, voices: 1 },
};

const MUSIC_SOURCE: AudioSource = require('../../assets/audio/music_loop.wav');
const AMBIENCE_SOURCE: AudioSource = require('../../assets/audio/city_ambience.wav');
const MUSIC_GAIN = 0.55;
const AMBIENCE_GAIN = 0.35;

interface Voices {
  players: AudioPlayer[];
  next: number;
}

/**
 * Owns every audio player. Players are created lazily and reused, so gameplay never
 * allocates new ones; volumes are applied per category from the settings.
 */
class SoundBoard {
  private voices = new Map<SoundName, Voices>();
  private music: AudioPlayer | null = null;
  private ambience: AudioPlayer | null = null;
  private musicVolume = 0.5;
  private sfxVolume = 0.75;
  private muted = false;
  private wantsMusic = false;

  async configure(): Promise<void> {
    try {
      await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' });
    } catch (error) {
      reportError('audio', error);
    }
  }

  setVolumes(music: number, sfx: number, muted: boolean): void {
    this.musicVolume = music;
    this.sfxVolume = sfx;
    this.muted = muted;
    this.applyBackgroundVolumes();
  }

  play(name: SoundName): void {
    const volume = this.volumeFor(SOUNDS[name]);
    if (volume <= 0) return;
    try {
      const player = this.nextVoice(name);
      player.volume = volume;
      player.seekTo(0).catch((error) => reportError('audio', error));
      player.play();
    } catch (error) {
      reportError('audio', error);
    }
  }

  /** Creates every effect player up front so the first play of each sound has no delay. */
  preload(): void {
    try {
      for (const name of Object.keys(SOUNDS) as SoundName[]) this.nextVoice(name);
    } catch (error) {
      reportError('audio', error);
    }
  }

  /** Background loops start on the first user gesture so browsers allow playback. */
  startBackground(): void {
    if (this.wantsMusic && this.music) return;
    this.wantsMusic = true;
    try {
      this.music ??= this.createLoop(MUSIC_SOURCE);
      this.ambience ??= this.createLoop(AMBIENCE_SOURCE);
      this.applyBackgroundVolumes();
    } catch (error) {
      reportError('audio', error);
    }
  }

  pauseBackground(): void {
    this.music?.pause();
    this.ambience?.pause();
  }

  resumeBackground(): void {
    if (this.wantsMusic) this.applyBackgroundVolumes();
  }

  private createLoop(source: AudioSource): AudioPlayer {
    const player = createAudioPlayer(source);
    player.loop = true;
    return player;
  }

  private applyBackgroundVolumes(): void {
    const loops: [AudioPlayer | null, number][] = [
      [this.music, this.muted ? 0 : this.musicVolume * MUSIC_GAIN],
      [this.ambience, this.muted ? 0 : this.musicVolume * AMBIENCE_GAIN],
    ];
    for (const [player, volume] of loops) {
      if (!player) continue;
      player.volume = volume;
      if (volume > 0 && this.wantsMusic && !player.playing) player.play();
      if (volume === 0 && player.playing) player.pause();
    }
  }

  private volumeFor(spec: SoundSpec): number {
    if (this.muted) return 0;
    const categoryVolume = spec.category === 'music' || spec.category === 'ambience' ? this.musicVolume : this.sfxVolume;
    return spec.gain * categoryVolume;
  }

  private nextVoice(name: SoundName): AudioPlayer {
    let entry = this.voices.get(name);
    if (!entry) {
      const spec = SOUNDS[name];
      entry = { players: Array.from({ length: spec.voices }, () => createAudioPlayer(spec.source)), next: 0 };
      this.voices.set(name, entry);
    }
    const player = entry.players[entry.next];
    entry.next = (entry.next + 1) % entry.players.length;
    return player;
  }
}

export const soundBoard = new SoundBoard();
