'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MusicNotes,
  Plus,
  MagnifyingGlass,
  SpeakerHigh,
  X,
  Check,
  BookmarkSimple,
  FolderSimple,
  Sparkle,
  Trash,
  ArrowRight,
  BookOpen,
} from '@phosphor-icons/react';
import { songs as initialSongs, chords as chordDatabase } from '@/lib/data';
import { guitarAudio } from '@/lib/audio';
import { useStoredState } from '@/lib/use-stored-state';
import type { Chord, Song } from '@/lib/types';

// Standard guitar string base frequencies (E2, A2, D3, G3, B3, E4)
const BASE_FREQS = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

export interface SongCollection {
  id: string;
  name: string;
  description: string;
  songIds: (string | number)[];
  createdAt: string;
}

const DEFAULT_COLLECTIONS: SongCollection[] = [
  {
    id: 'acoustic-warmups',
    name: 'Acoustic Warmups',
    description: 'Gentle fingerstyle and acoustic open chord changes to loosen the fretting hand.',
    songIds: [3, 2], // Wonderwall, Blackbird
    createdAt: 'Default',
  },
  {
    id: 'gig-setlist',
    name: 'Gig Setlist',
    description: 'Performance-ready repertoire pieces and lead improvisation studies.',
    songIds: [1, 4], // Slow Dancing, Little Wing
    createdAt: 'Default',
  },
  {
    id: 'all-favorites',
    name: 'Daily Repertoire',
    description: 'Complete rotating library for consistent daily habit reinforcement.',
    songIds: [1, 2, 3, 4],
    createdAt: 'Default',
  },
];

// Helper to normalize and search chord voicings
function normalizeChordName(str: string): string {
  return str.replace(/♯/g, '#').replace(/♭/g, 'b').trim();
}

function findChordVoicing(symbol: string): Chord | null {
  const clean = normalizeChordName(symbol);
  return (
    chordDatabase.find(
      (c) =>
        normalizeChordName(c.short).toLowerCase() === clean.toLowerCase() ||
        normalizeChordName(c.name).toLowerCase() === clean.toLowerCase()
    ) || null
  );
}

function getChordFrequencies(chord: Chord): number[] {
  return chord.fingers
    .map(([stringIndex, fret]) => {
      if (fret === 'x') return 0;
      return BASE_FREQS[stringIndex] * Math.pow(2, (fret as number) / 12);
    })
    .filter((f) => f > 0);
}

// Derive compatible scales for a song
interface ScaleRecommendation {
  id: string;
  name: string;
  key: string;
  mode: string;
  flavor: string;
  reason: string;
}

function getCompatibleScalesForSong(song: Song): ScaleRecommendation[] {
  const title = song.title.toLowerCase();
  if (title.includes('slow dancing')) {
    return [
      {
        id: 'c-sharp-minor-pentatonic',
        name: 'C♯ Minor Pentatonic',
        key: 'C♯',
        mode: 'Minor Pentatonic',
        flavor: 'Raw & Expressive',
        reason: 'Target the C# minor vocal melodies and John Mayer soulful blues bends.',
      },
      {
        id: 'c-sharp-dorian',
        name: 'C♯ Dorian',
        key: 'C♯',
        mode: 'Dorian',
        flavor: 'Silky R&B Lift',
        reason: 'The natural 6th (A#) brings out the signature smooth R&B double-stop accents.',
      },
      {
        id: 'e-major-pentatonic',
        name: 'E Major Pentatonic',
        key: 'E',
        mode: 'Major Pentatonic',
        flavor: 'Warm & Resolved',
        reason: 'Relative major scale highlighting the chorus release onto the E and B chords.',
      },
    ];
  }
  if (title.includes('blackbird')) {
    return [
      {
        id: 'g-major',
        name: 'G Major / Ionian',
        key: 'G',
        mode: 'Major',
        flavor: 'Bright & Harmonic',
        reason: 'Perfect match for McCartney acoustic fingerpicking ascending along strings 5 & 2.',
      },
      {
        id: 'g-major-pentatonic',
        name: 'G Major Pentatonic',
        key: 'G',
        mode: 'Major Pentatonic',
        flavor: 'Sweet Folk Melody',
        reason: 'Five core tones providing a clean vocal contour over the G → Am7 → G/B steps.',
      },
    ];
  }
  if (title.includes('wonderwall')) {
    return [
      {
        id: 'e-minor-pentatonic',
        name: 'E Minor Pentatonic',
        key: 'E',
        mode: 'Minor Pentatonic',
        flavor: 'Gritty & Grounded',
        reason: 'Locks into the acoustic driving groove over the Em7 and G chords.',
      },
      {
        id: 'g-major-pentatonic',
        name: 'G Major Pentatonic',
        key: 'G',
        mode: 'Major Pentatonic',
        flavor: 'Open Singalong Tones',
        reason: 'Accents the anchored 3rd fret high drones on strings 1 & 2.',
      },
    ];
  }
  if (title.includes('little wing')) {
    return [
      {
        id: 'e-minor-pentatonic',
        name: 'E Minor Pentatonic / Blues',
        key: 'E',
        mode: 'Minor Pentatonic',
        flavor: 'Hendrix Soul & Cry',
        reason: 'Essential lead framework for classic Hendrix chord-melody double stops.',
      },
      {
        id: 'e-dorian',
        name: 'E Dorian',
        key: 'E',
        mode: 'Dorian',
        flavor: 'Elevated Ballad',
        reason: 'Adds the sweet C# note creating modal tension against the Em → G → Am changes.',
      },
    ];
  }

  // Default heuristic for custom songs
  const firstChord = song.chords.split(/[·,]/)[0]?.trim() || 'G';
  const root = firstChord.replace(/m.*|maj.*|7.*|sus.*/i, '') || 'G';
  const isMinor = firstChord.includes('m') && !firstChord.includes('maj');

  return [
    {
      id: `${root.toLowerCase()}-${isMinor ? 'minor' : 'major'}-pentatonic`,
      name: `${root} ${isMinor ? 'Minor' : 'Major'} Pentatonic`,
      key: root,
      mode: isMinor ? 'Minor Pentatonic' : 'Major Pentatonic',
      flavor: 'Universal Solo Framework',
      reason: `Primary melodic foundation matching the song opening root chord (${firstChord}).`,
    },
    {
      id: `${root.toLowerCase()}-${isMinor ? 'dorian' : 'mixolydian'}`,
      name: `${root} ${isMinor ? 'Dorian' : 'Mixolydian'}`,
      key: root,
      mode: isMinor ? 'Dorian' : 'Mixolydian',
      flavor: 'Rich Harmonic Color',
      reason: `Extended modal coloration adding melodic sophistication over the chord loop.`,
    },
  ];
}

export default function SongLibrary() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get('view');

  // Segmented Tabs: 'all' | 'chords' | 'library'
  const [selectedTab, setSelectedTab] = useState<'all' | 'chords' | 'library' | null>(null);
  const activeTab: 'all' | 'chords' | 'library' = selectedTab ?? (
    viewParam === 'chords' ? 'chords' : viewParam === 'library' ? 'library' : 'all'
  );
  const setActiveTab = (tab: 'all' | 'chords' | 'library') => setSelectedTab(tab);

  const [songList, setSongList] = useStoredState<Song[]>('user-songs', initialSongs);
  const [collections, setCollections] = useStoredState<SongCollection[]>('libraries', DEFAULT_COLLECTIONS);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | number | null>(null);
  const [activeStrumChord, setActiveStrumChord] = useState<{ songId: string | number; chordIndex: number; chordSymbol: string } | null>(null);
  const [hoveredChordChip, setHoveredChordChip] = useState<{ songId: string | number; index: number; token: string } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Selected song for the "Find Chords & Scales" view
  const [selectedAnalysisSongId, setSelectedAnalysisSongId] = useState<string | number>(() => songList[0]?.id || 1);

  // Modal controls
  const [showAdd, setShowAdd] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [editingCollection, setEditingCollection] = useState<SongCollection | null>(null);

  // Form states for adding new song
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [chordsInput, setChordsInput] = useState('');
  const [difficulty, setDifficulty] = useState<Song['difficulty']>('Beginner');

  // Form states for new collection
  const [colName, setColName] = useState('');
  const [colDescription, setColDescription] = useState('');
  const [colSelectedSongs, setColSelectedSongs] = useState<(string | number)[]>([]);

  // Close chord popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setHoveredChordChip(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Strum single chord voicing
  const handleSingleChordStrum = (chordSymbol: string, songId: string | number, chordIndex: number) => {
    setActiveStrumChord({ songId, chordIndex, chordSymbol });
    const voicing = findChordVoicing(chordSymbol);
    if (voicing) {
      const freqs = getChordFrequencies(voicing);
      guitarAudio.strum(freqs, 35);
    } else {
      guitarAudio.strum([130.81, 164.81, 196.0, 246.94, 329.63], 35);
    }
    setTimeout(() => {
      setActiveStrumChord(null);
    }, 550);
  };

  // Dynamic chord progression preview
  const playPreview = async (song: Song) => {
    if (playingId === song.id) return;
    setPlayingId(song.id);

    const tokens = song.chords.split(/[·,]/).map((c) => c.trim()).filter(Boolean);

    for (let i = 0; i < tokens.length; i++) {
      const chordSymbol = tokens[i];
      setActiveStrumChord({ songId: song.id, chordIndex: i, chordSymbol });
      const voicing = findChordVoicing(chordSymbol);
      if (voicing) {
        const freqs = getChordFrequencies(voicing);
        guitarAudio.strum(freqs, 35);
      } else {
        guitarAudio.strum([130.81, 164.81, 196.0, 246.94, 329.63], 35);
      }
      await new Promise((r) => setTimeout(r, 680));
    }

    setActiveStrumChord(null);
    setPlayingId(null);

    // Bump progress slightly on practice
    setSongList((prev) =>
      prev.map((s) =>
        s.id === song.id
          ? {
              ...s,
              progress: Math.min(100, s.progress + 5),
              last: 'Just now',
            }
          : s
      )
    );
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSong: Song = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim() || 'Unknown Artist',
      chords: chordsInput.trim() || 'G · C · D',
      difficulty,
      progress: 0,
      last: 'Not yet',
    };

    setSongList([newSong, ...songList]);
    setTitle('');
    setArtist('');
    setChordsInput('');
    setShowAdd(false);
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;

    const newCol: SongCollection = {
      id: `col-${Date.now()}`,
      name: colName.trim(),
      description: colDescription.trim() || 'Custom practice collection',
      songIds: colSelectedSongs,
      createdAt: 'Custom',
    };

    setCollections([...collections, newCol]);
    setColName('');
    setColDescription('');
    setColSelectedSongs([]);
    setShowCreateCollection(false);
  };

  const handleDeleteCollection = (id: string) => {
    setCollections(collections.filter((c) => c.id !== id));
  };

  const handleToggleSongInCollection = (collectionId: string, songId: string | number) => {
    setCollections(
      collections.map((c) => {
        if (c.id !== collectionId) return c;
        const exists = c.songIds.includes(songId);
        return {
          ...c,
          songIds: exists ? c.songIds.filter((id) => id !== songId) : [...c.songIds, songId],
        };
      })
    );
  };

  const filteredSongs = useMemo(() => {
    return songList.filter((s) => {
      const matchesDiff =
        filterDifficulty === 'All' || s.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
      const matchesQuery =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.chords.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDiff && matchesQuery;
    });
  }, [songList, filterDifficulty, searchQuery]);

  const selectedAnalysisSong = useMemo(() => {
    return songList.find((s) => s.id === selectedAnalysisSongId) || songList[0];
  }, [songList, selectedAnalysisSongId]);

  const selectedSongChords = useMemo(() => {
    if (!selectedAnalysisSong) return [];
    const tokens = selectedAnalysisSong.chords.split(/[·,]/).map((c) => c.trim()).filter(Boolean);
    const unique = Array.from(new Set(tokens));
    return unique.map((token) => ({
      token,
      voicing: findChordVoicing(token),
    }));
  }, [selectedAnalysisSong]);

  const compatibleScales = useMemo(() => {
    if (!selectedAnalysisSong) return [];
    return getCompatibleScalesForSong(selectedAnalysisSong);
  }, [selectedAnalysisSong]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 select-none">
      {/* Top Action Toolbar (Page title is rendered by StudioPageHeader) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">

        <div className="flex items-center gap-2">
          {activeTab === 'library' ? (
            <button
              type="button"
              onClick={() => setShowCreateCollection(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] hover:bg-[#2b2b2b] dark:hover:bg-white transition-all shadow-sm cursor-pointer shrink-0 active:scale-98"
            >
              <Plus size={14} weight="regular" />
              <span>New Collection</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] hover:bg-[#2b2b2b] dark:hover:bg-white transition-all shadow-sm cursor-pointer shrink-0 active:scale-98"
            >
              <Plus size={14} weight="regular" />
              <span>Add Custom Song</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented View Switcher (skills.md Section 6.1 Pattern) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-[#EAE8E4] dark:border-white/10">
        <div className="inline-flex items-center gap-1.5 bg-[#F1F0ED] dark:bg-[#1A1816] p-1.5 rounded-2xl border border-[#EAE8E4] dark:border-white/10 shadow-xs">
          {[
            { id: 'all', label: 'All Pieces', icon: MusicNotes },
            { id: 'chords', label: 'Find Chords & Scales', icon: Sparkle },
            { id: 'library', label: 'Your Collections', icon: BookmarkSimple },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as 'all' | 'chords' | 'library');
                  if (tab.id === 'all') router.push('/songs', { scroll: false });
                  else router.push(`/songs?view=${tab.id}`, { scroll: false });
                }}
                className="relative px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSongTab"
                    className="absolute inset-0 bg-white dark:bg-[#282420] rounded-xl shadow-xs border border-black/5 dark:border-white/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? 'text-[#171717] dark:text-[#F5F5F4] font-semibold' : 'text-[#77746F] dark:text-[#A8A29E]'}`}>
                  <Icon size={13} weight={isActive ? 'bold' : 'regular'} className={isActive ? 'text-[#D4AD61]' : ''} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === 'all' && (
          <span className="text-xs font-mono text-[#77746F] dark:text-[#A8A29E]">
            {filteredSongs.length} of {songList.length} Pieces
          </span>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL PIECES                                                         */}
      {/* ========================================================================= */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] block mb-1">
                Saved to Repertoire
              </span>
              <div className="text-3xl font-sans font-semibold tracking-tight leading-[1.15] tabular-nums text-[#171717] dark:text-[#F5F5F4]">
                {songList.length}
              </div>
              <p className="text-[11px] text-[#77746F] dark:text-[#A8A29E] mt-1">Total pieces in practice rotation</p>
            </div>

            <div className="bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] block mb-1">
                In Active Rotation
              </span>
              <div className="text-3xl font-sans font-semibold tracking-tight leading-[1.15] tabular-nums text-[#D4AD61]">
                {songList.filter((s) => s.progress > 0 && s.progress < 100).length}
              </div>
              <p className="text-[11px] text-[#77746F] dark:text-[#A8A29E] mt-1">Currently building fluency</p>
            </div>

            <div className="bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] block mb-1">
                Mastered & Polished
              </span>
              <div className="text-3xl font-sans font-semibold tracking-tight leading-[1.15] tabular-nums text-emerald-500">
                {songList.filter((s) => s.progress === 100).length}
              </div>
              <p className="text-[11px] text-[#77746F] dark:text-[#A8A29E] mt-1">Ready for performance</p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 rounded-2xl p-2 shadow-xs">
            {/* Difficulty Segment Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => {
                const active = filterDifficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setFilterDifficulty(diff)}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'text-white dark:text-[#171717]'
                        : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="songDifficultyFilterPill"
                        transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                        className="absolute inset-0 rounded-full bg-[#171717] dark:bg-[#F5F5F4] shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{diff}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Field */}
            <div className="flex items-center gap-2 bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 rounded-full px-3.5 py-1.5 sm:w-64">
              <MagnifyingGlass size={13} weight="regular" className="text-[#77746F] dark:text-[#A8A29E] shrink-0" />
              <input
                type="text"
                placeholder="Search title, artist, chords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-[#171717] dark:text-[#F5F5F4] text-xs w-full focus:outline-hidden placeholder:text-[#A8A29E] dark:placeholder:text-[#6A6662]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4]"
                >
                  <X size={13} weight="regular" />
                </button>
              )}
            </div>
          </div>

          {/* Song Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSongs.map((song) => {
              const isPlaying = playingId === song.id;
              const diffBadgeColor =
                song.difficulty === 'Beginner'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : song.difficulty === 'Intermediate'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  : 'bg-[#38211F]/10 text-[#38211F] dark:bg-[#E9D8B7]/10 dark:text-[#E9D8B7] border-[#38211F]/20 dark:border-[#E9D8B7]/20';

              const chordTokens = song.chords.split(/[·,]/).map((c) => c.trim()).filter(Boolean);

              return (
                <motion.article
                  key={song.id}
                  layout
                  className="bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#D4AD61]/50 transition-colors relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${diffBadgeColor}`}>
                        {song.difficulty}
                      </span>
                      <span className="text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">
                        {song.last ? `Played ${song.last}` : 'Not practiced'}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-card-title text-lg sm:text-xl text-[#171717] dark:text-[#F5F5F4]">
                        {song.title}
                      </h3>
                      <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-0.5">
                        {song.artist}
                      </p>
                    </div>

                    {/* Interactive Chord Chips */}
                    <div className="bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 rounded-xl px-3.5 py-2.5 mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E]">
                          Chord Progression
                        </span>
                        <span className="text-[10px] text-[#A8A29E] font-mono">
                          Tap chip for voicing
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {chordTokens.map((token, idx) => {
                          const isSounding = activeStrumChord?.songId === song.id && activeStrumChord.chordIndex === idx;
                          const isPopoverOpen = hoveredChordChip?.songId === song.id && hoveredChordChip.index === idx;
                          const chordVoicing = findChordVoicing(token);

                          return (
                            <div key={idx} className="relative">
                              <button
                                type="button"
                                onClick={() => handleSingleChordStrum(token, song.id, idx)}
                                onMouseEnter={() => setHoveredChordChip({ songId: song.id, index: idx, token })}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wide transition-all cursor-pointer border ${
                                  isSounding
                                    ? 'bg-[#D4AD61] text-zinc-950 border-[#D4AD61] shadow-sm scale-105'
                                    : isPopoverOpen
                                    ? 'bg-[#D4AD61]/20 text-[#D4AD61] border-[#D4AD61]/50'
                                    : 'bg-white dark:bg-[#201D1A] text-[#D4AD61] hover:text-[#B8852B] dark:hover:text-[#F3D799] border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/60 shadow-xs'
                                }`}
                                title={`Strum ${token} chord`}
                              >
                                <span>{token}</span>
                              </button>

                              {/* Micro-Card Popover */}
                              <AnimatePresence>
                                {isPopoverOpen && chordVoicing && (
                                  <motion.div
                                    ref={popoverRef}
                                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-0 bottom-full mb-2 z-50 w-52 p-3 bg-white dark:bg-[#1A1816] rounded-xl border border-[#EAE8E4] dark:border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.25)] text-left"
                                  >
                                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#EAE8E4] dark:border-white/10">
                                      <div>
                                        <div className="text-xs font-bold font-mono text-[#171717] dark:text-[#F5F5F4]">
                                          {chordVoicing.name}
                                        </div>
                                        <div className="text-[10px] text-[#77746F] dark:text-[#A8A29E]">
                                          {chordVoicing.type}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSingleChordStrum(token, song.id, idx);
                                        }}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#D4AD61] text-zinc-950 font-mono text-[10px] font-bold hover:bg-[#FFE082] transition-colors"
                                      >
                                        <SpeakerHigh size={11} weight="fill" />
                                        <span>Strum</span>
                                      </button>
                                    </div>

                                    {/* String Fingers Row */}
                                    <div className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E] mb-1">
                                      Tab: {chordVoicing.fingers.map(([, f]) => f).join('-')}
                                    </div>
                                    <p className="text-[10px] text-[#77746F] dark:text-[#A8A29E] leading-tight">
                                      {chordVoicing.tip}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Progress & Quick Practice Button */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">Mastery</span>
                      <span className="text-[11px] font-mono font-semibold text-[#171717] dark:text-[#F5F5F4]">
                        {song.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F1F0ED] dark:bg-[#201D1A] rounded-full overflow-hidden mb-4">
                      <motion.div
                        className="h-full bg-[#D4AD61] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${song.progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => playPreview(song)}
                        disabled={isPlaying}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                          isPlaying
                            ? 'bg-[#E9D8B7]/30 dark:bg-[#D4AD61]/25 border-[#D4AD61] text-[#D4AD61]'
                            : 'bg-[#F7F6F3] dark:bg-[#1A1816] hover:bg-white dark:hover:bg-[#24201D] border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4]'
                        }`}
                      >
                        <SpeakerHigh size={13} weight="regular" className={isPlaying ? 'animate-bounce text-[#D4AD61]' : ''} />
                        <span>{isPlaying ? 'Playing Progression...' : 'Arpeggiate Progression'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAnalysisSongId(song.id);
                          setActiveTab('chords');
                          router.push('/songs?view=chords', { scroll: false });
                        }}
                        className="text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E] hover:text-[#D4AD61] dark:hover:text-[#D4AD61] transition-colors flex items-center gap-1"
                      >
                        <span>Analyze</span>
                        <ArrowRight size={11} weight="bold" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}

            {filteredSongs.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 rounded-2xl p-8">
                <MusicNotes size={24} weight="regular" className="mx-auto text-[#77746F] dark:text-[#A8A29E] mb-2 opacity-60" />
                <p className="text-sm font-medium text-[#171717] dark:text-[#F5F5F4]">No songs found</p>
                <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-1">
                  Try adjusting your search query or difficulty filter.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FIND CHORDS & SCALES                                               */}
      {/* ========================================================================= */}
      {activeTab === 'chords' && (
        <div className="space-y-6">
          {/* Song Selector Strip */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-[#121110] rounded-2xl border border-[#EAE8E4] dark:border-white/10 shadow-xs">
            <span className="text-xs font-mono font-medium text-[#77746F] dark:text-[#A8A29E] pl-2 mr-2">
              Select Piece:
            </span>
            {songList.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedAnalysisSongId(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedAnalysisSong?.id === s.id
                    ? 'bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] shadow-xs'
                    : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white bg-[#F7F6F3] dark:bg-[#1A1816]'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          {selectedAnalysisSong && (
            <div className="space-y-6">
              {/* Piece Analysis Header Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#F7F6F3] to-white dark:from-[#151413] dark:to-[#1A1816] border border-[#EAE8E4] dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AD61] font-bold">
                    Harmonic Analysis &amp; Compatible Scales
                  </span>
                  <h3 className="text-card-title text-xl sm:text-2xl text-[#171717] dark:text-[#F5F5F4] mt-0.5">
                    {selectedAnalysisSong.title}
                  </h3>
                  <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-1">
                    By {selectedAnalysisSong.artist} • Difficulty: {selectedAnalysisSong.difficulty}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => playPreview(selectedAnalysisSong)}
                    disabled={playingId === selectedAnalysisSong.id}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] hover:bg-[#2b2b2b] dark:hover:bg-white transition-all shadow-sm cursor-pointer"
                  >
                    <SpeakerHigh size={14} weight="regular" className={playingId === selectedAnalysisSong.id ? 'animate-bounce text-[#D4AD61]' : ''} />
                    <span>{playingId === selectedAnalysisSong.id ? 'Playing Progression...' : 'Strum Progression'}</span>
                  </button>
                </div>
              </div>

              {/* 1. Progression Chord Breakdown */}
              <div className="bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} weight="regular" className="text-[#D4AD61]" />
                    <h4 className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F4] tracking-tight">
                      Voicing Breakdown
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-[#77746F] dark:text-[#A8A29E]">
                    {selectedSongChords.length} Unique Voicings
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedSongChords.map(({ token, voicing }) => (
                    <div
                      key={token}
                      className="p-4 rounded-2xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 space-y-2 hover:border-[#D4AD61]/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base sm:text-lg font-mono font-bold tracking-tight text-[#D4AD61]">{token}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (voicing) {
                              guitarAudio.strum(getChordFrequencies(voicing), 35);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-white dark:bg-[#221F1C] hover:bg-[#D4AD61] text-[#77746F] hover:text-zinc-950 transition-colors cursor-pointer"
                          title={`Strum ${token}`}
                        >
                          <SpeakerHigh size={13} weight="regular" />
                        </button>
                      </div>

                      {voicing ? (
                        <>
                          <div className="text-[11px] font-mono text-[#171717] dark:text-[#F5F5F4]">
                            {voicing.name}
                          </div>
                          <div className="text-[10px] text-[#77746F] dark:text-[#A8A29E]">
                            Tab: <span className="font-mono font-bold">{voicing.fingers.map(([, f]) => f).join('-')}</span>
                          </div>
                          <div className="text-[10px] text-[#77746F] dark:text-[#A8A29E] leading-relaxed">
                            {voicing.tip}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-[#77746F] dark:text-[#A8A29E]">
                          Custom shape • Standard tuning
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Compatible Scales for Soloing */}
              <div className="bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkle size={16} weight="regular" className="text-[#D4AD61]" />
                    <h4 className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F4] tracking-tight">
                      Compatible Improvisation &amp; Soloing Scales
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-[#D4AD61]">
                    Theory Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {compatibleScales.map((scale) => (
                    <div
                      key={scale.id}
                      className="p-4 rounded-2xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 space-y-2 hover:border-[#D4AD61]/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D4AD61]">
                            {scale.flavor}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#77746F] dark:text-[#A8A29E]">
                            {scale.mode}
                          </span>
                        </div>
                        <h5 className="text-card-title text-base text-[#171717] dark:text-[#F5F5F4]">
                          {scale.name}
                        </h5>
                        <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-1 leading-relaxed">
                          {scale.reason}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#EAE8E4] dark:border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E]">
                          Key Root: {scale.key}
                        </span>
                        <Link
                          href={`/fretboard?key=${encodeURIComponent(scale.key)}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#171717] dark:text-[#F5F5F4] hover:text-[#D4AD61] dark:hover:text-[#D4AD61] transition-colors"
                        >
                          <span>Explore on Fretboard</span>
                          <ArrowRight size={11} weight="bold" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: YOUR COLLECTIONS                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {collections.map((col) => {
              const colSongs = songList.filter((s) => col.songIds.includes(s.id));
              const avgMastery = colSongs.length > 0
                ? Math.round(colSongs.reduce((acc, s) => acc + s.progress, 0) / colSongs.length)
                : 0;

              return (
                <div
                  key={col.id}
                  className="bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D4AD61]/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#F5EEDF] dark:bg-[#201D1A] text-[#9E7A32] dark:text-[#D4AD61] flex items-center justify-center">
                        <FolderSimple size={16} weight="regular" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E] bg-[#F7F6F3] dark:bg-[#1A1816] px-2 py-0.5 rounded-full">
                          {colSongs.length} Pieces
                        </span>
                        {col.createdAt === 'Custom' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCollection(col.id)}
                            className="text-[#77746F] hover:text-rose-500 transition-colors p-1"
                            title="Delete collection"
                          >
                            <Trash size={13} weight="regular" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-card-title text-lg text-[#171717] dark:text-[#F5F5F4]">
                      {col.name}
                    </h4>
                    <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-1 leading-relaxed">
                      {col.description}
                    </p>

                    {/* Songs in this collection */}
                    <div className="mt-3 space-y-1.5">
                      {colSongs.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between text-[11px] font-mono p-1.5 rounded-lg bg-[#F7F6F3] dark:bg-[#1A1816]"
                        >
                          <span className="truncate max-w-[150px] font-medium text-[#171717] dark:text-[#F5F5F4]">
                            {s.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => playPreview(s)}
                            className="text-[#D4AD61] hover:text-[#B8852B] transition-colors"
                            title="Preview"
                          >
                            <SpeakerHigh size={12} weight="regular" />
                          </button>
                        </div>
                      ))}
                      {colSongs.length === 0 && (
                        <div className="text-[11px] font-mono text-[#A8A29E] py-2 text-center">
                          No songs added yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Average Mastery Footer */}
                  <div className="pt-3 border-t border-[#EAE8E4] dark:border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E]">
                      Avg Fluency: {avgMastery}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingCollection(col)}
                      className="text-[11px] font-mono text-[#D4AD61] hover:underline cursor-pointer"
                    >
                      Manage Songs
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD CUSTOM SONG                                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-[#151413] border border-[#EAE8E4] dark:border-white/10 rounded-3xl shadow-xl p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AD61] font-semibold">
                    New Piece
                  </span>
                  <h3 className="text-card-title text-lg sm:text-xl text-[#171717] dark:text-[#F5F5F4]">
                    Add to Repertoire
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="p-1.5 rounded-full text-[#77746F] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-[#F7F6F3] dark:hover:bg-white/5 transition-all"
                >
                  <X size={16} weight="regular" />
                </button>
              </div>

              <form onSubmit={handleAddSong} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#77746F] dark:text-[#A8A29E] mb-1">
                    Song Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Wish You Were Here"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] focus:outline-hidden focus:border-[#D4AD61]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#77746F] dark:text-[#A8A29E] mb-1">
                    Artist / Composer
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Pink Floyd"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] focus:outline-hidden focus:border-[#D4AD61]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#77746F] dark:text-[#A8A29E] mb-1">
                    Chords (Separated by · or space)
                  </label>
                  <input
                    type="text"
                    value={chordsInput}
                    onChange={(e) => setChordsInput(e.target.value)}
                    placeholder="e.g. Em7 · G · A7sus4 · C"
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] focus:outline-hidden focus:border-[#D4AD61]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#77746F] dark:text-[#A8A29E] mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Song['difficulty'])}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] focus:outline-hidden focus:border-[#D4AD61]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 py-2.5 rounded-full text-xs font-medium border border-[#EAE8E4] dark:border-white/10 text-[#77746F] dark:text-[#A8A29E] hover:bg-[#F7F6F3] dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full text-xs font-semibold bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] hover:bg-[#2b2b2b] dark:hover:bg-white transition-all shadow-sm"
                  >
                    Save Song
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE COLLECTION                                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showCreateCollection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-[#151413] border border-[#EAE8E4] dark:border-white/10 rounded-3xl shadow-xl p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AD61] font-semibold">
                    New Playlist / Folder
                  </span>
                  <h3 className="text-card-title text-lg sm:text-xl text-[#171717] dark:text-[#F5F5F4]">
                    Create Collection
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateCollection(false)}
                  className="p-1.5 rounded-full text-[#77746F] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-[#F7F6F3] dark:hover:bg-white/5 transition-all"
                >
                  <X size={16} weight="regular" />
                </button>
              </div>

              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#77746F] dark:text-[#A8A29E] mb-1">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    required
                    value={colName}
                    onChange={(e) => setColName(e.target.value)}
                    placeholder="e.g. Blues Jam Night, Acoustic Set"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] focus:outline-hidden focus:border-[#D4AD61]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#77746F] dark:text-[#A8A29E] mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={colDescription}
                    onChange={(e) => setColDescription(e.target.value)}
                    placeholder="Short description of the practice goal"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] focus:outline-hidden focus:border-[#D4AD61]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#77746F] dark:text-[#A8A29E] mb-1">
                    Select Repertoire Pieces
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-[#F7F6F3] dark:bg-[#1A1816] rounded-xl border border-[#EAE8E4] dark:border-white/10">
                    {songList.map((s) => {
                      const isSelected = colSelectedSongs.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setColSelectedSongs((prev) =>
                              isSelected ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                            );
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#D4AD61]/20 text-[#171717] dark:text-[#F5F5F4] font-medium'
                              : 'text-[#77746F] dark:text-[#A8A29E] hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <span>{s.title}</span>
                          {isSelected && <Check size={13} weight="bold" className="text-[#D4AD61]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateCollection(false)}
                    className="flex-1 py-2.5 rounded-full text-xs font-medium border border-[#EAE8E4] dark:border-white/10 text-[#77746F] dark:text-[#A8A29E] hover:bg-[#F7F6F3] dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full text-xs font-semibold bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] hover:bg-[#2b2b2b] dark:hover:bg-white transition-all shadow-sm"
                  >
                    Create Collection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: MANAGE SONGS IN COLLECTION                                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {editingCollection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-[#151413] border border-[#EAE8E4] dark:border-white/10 rounded-3xl shadow-xl p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AD61] font-semibold">
                    Manage Collection
                  </span>
                  <h3 className="text-card-title text-lg sm:text-xl text-[#171717] dark:text-[#F5F5F4]">
                    {editingCollection.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCollection(null)}
                  className="p-1.5 rounded-full text-[#77746F] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-[#F7F6F3] dark:hover:bg-white/5"
                >
                  <X size={16} weight="regular" />
                </button>
              </div>

              <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mb-4">
                Toggle pieces to include or exclude from this collection:
              </p>

              <div className="max-h-60 overflow-y-auto space-y-1.5 p-2 bg-[#F7F6F3] dark:bg-[#1A1816] rounded-xl border border-[#EAE8E4] dark:border-white/10 mb-4">
                {songList.map((s) => {
                  const currentCol = collections.find((c) => c.id === editingCollection.id);
                  const isIncluded = currentCol?.songIds.includes(s.id);

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleToggleSongInCollection(editingCollection.id, s.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        isIncluded
                          ? 'bg-[#D4AD61]/20 text-[#171717] dark:text-[#F5F5F4] font-semibold'
                          : 'text-[#77746F] dark:text-[#A8A29E] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span>{s.title}</span>
                        <span className="text-[10px] text-[#A8A29E]">{s.artist}</span>
                      </div>
                      {isIncluded ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-[#D4AD61]">
                          <Check size={13} weight="bold" />
                          <span>In Set</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-[#A8A29E]">Add +</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setEditingCollection(null)}
                className="w-full py-2.5 rounded-full text-xs font-semibold bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] hover:bg-[#2b2b2b] dark:hover:bg-white transition-all shadow-sm"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
