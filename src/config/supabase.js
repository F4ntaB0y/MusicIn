import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://qiqzdvpwcsbmbwitpvcu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcXpkdnB3Y3NibWJ3aXRwdmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTA5MzIsImV4cCI6MjA4MTI4NjkzMn0.XWvQw4K5JIcSddclUGu9RZrqKngi-qmu_pFcnqLc_zw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});