import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../config/supabase';
import MyInput from '../components/atoms/MyInput';
import MyButton from '../components/atoms/MyButton';
import { theme } from '../styles/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Login Gagal', error.message);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Selamat Datang di Music.In</Text>
      <Text style={styles.subHeader}>Masuk untuk mendengarkan musik favorit Anda</Text>

      <MyInput
        label="Email"
        placeholder="Alamat Email"
        value={email}
        onChangeText={setEmail}
      />
      <MyInput
        label="Password"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <MyButton 
        title={loading ? 'Memproses...' : 'MASUK'} 
        onPress={handleLogin} 
        style={styles.button}
        disabled={loading}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Belum punya akun?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Daftar Sekarang</Text>
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
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  subHeader: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
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