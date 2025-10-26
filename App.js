// Nama File: App.js

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

// Data Musik
const songData = [
  { id: '1', title: 'Bella Ciao', artist: 'Manu Pilas', artwork: 'https://lh3.googleusercontent.com/v6zKg8G00Bq7G4FTDVzx8RdV3ZEdQRIMwbWfnjnD7R9042CgRJqSTUz1GZ62Wn483IQqSydIaflTNx42=w544-h544-l90-rj', file: require('./assets/music/song1.mp3') },
  { id: '2', title: 'Everything u are', artist: 'Hindia', artwork: 'https://lh3.googleusercontent.com/pP42VdTGrlRG0oCRZdgwhZ57R6CpfWDtewbZ9Mlg6gNoKWAjY4R59sGt_Le_zdWHh6hpNeRobL8aBVxwVQ=w544-h544-l90-rj', file: require('./assets/music/song2.mp3') },
  { id: '3', title: 'Last Night on Earth', artist: 'Green Day', artwork: 'https://lh3.googleusercontent.com/FnRYR-BT3RONNVBVF0Ws8IzCnzZYu7qbulZ3LL99NadPK8kEK_dvyldmJEGg_DZpJ0UsKoqwALI8SEz6=w544-h544-l90-rj', file: require('./assets/music/song3.mp3') },
];
const generatedMusicList = [];
for (let i = 0; i < 10; i++) { songData.forEach((song, index) => { generatedMusicList.push({ ...song, id: `${song.id}-${i}` }); }); }
const REAL_MUSIC = generatedMusicList;
const LIKED_SONGS_KEY = '@liked_songs';

// Komponen Navigasi Utama
function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomSafeArea = insets.bottom;

  // State Management
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState(new Set());

  // Muat 'like'
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

  // Simpan 'like'
  const saveLikedSongs = async (newLikedSet) => {
    try {
      const arrayToSave = Array.from(newLikedSet);
      await AsyncStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(arrayToSave));
    } catch (e) { console.error("[App.js] Gagal menyimpan like:", e); }
  };

  // Toggle 'like'
  const toggleLike = (songId) => {
    if (!songId) { console.warn("[App.js] toggleLike: songId tidak valid."); return; }
    const newLikedSet = new Set(likedSongIds);
    if (newLikedSet.has(songId)) newLikedSet.delete(songId);
    else newLikedSet.add(songId);
    setLikedSongIds(newLikedSet);
    saveLikedSongs(newLikedSet);
  };

  // Pastikan currentSong valid
  const currentSong = currentSongIndex !== null && currentSongIndex >= 0 && currentSongIndex < REAL_MUSIC.length ? REAL_MUSIC[currentSongIndex] : null;

  // Fungsi kontrol musik
  const getRandomIndex = () => {
    if (REAL_MUSIC.length <= 1) return 0;
    let newIndex; let attempts = 0; const maxAttempts = REAL_MUSIC.length * 2;
    do { newIndex = Math.floor(Math.random() * REAL_MUSIC.length); attempts++; if (attempts > maxAttempts) break; }
    while (newIndex === currentSongIndex);
    return newIndex;
  };

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

  const toggleShuffle = () => {
    setIsShuffled(prev => {
        const nextState = !prev;
        if (nextState && isLooping) setIsLooping(false);
        return nextState;
    });
  };

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
        // Sembunyikan header untuk layar tertentu
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

const styles = StyleSheet.create({}); // Kosong karena style diatur di screenOptions