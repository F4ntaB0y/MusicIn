import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, RefreshControl, ScrollView, Image, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import { searchUsers, sendFriendRequest, fetchFriendsData, acceptFriendRequest, removeFriend, fetchSuggestedUsers, fetchPendingSentRequests } from '../services/friendService';
import MyInput from '../components/atoms/MyInput';
// MyButton tidak lagi wajib jika kita ganti pakai TouchableOpacity custom, tapi biarkan jika dipakai di tempat lain
import MyButton from '../components/atoms/MyButton'; 
import { theme } from '../styles/theme';
// TAMBAHKAN 'Search' DI SINI
import { UserPlus, Trash2, Music, Check, X, AlertTriangle, Search } from 'lucide-react-native';

const DEFAULT_AVATAR = 'https://api.dicebear.com/9.x/adventurer/png?seed=Default';

export default function FriendsScreen() {
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [requests, setRequests] = useState([]);      
  const [friendsWithStatus, setFriendsWithStatus] = useState([]); 
  const [suggestions, setSuggestions] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadAllData = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const { incomingRequests, acceptedFriends } = await fetchFriendsData(user.id);
      setRequests(incomingRequests);

      const pendingSentIds = await fetchPendingSentRequests(user.id); 

      const { data: allActivities } = await supabase.from('activities').select('created_at, user_id, songs!song_id(title, artist)').order('created_at', { ascending: false }).limit(50);

      const processedFriends = new Map();
      const excludeIds = []; 

      acceptedFriends.forEach(item => {
        const isMeSender = item.user_id === user.id;
        const friendProfile = isMeSender ? item.receiver : item.sender;
        const friendId = isMeSender ? item.friend_id : item.user_id;

        if (friendProfile && !processedFriends.has(friendId)) {
            excludeIds.push(friendId);
            const lastActivity = allActivities?.find(act => act.user_id === friendId);
            processedFriends.set(friendId, {
                id: item.id,
                friendName: friendProfile.username,
                avatarUrl: friendProfile.avatar_url,
                friendId: friendId,
                statusMusic: lastActivity || null
            });
        }
      });
      
      incomingRequests.forEach(req => excludeIds.push(req.user_id));
      pendingSentIds.forEach(id => excludeIds.push(id)); 

      setFriendsWithStatus(Array.from(processedFriends.values()));

      const suggestionsData = await fetchSuggestedUsers(user.id, excludeIds);
      setSuggestions(suggestionsData);

    } catch (error) { console.error(error.message); } 
    finally { setIsRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { loadAllData(); }, [user]));

  const handleSearch = async () => {
    if (!searchTerm.trim()) return setSearchResults([]);
    setLoading(true);
    try {
      const results = await searchUsers(searchTerm);
      setSearchResults(results.filter(p => p.id !== user.id)); 
    } catch (error) { Alert.alert('Gagal', error.message); } 
    finally { setLoading(false); }
  };

  const handleAddFriend = async (friendId, username) => {
    try {
      await sendFriendRequest(user.id, friendId);
      Alert.alert('Sukses', `Permintaan ke ${username} dikirim.`);
      setSuggestions(prev => prev.filter(p => p.id !== friendId));
      setSearchResults(prev => prev.filter(p => p.id !== friendId));
      setSearchTerm(''); 
    } catch (error) { Alert.alert('Gagal', error.message || 'Gagal mengirim permintaan.'); }
  };

  const handleAccept = async (id) => {
    await acceptFriendRequest(id);
    loadAllData();
  };

  const handleRemoveClick = (friendshipId, username) => {
    setDeleteTarget({ id: friendshipId, name: username });
    setDeleteModalVisible(true);
  };

  const confirmRemove = async () => {
    if (!deleteTarget) return;
    try {
        await removeFriend(deleteTarget.id);
        setDeleteModalVisible(false);
        loadAllData();
    } catch (error) {
        Alert.alert('Gagal', 'Gagal menghapus teman.');
    }
  };

  const Avatar = ({ url, size = 50, showStatus = false }) => (
    <View style={{ width: size, height: size, position: 'relative' }}>
        <Image source={{ uri: url || DEFAULT_AVATAR }} style={{ width: size, height: size, borderRadius: size/2, backgroundColor: '#333' }}/>
        {showStatus && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary, position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: theme.colors.surface }} />}
    </View>
  );

  const renderFriendCard = (item) => {
    const music = item.statusMusic;
    let isNowPlaying = false;
    let timeText = '';

    if (music) {
        const diff = (new Date() - new Date(music.created_at)) / 1000 / 60;
        if (diff < 10) { isNowPlaying = true; timeText = 'Baru saja'; } 
        else { 
            const date = new Date(music.created_at);
            timeText = diff > 1440 ? date.toLocaleDateString() : date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        }
    }

    return (
        <View key={item.id} style={styles.friendCard}>
            <View style={styles.cardLeft}>
                <Avatar url={item.avatarUrl} size={48} showStatus={isNowPlaying} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.friendName}>{item.friendName}</Text>
                    {music ? (
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                <Music size={12} color={isNowPlaying ? theme.colors.primary : '#666'} />
                                <Text style={[styles.songTitle, { color: isNowPlaying ? theme.colors.primary : '#888' }]} numberOfLines={1}>
                                    {' '}{music.songs?.title}
                                </Text>
                            </View>
                            <Text style={styles.artistName} numberOfLines={1}>{music.songs?.artist}</Text>
                        </View>
                    ) : ( <Text style={styles.offlineText}>Belum ada aktivitas</Text> )}
                </View>
            </View>
            <View style={styles.cardRight}>
                {music && <Text style={styles.timeText}>{timeText}</Text>}
                <TouchableOpacity onPress={() => handleRemoveClick(item.id, item.friendName)} style={styles.actionIcon}>
                    <Trash2 size={18} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sosial</Text>
      
      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
             <MyInput placeholder="Cari teman baru..." value={searchTerm} onChangeText={setSearchTerm} style={{marginBottom:0}} />
        </View>
        
        {/* --- PERBAIKAN DI SINI: TOMBOL ICON PENCARIAN --- */}
        <TouchableOpacity 
            style={styles.searchIconBtn} 
            onPress={handleSearch}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator size="small" color="white" />
            ) : (
                <Search size={24} color="white" />
            )}
        </TouchableOpacity>

      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={loadAllData} tintColor={theme.colors.primary} />}>
        {searchResults.length > 0 && (
            <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Hasil Pencarian</Text>
                {searchResults.map(p => (
                    <View key={p.id} style={styles.rowBetween}>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <Avatar url={p.avatar_url} size={35} />
                            <Text style={[styles.whiteText, {marginLeft: 10}]}>{p.username}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleAddFriend(p.id, p.username)}><UserPlus size={20} color={theme.colors.primary} /></TouchableOpacity>
                    </View>
                ))}
            </View>
        )}

        {suggestions.length > 0 && searchResults.length === 0 && (
            <View style={{ marginBottom: 20 }}>
                <Text style={styles.sectionTitle}>Saran Teman</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 5 }}>
                    {suggestions.map(s => (
                        <View key={s.id} style={styles.suggestionCard}>
                            <Avatar url={s.avatar_url} size={60} />
                            <Text style={styles.suggestionName} numberOfLines={1}>{s.username}</Text>
                            <TouchableOpacity style={styles.addSmallBtn} onPress={() => handleAddFriend(s.id, s.username)}>
                                <Text style={styles.addSmallText}>+ Tambah</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>
        )}

        {requests.length > 0 && (
            <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Permintaan Masuk ({requests.length})</Text>
                {requests.map(req => (
                    <View key={req.id} style={styles.rowBetween}>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <Avatar url={req.sender?.avatar_url} size={40} />
                            <Text style={[styles.whiteText, {marginLeft: 10}]}>{req.sender?.username}</Text>
                        </View>
                        <View style={{flexDirection:'row', gap: 10}}>
                             <TouchableOpacity onPress={() => handleRemoveClick(req.id, 'Permintaan')} style={styles.rejectBtn}><X size={16} color="white" /></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleAccept(req.id)} style={styles.acceptBtn}><Check size={16} color="white" /></TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        )}

        <View style={{ marginTop: 10 }}>
             <Text style={styles.sectionTitle}>Daftar Teman ({friendsWithStatus.length})</Text>
             {friendsWithStatus.length === 0 ? (
                <View style={styles.emptyState}><Text style={styles.emptyText}>Belum ada teman.</Text></View>
             ) : ( friendsWithStatus.map(item => renderFriendCard(item)) )}
        </View>
        <View style={{height: 100}} /> 
      </ScrollView>

      <Modal visible={deleteModalVisible} transparent={true} animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.alertOverlay}>
            <View style={styles.alertBox}>
                <AlertTriangle size={40} color={theme.colors.error} style={{marginBottom:15}} />
                <Text style={styles.alertTitle}>Hapus Teman?</Text>
                <Text style={styles.alertMessage}>Anda yakin ingin menghapus {deleteTarget?.name}?</Text>
                
                <View style={styles.alertBtnRow}>
                    <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={styles.btnCancel}>
                        <Text style={styles.btnTextCancel}>Batal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmRemove} style={styles.btnConfirm}>
                        <Text style={styles.btnTextConfirm}>Hapus</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 50, paddingHorizontal: theme.spacing.m },
  header: { ...theme.typography.header, marginBottom: theme.spacing.m },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  
  // STYLE BARU TOMBOL ICON
  searchIconBtn: { 
    width: 50, 
    height: 50, // Menyesuaikan tinggi input (kurang lebih)
    backgroundColor: theme.colors.primary, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 0 
  },
  
  sectionBox: { marginBottom: 20, backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12 },
  sectionTitle: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  whiteText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  acceptBtn: { backgroundColor: theme.colors.primary, padding: 8, borderRadius: 20 },
  rejectBtn: { backgroundColor: '#333', padding: 8, borderRadius: 20 },
  suggestionCard: { backgroundColor: theme.colors.surface, padding: 15, borderRadius: 12, alignItems: 'center', marginRight: 10, width: 110, borderWidth: 1, borderColor: '#333' },
  suggestionName: { color: 'white', fontWeight: 'bold', marginVertical: 8, fontSize: 12 },
  addSmallBtn: { backgroundColor: theme.colors.primary, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4 },
  addSmallText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  friendCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#333' },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  friendName: { color: theme.colors.white, fontWeight: 'bold', fontSize: 15 },
  songTitle: { fontWeight: 'bold', fontSize: 12 },
  artistName: { color: '#666', fontSize: 11, marginLeft: 16 },
  offlineText: { color: '#444', fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between', height: 45 },
  timeText: { color: '#555', fontSize: 10, marginBottom: 5 },
  actionIcon: { padding: 4 },
  emptyState: { alignItems: 'center', marginTop: 30, padding: 20 },
  emptyText: { color: '#666', textAlign: 'center' },

  // STYLE MODAL
  alertOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  alertBox: { width: '80%', backgroundColor: '#1E1E1E', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 10 },
  alertTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  alertMessage: { color: '#AAA', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  alertBtnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  btnCancel: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#333', alignItems: 'center' },
  btnConfirm: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: theme.colors.error, alignItems: 'center' },
  btnTextCancel: { color: 'white', fontWeight: 'bold' },
  btnTextConfirm: { color: 'white', fontWeight: 'bold' },
});