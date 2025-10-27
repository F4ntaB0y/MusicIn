// Nama File: App.js
// Penjelasan singkat:
// Ini adalah entry point aplikasi. Mengatur navigasi tab bawah.
// Menyimpan state global sederhana: index lagu saat ini, mode shuffle, loop, dan daftar lagu yang disukai.
// REAL_MUSIC adalah daftar lagu yang dipakai di semua layar.
// Istilah: "state" = data yang berubah selama aplikasi berjalan.
// Istilah: "props" = data yang dikirim dari satu komponen ke komponen lain.

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Impor layar ASLI
import MusicListScreen from './screens/MusicListScreen';
import SearchScreen from './screens/SearchScreen';
import PlayerScreen from './screens/PlayerScreen';
import LikedMusicScreen from './screens/LikedMusicScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Konstanta warna
const BACKGROUND_COLOR = '#121212';
const ACTIVE_COLOR = '#FFFFFF';
const INACTIVE_COLOR = '#A0AEC0';
const TEXT_COLOR = '#FFFFFF';

// Data Musik (sample)
// file: require(...) menunjukkan file audio lokal dalam folder assets.
// id unik dipakai untuk identifikasi lagu.
const songData = [
  { id: '1', title: 'Bella Ciao', artist: 'Manu Pilas', artwork: 'https://lh3.googleusercontent.com/v6zKg8G00Bq7G4FTDVzx8RdV3ZEdQRIMwbWfnjnD7R9042CgRJqSTUz1GZ62Wn483IQqSydIaflTNx42=w544-h544-l90-rj', file: require('./assets/music/song1.mp3') },
  { id: '2', title: 'Everything u are', artist: 'Hindia', artwork: 'https://lh3.googleusercontent.com/pP42VdTGrlRG0oCRZdgwhZ57R6CpfWDtewbZ9Mlg6gNoKWAjY4R59sGt_Le_zdWHh6hpNeRobL8aBVxwVQ=w544-h544-l90-rj', file: require('./assets/music/song2.mp3') },
  { id: '3', title: 'Last Night on Earth', artist: 'Green Day', artwork: 'https://lh3.googleusercontent.com/FnRYR-BT3RONNVBVF0Ws8IzCnzZYu7qbulZ3LL99NadPK8kEK_dvyldmJEGg_DZpJ0UsKoqwALI8SEz6=w544-h544-l90-rj', file: require('./assets/music/song3.mp3') },
];
// Untuk demo memperbanyak data agar list lebih panjang.
// Teknik: cloning array dan mengganti id dengan id + indeks.
// Alasan: memudahkan testing paging / list panjang.
const generatedMusicList = [];
for (let i = 0; i < 10; i++) { songData.forEach((song, index) => { generatedMusicList.push({ ...song, id: `${song.id}-${i}` }); }); }
const REAL_MUSIC = generatedMusicList;
const LIKED_SONGS_KEY = '@liked_songs';

// Komponen Navigasi Utama
function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomSafeArea = insets.bottom;

  // State Management
  // currentSongIndex menyimpan indeks lagu yang sedang diputar di REAL_MUSIC.
  // isShuffled menentukan apakah pemilihan lagu selanjutnya acak.
  // isLooping menentukan apakah lagu diulang terus.
  // likedSongIds adalah Set berisi id lagu yang di-like.
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState(new Set());

  // Muat 'like' dari AsyncStorage saat komponen mount.
  // AsyncStorage = penyimpanan sederhana di perangkat.
  useEffect(() => {
    const loadLikedSongs = async () => {
      try {
        const storedLikedSongs = await AsyncStorage.getItem(LIKED_SONGS_KEY);
        if (storedLikedSongs !== null) {
          setLikedSongIds(new Set(JSON.parse(storedLikedSongs)));
        }
      } catch (e) { console.error("[App.js] Gagal memuat like:", e); }
    };
    loadLikedSongs();
  }, []);

  // Simpan 'like' ke AsyncStorage setiap kali ada perubahan.
  const saveLikedSongs = async (newLikedSet) => {
    try {
      const arrayToSave = Array.from(newLikedSet);
      await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(arrayToSave));
    } catch (e) { console.error("[App.js] Gagal menyimpan like:", e); }
  };

  // Toggle 'like' sederhana:
  // Jika sudah ada di set -> hapus.
  // Jika belum -> tambahkan.
  // Simpan ke state dan AsyncStorage.
  const toggleLike = (songId) => {
    if (!songId) { console.warn("[App.js] toggleLike: songId tidak valid."); return; }
    const newLikedSet = new Set(likedSongIds);
    if (newLikedSet.has(songId)) newLikedSet.delete(songId);
    else newLikedSet.add(songId);
    setLikedSongIds(newLikedSet);
    saveLikedSongs(newLikedSet);
  };

  // Validasi currentSong berdasarkan index.
  const currentSong = currentSongIndex !== null && currentSongIndex >= 0 && currentSongIndex < REAL_MUSIC.length ? REAL_MUSIC[currentSongIndex] : null;

  // Fungsi kontrol musik: getRandomIndex untuk shuffle.
  // Logika: pilih index acak yang berbeda dari current.
  // Batas percobaan untuk menghindari infinite loop.
  const getRandomIndex = () => {
    if (REAL_MUSIC.length <= 1) return 0;
    let newIndex; let attempts = 0; const maxAttempts = REAL_MUSIC.length * 2;
    do { newIndex = Math.floor(Math.random() * REAL_MUSIC.length); attempts++; if (attempts > maxAttempts) break; }
    while (newIndex === currentSongIndex);
    return newIndex;
  };

  // handleNextSong: menghitung index berikutnya berdasarkan mode.
  // Jika shuffle true -> pakai getRandomIndex.
  // Jika tidak -> index + 1 dengan modulo (wrap-around).
  const handleNextSong = () => {
    setCurrentSongIndex(prevIndex => {
        if (prevIndex === null || prevIndex < 0 || prevIndex >= REAL_MUSIC.length) return 0;
        let nextIndex;
        if (isShuffled) { nextIndex = getRandomIndex(); }
        else { nextIndex = (prevIndex + 1) % REAL_MUSIC.length; }
        if (typeof nextIndex === 'number' && nextIndex >= 0 && nextIndex < REAL_MUSIC.length) return nextIndex;
        else { console.error("[App.js] Gagal hitung nextIndex!"); return prevIndex; }
    });
  };

  // handlePrevSong: mirip next, tapi mundur satu langkah.
  const handlePrevSong = () => {
    setCurrentSongIndex(prevIndex => {
        if (prevIndex === null || prevIndex < 0 || prevIndex >= REAL_MUSIC.length) return 0;
        let prevIdx;
        if (isShuffled) { prevIdx = getRandomIndex(); }
        else { prevIdx = (prevIndex - 1 + REAL_MUSIC.length) % REAL_MUSIC.length; }
        if (typeof prevIdx === 'number' && prevIdx >= 0 && prevIdx < REAL_MUSIC.length) return prevIdx;
        else { console.error("[App.js] Gagal hitung prevIndex!"); return prevIndex; }
    });
  };

  // Toggle shuffle: jika aktifkan shuffle lalu loop aktif, matikan loop supaya tidak bentrok.
  const toggleShuffle = () => {
    setIsShuffled(prev => {
        const nextState = !prev;
        if (nextState && isLooping) setIsLooping(false);
        return nextState;
    });
  };

  // Toggle looping: jika aktifkan loop lalu shuffle aktif, matikan shuffle supaya satu mode saja aktif.
  const toggleLooping = () => {
    setIsLooping(prev => {
        const nextState = !prev;
        if (nextState && isShuffled) setIsShuffled(false);
        return nextState;
    });
  };

  return (
    <Tab.Navigator
      initialRouteName="Player"
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: BACKGROUND_COLOR },
        // Style judul header default (bold, ukuran 24)
        headerTitleStyle: { color: TEXT_COLOR, fontSize: 24, fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: BACKGROUND_COLOR, borderTopColor: '#282828',
          height: 55 + bottomSafeArea, paddingBottom: bottomSafeArea > 5 ? bottomSafeArea - 5 : 5 , paddingTop: 5,
        },
        tabBarActiveTintColor: ACTIVE_COLOR, tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'alert-circle-outline';
          if (route.name === 'Beranda') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Pencarian') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Player') iconName = focused ? 'play-circle' : 'play-circle-outline';
          else if (route.name === 'Disukai') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Profil') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: { marginBottom: 2, fontSize: 10, },
        // Sembunyikan header untuk layar tertentu (list/search/liked)
        headerShown: !['Beranda', 'Pencarian', 'Disukai'].includes(route.name)
      })}
    >
      {/* Hubungkan Layar Asli & Kirim Props */}
      <Tab.Screen name="Beranda" options={{ title: 'Daftar Musik' }}>
        {(props) => ( <MusicListScreen {...props} songList={REAL_MUSIC} currentSong={currentSong} setCurrentSongIndex={setCurrentSongIndex} /> )}
      </Tab.Screen>
      <Tab.Screen name="Pencarian" options={{ title: 'Pencarian' }}>
        {(props) => ( <SearchScreen {...props} songList={REAL_MUSIC} currentSong={currentSong} setCurrentSongIndex={setCurrentSongIndex} /> )}
      </Tab.Screen>
      <Tab.Screen name="Player" options={{ title: 'Sedang Memutar' }}>
        {(props) => ( <PlayerScreen {...props} song={currentSong} onNext={handleNextSong} onPrev={handlePrevSong} isShuffled={isShuffled} onShuffleToggle={toggleShuffle} isLooping={isLooping} onLoopToggle={toggleLooping} isLiked={likedSongIds.has(currentSong?.id)} onToggleLike={toggleLike} /> )}
      </Tab.Screen>
      <Tab.Screen name="Disukai" options={{ title: 'Musik Disukai' }}>
        {(props) => ( <LikedMusicScreen {...props} allSongs={REAL_MUSIC} likedSongIds={likedSongIds} currentSong={currentSong} setCurrentSongIndex={setCurrentSongIndex} /> )}
      </Tab.Screen>
      <Tab.Screen name="Profil" component={ProfileScreen} options={{ title: 'Profil Anda' }}/>
    </Tab.Navigator>
  );
}

// Komponen App utama
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({}); 
