// File: components/molecules/ProgressSlider.js
// Penjelasan:
// Molekul ini sekarang menggunakan warna global.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

// Impor warna global
import { TEXT_PRIMARY, TEXT_SECONDARY, PROGRESS_TRACK } from '../../src/constants/colors';

// Definisi warna lokal DIHAPUS

// Helper: ubah milidetik ke format mm:ss (tetap sama)
function formatMillis(millis) {
  if (!millis) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

const ProgressSlider = ({
  positionMillis,
  durationMillis,
  onSlidingStart,
  onSlidingComplete,
  disabled,
}) => {
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.timeText}>{formatMillis(positionMillis)}</Text>
      <Slider
        style={styles.slider}
        value={positionMillis}
        maximumValue={durationMillis > 0 ? durationMillis : 1}
        minimumValue={0}
        minimumTrackTintColor={TEXT_PRIMARY} // DIUBAH
        maximumTrackTintColor={PROGRESS_TRACK} // DIUBAH
        thumbTintColor={TEXT_PRIMARY} // DIUBAH
        onSlidingStart={onSlidingStart}
        onSlidingComplete={onSlidingComplete}
        disabled={disabled}
      />
      <Text style={styles.timeText}>{formatMillis(durationMillis)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  timeText: {
    color: TEXT_SECONDARY, // DIUBAH
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
});

export default ProgressSlider;