import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; 
import { supabase } from '../config/supabase';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../styles/theme';
import { Play, Pause, Music, Trash2, Edit, X } from 'lucide-react-native';
import MyButton from '../components/atoms/MyButton';

export default function HomeScreen() {
  const { user } = useAuth();
  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State Modal Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState(''); // STATE BARU UNTUK COVER
  const [saving, setSaving] = useState(false);

  const { playSound, pauseSound, resumeSound, isPlaying, currentSong } = useMusicPlayer();

  const fetchSongs = async () => {
    if (!user) return;
    try {
      if (!refreshing) setLoading(true);
      const { data, error } = await supabase.from('songs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setSongs(data || []);
    } catch (err) { console.error(err.message); } 
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchSongs(); }, [user]));
  const onRefresh = () => { setRefreshing(true); fetchSongs(); };

  const handleDelete = (song) => {
    Alert.alert('Hapus Lagu', `Yakin ingin menghapus "${song.title}"?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: async () => {
            await supabase.from('songs').delete().eq('id', song.id);
            setSongs(prev => prev.filter(item => item.id !== song.id));
          }}
      ]);
  };

  const openEditModal = (song) => {
    setEditId(song.id);
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setEditCoverUrl(song.cover_url || ''); // Set nilai awal cover
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editTitle || !editArtist) { Alert.alert('Error', 'Judul dan Artis wajib diisi'); return; }
    setSaving(true);
    try {
        const { error } = await supabase.from('songs').update({ 
            title: editTitle, 
            artist: editArtist,
            cover_url: editCoverUrl // Update Cover di Database
        }).eq('id', editId);
        
        if (error) throw error;
        setModalVisible(false);
        fetchSongs(); 
        Alert.alert('Sukses', 'Data lagu diperbarui.');
    } catch (err) { Alert.alert('Gagal', err.message); } 
    finally { setSaving(false); }
  };

  const renderItem = ({ item }) => {
    const isActiveSong = currentSong?.id === item.id;
    const isThisSongPlaying = isActiveSong && isPlaying;
    return (
      <View style={[styles.card, isActiveSong && styles.activeCard]}>
        <TouchableOpacity style={styles.clickableArea} onPress={() => {
                if (isThisSongPlaying) pauseSound();
                else if (isActiveSong && !isPlaying) resumeSound();
                else playSound(item, songs); 
            }}>
            <Image source={{ uri: item.cover_url || 'https://placehold.co/100x100' }} style={styles.coverImage} />
            <View style={styles.textContainer}>
                <Text style={[styles.title, isActiveSong && { color: theme.colors.primary }]} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
            </View>
        </TouchableOpacity>
        <View style={styles.actionContainer}>
            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}><Edit size={18} color={theme.colors.textSecondary} /></TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}><Trash2 size={18} color={theme.colors.error} /></TouchableOpacity>
            <TouchableOpacity onPress={() => isThisSongPlaying ? pauseSound() : isActiveSong ? resumeSound() : playSound(item, songs)} style={styles.playBtnSmall}>
                {isThisSongPlaying ? <Pause size={20} color={theme.colors.primary} fill={theme.colors.primary} /> : <Play size={20} color={isActiveSong ? theme.colors.primary : theme.colors.white} />}
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Perpustakaan Saya</Text>
        <Text style={styles.headerSubtitle}>Koleksi pribadi Anda.</Text>
      </View>
      {loading && !refreshing ? ( <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View> ) : (
        <FlatList data={songs} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.listContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />} ListEmptyComponent={<View style={styles.emptyContainer}><Music size={50} color={theme.colors.textSecondary} style={{ marginBottom: 10, opacity: 0.5 }} /><Text style={styles.emptyText}>Belum ada lagu.</Text></View>} />
      )}

      {/* --- MODAL EDIT --- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Edit Info Lagu</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}><X color={theme.colors.textSecondary} /></TouchableOpacity>
                </View>

                {/* Preview Kecil */}
                <View style={{alignItems:'center', marginBottom: 15}}>
                     <Image source={{uri: editCoverUrl || 'https://placehold.co/100'}} style={{width:80, height:80, borderRadius:8}} />
                </View>

                <Text style={styles.inputLabel}>Judul Lagu</Text>
                <TextInput style={styles.input} value={editTitle} onChangeText={setEditTitle} placeholderTextColor="#666"/>

                <Text style={styles.inputLabel}>Nama Artis</Text>
                <TextInput style={styles.input} value={editArtist} onChangeText={setEditArtist} placeholderTextColor="#666"/>
                
                {/* INPUT BARU UNTUK COVER URL */}
                <Text style={styles.inputLabel}>Link Cover Album (URL)</Text>
                <TextInput style={styles.input} value={editCoverUrl} onChangeText={setEditCoverUrl} placeholder="https://..." placeholderTextColor="#666"/>

                <MyButton title={saving ? "Menyimpan..." : "SIMPAN PERUBAHAN"} onPress={handleUpdate} disabled={saving} style={{marginTop: 20}} />
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 50 },
  headerContainer: { paddingHorizontal: theme.spacing.l, marginBottom: theme.spacing.m },
  headerTitle: { ...theme.typography.header, color: theme.colors.white },
  headerSubtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 4 },
  listContainer: { paddingHorizontal: theme.spacing.m, paddingBottom: 120 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.surface, padding: theme.spacing.s, borderRadius: 12, marginBottom: theme.spacing.s },
  activeCard: { borderWidth: 1, borderColor: theme.colors.primary, backgroundColor: '#1DB95410' },
  clickableArea: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  coverImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#333' },
  textContainer: { flex: 1, marginLeft: theme.spacing.m, marginRight: 10 },
  title: { ...theme.typography.subHeader, fontSize: 16, color: theme.colors.white, marginBottom: 2 },
  artist: { ...theme.typography.body, fontSize: 14, color: theme.colors.textSecondary },
  actionContainer: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 8, marginRight: 5 },
  playBtnSmall: { padding: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: theme.colors.white, fontSize: 18 },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 20 },
  modalContent: { backgroundColor: theme.colors.surface, borderRadius: 15, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  inputLabel: { color: theme.colors.textSecondary, marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#121212', color: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' }
});