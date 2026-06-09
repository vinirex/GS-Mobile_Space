import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAppState } from '../hooks/useAppState';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ApodResponse, EpicResponse } from '../types';
import { nasaService } from '../services/nasaService';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { CustomRadialChart } from '../components/CustomSVGCharts';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { toggleFavoriteApod, isFavoriteApod, settings } = useAppState();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // API loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [apod, setApod] = useState<ApodResponse | null>(null);
  const [epicImage, setEpicImage] = useState<EpicResponse | null>(null);
  const [epicUrl, setEpicUrl] = useState<string>('');

  // Interactive SDG carbon calculator values
  const [hectaresPlanning, setHectaresPlanning] = useState<number>(150); // Satellite precision agriculture area
  const [routeKmOpt, setRouteKmOpt] = useState<number>(2400); // GPS logistics route optimization distance

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch APOD
        const apodData = await nasaService.getApod();
        setApod(apodData);

        // Fetch EPIC image
        const epicImages = await nasaService.getEpicImages();
        if (epicImages && epicImages.length > 0) {
          const firstEpic = epicImages[0];
          setEpicImage(firstEpic);
          // Generate absolute URL
          const url = nasaService.getEpicImageUrl(firstEpic, settings.nasaApiKey);
          setEpicUrl(url);
        }
      } catch (error: any) {
        console.error(error);
        Alert.alert('Erro na API', error.message || 'Houve um problema de conexão com as bases espaciais.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [settings.nasaApiKey]);

  // Carbon computations (ODS 13 & ODS 2):
  // 1 Ha precision satellite agriculture planning offsets ~0.45 Tons CO2 (optimized fertilizer/deforestation)
  // 1 Km satellite routing optimization offsets ~0.0018 Tons CO2 (optimized shipping routes)
  const carbonSavedAgri = hectaresPlanning * 0.45;
  const carbonSavedRoute = routeKmOpt * 0.0018;
  const totalCarbonSaved = carbonSavedAgri + carbonSavedRoute;

  const navigateToDetail = (type: 'apod' | 'asteroid' | 'climate', data: any) => {
    navigation.navigate('Detail', { type, data });
  };

  const renderSkeleton = () => (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <SkeletonLoader width={150} height={20} />
        <SkeletonLoader width={240} height={32} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.content}>
        <SkeletonLoader height={180} borderRadius={16} style={{ marginVertical: 12 }} />
        <SkeletonLoader height={240} borderRadius={16} style={{ marginVertical: 12 }} />
      </View>
    </ScrollView>
  );

  if (loading) {
    return renderSkeleton();
  }

  const isApodFav = apod ? isFavoriteApod(apod.date) : false;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Welcome Title */}
      <View style={styles.header}>
        <Text style={[styles.dateHeader, { color: theme.textMuted }]}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Espaço & Clima</Text>
      </View>

      <View style={styles.content}>
        {/* Astronomy Picture Card */}
        {apod && (
          <GlassCard 
            style={styles.apodCard} 
            onPress={() => navigateToDetail('apod', apod)}
          >
            <Image source={{ uri: apod.url }} style={styles.apodImage} />
            <View style={styles.apodInfo}>
              <View style={styles.badgeRow}>
                <Text style={[styles.cardBadge, { backgroundColor: theme.primary, color: '#000' }]}>Imagem do Dia</Text>
                <TouchableOpacity 
                  style={styles.favBtn} 
                  onPress={() => toggleFavoriteApod(apod)}
                >
                  <Text style={styles.favStar}>{isApodFav ? '❤️' : '🖤'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.apodTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                {apod.title}
              </Text>
              <Text style={[styles.apodDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                {apod.explanation}
              </Text>
            </View>
          </GlassCard>
        )}

        {/* EPIC Earth Globe card */}
        {epicUrl !== '' && (
          <GlassCard style={styles.epicCard}>
            <View style={styles.epicHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Monitoramento Terrestre</Text>
                <Text style={[styles.sectionSub, { color: theme.textMuted }]}>
                  Foto global tirada por satélite DSCOVR (NASA)
                </Text>
              </View>
              <Text style={styles.epicIcon}>🛰️</Text>
            </View>

            <Image source={{ uri: epicUrl }} style={styles.epicImage} resizeMode="contain" />
            <Text style={[styles.epicDate, { color: theme.textMuted }]}>
              Data de Captura: {epicImage?.date}
            </Text>
          </GlassCard>
        )}

        {/* SDG Space Technology calculator card */}
        <GlassCard style={styles.sdgCard}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Space for SDGs (ODS 13)</Text>
          <Text style={[styles.sectionSub, { color: theme.textMuted, marginBottom: 16 }]}>
            Calcule o impacto positivo da tecnologia espacial na redução da emissão de CO₂.
          </Text>

          <View style={styles.calcRow}>
            {/* Radial progress showing carbon saved in metric tons */}
            <CustomRadialChart 
              value={Math.min(totalCarbonSaved / 2, 100)} // scale factor
              size={120}
              strokeWidth={10}
              label="Ton. CO₂"
              rating="Compensado"
              color={theme.primary}
            />

            <View style={styles.calcInputs}>
              {/* Agricultural Area Planning selector */}
              <View style={styles.sliderCol}>
                <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>
                  Área Agrícola Otimizada (Ha)
                </Text>
                <View style={styles.adjustRow}>
                  <TouchableOpacity 
                    style={[styles.adjustBtn, { backgroundColor: theme.cardBorder }]}
                    onPress={() => setHectaresPlanning(prev => Math.max(0, prev - 25))}
                  >
                    <Text style={[styles.adjustBtnText, { color: theme.textPrimary }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.adjustVal, { color: theme.textPrimary }]}>{hectaresPlanning}</Text>
                  <TouchableOpacity 
                    style={[styles.adjustBtn, { backgroundColor: theme.cardBorder }]}
                    onPress={() => setHectaresPlanning(prev => prev + 25)}
                  >
                    <Text style={[styles.adjustBtnText, { color: theme.textPrimary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Shipping Route optimization selector */}
              <View style={styles.sliderCol}>
                <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>
                  Rotas GPS Otimizadas (Km)
                </Text>
                <View style={styles.adjustRow}>
                  <TouchableOpacity 
                    style={[styles.adjustBtn, { backgroundColor: theme.cardBorder }]}
                    onPress={() => setRouteKmOpt(prev => Math.max(0, prev - 100))}
                  >
                    <Text style={[styles.adjustBtnText, { color: theme.textPrimary }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.adjustVal, { color: theme.textPrimary }]}>{routeKmOpt}</Text>
                  <TouchableOpacity 
                    style={[styles.adjustBtn, { backgroundColor: theme.cardBorder }]}
                    onPress={() => setRouteKmOpt(prev => prev + 100)}
                  >
                    <Text style={[styles.adjustBtnText, { color: theme.textPrimary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <Text style={[styles.calcReport, { color: theme.textSecondary, borderTopColor: theme.cardBorder }]}>
            💡 Dados obtidos por satélite guiam tratores autônomos reduzindo uso de diesel e detectam rotas logísticas mais curtas, economizando combustível.
          </Text>
        </GlassCard>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 60,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  dateHeader: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
  },
  apodCard: {
    overflow: 'hidden',
    padding: 0,
  },
  apodImage: {
    width: '100%',
    height: 180,
  },
  apodInfo: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  favBtn: {
    padding: 4,
  },
  favStar: {
    fontSize: 18,
  },
  apodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  apodDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  epicCard: {
    padding: 16,
    marginVertical: 10,
  },
  epicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  epicIcon: {
    fontSize: 22,
  },
  epicImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  epicDate: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
  sdgCard: {
    padding: 16,
    marginVertical: 10,
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  calcInputs: {
    flex: 1,
    gap: 12,
  },
  sliderCol: {
    flexDirection: 'column',
  },
  sliderLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adjustBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  adjustBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  adjustVal: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  calcReport: {
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: 12,
    fontSize: 11,
    lineHeight: 15,
  },
});

export default HomeScreen;
