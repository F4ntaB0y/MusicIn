// Nama File: screens/SearchScreen.js
// PERUBAHAN: 'bottom' dihapus dari prop 'edges' di SafeAreaView

import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Impor Molekul
import SongItem from '../components/molecules/SongItem';
import SearchBar from '../components/molecules/SearchBar';

// Impor warna global
import { BACKGROUND, TEXT_SECONDARY } from '../src/constants/colors';

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
    // PERUBAHAN DI BARIS INI: 'bottom' dihapus
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Artis atau lagu..."
        />
        
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
            <Ionicons name="musical-notes-outline" size={80} color={TEXT_SECONDARY} />
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
  safeArea: { 
    flex: 1, 
    backgroundColor: BACKGROUND, 
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 10 
  },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyText: { 
    fontSize: 16, 
    color: TEXT_SECONDARY, 
    marginTop: 15 
  },
  list: { 
    flex: 1 
  },
});