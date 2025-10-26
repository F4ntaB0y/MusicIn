// Nama File: screens/PlayerScreen.js
// Pemeriksaan ulang: Pastikan tidak ada teks di luar <Text>

import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

const BACKGROUND_COLOR = '#121212';
const TEXT_COLOR = '#FFFFFF';
const SUBTEXT_COLOR = '#A0AEC0';
const LIKE_COLOR = '#1DB954';
const PROGRESS_TRACK_COLOR = '#404040';
const BUTTON_COLOR = '#282828';
const screenWidth = Dimensions.get('window').width;
const albumArtSize = screenWidth * 0.8;

function formatMillis(millis) {
  if (!millis) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default function PlayerScreen({
  song, onNext, onPrev, isShuffled, onShuffleToggle, isLooping, onLoopToggle, isLiked, onToggleLike
}) {

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
    if (!songAsset) return; setIsLoading(true); setIsPlaying(false); setPositionMillis(0); setDurationMillis(0); setIsSliderDisabled(true); if (sound) await sound.unloadAsync(); try { await Audio.setAudioModeAsync({ playsInSilentModeIOS: true }); const { sound: newSound, status } = await Audio.Sound.createAsync( songAsset, { shouldPlay: true, isLooping: isLooping } ); if (status.isLoaded) { newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate); setSound(newSound); setIsPlaying(true); } else { setSound(null); setIsPlaying(false); console.error("Gagal load saat createAsync"); } setIsLoading(false); } catch (error) { console.error("Error loadAndPlaySound:", error); setIsLoading(false); setIsSliderDisabled(true); setSound(null); }
  }

  useEffect(() => { if (song) loadAndPlaySound(song.file); else if (sound) { sound.unloadAsync(); setSound(null); } }, [song]);
  useEffect(() => { return sound ? () => { sound.unloadAsync(); } : undefined; }, [sound]);

  const handlePlayPause = async () => { if (!sound) return; try { if (isPlaying) { await sound.pauseAsync(); setIsPlaying(false); } else { await sound.playAsync(); setIsPlaying(true); } } catch (error) { console.error("Error handlePlayPause:", error); setIsPlaying(false); } };
  const handleRepeat = async () => { onLoopToggle(); if (sound) { try { await sound.setIsLoopingAsync(!isLooping); } catch (error) { console.error("Error setting looping:", error); } } };
  const handleShuffle = () => onShuffleToggle();
  const handleSlidingStart = async () => { if (!sound || isSliderDisabled) return; setIsSeeking(true); setPlaybackStatusBeforeSeek(isPlaying); if (isPlaying) await sound.pauseAsync(); };
  const handleSlidingComplete = async (value) => { if (!sound || isSliderDisabled) return; if (value >= 0 && value <= durationMillis) { setPositionMillis(value); try { await sound.setPositionAsync(value); } catch (error) { console.warn("Error setPosition:", error); } } else { console.warn("Invalid seek:", value); } setIsSeeking(false); if (playbackStatusBeforeSeek) await sound.playAsync(); };
  const handleLikePress = () => { if (song && song.id) onToggleLike(song.id); else console.warn("Cannot like, no song id"); };

  if (!song) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={80} color={SUBTEXT_COLOR} />
          <Text style={styles.emptyText}>Pilih lagu</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Bagian Atas */}
        <View style={styles.topSection}>
            <Image style={styles.albumArt} source={{ uri: song.artwork }} onError={(e) => console.log("Gagal load artwork:", e.nativeEvent.error)} />
            <View style={styles.songInfoContainer}>
              <View style={styles.titleContainer}>
                <View style={styles.titleTextContainer}>
                  <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
                  <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
                </View>
                <TouchableOpacity onPress={handleLikePress} style={styles.likeButton}>
                  <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={30} color={isLiked ? LIKE_COLOR : SUBTEXT_COLOR} />
                </TouchableOpacity>
              </View>
            </View>
        </View>
        {/* Bagian Bawah */}
        <View style={styles.bottomSection}>
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatMillis(positionMillis)}</Text>
              <Slider
                style={styles.slider}
                value={positionMillis} maximumValue={durationMillis > 0 ? durationMillis : 1}
                minimumValue={0} minimumTrackTintColor={TEXT_COLOR} maximumTrackTintColor={PROGRESS_TRACK_COLOR}
                thumbTintColor={TEXT_COLOR} onSlidingStart={handleSlidingStart} onSlidingComplete={handleSlidingComplete}
                disabled={isSliderDisabled}
              />
              <Text style={styles.timeText}>{formatMillis(durationMillis)}</Text>
            </View>
            <View style={styles.controlsContainer}>
              <TouchableOpacity onPress={handleShuffle}>
                 <Ionicons name="shuffle" size={30} color={isShuffled ? LIKE_COLOR : SUBTEXT_COLOR}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={onPrev}>
                 <Ionicons name="play-skip-back" size={40} color={TEXT_COLOR} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playButton} onPress={handlePlayPause} disabled={isLoading} >
                 {isLoading ? <ActivityIndicator size="large" color={BACKGROUND_COLOR} /> : <Ionicons name={isPlaying ? 'pause' : 'play'} size={50} color={BACKGROUND_COLOR} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={onNext}>
                 <Ionicons name="play-skip-forward" size={40} color={TEXT_COLOR} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRepeat}>
                 <Ionicons name="repeat" size={30} color={isLooping ? LIKE_COLOR : SUBTEXT_COLOR}/>
              </TouchableOpacity>
            </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND_COLOR },
  container: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: '5%', paddingBottom: '5%' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, color: SUBTEXT_COLOR, marginTop: 15 },
  topSection: { alignItems: 'center' },
  bottomSection: { /* No specific style needed */ },
  albumArt: { width: albumArtSize, height: albumArtSize, borderRadius: 15, marginBottom: 30, backgroundColor: BUTTON_COLOR, },
  songInfoContainer: { width: '100%', marginBottom: 25 },
  titleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  titleTextContainer: { flex: 1, marginRight: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: TEXT_COLOR, marginBottom: 8 },
  artist: { fontSize: 18, color: SUBTEXT_COLOR },
  likeButton: { paddingLeft: 10 },
  progressContainer: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  timeText: { color: SUBTEXT_COLOR, fontSize: 12, minWidth: 40, textAlign: 'center' },
  slider: { flex: 1, marginHorizontal: 10 },
  controlsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginBottom: 15 },
  playButton: { backgroundColor: TEXT_COLOR, borderRadius: 35, width: 70, height: 70, justifyContent: 'center', alignItems: 'center' },
});