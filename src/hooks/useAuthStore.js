import { create } from 'zustand';

// Store untuk menyimpan status otentikasi
export const useAuthStore = create((set) => ({
  session: null,
  user: null,
  isLoading: true, // Untuk mengecek inisialisasi awal

  setSession: (session) => set({ session, user: session?.user || null, isLoading: false }),
  clearSession: () => set({ session: null, user: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));