import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { theme } from '../styles/theme';
import { Play, Pause, SkipBack, SkipForward, Disc } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Fungsi Format Waktu (0 -> 00:00)
const formatTime = (millis) => {
  if (!millis || millis < 0) return "00:00";
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);
  
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  return `${formattedMinutes}:${formattedSeconds}`;
};

export default function MusicPlayerScreen() {
  const { 
    currentSong, isPlaying, pauseSound, resumeSound, 
    playNext, playPrev, position, duration 
  } = useMusicPlayer();

  const handlePlayPause = () => {
    isPlaying ? pauseSound() : resumeSound();
  };

  // Hitung persentase progress bar
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <View style={styles.container}>
        <Disc size={100} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
        <Text style={styles.emptyText}>Belum ada lagu yang diputar</Text>
        <Text style={styles.subText}>Pilih lagu dari Beranda untuk mulai mendengarkan</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. HEADER KECIL */}
      <View style={styles.header}>
        <Text style={styles.headerText}>SEDANG DIPUTAR</Text>
      </View>

      {/* 2. COVER ALBUM BESAR */}
      <View style={styles.coverContainer}>
        <Image 
          source={{ uri: currentSong.cover_url || 'https://placehold.co/300x300/1DB954/FFFFFF.png' }} 
          style={styles.coverImage} 
        />
      </View>

      {/* 3. INFO LAGU */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{currentSong.title}</Text>
        <Text style={styles.artist}>{currentSong.artist}</Text>
        <Text style={styles.album}>{currentSong.album || 'Single'}</Text>
      </View>

      {/* 4. PROGRESS BAR AKTIF */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          {/* Garis Hijau yang bergerak sesuai durasi */}
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} /> 
        </View>
        <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* 5. KONTROL UTAMA */}
      <View style={styles.controlsContainer}>
        {/* Tombol Previous */}
        <TouchableOpacity onPress={playPrev}>
          <SkipBack size={35} color={theme.colors.white} />
        </TouchableOpacity>

        {/* Tombol Play/Pause */}
        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
          {isPlaying ? (
            <Pause size={40} color="#000" fill="#000" />
          ) : (
            <Play size={40} color="#000" fill="#000" style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>

        {/* Tombol Next */}
        <TouchableOpacity onPress={playNext}>
          <SkipForward size={35} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.l,
  },
  emptyText: {
    ...theme.typography.subHeader,
    marginTop: theme.spacing.l,
    textAlign: 'center',
  },
  subText: {
    ...theme.typography.body,
    marginTop: theme.spacing.s,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  header: {
    position: 'absolute',
    top: 60,
  },
  headerText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  coverContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.l,
  },
  coverImage: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l,
  },
  title: {
    ...theme.typography.header,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  artist: {
    ...theme.typography.subHeader,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  album: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    opacity: 0.7,
  },
  progressContainer: {
    width: '90%', // Menggunakan width statis agar responsif di sini
    maxWidth: 400,
    marginBottom: theme.spacing.xl,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    marginBottom: theme.spacing.s,
    overflow: 'hidden', 
  },
  progressBarFill: {
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '60%',
  },
  playButton: {
    width: 70,
    height: 70,
    backgroundColor: theme.colors.primary,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
});