import { QARI_LIST } from '../types/quran';

export interface AudioTrack {
  type: 'ayah' | 'surah';
  nomorSurat: number;
  namaSuratLatin: string;
  nomorAyat?: number;
  qariId: string;
  qariName: string;
  url: string;
  title: string;
  subtitle: string;
}

export interface AudioPlayerState {
  track: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  errorMessage: string | null;
  playbackRate: number;
}

type AudioListener = (state: AudioPlayerState) => void;

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private state: AudioPlayerState = {
    track: null,
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    errorMessage: null,
    playbackRate: 1.0,
  };
  private listeners: AudioListener[] = [];
  private nextAyahCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.preload = 'auto';

    this.audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true, isLoading: false, errorMessage: null });
    });

    this.audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false });
    });

    this.audio.addEventListener('waiting', () => {
      this.updateState({ isLoading: true });
    });

    this.audio.addEventListener('playing', () => {
      this.updateState({ isLoading: false, isPlaying: true });
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.updateState({
          currentTime: this.audio.currentTime,
          duration: this.audio.duration || 0,
        });
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio) {
        this.updateState({
          duration: this.audio.duration || 0,
          isLoading: false,
        });
      }
    });

    this.audio.addEventListener('ended', () => {
      this.updateState({ isPlaying: false, currentTime: 0 });
      if (this.nextAyahCallback) {
        this.nextAyahCallback();
      }
    });

    this.audio.addEventListener('error', () => {
      console.warn('[AudioService] Audio playback error:', this.audio?.error);
      this.updateState({
        isPlaying: false,
        isLoading: false,
        errorMessage: 'Gagal memuat audio. Pastikan koneksi internet stabil.',
      });
    });
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private updateState(partial: Partial<AudioPlayerState>) {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public getState(): AudioPlayerState {
    return this.state;
  }

  public setOnAyahEnded(callback: (() => void) | null) {
    this.nextAyahCallback = callback;
  }

  public playAyah(
    nomorSurat: number,
    namaSuratLatin: string,
    nomorAyat: number,
    audioUrls: { [key: string]: string | undefined },
    qariId = '05'
  ): boolean {
    this.initAudio();
    if (!this.audio) return false;

    // Cari URL audio qari yang dipilih, fallback ke qari pertama yang tersedia
    let selectedUrl = audioUrls[qariId];
    let activeQariId = qariId;
    if (!selectedUrl) {
      const availableKey = Object.keys(audioUrls)[0];
      if (availableKey && audioUrls[availableKey]) {
        selectedUrl = audioUrls[availableKey];
        activeQariId = availableKey;
      }
    }

    if (!selectedUrl) {
      this.updateState({
        errorMessage: `Audio untuk ayat ${nomorAyat} belum tersedia dari server.`,
      });
      return false;
    }

    const qari = QARI_LIST.find(q => q.id === activeQariId) || { id: activeQariId, name: 'Qari Pilihan', origin: '' };

    const track: AudioTrack = {
      type: 'ayah',
      nomorSurat,
      namaSuratLatin,
      nomorAyat,
      qariId: activeQariId,
      qariName: qari.name,
      url: selectedUrl,
      title: `${namaSuratLatin} : Ayat ${nomorAyat}`,
      subtitle: `Qari: ${qari.name}`,
    };

    // If same track is paused, resume
    if (this.state.track && this.state.track.url === selectedUrl && !this.state.isPlaying) {
      this.resume();
      return true;
    }

    this.audio.src = selectedUrl;
    this.audio.playbackRate = this.state.playbackRate;
    this.updateState({
      track,
      isLoading: true,
      errorMessage: null,
      currentTime: 0,
    });

    this.audio.play().catch(err => {
      console.warn('[AudioService] Play error (autoplay restriction):', err);
      this.updateState({
        isPlaying: false,
        isLoading: false,
        errorMessage: 'Klik tombol putar untuk mendengarkan audio.',
      });
    });

    return true;
  }

  public playFullSurah(
    nomorSurat: number,
    namaSuratLatin: string,
    audioUrls: { [key: string]: string | undefined },
    qariId = '05'
  ): boolean {
    this.initAudio();
    if (!this.audio) return false;

    let selectedUrl = audioUrls[qariId];
    let activeQariId = qariId;
    if (!selectedUrl) {
      const availableKey = Object.keys(audioUrls)[0];
      if (availableKey && audioUrls[availableKey]) {
        selectedUrl = audioUrls[availableKey];
        activeQariId = availableKey;
      }
    }

    if (!selectedUrl) {
      this.updateState({
        errorMessage: `Audio full untuk surat ${namaSuratLatin} belum tersedia.`,
      });
      return false;
    }

    const qari = QARI_LIST.find(q => q.id === activeQariId) || { id: activeQariId, name: 'Qari Pilihan', origin: '' };

    const track: AudioTrack = {
      type: 'surah',
      nomorSurat,
      namaSuratLatin,
      qariId: activeQariId,
      qariName: qari.name,
      url: selectedUrl,
      title: `Surat ${namaSuratLatin} (Full)`,
      subtitle: `Lantunan Tilawah: ${qari.name}`,
    };

    if (this.state.track && this.state.track.url === selectedUrl && !this.state.isPlaying) {
      this.resume();
      return true;
    }

    this.audio.src = selectedUrl;
    this.audio.playbackRate = this.state.playbackRate;
    this.updateState({
      track,
      isLoading: true,
      errorMessage: null,
      currentTime: 0,
    });

    this.audio.play().catch(err => {
      console.warn('[AudioService] Play full surah failed:', err);
      this.updateState({
        isPlaying: false,
        isLoading: false,
        errorMessage: 'Klik tombol putar untuk memulai tilawah.',
      });
    });

    return true;
  }

  public pause() {
    if (this.audio && this.state.isPlaying) {
      this.audio.pause();
    }
  }

  public resume() {
    if (this.audio) {
      this.audio.play().catch(err => {
        console.warn('[AudioService] Resume failed:', err);
      });
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = '';
    }
    this.updateState({
      track: null,
      isPlaying: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      errorMessage: null,
    });
  }

  public seek(seconds: number) {
    if (this.audio && this.audio.duration) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration));
    }
  }

  public setPlaybackRate(rate: number) {
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
    this.updateState({ playbackRate: rate });
  }
}

export const audioService = new AudioService();
