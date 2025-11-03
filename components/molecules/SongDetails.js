// File: components/molecules/SongDetails.js
// Penjelasan:
// Molekul ini sekarang menggunakan warna global.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Impor warna global
import { TEXT_PRIMARY, TEXT_SECONDARY, LIKE } from '../../src/constants/colors';

// Definisi warna lokal DIHAPUS

const SongDetails = ({ title, artist, isLiked, onToggleLike }) => {
  return (
    <View style={styles.songInfoContainer}>
      <View style={styles.titleContainer}>
        <View style={styles.titleTextContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{artist}</Text>
        </View>
        <TouchableOpacity onPress={onToggleLike} style={styles.likeButton}>
          <Ionicons 
            name={isLiked ? 'heart' : 'heart-outline'} 
            size={30} 
            color={isLiked ? LIKE : TEXT_SECONDARY} // DIUBAH
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  songInfoContainer: {
    width: '100%',
    marginBottom: 25,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  titleTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_PRIMARY, // DIUBAH
    marginBottom: 8,
  },
  artist: {
    fontSize: 18,
    color: TEXT_SECONDARY, // DIUBAH
  },
  likeButton: {
    paddingLeft: 10,
  },
});

export default SongDetails;