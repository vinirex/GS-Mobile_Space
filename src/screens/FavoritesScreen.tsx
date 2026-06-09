import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAppState } from '../hooks/useAppState';
import { formatDistance } from '../utils/units';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ApodResponse, Asteroid, SavedLocation } from '../types';
import GlassCard from '../components/GlassCard';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export const FavoritesScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  
  const { 
    favoritesApod, 
    favoritesAsteroids, 
    favoritesLocations,
    toggleFavoriteApod,
    toggleFavoriteAsteroid,
    toggleFavoriteLocation,
    settings,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'apod' | 'asteroid' | 'climate'>('apod');

  const navigateToDetail = (type: 'apod' | 'asteroid' | 'climate', data: any) => {
    navigation.navigate('Detail', { type, data });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>{activeTab === 'apod' ? '📸' : activeTab === 'asteroid' ? '☄️' : '🌍'}</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nenhum item salvo ainda</Text>
      <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
        Navegue pelas listagens do app e clique em favoritar para monitorar informações.
      </Text>
    </View>
  );

  const renderApodItem = ({ item }: { item: ApodResponse }) => (
    <GlassCard 
      style={styles.cardItem} 
      onPress={() => navigateToDetail('apod', item)}
    >
      <Image source={{ uri: item.url }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.cardSub, { color: theme.textMuted }]}>{item.date}</Text>
      </View>
      <TouchableOpacity 
        style={styles.btnTrash} 
        onPress={() => toggleFavoriteApod(item)}
      >
        <Text style={styles.trashText}>🗑️</Text>
      </TouchableOpacity>
    </GlassCard>
  );

  const renderAsteroidItem = ({ item }: { item: Asteroid }) => {
    const sizeKm = parseFloat(item.estimated_diameter?.kilometers?.estimated_diameter_max || '0');
    const size = formatDistance(sizeKm, settings.useMetric);
    return (
      <GlassCard 
        style={styles.cardItem}
        onPress={() => navigateToDetail('asteroid', item)}
      >
        <View style={styles.emojiContainer}>
          <Text style={styles.itemEmoji}>☄️</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.cardSub, { color: theme.textMuted }]}>
            Diâmetro: {size} km | Perigo: {item.is_potentially_hazardous_asteroid ? 'Sim' : 'Não'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.btnTrash} 
          onPress={() => toggleFavoriteAsteroid(item)}
        >
          <Text style={styles.trashText}>🗑️</Text>
        </TouchableOpacity>
      </GlassCard>
    );
  };

  const renderLocationItem = ({ item }: { item: SavedLocation }) => (
    <GlassCard 
      style={styles.cardItem}
      onPress={() => navigateToDetail('climate', item)}
    >
      <View style={styles.emojiContainer}>
        <Text style={styles.itemEmoji}>🌍</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.cardSub, { color: theme.textMuted }]}>
          Lat: {item.latitude.toFixed(2)} | Lon: {item.longitude.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.btnTrash} 
        onPress={() => toggleFavoriteLocation(item)}
      >
        <Text style={styles.trashText}>🗑️</Text>
      </TouchableOpacity>
    </GlassCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Monitoramento</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Seus itens espaciais e climáticos salvos</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'apod' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('apod')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'apod' ? theme.primary : theme.textMuted }]}>Imagens</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'asteroid' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('asteroid')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'asteroid' ? theme.primary : theme.textMuted }]}>Asteroides</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'climate' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('climate')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'climate' ? theme.primary : theme.textMuted }]}>Clima</Text>
        </TouchableOpacity>
      </View>

      {/* List render */}
      {activeTab === 'apod' && (
        favoritesApod.length > 0 ? (
          <FlatList
            data={favoritesApod}
            keyExtractor={(item) => item.date}
            renderItem={renderApodItem}
            contentContainerStyle={styles.listContent}
          />
        ) : renderEmptyState()
      )}

      {activeTab === 'asteroid' && (
        favoritesAsteroids.length > 0 ? (
          <FlatList
            data={favoritesAsteroids}
            keyExtractor={(item) => item.id}
            renderItem={renderAsteroidItem}
            contentContainerStyle={styles.listContent}
          />
        ) : renderEmptyState()
      )}

      {activeTab === 'climate' && (
        favoritesLocations.length > 0 ? (
          <FlatList
            data={favoritesLocations}
            keyExtractor={(item) => item.name}
            renderItem={renderLocationItem}
            contentContainerStyle={styles.listContent}
          />
        ) : renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 60,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
  },
  btnTrash: {
    padding: 10,
  },
  trashText: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default FavoritesScreen;
