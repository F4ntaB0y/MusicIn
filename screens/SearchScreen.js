// Nama File: screens/SearchScreen.js
// Perbaikan: Mengembalikan JSX lengkap untuk SongItem

import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BACKGROUND_COLOR = '#121212';
const TEXT_COLOR = '#FFFFFF';
const SUBTEXT_COLOR = '#A0AEC0';
const BUTTON_COLOR = '#282828';
const THEME_COLOR = '#1DB954'; // Hijau Spotify

// === KEMBALIKAN JSX LENGKAP DI SINI ===
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
// === AKHIR PENGEMBALIAN ===

export default function SearchScreen({
  navigation,
  songList,
  currentSong,
  setCurrentSongIndex
}) {

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSongs = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return songList.filter(song =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
    );
  }, [searchQuery, songList]);

  const handlePlaySong = (selectedSong) => {
    const originalIndex = songList.findIndex(song => song.id === selectedSong.id);
    if (originalIndex !== -1) {
      setCurrentSongIndex(originalIndex);
      navigation.navigate('Player');
    }
  };

  const renderItem = ({ item }) => {
    const isPlaying = currentSong?.id === item.id;
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
      <View style={styles.container}>
        <Text style={styles.title}>Pencarian</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={SUBTEXT_COLOR} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Artis atau lagu..."
            placeholderTextColor={SUBTEXT_COLOR}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {filteredSongs.length > 0 ? (
          <FlatList
            data={filteredSongs}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            extraData={currentSong?.id}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={80} color={SUBTEXT_COLOR} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Tidak ada hasil ditemukan' : 'Temukan musik favorit Anda.'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND_COLOR },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: TEXT_COLOR, marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: BUTTON_COLOR, borderRadius: 8, paddingHorizontal: 10, marginBottom: 15 },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, color: TEXT_COLOR, fontSize: 16, paddingVertical: 12 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: SUBTEXT_COLOR, marginTop: 15 },
  list: { flex: 1 },
  songItemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  artwork: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 16, fontWeight: 'bold', color: TEXT_COLOR },
  songArtist: { fontSize: 14, color: SUBTEXT_COLOR },
  playingText: { color: THEME_COLOR },
  playingIcon: { marginLeft: 10 },
});