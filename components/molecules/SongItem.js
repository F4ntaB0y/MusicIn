// File: components/molecules/SongItem.js
// Penjelasan:
// Molekul ini sekarang menggunakan warna global dari /src/constants/colors.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Impor warna global
// Path: ../../ (keluar dari molecules, keluar dari components)
import { TEXT_PRIMARY, TEXT_SECONDARY, THEME } from '../../src/constants/colors';

// Definisi warna lokal DIHAPUS

const SongItem = ({ item, isPlaying, isLiked, onPress }) => {
  
  const renderRightIcon = () => {
    if (isPlaying) {
      // Menggunakan THEME
      return <Ionicons name="volume-medium" size={24} color={THEME} style={styles.statusIcon} />;
    }
    if (isLiked) {
      // Menggunakan THEME
      return <Ionicons name="heart" size={24} color={THEME} style={styles.statusIcon} />;
    }
    return null;
  };

  return (
    <TouchableOpacity style={styles.songItemContainer} onPress={onPress}>
      <Image source={{ uri: item.artwork }} style={styles.artwork} />
      <View style={styles.songInfo}>
        <Text 
          style={[styles.songTitle, isPlaying && styles.playingText]} 
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      {renderRightIcon()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  songItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20, 
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY, // DIUBAH
  },
  songArtist: {
    fontSize: 14,
    color: TEXT_SECONDARY, // DIUBAH
  },
  playingText: {
    color: THEME, // DIUBAH
  },
  statusIcon: {
    marginLeft: 10,
  },
});

export default SongItem;