'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Copy,
  Link as LinkIcon,
  Metronome,
  MusicNotes,
  Radio,
  ShareNetwork,
  Users,
  Waveform,
} from '@phosphor-icons/react';
import {
  Avatar,
  Badge,
  Button,
  Collapse,
  Count,
  Divider,
  Popover,
  Roll,
  Row,
  Segmented,
  Stage,
  Window,
  useLook,
} from '@/components/stageshow/kit';
import type { Act } from '@/components/stageshow/kit';

type ChordId = 'Am7' | 'Fmaj7' | 'C' | 'G6';

interface ChordShape {
  id: ChordId;
  name: string;
  formula: string;
  notes: string[];
  frets: number[]; // 6 strings: E A D G B e (-1 = muted, 0 = open)
}

const CHORDS: Record<ChordId, ChordShape> = {
  Am7: {
    id: 'Am7',
    name: 'A Minor 7',
    formula: '1 · ♭3 · 5 · ♭7',
    notes: ['A', 'C', 'E', 'G'],
    frets: [-1, 0, 2, 0, 1, 0],
  },
  Fmaj7: {
    id: 'Fmaj7',
    name: 'F Major 7',
    formula: '1 · 3 · 5 · 7',
    notes: ['F', 'A', 'C', 'E'],
    frets: [-1, -1, 3, 2, 1, 0],
  },
  C: {
    id: 'C',
    name: 'C Major',
    formula: '1 · 3 · 5',
    notes: ['C', 'E', 'G'],
    frets: [-1, 3, 2, 0, 1, 0],
  },
  G6: {
    id: 'G6',
    name: 'G Major 6',
    formula: '1 · 3 · 5 · 6',
    notes: ['G', 'B', 'D', 'E'],
    frets: [3, 2, 0, 0, 0, 0],
  },
};

const CHORD_ORDER: ChordId[] = ['Am7', 'Fmaj7', 'C', 'G6'];

interface JamSceneState {
  activeChord: ChordId;
  bpm: number;
  feel: '4/4' | '3/4';
  inviteOpen: boolean;
  copied: boolean;
  syncDetailsOpen: boolean;
  devonChord: ChordId;
  shareOrigin: { left: number; top: number };
}

const INITIAL_SCENE: JamSceneState = {
  activeChord: 'Am7',
  bpm: 118,
  feel: '4/4',
  inviteOpen: false,
  copied: false,
  syncDetailsOpen: false,
  devonChord: 'Am7',
  shareOrigin: { left: 560, top: 82 },
};

const BANDMATES = [
  { name: 'Tejas', role: 'Host · Lead Strat', tone: 'accent' as const },
  { name: 'Maya', role: 'Acoustic Rhythm', tone: 'person' as const },
  { name: 'Devon', role: 'Warm P-Bass', tone: 'person' as const },
];

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

async function runJamScript(a: Act<JamSceneState>) {
  a.mark('intro');
  await a.snap(INITIAL_SCENE);
  await a.wait(650);

  a.mark('select-chord');
  await a.enter('chord-Fmaj7');
  await a.wait(180);
  await a.click('chord-Fmaj7');
  await a.set({ activeChord: 'Fmaj7' });
  await a.wait(420);
  await a.set({ devonChord: 'Fmaj7' });
  await a.wait(550);

  a.mark('tempo-shift');
  await a.click('bpm-up');
  await a.set({ bpm: 122 });
  await a.wait(280);
  await a.click('chord-G6');
  await a.set({ activeChord: 'G6', devonChord: 'G6' });
  await a.wait(550);

  a.mark('share-room');
  await a.move('share-btn');
  const btnRect = a.rect('share-btn');
  const isCompactStage = btnRect.x + btnRect.width < 480;
  const popWidth = isCompactStage ? 236 : 264;
  await a.click('share-btn');
  await a.set({
    inviteOpen: true,
    shareOrigin: {
      left: Math.max(16, btnRect.x + btnRect.width - popWidth),
      top: btnRect.y + btnRect.height + 8,
    },
  });
  await a.wait(480);

  await a.click('copy-invite');
  await a.set({ copied: true });
  await a.wait(1100);

  await a.click('close-invite');
  await a.set({ inviteOpen: false });
  await a.wait(320);

  a.mark('sync-telemetry');
  await a.click('sync-toggle');
  await a.set({ syncDetailsOpen: true });
  await a.wait(1100);

  await a.click('chord-C');
  await a.set({ activeChord: 'C', devonChord: 'C' });
  await a.wait(1400);

  await a.set({ syncDetailsOpen: false, copied: false });
  await a.wait(500);
}

function JamStageContent({ s }: { s: JamSceneState }) {
  const { layout } = useLook();
  const compact = layout === 'compact';
  const [hoverManualChord, setHoverManualChord] = useState<ChordId | null>(null);

  const displayChord = hoverManualChord ?? s.activeChord;
  const chord = CHORDS[displayChord];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6">
      {/* Ambient warm rosewood/amber glow anchored behind window */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 24%, rgba(212, 173, 97, 0.11), transparent 58%), radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.06), transparent 48%)',
        }}
      />

      <Window
        url="fretboard.app/jam/JAM-8402"
        title="Fretboard Jamroom"
        style={{
          width: compact ? 378 : 836,
          height: compact ? 542 : 484,
        }}
      >
        <div className="flex flex-col h-full text-[var(--ss-text-strong)]">
          {/* Top Studio Toolbar */}
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--ss-line)] bg-[var(--ss-chrome)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Badge tone="success" dot>
                Live · 14 ms
              </Badge>
              <span className="text-[12px] font-medium text-[var(--ss-text-strong)] truncate">
                Late Night Progression
              </span>
              {!compact && (
                <span className="text-[11px] font-mono text-[var(--ss-text-faint)]">
                  #JAM-8402
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!compact && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--ss-line)] bg-[var(--ss-surface)]">
                  <Metronome size={12} className="text-[#D4AD61]" />
                  <span className="text-[12px] font-mono font-semibold text-[var(--ss-text-strong)]">
                    <Count value={s.bpm} /> BPM
                  </span>
                  <button
                    type="button"
                    data-target="bpm-up"
                    className="ml-1 px-1.5 py-0.5 rounded bg-[var(--ss-ink-2)] hover:bg-[var(--ss-ink-3)] text-[10px] font-mono text-[#D4AD61] transition-colors cursor-pointer"
                  >
                    +4
                  </button>
                </div>
              )}

              <Button
                data-target="sync-toggle"
                variant="ghost"
                size="small"
                icon={<Waveform size={13} />}
              >
                Sync
              </Button>

              <Button
                data-target="share-btn"
                variant="primary"
                size="small"
                icon={<ShareNetwork size={13} weight="bold" />}
              >
                Share Room
              </Button>
            </div>
          </div>

          {/* Main Split Studio Workspace */}
          <div
            className={`flex-1 min-h-0 grid ${
              compact ? 'grid-cols-1' : 'grid-cols-[240px_1fr]'
            }`}
          >
            {/* Left Sidebar: Active Musicians (desktop/tablet) */}
            {!compact && (
              <aside className="border-r border-[var(--ss-line)] bg-[var(--ss-well)] p-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--ss-text-faint)]">
                      Bandmates (3)
                    </span>
                    <Users size={13} className="text-[var(--ss-text-faint)]" />
                  </div>

                  <div className="space-y-1">
                    {BANDMATES.map((member, idx) => {
                      const followingChord =
                        idx < 2 ? displayChord : s.devonChord;
                      return (
                        <Row
                          key={member.name}
                          pad={8}
                          selected={idx === 0}
                          lead={
                            <Avatar
                              name={member.name}
                              size={26}
                              tone={member.tone}
                              ring="confirmed"
                            />
                          }
                          title={member.name}
                          subtitle={member.role}
                          meta={
                            <span className="text-[10px] font-mono font-semibold text-[#D4AD61]">
                              {followingChord}
                            </span>
                          }
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Collapsible Sync Telemetry Drawer */}
                <div className="pt-2 border-t border-[var(--ss-line)]">
                  <Collapse open={s.syncDetailsOpen} reveal="clip">
                    <div className="p-2.5 rounded-lg bg-[var(--ss-surface)] border border-[var(--ss-line)] space-y-1.5 mb-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--ss-text)]">WebRTC Mesh</span>
                        <span className="font-mono text-emerald-400">Locked</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--ss-text)]">Jitter Buffer</span>
                        <span className="font-mono text-[var(--ss-text-strong)]">4.2 ms</span>
                      </div>
                    </div>
                  </Collapse>

                  <div className="flex items-center justify-between px-1 text-[11px] text-[var(--ss-text)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Radio size={12} className="text-[#D4AD61]" />
                      Clock Master
                    </span>
                    <span className="font-mono text-[10px] text-[var(--ss-text-faint)]">
                      {s.feel}
                    </span>
                  </div>
                </div>
              </aside>
            )}

            {/* Center Stage: Live Chord & Fretboard Mirror */}
            <main className="p-4 sm:p-5 flex flex-col justify-between gap-4 bg-[var(--ss-surface)] min-w-0">
              {/* Chord Progression Strip + Meter */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--ss-well)] border border-[var(--ss-line)]">
                  {CHORD_ORDER.map((id) => {
                    const active = displayChord === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        data-target={`chord-${id}`}
                        onMouseEnter={() => setHoverManualChord(id)}
                        onMouseLeave={() => setHoverManualChord(null)}
                        className={`px-3 py-1 rounded-md text-[12px] font-mono font-semibold transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#D4AD61] text-[#0C0A09] shadow-sm'
                            : 'text-[var(--ss-text)] hover:text-[var(--ss-text-strong)]'
                        }`}
                      >
                        {id}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <Segmented
                    value={s.feel === '4/4' ? 0 : 1}
                    items={['4/4', '3/4']}
                  />
                  {compact && (
                    <span
                      data-target="bpm-up"
                      className="px-2 py-1 rounded-md bg-[var(--ss-well)] border border-[var(--ss-line)] text-[11px] font-mono text-[#D4AD61]"
                    >
                      <Count value={s.bpm} /> BPM
                    </span>
                  )}
                </div>
              </div>

              {/* Active Sounding Voicing Banner */}
              <div className="rounded-xl border border-[var(--ss-line)] bg-[var(--ss-well)] px-4 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#D4AD61] mb-1">
                    Synchronized Voicing
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl font-bold tracking-tight text-[var(--ss-text-strong)]">
                      <Roll variant="fade">{chord.id}</Roll>
                    </span>
                    <span className="text-xs text-[var(--ss-text)] truncate">
                      <Roll variant="fade">{chord.name}</Roll>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {chord.notes.map((note) => (
                    <span
                      key={note}
                      className="w-7 h-7 rounded-md bg-[var(--ss-surface)] border border-[var(--ss-line)] flex items-center justify-center text-[11px] font-mono font-semibold text-[#E9D8B7]"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Live Synchronized Fretboard Grid */}
              <div className="rounded-xl border border-[var(--ss-line)] bg-[#1B1312] p-3.5 sm:p-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#A8A29E]/80 mb-2.5">
                  <span>FRETS 1 — 5</span>
                  <span className="text-[#D4AD61]">{chord.formula}</span>
                </div>

                <div className="space-y-2 relative">
                  {/* Vertical fret wires */}
                  <div className="absolute inset-y-0 left-7 right-1 grid grid-cols-5 pointer-events-none">
                    {[1, 2, 3, 4, 5].map((f) => (
                      <div
                        key={f}
                        className="border-r border-white/10 h-full last:border-r-0"
                      />
                    ))}
                  </div>

                  {STRING_LABELS.slice()
                    .reverse()
                    .map((label, revIdx) => {
                      const stringIdx = 5 - revIdx;
                      const fret = chord.frets[stringIdx];
                      const thickness = 1 + (5 - stringIdx) * 0.25;

                      return (
                        <div
                          key={label}
                          className="relative h-5 flex items-center gap-2"
                        >
                          <span className="w-5 text-[10px] font-mono text-[#A8A29E] text-right shrink-0">
                            {label}
                          </span>

                          <div className="relative flex-1 h-full grid grid-cols-5 items-center">
                            <div
                              className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#D4AD61]/40 via-[#E9D8B7]/35 to-[#D4AD61]/30"
                              style={{ height: `${thickness}px` }}
                            />

                            {[1, 2, 3, 4, 5].map((fretCol) => {
                              const pressed = fret === fretCol;
                              return (
                                <div
                                  key={fretCol}
                                  className="relative z-10 flex items-center justify-center"
                                >
                                  {pressed && (
                                    <span className="w-4 h-4 rounded-full bg-[#D4AD61] text-[#0C0A09] text-[9px] font-mono font-bold flex items-center justify-center shadow-[0_0_12px_rgba(212,173,97,0.7)] transition-transform duration-300 scale-100">
                                      {fretCol}
                                    </span>
                                  )}
                                </div>
                              );
                            })}

                            {fret === 0 && (
                              <span
                                title="Open string"
                                className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-[#D4AD61]"
                              />
                            )}
                            {fret === -1 && (
                              <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[#78716C]">
                                ×
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Compact footer cue */}
              <div className="flex items-center justify-between text-[11px] text-[var(--ss-text)]">
                <span className="inline-flex items-center gap-1.5">
                  <MusicNotes size={13} className="text-[#D4AD61]" />
                  {BANDMATES[1].name} &amp; {BANDMATES[2].name} synced on {chord.id}
                </span>
                <Link
                  href="/jam"
                  className="font-mono text-[11px] text-[#E9D8B7] hover:text-[#D4AD61] transition-colors"
                >
                  Launch Room →
                </Link>
              </div>
            </main>
          </div>
        </div>
      </Window>

      {/* Native Stageshow Popover anchored to Share Room */}
      <Popover
        show={s.inviteOpen}
        origin="top right"
        style={{
          position: 'absolute',
          left: s.shareOrigin.left,
          top: s.shareOrigin.top,
          width: compact ? 236 : 264,
          zIndex: 30,
        }}
      >
        <div className="rounded-xl bg-[var(--ss-raised)] border border-[var(--ss-line)] p-3.5 shadow-[var(--ss-shadow-float)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#D4AD61]">
              Invite Link
            </span>
            <button
              type="button"
              data-target="close-invite"
              className="text-[11px] font-mono text-[var(--ss-text-faint)] hover:text-[var(--ss-text-strong)] cursor-pointer"
            >
              Esc
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-[var(--ss-well)] border border-[var(--ss-line)]">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--ss-text-strong)] truncate">
              <LinkIcon size={12} className="text-[#D4AD61] shrink-0" />
              fretboard.app/jam/8402
            </span>
          </div>

          <Divider />

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-[var(--ss-text)]">
              Low-latency P2P active
            </span>
            <Button
              data-target="copy-invite"
              variant={s.copied ? 'secondary' : 'primary'}
              size="small"
              icon={s.copied ? <Check size={12} weight="bold" /> : <Copy size={12} />}
            >
              {s.copied ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
}

export default function MacBookShowcase() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="rounded-[24px] p-1.5 sm:p-2.5 bg-white/[0.02] border border-white/[0.07] shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        <Stage<JamSceneState>
          width={900}
          height={540}
          compact={{ below: 640, width: 410, height: 590 }}
          theme="dark"
          initial={INITIAL_SCENE}
          script={runJamScript}
          className="rounded-[18px] overflow-hidden fretboard-jam-stage"
        >
          {(s) => <JamStageContent s={s} />}
        </Stage>
      </div>
    </div>
  );
}
