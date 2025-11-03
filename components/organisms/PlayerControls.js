// File: src/components/organisms/PlayerControls.js
// Penjelasan:
// Organisme ini menggabungkan semua tombol kontrol pemutaran.
// (Shuffle, Prev, Play/Pause, Next, Repeat).

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Impor warna global
import { 
  BACKGROUND, 
  TEXT_PRIMARY, 
  TEXT_SECONDARY, 
  LIKE 
} from '../../src/constants/colors';

const PlayerControls = ({
  isLoading,
  isPlaying,
  isShuffled,
  isLooping,
  onPlayPause,
  onPrev,
  onNext,
  onShuffle,
  onRepeat,
}) => {
  return (
    <View style={styles.controlsContainer}>
      <TouchableOpacity onPress={onShuffle}>
         <Ionicons name="shuffle" size={30} color={isShuffled ? LIKE : TEXT_SECONDARY}/>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPrev}>
         <Ionicons name="play-skip-back" size={40} color={TEXT_PRIMARY} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.playButton} onPress={onPlayPause} disabled={isLoading} >
         {isLoading 
           ? <ActivityIndicator size="large" color={BACKGROUND} /> 
           : <Ionicons name={isPlaying ? 'pause' : 'play'} size={50} color={BACKGROUND} />
         }
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onNext}>
         <Ionicons name="play-skip-forward" size={40} color={TEXT_PRIMARY} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onRepeat}>
         <Ionicons name="repeat" size={30} color={isLooping ? LIKE : TEXT_SECONDARY}/>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-around', 
    width: '100%', 
    marginBottom: 15 
  },
  playButton: { 
    backgroundColor: TEXT_PRIMARY, 
    borderRadius: 35, 
    width: 70, 
    height: 70, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});

export default PlayerControls;