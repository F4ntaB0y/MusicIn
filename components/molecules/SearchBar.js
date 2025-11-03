// File: components/molecules/SearchBar.js
// Penjelasan:
// Molekul ini sekarang menggunakan warna global.

import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Impor warna global
import { TEXT_SECONDARY, BUTTON_PRIMARY, TEXT_PRIMARY } from '../../src/constants/colors';

// Definisi warna lokal DIHAPUS

const SearchBar = ({ value, onChangeText, placeholder }) => {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={20} color={TEXT_SECONDARY} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder || "Cari..."}
        placeholderTextColor={TEXT_SECONDARY} // DIUBAH
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BUTTON_PRIMARY, // DIUBAH
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: TEXT_PRIMARY, // DIUBAH
    fontSize: 16,
    paddingVertical: 12,
  },
});

export default SearchBar;