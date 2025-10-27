}
      </Text>
      <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
    </View>
    {/* Ikon hati untuk layar Disukai */}
    <Ionicons name="heart" size={24} color={LIKE_COLOR} style={styles.playingIcon} />
  </TouchableOpacity>
);
// === AKHIR PENGEMBALIAN ===

export default function LikedMusicScreen({
  navigation,
  allSongs,
  likedSongIds,
  currentSong,
  setCurrentSongIndex
}) {

  const likedSongs = allSongs.filter(song => likedSongIds.has(song.id));

  const handlePlaySong = (selectedSong) => {
    const originalIndex = allSongs.findIndex(song => song.id === selectedSong.id);
    if (originalIndex !== -1) {
      setCurrentSongIndex(originalIndex);
      navigation.navigate('Player');
    }
  };

  const renderItem = ({ item }) => {
    const isPlaying = currentSong?.id === item.id;
    return (
      <SongItem
        item={item}
        isPlaying={isPlaying}
        onPress={() => handlePlaySong(item)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <Text style={styles.headerTitle}>Musik yang Disukai</Text>
        {likedSongs.length > 0 ? (
            <FlatList
                data={likedSongs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
                extraData={currentSong?.id}
            />
        ) : (
            <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={80} color={SUBTEXT_COLOR} />
                <Text style={styles.emptyText}>Belum ada lagu disukai.</Text>
                <Text style={styles.emptySubText}>Tekan ikon hati untuk menyimpan.</Text>
            </View>
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND_COLOR },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: TEXT_COLOR, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, },
  list: { flex: 1 },
  songItemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20 },
  artwork: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 16, fontWeight: 'bold', color: TEXT_COLOR },
  songArtist: { fontSize: 14, color: SUBTEXT_COLOR },
  playingText: { color: LIKE_COLOR }, // Tetap gunakan LIKE_COLOR untuk highlight di halaman ini
  playingIcon: { marginLeft: 10 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: TEXT_COLOR, textAlign: 'center', marginTop: 20 },
  emptySubText: { fontSize: 14, color: SUBTEXT_COLOR, textAlign: 'center', marginTop: 10 }
});
