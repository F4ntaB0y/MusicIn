// Nama File: screens/ProfileScreen.js

import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator // Pastikan ini diimpor jika Anda menggunakan isLoading
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const BACKGROUND_COLOR = '#121212';
const TEXT_COLOR = '#FFFFFF';
const SUBTEXT_COLOR = '#A0AEC0';
const THEME_COLOR = '#63B3ED'; // Biru muda
const BUTTON_COLOR = '#282828';

const STORAGE_KEY_NAME = '@profile_name';
const STORAGE_KEY_IMAGE = '@profile_image';

export default function ProfileScreen() {

  const [name, setName] = useState('Pengguna Tamu');
  const [imageUri, setImageUri] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isLoading, setIsLoading] = useState(true); // State loading

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true); // Mulai loading
    try {
      const storedName = await AsyncStorage.getItem(STORAGE_KEY_NAME);
      const storedImage = await AsyncStorage.getItem(STORAGE_KEY_IMAGE);
      setName(storedName !== null ? storedName : 'Pengguna Tamu');
      setImageUri(storedImage !== null ? storedImage : null);
    } catch (e) {
      console.error("Gagal memuat data profil", e);
      setName('Pengguna Tamu'); // Set default jika error
      setImageUri(null);
      Alert.alert("Error", "Gagal memuat data profil.");
    } finally {
      setIsLoading(false); // Selesai loading
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin diperlukan', 'Izin galeri diperlukan.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) {
      const newImageUri = result.assets[0].uri;
      setImageUri(newImageUri);
      await AsyncStorage.setItem(STORAGE_KEY_IMAGE, newImageUri);
    }
  };

  const handleEditName = () => {
    setTempName(name);
    setIsModalVisible(true);
  };

  const handleSaveName = async () => {
    const newName = tempName.trim();
    if (newName.length > 0) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_NAME, newName);
        setName(newName);
        setIsModalVisible(false);
      } catch (e) { Alert.alert("Error", "Gagal menyimpan nama."); }
    } else { Alert.alert("Nama tidak valid", "Nama tidak boleh kosong."); }
  };

  const handleCloseModal = () => setIsModalVisible(false);

  // Tampilkan loading jika sedang memuat
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={THEME_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal transparent={true} animationType="fade" visible={isModalVisible} onRequestClose={handleCloseModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Nama</Text>
            <Text style={styles.modalSubtitle}>Masukkan nama baru:</Text>
            <TextInput style={styles.textInput} value={tempName} onChangeText={setTempName} placeholder="Nama Baru..." placeholderTextColor={SUBTEXT_COLOR}/>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={handleCloseModal}><Text style={styles.modalButtonText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonSave]} onPress={handleSaveName}><Text style={styles.modalButtonText}>Simpan</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.container}>
        <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.profileImage} /> : <View style={styles.imagePlaceholder}><Ionicons name="person" size={80} color={SUBTEXT_COLOR} /></View>}
          <View style={styles.editIcon}><Ionicons name="camera" size={20} color={TEXT_COLOR} /></View>
        </TouchableOpacity>
        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.userHandle}>@{name.replace(/\s/g, '').toLowerCase() || 'pengguna'}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleEditName}>
            <Ionicons name="pencil" size={20} color={TEXT_COLOR} /><Text style={styles.buttonText}>Edit Nama</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND_COLOR },
  container: { flex: 1, alignItems: 'center', padding: 20, paddingTop: 40 }, // Kurangi marginTop sedikit
  loadingContainer: { // Style baru untuk loading
    justifyContent: 'center',
  },
  imageContainer: { marginBottom: 20 },
  profileImage: { width: 150, height: 150, borderRadius: 75, borderWidth: 3, borderColor: THEME_COLOR },
  imagePlaceholder: { width: 150, height: 150, borderRadius: 75, backgroundColor: BUTTON_COLOR, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: BUTTON_COLOR },
  editIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 15 },
  userName: { fontSize: 28, fontWeight: 'bold', color: TEXT_COLOR },
  userHandle: { fontSize: 16, color: SUBTEXT_COLOR, marginBottom: 30 },
  buttonContainer: { width: '100%' },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: BUTTON_COLOR, padding: 15, borderRadius: 10, marginBottom: 15 },
  buttonText: { color: TEXT_COLOR, fontSize: 16, marginLeft: 15 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: '#1e1e1e', borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: TEXT_COLOR, marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: SUBTEXT_COLOR, marginBottom: 15 },
  textInput: { backgroundColor: BACKGROUND_COLOR, color: TEXT_COLOR, padding: 10, borderRadius: 8, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: BUTTON_COLOR },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
  modalButtonCancel: { backgroundColor: BUTTON_COLOR },
  modalButtonSave: { backgroundColor: THEME_COLOR },
  modalButtonText: { color: TEXT_COLOR, fontWeight: 'bold' },
});