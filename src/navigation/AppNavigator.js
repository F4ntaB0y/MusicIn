import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import AuthStack from './AuthStack'; // Akan dibuat
import MainTabs from './MainTabs';   // Akan dibuat
import { theme } from '../styles/theme';

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  const { session, isLoading } = useAuth();
  
  if (isLoading) {
    // Tampilkan loading screen saat pertama kali mengecek sesi
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          // Jika sudah login, tampilkan MainTabs
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          // Jika belum login, tampilkan AuthStack (Login/Register)
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});