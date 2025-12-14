import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import penting untuk Safe Area
import { Home, Users, Music, User, Disc } from 'lucide-react-native';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import AddMusicScreen from '../screens/AddMusicScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MusicPlayerScreen from '../screens/MusicPlayerScreen'; // Pastikan file ini ada

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  // Hook untuk mendeteksi area aman (poni atas & tombol navigasi bawah)
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Beranda"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1DB954', // Warna hijau aktif
        tabBarInactiveTintColor: '#B3B3B3', // Warna abu-abu tidak aktif
        
        // PENGATURAN STYLE NAVIGASI AGAR TIDAK BENTROK
        tabBarStyle: {
          backgroundColor: '#121212', // Latar belakang gelap
          borderTopWidth: 0,
          elevation: 0, // Hilangkan bayangan di Android
          
          // Tinggi dinamis: 60px standar + tinggi area tombol navigasi HP
          height: 60 + (Platform.OS === 'android' ? 10 : insets.bottom), 
          
          // Padding bawah dinamis agar icon tidak tertutup tombol HP
          paddingBottom: Platform.OS === 'android' ? 10 : insets.bottom,
          
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Beranda"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      
      <Tab.Screen
        name="Tambah"
        component={AddMusicScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Music color={color} size={size} />,
        }}
      />
      
      <Tab.Screen
        name="Player"
        component={MusicPlayerScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Disc color={color} size={size} />,
        }}
      />
      
      <Tab.Screen
        name="Teman"
        component={FriendsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}