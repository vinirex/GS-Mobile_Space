import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Asteroid, CityInfo } from '../types';
import { nasaService } from '../services/nasaService';
import { climateService } from '../services/climateService';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useAppState } from '../hooks/useAppState';
import { formatDistance, formatVelocity } from '../utils/units';

type ListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export const ListScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<ListScreenNavigationProp>();
  const { toggleFavoriteLocation, isFavoriteLocation, settings } = useAppState();

  // Tab State: 'climate' (City search & AQI) | 'asteroid' (NASA NeoWs radar list)
  const [listType, setListType] = useState<'climate' | 'asteroid'>('climate');

  // Search & Loading States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Climate / City List States
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [selectedCityAqi, setSelectedCityAqi] = useState<{ [cityName: string]: number }>({});

  // Asteroids States
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [filteredAsteroids, setFilteredAsteroids] = useState<Asteroid[]>([]);
  const [filterHazardousOnly, setFilterHazardousOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'velocity'>('name');

  // Fetch Asteroids on mount
  useEffect(() => {
    const fetchAsteroids = async () => {
      setLoading(true);
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 3); // 3 days window to keep results fast
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        
        const data = await nasaService.getNearEarthObjects(todayStr, nextWeekStr);
        setAsteroids(data);
        setFilteredAsteroids(data);
      } catch (error: any) {
        console.error(error);
        Alert.alert('Erro NASA API', error.message || 'Falha ao buscar dados de radar orbital.');
      } finally {
        setLoading(false);
      }
    };

    fetchAsteroids();
  }, []);

  // Filter & Sort Asteroids whenever search parameters change
  useEffect(() => {
    let result = [...asteroids];

    // Filter by name
    if (searchQuery.trim().length > 0) {
      result = result.filter(ast => 
        ast.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by hazardous flag
    if (filterHazardousOnly) {
      result = result.filter(ast => ast.is_potentially_hazardous_asteroid);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'size') {
        const sizeA = a.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
        const sizeB = b.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
        return sizeB - sizeA; // Descending size
      } else if (sortBy === 'velocity') {
        const velA = parseFloat(a.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour || '0');
        const velB = parseFloat(b.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour || '0');
        return velB - velA; // Descending velocity
      }
      return 0;
    });

    setFilteredAsteroids(result);
  }, [searchQuery, filterHazardousOnly, sortBy, asteroids]);

  // Handle City search execution
  const handleCitySearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setLoading(true);
    try {
      const results = await climateService.searchCities(searchQuery);
      setCities(results);
      
      // Fetch AQI score for each city in search results as preview indicator
      results.forEach(async (city) => {
        try {
          const aqiData = await climateService.getAirQuality(city.latitude, city.longitude);
          const pm = aqiData.hourly.pm2_5[0] || 0;
          const no2 = aqiData.hourly.nitrogen_dioxide[0] || 0;
          const o3 = aqiData.hourly.ozone[0] || 0;
          const index = climateService.calculateAQIIndex(pm, no2, o3);
          setSelectedCityAqi(prev => ({
            ...prev,
            [city.name]: index.score
          }));
        } catch {
          // Keep it silent if a preview fails
        }
      });
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao pesquisar cidades.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToDetail = (type: 'apod' | 'asteroid' | 'climate', data: any) => {
    navigation.navigate('Detail', { type, data });
  };

  // Render list items
  const renderCityItem = ({ item }: { item: CityInfo }) => {
    const aqiVal = selectedCityAqi[item.name];
    const isFav = isFavoriteLocation(item.name);

    return (
      <GlassCard 
        style={styles.card} 
        onPress={() => navigateToDetail('climate', { ...item, aqiScore: aqiVal })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.name}</Text>
            <Text style={[styles.cardSub, { color: theme.textMuted }]}>
              {item.state ? `${item.state}, ` : ''}{item.country}
            </Text>
          </View>
          <View style={styles.rightActionRow}>
            {aqiVal !== undefined && (
              <View style={[styles.badge, { backgroundColor: aqiVal > 50 ? theme.warning : theme.success }]}>
                <Text style={styles.badgeText}>AQI {aqiVal}</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.favStar}
              onPress={() => toggleFavoriteLocation({ ...item, aqiScore: aqiVal })}
            >
              <Text style={styles.starText}>{isFav ? '⭐️' : '☆'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GlassCard>
    );
  };

  const renderAsteroidItem = ({ item }: { item: Asteroid }) => {
    const diameterKm = parseFloat(String(item.estimated_diameter?.kilometers?.estimated_diameter_max || '0'));
    const speedKmh = parseFloat(item.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour || '0');
    const diameter = formatDistance(diameterKm, settings.useMetric);
    const speed = formatVelocity(speedKmh, settings.useMetric);

    return (
      <GlassCard 
        style={styles.card}
        onPress={() => navigateToDetail('asteroid', item)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.name}</Text>
            <Text style={[styles.cardSub, { color: theme.textMuted }]}>
              ∅ {diameter} km | 🚀 {speed} km/h
            </Text>
          </View>
          <View style={[
            styles.badge, 
            { backgroundColor: item.is_potentially_hazardous_asteroid ? theme.danger : theme.success }
          ]}>
            <Text style={styles.badgeText}>
              {item.is_potentially_hazardous_asteroid ? 'Perigoso' : 'Seguro'}
            </Text>
          </View>
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Explorar Dados</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Análise detalhada de clima e órbita</Text>
      </View>

      {/* Segment switcher */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity 
          style={[styles.segmentButton, listType === 'climate' && { backgroundColor: theme.primary }]}
          onPress={() => {
            setListType('climate');
            setSearchQuery('');
          }}
        >
          <Text style={[styles.segmentText, { color: listType === 'climate' ? '#000' : theme.textPrimary }]}>
            Monitoramento de Cidades
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.segmentButton, listType === 'asteroid' && { backgroundColor: theme.primary }]}
          onPress={() => {
            setListType('asteroid');
            setSearchQuery('');
          }}
        >
          <Text style={[styles.segmentText, { color: listType === 'asteroid' ? '#000' : theme.textPrimary }]}>
            Radar de Asteroides
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchRow}>
        <TextInput
          style={[
            styles.searchInput,
            { 
              color: theme.textPrimary,
              borderColor: theme.cardBorder,
              backgroundColor: theme.cardBg
            }
          ]}
          placeholder={listType === 'climate' ? "Pesquise uma cidade (ex: Sao Paulo)..." : "Pesquise por nome de asteroide..."}
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={listType === 'climate' ? handleCitySearch : undefined}
        />
        {listType === 'climate' && (
          <TouchableOpacity 
            style={[styles.searchBtn, { backgroundColor: theme.secondary }]}
            onPress={handleCitySearch}
          >
            <Text style={styles.searchBtnText}>Buscar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters & Sorting only for Asteroids */}
      {listType === 'asteroid' && (
        <View style={styles.filterSection}>
          <TouchableOpacity 
            style={[
              styles.filterBtn, 
              { borderColor: theme.cardBorder, backgroundColor: filterHazardousOnly ? theme.danger : 'transparent' }
            ]}
            onPress={() => setFilterHazardousOnly(!filterHazardousOnly)}
          >
            <Text style={[styles.filterBtnText, { color: filterHazardousOnly ? '#FFF' : theme.textPrimary }]}>
              ⚠️ Apenas Ameaças
            </Text>
          </TouchableOpacity>

          <View style={styles.sortRow}>
            <Text style={[styles.sortLabel, { color: theme.textMuted }]}>Ordenar por:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortOptions}>
              <TouchableOpacity 
                style={[styles.sortOptBtn, sortBy === 'name' && { backgroundColor: theme.primary }]}
                onPress={() => setSortBy('name')}
              >
                <Text style={[styles.sortOptText, { color: sortBy === 'name' ? '#000' : theme.textSecondary }]}>Nome</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sortOptBtn, sortBy === 'size' && { backgroundColor: theme.primary }]}
                onPress={() => setSortBy('size')}
              >
                <Text style={[styles.sortOptText, { color: sortBy === 'size' ? '#000' : theme.textSecondary }]}>Tamanho</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sortOptBtn, sortBy === 'velocity' && { backgroundColor: theme.primary }]}
                onPress={() => setSortBy('velocity')}
              >
                <Text style={[styles.sortOptText, { color: sortBy === 'velocity' ? '#000' : theme.textSecondary }]}>Velocidade</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {/* List content */}
      {loading ? (
        <View style={styles.loader}>
          <SkeletonLoader height={60} style={{ marginVertical: 8 }} />
          <SkeletonLoader height={60} style={{ marginVertical: 8 }} />
          <SkeletonLoader height={60} style={{ marginVertical: 8 }} />
        </View>
      ) : (
        listType === 'climate' ? (
          cities.length > 0 ? (
            <FlatList
              data={cities}
              keyExtractor={(item) => `${item.latitude}-${item.longitude}`}
              renderItem={renderCityItem}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyView}>
              <Text style={styles.emptyEmoji}>🌍</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Faça uma busca para ver dados de poluição e clima de cidades reais.
              </Text>
            </View>
          )
        ) : (
          filteredAsteroids.length > 0 ? (
            <FlatList
              data={filteredAsteroids}
              keyExtractor={(item) => item.id}
              renderItem={renderAsteroidItem}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyView}>
              <Text style={styles.emptyEmoji}>🛸</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Nenhum asteroide encontrado na órbita terrestre para os filtros selecionados.
              </Text>
            </View>
          )
        )
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
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 4,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 46,
    fontSize: 14,
  },
  searchBtn: {
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
  },
  searchBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterSection: {
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sortLabel: {
    fontSize: 12,
    marginRight: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOptBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  sortOptText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    padding: 16,
    marginVertical: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
  },
  rightActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  favStar: {
    padding: 4,
  },
  starText: {
    fontSize: 20,
  },
  emptyView: {
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
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loader: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});

export default ListScreen;
