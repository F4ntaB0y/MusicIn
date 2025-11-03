// Nama File: screens/ProfileScreen.js
// PERUBAHAN: 'bottom' dihapus dari prop 'edges' di SafeAreaView

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
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

// Impor warna global
import { 
  BACKGROUND, 
  TEXT_PRIMARY, 
  TEXT_SECONDARY, 
  PROFILE_THEME, 
  BUTTON_PRIMARY 
} from '../src/constants/colors';

const STORAGE_KEY_NAME = '@profile_name';
const STORAGE_KEY_IMAGE = '@profile_image';

export default function ProfileScreen() {

  // ... (State dan semua fungsi tetap sama) ...
  const [name, setName] = useState('Pengguna Tamu');
  const [imageUri, setImageUri] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const storedName = await AsyncStorage.getItem(STORAGE_KEY_NAME);
      const storedImage = await AsyncStorage.getItem(STORAGE_KEY_IMAGE);
      setName(storedName !== null ? storedName : 'Pengguna Tamu');
      setImageUri(storedImage !== null ? storedImage : null);
    } catch (e) {
      console.error("Gagal memuat data profil", e);
      setName('Pengguna Tamu');
      setImageUri(null);
      Alert.alert("Error", "Gagal memuat data profil.");
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      // PERUBAHAN DI BARIS INI: 'bottom' dihapus
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={PROFILE_THEME} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    // PERUBAHAN DI BARIS INI: 'bottom' dihapus
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <Modal transparent={true} animationType="fade" visible={isModalVisible} onRequestClose={handleCloseModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Nama</Text>
            <Text style={styles.modalSubtitle}>Masukkan nama baru:</Text>
            <TextInput style={styles.textInput} value={tempName} onChangeText={setTempName} placeholder="Nama Baru..." placeholderTextColor={TEXT_SECONDARY}/>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={handleCloseModal}><Text style={styles.modalButtonText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonSave]} onPress={handleSaveName}><Text style={styles.modalButtonText}>Simpan</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.container}>
        <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.profileImage} /> : <View style={styles.imagePlaceholder}><Ionicons name="person" size={80} color={TEXT_SECONDARY} /></View>}
          <View style={styles.editIcon}><Ionicons name="camera" size={20} color={TEXT_PRIMARY} /></View>
        </TouchableOpacity>
        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.userHandle}>@{name.replace(/\s/g, '').toLowerCase() || 'pengguna'}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleEditName}>
            <Ionicons name="pencil" size={20} color={TEXT_PRIMARY} /><Text style={styles.buttonText}>Edit Nama</Text>
          </TouchableOpacity>
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
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 40 
  },
  loadingContainer: {
    justifyContent: 'center',
  },
  imageContainer: { 
    marginBottom: 20 
  },
  profileImage: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    borderWidth: 3, 
    borderColor: PROFILE_THEME, 
  },
  imagePlaceholder: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    backgroundColor: BUTTON_PRIMARY, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: BUTTON_PRIMARY, 
  },
  editIcon: { 
    position: 'absolute', 
    bottom: 5, 
    right: 5, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    padding: 8, 
    borderRadius: 15 
  },
  userName: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: TEXT_PRIMARY, 
  },
  userHandle: { 
    fontSize: 16, 
    color: TEXT_SECONDARY, 
    marginBottom: 30 
  },
  buttonContainer: { 
    width: '100%' 
  },
  button: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: BUTTON_PRIMARY, 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15 
  },
  buttonText: { 
    color: TEXT_PRIMARY, 
    fontSize: 16, 
    marginLeft: 15 
  },
  modalBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: { 
    width: '90%', 
    backgroundColor: '#1e1e1e', 
    borderRadius: 10, 
    padding: 20 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: TEXT_PRIMARY, 
    marginBottom: 5 
  },
  modalSubtitle: { 
    fontSize: 14, 
    color: TEXT_SECONDARY, 
    marginBottom: 15 
  },
  textInput: { 
    backgroundColor: BACKGROUND, 
    color: TEXT_PRIMARY, 
    padding: 10, 
    borderRadius: 8, 
    fontSize: 16, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: BUTTON_PRIMARY, 
  },
  modalButtonRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end' 
  },
  modalButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    marginLeft: 10 
  },
  modalButtonCancel: { 
    backgroundColor: BUTTON_PRIMARY, 
  },
  modalButtonSave: { 
    backgroundColor: PROFILE_THEME, 
  },
  modalButtonText: { 
    color: TEXT_PRIMARY, 
    fontWeight: 'bold' 
  },
});