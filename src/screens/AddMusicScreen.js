import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth'; 
import MyInput from '../components/atoms/MyInput';
import MyButton from '../components/atoms/MyButton';
import { theme } from '../styles/theme';
import { Music, DownloadCloud } from 'lucide-react-native';

export default function AddMusicScreen({ navigation }) {
  const { user } = useAuth();
  
  const [youtubeLink, setYoutubeLink] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [coverUrl, setCoverUrl] = useState(''); 
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(false);

  const handleAutoFill = async () => {
    if (!youtubeLink.includes('youtu')) {
      Alert.alert('Link Salah', 'Pastikan link berasal dari YouTube.');
      return;
    }
    setFetchingInfo(true);
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=${youtubeLink}&format=json`);
      if (!response.ok) throw new Error('Video tidak ditemukan');
      const data = await response.json();
      
      setCoverUrl(data.thumbnail_url); 
      const fullTitle = data.title;
      
      if (fullTitle.includes('-')) {
        const parts = fullTitle.split('-');
        setArtist(parts[0].trim());
        const cleanTitle = parts[1].replace(/(\(Official.*?\)|\[.*?\])/gi, '').trim();
        setTitle(cleanTitle);
      } else {
        setTitle(fullTitle);
        setArtist(data.author_name.replace(' - Topic', ''));
      }
      setAlbum('Single'); 
      Alert.alert('Berhasil!', 'Data lagu berhasil diambil.');
    } catch (error) {
      Alert.alert('Gagal', 'Tidak bisa mengambil data.');
    } finally {
      setFetchingInfo(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) { console.log('Error picking file:', err); }
  };

  const handleSave = async () => {
    if (!user || !user.id) { Alert.alert('Error', 'Silakan Login ulang.'); return; }
    if (!title || !artist || !selectedFile) { Alert.alert('Data Kurang', 'Judul, Artis, dan File MP3 wajib diisi.'); return; }

    setLoading(true);
    try {
      const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${Date.now()}-${safeTitle}.mp3`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({ from: selectedFile.uri, to: newPath });

      const { error } = await supabase.from('songs').insert({
        user_id: user.id,
        title: title,
        artist: artist,
        local_uri: newPath,
        cover_url: coverUrl || 'https://placehold.co/150x150/1DB954/FFFFFF.png?text=Music',
      });

      if (error) throw error;
      
      await supabase.from('activities').insert({ user_id: user.id, action_type: 'added_song' });

      Alert.alert('Berhasil', 'Lagu tersimpan!');
      navigation.goBack();

    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', error.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Tambah Lagu</Text>

      {/* Auto Fill Section */}
      <View style={styles.autoFillContainer}>
        <Text style={styles.sectionLabel}>Isi Otomatis dari YouTube</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <MyInput placeholder="Paste Link YouTube..." value={youtubeLink} onChangeText={setYoutubeLink} />
          </View>
          <TouchableOpacity style={styles.fetchButton} onPress={handleAutoFill} disabled={fetchingInfo}>
            {fetchingInfo ? <Text style={{color:'white'}}>...</Text> : <DownloadCloud color="white" size={20} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Preview Gambar */}
      {coverUrl !== '' && (
        <View style={styles.coverPreview}>
          <Image source={{ uri: coverUrl }} style={styles.coverImage} />
        </View>
      )}

      {/* Form Input Manual */}
      <MyInput label="Judul Lagu" value={title} onChangeText={setTitle} />
      <MyInput label="Nama Artis" value={artist} onChangeText={setArtist} />
      
      <MyInput 
        label="Link Gambar Cover (Opsional)" 
        placeholder="https://contoh.com/gambar.jpg"
        value={coverUrl} 
        onChangeText={setCoverUrl} 
      />

      <Text style={[styles.sectionLabel, { marginTop: theme.spacing.m }]}>File MP3</Text>
      <TouchableOpacity onPress={pickDocument} style={styles.uploadArea}>
        {selectedFile ? (
          <View style={{ alignItems: 'center' }}>
            <Music size={40} color={theme.colors.primary} />
            <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Music size={40} color={theme.colors.textSecondary} />
            <Text style={styles.uploadText}>Pilih File MP3 dari HP</Text>
          </View>
        )}
      </TouchableOpacity>

      <MyButton 
        title={loading ? 'Menyimpan...' : 'SIMPAN'} 
        onPress={handleSave} 
        // Margin dihapus disini karena sudah ditangani padding container
        disabled={loading} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    backgroundColor: theme.colors.background, 
    padding: theme.spacing.l, 
    paddingTop: 50,
    // PERBAIKAN UTAMA: Tambahkan padding bawah besar agar tombol naik di atas menu navigasi
    paddingBottom: 150 
  },
  header: { ...theme.typography.header, marginBottom: theme.spacing.l },
  sectionLabel: { ...theme.typography.body, color: theme.colors.textPrimary, fontWeight: 'bold', marginBottom: theme.spacing.s },
  autoFillContainer: { backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: 8, marginBottom: theme.spacing.l },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s },
  fetchButton: { backgroundColor: theme.colors.primary, height: 50, width: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginBottom: theme.spacing.m },
  coverPreview: { alignItems: 'center', marginBottom: theme.spacing.l },
  coverImage: { width: 150, height: 150, borderRadius: 8 },
  uploadArea: { 
    height: 120, 
    backgroundColor: theme.colors.surface, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: theme.colors.textSecondary, 
    borderStyle: 'dashed', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 20 // Jarak sebelum tombol simpan
  },
  uploadText: { color: theme.colors.textSecondary, marginTop: theme.spacing.s },
  fileName: { color: theme.colors.primary, marginTop: theme.spacing.s, fontWeight: 'bold', paddingHorizontal: 10 },
});