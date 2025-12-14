import { create } from 'zustand';
import { Audio } from 'expo-av';
import { supabase } from '../config/supabase';

export const useMusicPlayer = create((set, get) => ({
  sound: null,
  isPlaying: false,
  currentSong: null,
  queue: [],        // Daftar antrean lagu
  currentIndex: 0,  // Posisi lagu sekarang di antrean
  position: 0,      // Waktu berjalan (ms)
  duration: 1,      // Total durasi lagu (ms) - Default 1 untuk mencegah error pembagian nol

  // Fungsi Utama: Memutar Lagu
  // Menerima daftar lagu (songsList) untuk membuat antrean
  playSound: async (song, songsList = []) => {
    const { sound: currentSound } = get();

    try {
      if (currentSound) await currentSound.unloadAsync();

      // Setup Antrean (Hanya update jika daftar baru diberikan)
      if (songsList.length > 0) {
        const index = songsList.findIndex(s => s.id === song.id);
        set({ queue: songsList, currentIndex: index });
      }

      console.log('Loading:', song.title);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.local_uri },
        { shouldPlay: true }
      );

      set({ sound: newSound, isPlaying: true, currentSong: song });

      // LISTENER REAL-TIME (Untuk Progress Bar)
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          set({
            position: status.positionMillis,
            duration: status.durationMillis || 1, 
            isPlaying: status.isPlaying
          });

          // Auto Next saat lagu habis
          if (status.didJustFinish) {
            get().playNext(); 
          }
        }
      });

      // Catat Activity ke Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('activities').insert({
          user_id: session.user.id, song_id: song.id, action_type: 'playing'
        });
      }

    } catch (error) {
      console.error('Error Play:', error);
      alert('Gagal memutar lagu. File mungkin hilang atau korup.');
    }
  },

  // Fungsi Pindah ke Lagu Berikutnya
  playNext: async () => {
    const { queue, currentIndex, playSound } = get();
    if (queue.length === 0) return;

    // Hitung index selanjutnya (Looping: Jika terakhir, balik ke awal)
    const nextIndex = (currentIndex + 1) % queue.length;
    const nextSong = queue[nextIndex];
    
    // Panggil playSound tanpa mengirim songsList lagi
    await playSound(nextSong); 
    set({ currentIndex: nextIndex }); // Update index di state
  },

  // Fungsi Pindah ke Lagu Sebelumnya
  playPrev: async () => {
    const { queue, currentIndex, playSound } = get();
    if (queue.length === 0) return;

    // Hitung index sebelumnya
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1; // Balik ke paling belakang

    const prevSong = queue[prevIndex];
    await playSound(prevSong);
    set({ currentIndex: prevIndex }); // Update index di state
  },

  pauseSound: async () => {
    const { sound } = get();
    if (sound) {
      await sound.pauseAsync();
      set({ isPlaying: false });
    }
  },

  resumeSound: async () => {
    const { sound } = get();
    if (sound) {
      await sound.playAsync();
      set({ isPlaying: true });
    }
  },
  
  // Fitur geser progress bar (belum terimplementasi di UI, tapi disiapkan)
  seekTo: async (millis) => {
    const { sound } = get();
    if (sound) {
        await sound.setPositionAsync(millis);
    }
  }
}));