import { supabase } from '../config/supabase';

// Mencari pengguna (Search)
export const searchUsers = async (searchTerm) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .ilike('username', `%${searchTerm}%`)
    .limit(10);
  
  if (error) throw error;
  return data;
};

// --- PERBAIKAN UTAMA: CEK DUPLIKASI SEBELUM KIRIM ---
export const sendFriendRequest = async (userId, friendId) => {
  // 1. Cek apakah sudah ada hubungan sebelumnya (Pending / Accepted)
  // Kita cek dua arah: (Saya -> Dia) ATAU (Dia -> Saya)
  const { data: existingCheck, error: checkError } = await supabase
    .from('friends')
    .select('id, status')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
    .maybeSingle();

  if (checkError) throw checkError;

  // 2. Jika sudah ada data, tolak permintaan
  if (existingCheck) {
    if (existingCheck.status === 'accepted') {
        throw new Error('Kalian sudah berteman.');
    } else {
        throw new Error('Permintaan pertemanan sudah dikirim sebelumnya.');
    }
  }

  // 3. Jika bersih (belum ada hubungan), baru simpan ke database
  const { error } = await supabase.from('friends').insert({
    user_id: userId,
    friend_id: friendId,
    status: 'pending',
  });

  if (error) throw error;
  return true;
};

// Ambil Data Teman
export const fetchFriendsData = async (userId) => {
  // 1. Permintaan Masuk
  const { data: incomingRequests, error: error1 } = await supabase
    .from('friends')
    .select('id, user_id, sender:profiles!user_id(username, avatar_url)') 
    .eq('friend_id', userId)
    .eq('status', 'pending');

  // 2. Daftar Teman
  const { data: acceptedFriends, error: error2 } = await supabase
    .from('friends')
    .select('id, user_id, friend_id, sender:profiles!user_id(username, avatar_url), receiver:profiles!friend_id(username, avatar_url)')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error1 || error2) throw error1 || error2;
  
  return { incomingRequests, acceptedFriends };
};

// Ambil ID Request Keluar (Pending) - Agar tidak muncul di saran teman
export const fetchPendingSentRequests = async (userId) => {
  const { data, error } = await supabase
    .from('friends')
    .select('friend_id')
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
  return data.map(item => item.friend_id);
};

// Ambil Saran Teman
export const fetchSuggestedUsers = async (userId, existingFriendIds = []) => {
  const excludeIds = [userId, ...existingFriendIds];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .not('id', 'in', `(${excludeIds.join(',')})`)
    .limit(5);

  if (error) throw error;
  return data;
};

export const acceptFriendRequest = async (friendshipId) => {
  const { error } = await supabase.from('friends').update({ status: 'accepted' }).eq('id', friendshipId);
  if (error) throw error;
  return true;
};

export const removeFriend = async (friendshipId) => {
  const { error } = await supabase.from('friends').delete().eq('id', friendshipId);
  if (error) throw error;
  return true;
};