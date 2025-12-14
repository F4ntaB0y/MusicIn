import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { theme } from '../../styles/theme';

export default function MyInput({ value, onChangeText, placeholder, secureTextEntry, label }) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.m,
    width: '100%',
  },
  label: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s,
    fontSize: 14,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    borderRadius: 8,
    padding: theme.spacing.m,
    fontSize: 16,
  },
});