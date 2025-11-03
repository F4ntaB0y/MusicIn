// Nama File: screens/MusicListScreen.js
// PERUBAHAN: 'bottom' dihapus dari prop 'edges' di SafeAreaView

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';

// Impor Molekul
import SongItem from '../components/molecules/SongItem';

// Impor warna global
import { BACKGROUND } from '../src/constants/colors';

export default function MusicListScreen({
  navigation,
  songList,
  currentSong,
  setCurrentSongIndex
}) {

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
  safeArea: { 
    flex: 1, 
    backgroundColor: BACKGROUND, 
  },
  list: { 
    flex: 1, 
  },
});