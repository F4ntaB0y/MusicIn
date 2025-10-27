// Nama File: screens/MusicListScreen.js
// Penjelasan singkat:
// Menampilkan daftar semua lagu (REAL_MUSIC).
// Tiap item bisa diketuk untuk memutar. State currentSong dipakai untuk menyorot item yang sedang diputar.
// Algoritma: saat dipilih -> cari index asli lagu di list -> setCurrentSongIndex -> navigasi ke Player.

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BACKGROUND_COLOR = '#121212';
const TEXT_COLOR = '#FFFFFF';
const SUBTEXT_COLOR = '#A0AEC0';
const THEME_COLOR = '#1DB954';

const SongItem = ({ item, isPlaying, onPress }) => (
  <TouchableOpacity style={styles.songItemContainer} onPress={onPress}>
    <Image source={{ uri: item.artwork }} style={styles.artwork} />
    <View style={styles.songInfo}>
      <Text style={[styles.songTitle, isPlaying && styles.playingText]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
    </View>
    {isPlaying && (
      <Ionicons name="volume-medium" size={24} color={THEME_COLOR} style={styles.playingIcon} />
    )}
  </TouchableOpacity>
);

export default function MusicListScreen({
  navigation,
  songList,
  currentSong,
  setCurrentSongIndex
}) {

  // handlePlaySong: temukan index asli dalam songList lalu set index.
  // Alasan: props yang diterima mungkin berasal dari array yang sama (REAL_MUSIC).
  const handlePlaySong = (selectedSong) => {
    const originalIndex = songList.findIndex(song => song.id === selectedSong.id);
    if (originalIndex !== -1) {
      setCurrentSongIndex(originalIndex);
      navigation.navigate('Player'); // pindah ke layar player
    }
  };

  const renderItem = ({ item }) => {
    const isPlaying = currentSong?.id === item.id; // cek apakah ini lagu yang sedang diputar
    return (
      <SongItem
        item={item}
        isPlaying={isPlaying}
        onPress={() => handlePlaySong(item)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Text style={styles.headerTitle}>Selamat Datang</Text>
      <FlatList
        data={songList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        extraData={currentSong?.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND_COLOR, },
  list: { flex: 1, },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: TEXT_COLOR, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, },
  songItemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, },
  artwork: { width: 50, height: 50, borderRadius: 8, marginRight: 15, },
  songInfo: { flex: 1, },
  songTitle: { fontSize: 16, fontWeight: 'bold', color: TEXT_COLOR, },
  songArtist: { fontSize: 14, color: SUBTEXT_COLOR, },
  playingText: { color: THEME_COLOR, },
  playingIcon: { marginLeft: 10, },
});
