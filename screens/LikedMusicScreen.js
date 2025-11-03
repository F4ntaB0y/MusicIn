// Nama File: screens/LikedMusicScreen.js
// PERUBAHAN: 'bottom' dihapus dari prop 'edges' di SafeAreaView

import React from 'react';
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

// Impor warna global
import { BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY } from '../src/constants/colors';

export default function LikedMusicScreen({
  navigation,
  allSongs,
  likedSongIds,
  currentSong,
  setCurrentSongIndex
}) {

  const likedSongs = allSongs.filter(song => likedSongIds.has(song.id));

  const handlePlaySong = (selectedSong) => {
    const originalIndex = allSongs.findIndex(song => song.id === selectedSong.id);
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
        isLiked={true} 
        onPress={() => handlePlaySong(item)}
      />
    );
  };

  return (
    // PERUBAHAN DI BARIS INI: 'bottom' dihapus
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        {likedSongs.length > 0 ? (
            <FlatList
                data={likedSongs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
                extraData={currentSong?.id}
            />
        ) : (
            <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={80} color={TEXT_SECONDARY} />
                <Text style={styles.emptyText}>Belum ada lagu disukai.</Text>
                <Text style={styles.emptySubText}>Tekan ikon hati untuk menyimpan.</Text>
            </View>
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: BACKGROUND, 
  },
  list: { 
    flex: 1 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  emptyText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: TEXT_PRIMARY, 
    textAlign: 'center', 
    marginTop: 20 
  },
  emptySubText: { 
    fontSize: 14, 
    color: TEXT_SECONDARY, 
    textAlign: 'center', 
    marginTop: 10 
  }
});