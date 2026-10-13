#!/usr/bin/env python3
"""Synthesizes every sound of TOWER DING into assets/audio/.

All audio is generated from scratch by this script (no samples), so it is original and
free of third-party rights. Run: python3 scripts/generate_audio.py
"""
import math
import os
import random
import struct
import wave

RATE = 22050
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio')


def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    pitch, octave = name[:-1], int(name[-1])
    semitones = names[pitch] + (octave - 4) * 12 - 9
    return 440.0 * 2 ** (semitones / 12)


def silence(seconds):
    return [0.0] * int(seconds * RATE)


def mix_into(buffer, samples, start_seconds, gain=1.0, wrap=False):
    start = int(start_seconds * RATE)
    for i, value in enumerate(samples):
        index = start + i
        if wrap:
            index %= len(buffer)
        elif index >= len(buffer):
            break
        buffer[index] += value * gain


def tone(freq, seconds, shape='sine', attack=0.004, decay=None, freq_end=None, vibrato=0.0):
    total = int(seconds * RATE)
    out = []
    phase = 0.0
    for i in range(total):
        t = i / RATE
        progress = i / max(1, total - 1)
        f = freq if freq_end is None else freq + (freq_end - freq) * progress
        if vibrato:
            f *= 1 + vibrato * math.sin(2 * math.pi * 5.5 * t)
        phase += 2 * math.pi * f / RATE
        if shape == 'sine':
            value = math.sin(phase)
        elif shape == 'triangle':
            value = 2 / math.pi * math.asin(math.sin(phase))
        else:
            value = math.sin(phase) + 0.25 * math.sin(2 * phase) + 0.1 * math.sin(3 * phase)
        env = min(1.0, t / attack) if attack > 0 else 1.0
        if decay:
            env *= math.exp(-t / decay)
        release = min(1.0, (total - i) / (0.01 * RATE))
        out.append(value * env * release)
    return out


def bell(freq, seconds, decay=0.25, brightness=0.35):
    partials = [(1.0, 1.0, 1.0), (2.76, brightness, 0.6), (5.4, brightness * 0.4, 0.35)]
    out = silence(seconds)
    for ratio, gain, decay_ratio in partials:
        mix_into(out, tone(freq * ratio, seconds, 'sine', attack=0.002, decay=decay * decay_ratio), 0, gain)
    return out


def noise(seconds, cutoff=0.1, attack=0.01, decay=None, swell=False, seed=1):
    rng = random.Random(seed)
    total = int(seconds * RATE)
    out = []
    low = 0.0
    for i in range(total):
        t = i / RATE
        low += cutoff * (rng.uniform(-1, 1) - low)
        if swell:
            env = math.sin(math.pi * i / total)
        else:
            env = min(1.0, t / attack)
            if decay:
                env *= math.exp(-t / decay)
        out.append(low * env)
    return out


def normalize(samples, peak=0.85):
    top = max(1e-9, max(abs(v) for v in samples))
    return [v * peak / top for v in samples]


def lowpass(samples, cutoff):
    out, low = [], 0.0
    for value in samples:
        low += cutoff * (value - low)
        out.append(low)
    return out


def write(name, samples, peak=0.85):
    samples = normalize(samples, peak)
    path = os.path.join(OUT, name + '.wav')
    with wave.open(path, 'wb') as file:
        file.setnchannels(1)
        file.setsampwidth(2)
        file.setframerate(RATE)
        file.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, v)) * 32767)) for v in samples))
    print('wrote', path)


def arpeggio(notes, step, length, decay=0.18, brightness=0.3):
    out = silence(step * (len(notes) - 1) + length)
    for i, n in enumerate(notes):
        mix_into(out, bell(note(n), length, decay, brightness), i * step)
    return out


def ui_sounds():
    write('ui_tap', tone(1250, 0.06, 'sine', attack=0.001, decay=0.018, freq_end=950), 0.6)
    back = silence(0.12)
    mix_into(back, tone(880, 0.06, 'sine', attack=0.001, decay=0.02), 0)
    mix_into(back, tone(660, 0.07, 'sine', attack=0.001, decay=0.025), 0.045)
    write('ui_back', back, 0.55)
    coins = silence(0.32)
    mix_into(coins, bell(note('B6'), 0.2, 0.06, 0.5), 0)
    mix_into(coins, bell(note('E7'), 0.25, 0.08, 0.5), 0.07)
    write('coins', coins, 0.6)


def elevator_sounds():
    depart = noise(0.42, cutoff=0.05, swell=True, seed=3)
    mix_into(depart, tone(95, 0.42, 'triangle', attack=0.08, freq_end=150), 0, 0.25)
    write('depart', depart, 0.5)
    write('arrive', bell(note('A5'), 0.9, decay=0.35, brightness=0.28), 0.6)
    doors = noise(0.2, cutoff=0.22, swell=True, seed=5)
    write('doors', lowpass(doors, 0.3), 0.4)


def passenger_sounds():
    write('board', tone(520, 0.09, 'sine', attack=0.002, decay=0.04, freq_end=820), 0.55)
    deliver = silence(0.36)
    mix_into(deliver, bell(note('E6'), 0.2, 0.07, 0.3), 0)
    mix_into(deliver, bell(note('B6'), 0.3, 0.1, 0.3), 0.06)
    write('deliver', deliver, 0.6)
    lost = tone(240, 0.28, 'triangle', attack=0.004, decay=0.1, freq_end=150)
    mix_into(lost, noise(0.08, cutoff=0.2, decay=0.03, seed=9), 0, 0.3)
    write('lost', lost, 0.6)


def feedback_sounds():
    write('combo', arpeggio(['C6', 'E6', 'G6', 'C7'], 0.055, 0.3, decay=0.12, brightness=0.35), 0.7)
    sparkle = silence(0.6)
    rng = random.Random(4)
    for i, n in enumerate(['G6', 'D7', 'B6', 'G7', 'E7']):
        mix_into(sparkle, bell(note(n), 0.3, 0.08, 0.5), i * 0.05 + rng.uniform(0, 0.01), 0.7)
    write('callout', sparkle, 0.65)
    warning = silence(0.34)
    mix_into(warning, tone(note('A4'), 0.12, 'triangle', attack=0.01, decay=0.08), 0)
    mix_into(warning, tone(note('F4'), 0.14, 'triangle', attack=0.01, decay=0.09), 0.16)
    write('warning', warning, 0.55)
    write('event', arpeggio(['G5', 'C6', 'E6'], 0.09, 0.45, decay=0.2, brightness=0.25), 0.6)
    upgrade = silence(0.8)
    mix_into(upgrade, noise(0.5, cutoff=0.4, swell=True, seed=12), 0, 0.15)
    mix_into(upgrade, arpeggio(['C6', 'G6', 'E7'], 0.07, 0.55, decay=0.22, brightness=0.35), 0.1)
    write('upgrade', upgrade, 0.65)
    over = silence(1.5)
    for i, n in enumerate(['E5', 'C5', 'A4', 'E4']):
        mix_into(over, tone(note(n), 0.6, 'soft', attack=0.01, decay=0.3), i * 0.18, 0.8)
    write('game_over', lowpass(over, 0.35), 0.6)
    record = silence(1.8)
    for i, n in enumerate(['C5', 'E5', 'G5', 'C6']):
        mix_into(record, bell(note(n), 0.5, 0.18, 0.3), i * 0.09)
    for n in ['C6', 'E6', 'G6']:
        mix_into(record, tone(note(n), 1.2, 'soft', attack=0.03, decay=0.5, vibrato=0.004), 0.4, 0.4)
    write('new_record', record, 0.7)


def music_loop():
    """96 BPM, 8 bars, Fmaj7 - Em7 - Dm7 - Cmaj7, soft enough to sit under gameplay for hours."""
    beat = 60 / 96
    bar = beat * 4
    length = bar * 8
    buffer = silence(length)
    chords = [
        (['F3', 'A3', 'C4', 'E4'], 'F2'),
        (['E3', 'G3', 'B3', 'D4'], 'E2'),
        (['D3', 'F3', 'A3', 'C4'], 'D2'),
        (['C3', 'E3', 'G3', 'B3'], 'C2'),
    ]
    melody = ['A4', 'C5', 'E5', 'C5', 'G4', 'B4', 'D5', 'B4', 'F4', 'A4', 'C5', 'A4', 'E4', 'G4', 'B4', 'G4']
    for index, (pad_notes, root) in enumerate(chords):
        start = index * bar * 2
        for n in pad_notes:
            mix_into(buffer, tone(note(n), bar * 2 + 0.6, 'triangle', attack=0.5, decay=2.2), start, 0.09, wrap=True)
        for b in range(4):
            mix_into(buffer, tone(note(root), beat * 1.6, 'sine', attack=0.01, decay=0.5), start + b * beat * 2, 0.32, wrap=True)
        for step in range(16):
            n = melody[(index * 4 + step) % len(melody)]
            if step % 4 == 3:
                continue
            mix_into(buffer, bell(note(n), 0.45, 0.14, 0.18), start + step * beat / 2, 0.07, wrap=True)
    for step in range(int(length / (beat / 2))):
        accent = 1.0 if step % 2 == 0 else 0.6
        mix_into(buffer, noise(0.05, cutoff=0.9, decay=0.012, seed=100 + step), step * beat / 2, 0.035 * accent, wrap=True)
    write('music_loop', lowpass(buffer, 0.55), 0.7)


def city_ambience():
    """Low city rumble with a seamless loop point (crossfaded tail)."""
    seconds, fade = 10.0, 1.0
    body = noise(seconds + fade, cutoff=0.015, attack=0.0001, seed=77)
    total, overlap = int(seconds * RATE), int(fade * RATE)
    loop = body[:total]
    for i in range(overlap):
        mix = i / overlap
        loop[i] = loop[i] * mix + body[total + i] * (1 - mix)
    write('city_ambience', loop, 0.35)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    ui_sounds()
    elevator_sounds()
    passenger_sounds()
    feedback_sounds()
    music_loop()
    city_ambience()
