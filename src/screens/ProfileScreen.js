import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TextInput, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import MyButton from '../components/atoms/MyButton';
import { theme } from '../styles/theme';
import { Edit2, Save, X, Camera, LogOut } from 'lucide-react-native';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/9.x/adventurer/png?seed=Felix',
  'https://api.dicebear.com/9.x/adventurer/png?seed=Aneka',
  'https://api.dicebear.com/9.x/adventurer/png?seed=Gizmo',
  'https://api.dicebear.com/9.x/adventurer/png?seed=Zoey',
  'https://api.dicebear.com/9.x/adventurer/png?seed=Trouble',
  'https://api.dicebear.com/9.x/adventurer/png?seed=Bandit',
  'https://api.dicebear.com/9.x/adventurer/png?seed=Cuddles',
  'https://api.dicebear.com/9.x/adventurer/png?seed=Midnight',
];

// PERBAIKAN 1: Tambahkan { navigation } di sini
export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); 

      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email.split('@')[0], 
            full_name: 'User Baru',
            avatar_url: AVATAR_OPTIONS[0]
          })
          .select()
          .single();
        if (createError) throw createError;
        data = newProfile;
      }
      setProfile(data);
      setNewUsername(data.username);
    } catch (error) {
      console.error('Error Profile Fetch:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [user]);

  const handleUpdateProfile = async () => {
    if (!newUsername.trim()) { alert('Username kosong.'); return; }
    setSaving(true);
    try {
        const { error } = await supabase.from('profiles').update({ username: newUsername, updated_at: new Date() }).eq('id', user.id);
        if (error) throw error;
        setProfile({ ...profile, username: newUsername });
        setIsEditing(false);
        alert('Sukses: Username diperbarui.');
    } catch (error) { alert('Gagal: ' + error.message); } 
    finally { setSaving(false); }
  };

  const handleSelectAvatar = async (url) => {
    setAvatarModalVisible(false);
    setProfile({ ...profile, avatar_url: url });
    try { await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id); } 
    catch (error) { fetchProfile(); }
  };

  // PERBAIKAN 2: Logic Logout yang Lebih Kuat (Web Friendly)
  const confirmLogout = async () => {
    setLogoutModalVisible(false); // Tutup modal dulu
    
    try {
        // 1. Logout dari Supabase
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // 2. PAKSA PINDAH KE LOGIN (Penting untuk Web)
        // Kita gunakan reset agar user tidak bisa tekan tombol 'Back' kembali ke profil
        if (navigation) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }], // Pastikan nama route Login Anda sesuai (misal: 'Login' atau 'Auth')
            });
        }
    } catch (error) {
        console.error("Logout Error:", error);
        // Fallback jika navigasi gagal (biasanya karena App.js sudah otomatis switch stack)
        // Kita biarkan saja karena biasanya user = null akan mentrigger App.js
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Jika profile belum siap tapi loading sudah selesai (jarang terjadi)
  if (!profile && !loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profil Saya</Text>

      {/* AVATAR */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={() => setAvatarModalVisible(true)} style={styles.avatarWrapper}>
            <Image source={{ uri: profile?.avatar_url || AVATAR_OPTIONS[0] }} style={styles.avatarImage} />
            <View style={styles.cameraIconBg}><Camera size={16} color="white" /></View>
        </TouchableOpacity>
        <Text style={styles.tapToChange}>Ketuk untuk ganti avatar</Text>
      </View>

      {/* INFO EMAIL */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>
      
      {/* INFO USERNAME */}
      <View style={styles.infoBox}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={styles.label}>Username</Text>
            {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Edit2 size={16} color={theme.colors.primary} />
                </TouchableOpacity>
            )}
        </View>
        {isEditing ? (
            <View style={styles.editRow}>
                <TextInput style={styles.input} value={newUsername} onChangeText={setNewUsername} autoCapitalize="none" placeholderTextColor="#666"/>
                <View style={{flexDirection:'row', gap: 10}}>
                    <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.iconBtn}><X size={20} color={theme.colors.error} /></TouchableOpacity>
                    <TouchableOpacity onPress={handleUpdateProfile} disabled={saving} style={styles.iconBtn}><Save size={20} color={theme.colors.primary} /></TouchableOpacity>
                </View>
            </View>
        ) : (
            <Text style={styles.value}>{profile?.username || '-'}</Text>
        )}
      </View>

      {/* TOMBOL LOGOUT */}
      <MyButton 
        title="KELUAR (LOGOUT)" 
        onPress={() => setLogoutModalVisible(true)} 
        type="secondary"
        style={styles.logoutButton}
      />

      {/* MODAL AVATAR */}
      <Modal visible={avatarModalVisible} transparent={true} animationType="slide" onRequestClose={() => setAvatarModalVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Pilih Avatar</Text>
                    <TouchableOpacity onPress={() => setAvatarModalVisible(false)}><X color={theme.colors.textSecondary} /></TouchableOpacity>
                </View>
                <View style={styles.avatarGrid}>
                    {AVATAR_OPTIONS.map((url, index) => (
                        <TouchableOpacity key={index} onPress={() => handleSelectAvatar(url)} style={[styles.avatarOption, profile?.avatar_url === url && styles.avatarSelected]}>
                            <Image source={{ uri: url }} style={styles.avatarOptionImg} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
      </Modal>

      {/* MODAL KONFIRMASI LOGOUT */}
      <Modal visible={logoutModalVisible} transparent={true} animationType="fade" onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={styles.alertOverlay}>
            <View style={styles.alertBox}>
                <LogOut size={40} color={theme.colors.error} style={{marginBottom:15}} />
                <Text style={styles.alertTitle}>Konfirmasi Logout</Text>
                <Text style={styles.alertMessage}>Apakah Anda yakin ingin keluar?</Text>
                
                <View style={styles.alertBtnRow}>
                    <TouchableOpacity onPress={() => setLogoutModalVisible(false)} style={styles.btnCancel}>
                        <Text style={styles.btnTextCancel}>Batal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmLogout} style={styles.btnConfirm}>
                        <Text style={styles.btnTextConfirm}>Ya, Keluar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 50, paddingHorizontal: theme.spacing.l },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { ...theme.typography.header, marginBottom: theme.spacing.l, textAlign: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: theme.spacing.xl },
  avatarWrapper: { position: 'relative' },
  avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: theme.colors.primary, backgroundColor: '#333' },
  cameraIconBg: { position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primary, padding: 6, borderRadius: 20, borderWidth: 2, borderColor: theme.colors.background },
  tapToChange: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 8 },
  infoBox: { backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: 8, marginBottom: theme.spacing.m },
  label: { ...theme.typography.body, color: theme.colors.textSecondary, fontSize: 12, marginBottom: theme.spacing.xs },
  value: { ...theme.typography.subHeader, fontSize: 16 },
  editRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  input: { flex: 1, backgroundColor: '#121212', color: 'white', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 5, borderWidth: 1, borderColor: '#333', marginRight: 10, fontSize: 16 },
  iconBtn: { padding: 5 },
  logoutButton: { marginTop: theme.spacing.xl, borderColor: theme.colors.error },
  
  // MODAL STYLES
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  avatarOption: { padding: 5, borderRadius: 50, borderWidth: 2, borderColor: 'transparent' },
  avatarSelected: { borderColor: theme.colors.primary },
  avatarOptionImg: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#333' },

  // ALERT BOX STYLES
  alertOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  alertBox: { width: '80%', maxWidth: 400, backgroundColor: '#1E1E1E', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 10 },
  alertTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  alertMessage: { color: '#AAA', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  alertBtnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  btnCancel: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#333', alignItems: 'center' },
  btnConfirm: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: theme.colors.error, alignItems: 'center' },
  btnTextCancel: { color: 'white', fontWeight: 'bold' },
  btnTextConfirm: { color: 'white', fontWeight: 'bold' },
});