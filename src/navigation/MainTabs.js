import React from 'react';
import { Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import Wajib
import { Home, Users, Music, User, Disc } from 'lucide-react-native';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import AddMusicScreen from '../screens/AddMusicScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MusicPlayerScreen from '../screens/MusicPlayerScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  // 1. Ambil info area aman layar (poni & tombol bawah)
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Beranda"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1DB954', // Hijau Spotify
        tabBarInactiveTintColor: '#B3B3B3',
        
        // 2. LOGIKA AGAR TIDAK BENTROK
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopWidth: 0,
          elevation: 0,
          position: 'absolute', // Membuat background transparan di area bawah terlihat menyatu
          bottom: 0,
          left: 0,
          right: 0,
          // Tinggi dinamis: 60px + area aman tombol HP
          height: 60 + (Platform.OS === 'ios' ? insets.bottom : insets.bottom + 10),
          // Padding konten agar naik ke atas
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom + 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginBottom: 5,
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
      
      {/* Tombol Tengah (Player) */}
      <Tab.Screen
        name="Player"
        component={MusicPlayerScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={{
                position: 'absolute',
                top: -15, // Membuat icon ini "mengapung" sedikit
                backgroundColor: '#1DB954',
                padding: 10,
                borderRadius: 30,
                elevation: 5
            }}>
                <Disc color={'white'} size={30} />
            </View>
          ),
          tabBarLabel: () => null, // Hilangkan teks label untuk tombol tengah
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