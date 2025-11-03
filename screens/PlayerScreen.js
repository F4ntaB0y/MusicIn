// Nama File: screens/PlayerScreen.js
// PERUBAHAN: Menggunakan organisme PlayerControls

import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
// TouchableOpacity dihapus dari import utama, karena tombol ada di PlayerControls
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

// Impor Molekul
import ProgressSlider from '../components/molecules/ProgressSlider';
import SongDetails from '../components/molecules/SongDetails';
// Impor Organisme
import PlayerControls from '../components/organisms/PlayerControls';

// Impor warna global
import { 
  BACKGROUND, 
  TEXT_PRIMARY, 
  TEXT_SECONDARY, 
  LIKE, 
  BUTTON_PRIMARY 
} from '../src/constants/colors';

const screenWidth = Dimensions.get('window').width;
const albumArtSize = screenWidth * 0.8;

export default function PlayerScreen({
  song, onNext, onPrev, isShuffled, onShuffleToggle, isLooping, onLoopToggle, isLiked, onToggleLike
}) {

  // ... (State dan semua fungsi tetap sama) ...
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [playbackStatusBeforeSeek, setPlaybackStatusBeforeSeek] = useState(false);
  const [isSliderDisabled, setIsSliderDisabled] = useState(true);

  useEffect(() => { setIsSliderDisabled(isLoading || !sound); }, [isLoading, sound]);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      if (!isSeeking) setPositionMillis(status.positionMillis);
      setDurationMillis(status.durationMillis);
      if (status.didJustFinish && !isLooping) onNext(); 
    } else {
      if (status.error) console.error(`[PlayerScreen] Playback Error: ${status.error}`);
      setIsSliderDisabled(true); setPositionMillis(0); setDurationMillis(0);
    }
  };

  async function loadAndPlaySound(songAsset) {
    if (!songAsset) return;
    setIsLoading(true); setIsPlaying(false); setPositionMillis(0); setDurationMillis(0); setIsSliderDisabled(true);
    if (sound) await sound.unloadAsync();
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        songAsset,
        { shouldPlay: true, isLooping: isLooping } 
      );
      if (status.isLoaded) {
        newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        setSound(newSound);
        setIsPlaying(true);
      } else {
        setSound(null);
        setIsPlaying(false);
        console.error("Gagal load saat createAsync");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loadAndPlaySound:", error);
      setIsLoading(false);
      setIsSliderDisabled(true);
      setSound(null);
    }
  }

  useEffect(() => {
    if (song) loadAndPlaySound(song.file);
    else if (sound) { sound.unloadAsync(); setSound(null); }
  }, [song]); 

  useEffect(() => { return sound ? () => { sound.unloadAsync(); } : undefined; }, [sound]);

  useEffect(() => {
    const setLoopingStatus = async () => {
      if (sound) {
        try {
          await sound.setIsLoopingAsync(isLooping);
        } catch (error) {
          console.error("Error sinkronisasi isLooping:", error);
        }
      }
    };
    
    setLoopingStatus();
  }, [isLooping, sound]);

  const handlePlayPause = async () => {
    if (!sound) return;
    try {
      if (isPlaying) { await sound.pauseAsync(); setIsPlaying(false); }
      else { await sound.playAsync(); setIsPlaying(true); }
    } catch (error) { console.error("Error handlePlayPause:", error); setIsPlaying(false); }
  };

  const handleRepeat = async () => {
    onLoopToggle();
  };

  const handleShuffle = () => onShuffleToggle();

  const handleSlidingStart = async () => {
    if (!sound || isSliderDisabled) return;
    setIsSeeking(true);
    setPlaybackStatusBeforeSeek(isPlaying);
    if (isPlaying) await sound.pauseAsync();
  };

  const handleSlidingComplete = async (value) => {
    if (!sound || isSliderDisabled) return;
    if (value >= 0 && value <= durationMillis) {
      setPositionMillis(value);
      try { await sound.setPositionAsync(value); } catch (error) { console.warn("Error setPosition:", error); }
    } else { console.warn("Invalid seek:", value); }
    setIsSeeking(false);
    if (playbackStatusBeforeSeek) await sound.playAsync();
  };

  const handleLikePress = () => { if (song && song.id) onToggleLike(song.id); else console.warn("Cannot like, no song id"); };


  if (!song) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={80} color={TEXT_SECONDARY} />
          <Text style={styles.emptyText}>Pilih lagu</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={styles.container}>
        <View style={styles.topSection}>
            <Image style={styles.albumArt} source={{ uri: song.artwork }} onError={(e) => console.log("Gagal load artwork:", e.nativeEvent.error)} />
            
            <SongDetails
              title={song.title}
              artist={song.artist}
              isLiked={isLiked}
              onToggleLike={handleLikePress}
            />
        </View>
        
        <View style={styles.bottomSection}>
            <ProgressSlider
              positionMillis={positionMillis}
              durationMillis={durationMillis}
              onSlidingStart={handleSlidingStart}
              onSlidingComplete={handleSlidingComplete}
              disabled={isSliderDisabled}
            />
            
            {/* PERUBAHAN: Ganti <View> dengan <PlayerControls> */}
            <PlayerControls
              isLoading={isLoading}
              isPlaying={isPlaying}
              isShuffled={isShuffled}
              isLooping={isLooping}
              onPlayPause={handlePlayPause}
              onPrev={onPrev}
              onNext={onNext}
              onShuffle={handleShuffle}
              onRepeat={handleRepeat}
            />
        </View>
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
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: '5%', 
    paddingBottom: '5%' 
  },
  emptyContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  emptyText: { 
    fontSize: 18, 
    color: TEXT_SECONDARY, 
    marginTop: 15 
  },
  topSection: { 
    alignItems: 'center' 
  },
  bottomSection: { /* No specific style needed */ },
  albumArt: { 
    width: albumArtSize, 
    height: albumArtSize, 
    borderRadius: 15, 
    marginBottom: 30, 
    backgroundColor: BUTTON_PRIMARY, 
  },
  // PERUBAHAN: Style 'controlsContainer' dan 'playButton' DIHAPUS
});