import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../config/supabase';
import MyInput from '../components/atoms/MyInput';
import MyButton from '../components/atoms/MyButton';
import { theme } from '../styles/theme';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Mohon isi semua data.');
      return;
    }

    setLoading(true);

    // Kirim metadata (username & full_name) langsung saat Sign Up
    // Ini akan ditangkap oleh Trigger SQL untuk membuat profil otomatis
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          full_name: username, // Default full_name sama dengan username
        },
      },
    });

    if (error) {
      Alert.alert('Pendaftaran Gagal', error.message);
      setLoading(false);
      return;
    }

    // Jika sukses, arahkan ke Login
    Alert.alert('Berhasil!', 'Akun berhasil dibuat. Silakan masuk.');
    navigation.navigate('Login');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Buat Akun Music.In</Text>

      <MyInput
        label="Username"
        placeholder="Nama Pengguna"
        value={username}
        onChangeText={setUsername}
      />
      <MyInput
        label="Email"
        placeholder="Alamat Email"
        value={email}
        onChangeText={setEmail}
      />
      <MyInput
        label="Password"
        placeholder="Password (Min. 6 karakter)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <MyButton 
        title={loading ? 'Mendaftarkan...' : 'DAFTAR'} 
        onPress={handleRegister} 
        style={styles.button}
        disabled={loading}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Sudah punya akun?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Masuk</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    ...theme.typography.header,
    marginBottom: theme.spacing.xl * 2,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.l,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.s,
  },
  linkText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
