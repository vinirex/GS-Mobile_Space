import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Linking, Dimensions, Share, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, WeatherData } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useAppState } from '../hooks/useAppState';
import { formatDistance, formatVelocity } from '../utils/units';
import { climateService } from '../services/climateService';
import GlassCard from '../components/GlassCard';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;

export const DetailScreen: React.FC = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<DetailScreenNavigationProp>();
  const { theme } = useTheme();
  const { type, data } = route.params;

  const {
    isFavoriteApod,
    toggleFavoriteApod,
    isFavoriteAsteroid,
    toggleFavoriteAsteroid,
    settings,
  } = useAppState();

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      if (type !== 'climate') return;
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const result = await climateService.getWeather(data.latitude, data.longitude, settings.useMetric);
        setWeatherData(result);
      } catch (error: any) {
        setWeatherError(error.message || 'Erro ao carregar dados climáticos.');
        setWeatherData(null);
      } finally {
        setWeatherLoading(false);
      }
    };

    loadWeather();
  }, [type, data.latitude, data.longitude, settings.useMetric]);

  const handleShare = async () => {
    try {
      let content = '';
      if (type === 'apod') {
        content = `Astro Imagem do Dia: ${data.title} - ${data.url}`;
      } else if (type === 'asteroid') {
        const diameterMaxKm = parseFloat(data.estimated_diameter?.kilometers?.estimated_diameter_max || '0');
        content = `Asteroide Monitorado: ${data.name}. Diâmetro: ${formatDistance(diameterMaxKm, settings.useMetric)}. Perigo: ${data.is_potentially_hazardous_asteroid ? 'Sim' : 'Não'}`;
      } else if (type === 'climate') {
        content = `Qualidade do Ar em ${data.name}: AQI ${data.aqiScore || 'N/A'}`;
      }
      await Share.share({ message: content });
    } catch (error) {
      console.error(error);
    }
  };

  const renderApodDetail = () => {
    const isFav = isFavoriteApod(data.date);
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: data.hdurl || data.url }} style={styles.image} resizeMode="cover" />
        
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{data.title}</Text>
          <Text style={[styles.date, { color: theme.textMuted }]}>{data.date}</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.btnAction, { backgroundColor: theme.primary }]}
              onPress={() => toggleFavoriteApod(data)}
            >
              <Text style={styles.btnText}>{isFav ? '❤️ Favoritado' : '🖤 Favoritar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnAction, { backgroundColor: theme.secondary }]}
              onPress={handleShare}
            >
              <Text style={styles.btnText}>📤 Compartilhar</Text>
            </TouchableOpacity>
          </View>

          <GlassCard style={styles.sdgCard}>
            <Text style={[styles.sdgTag, { backgroundColor: theme.secondary }]}>ODS 9 - Indústria e Inovação</Text>
            <Text style={[styles.sdgText, { color: theme.textSecondary }]}>
              O monitoramento espacial profundo e telescópicos inspiram a inovação de sensores e materiais essenciais para o monitoramento climático moderno na Terra.
            </Text>
          </GlassCard>

          <Text style={[styles.heading, { color: theme.textPrimary }]}>Explicação Científica</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{data.explanation}</Text>
        </View>
      </ScrollView>
    );
  };

  const renderAsteroidDetail = () => {
    const isFav = isFavoriteAsteroid(data.id);
    const diameterMinKm = parseFloat(data.estimated_diameter?.kilometers?.estimated_diameter_min || '0');
    const diameterMaxKm = parseFloat(data.estimated_diameter?.kilometers?.estimated_diameter_max || '0');
    const closeApproach = data.close_approach_data?.[0];
    const velocityKmh = parseFloat(closeApproach?.relative_velocity?.kilometers_per_hour || '0');
    const missDistKm = parseFloat(closeApproach?.miss_distance?.kilometers || '0');
    const diameterMin = formatDistance(diameterMinKm, settings.useMetric);
    const diameterMax = formatDistance(diameterMaxKm, settings.useMetric);
    const velocity = formatVelocity(velocityKmh, settings.useMetric);
    const missDist = formatDistance(missDistKm, settings.useMetric);

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.asteroidHeader, { backgroundColor: theme.isDark ? '#111827' : '#E2E8F0' }]}>
          <Text style={styles.asteroidEmoji}>☄️</Text>
          <Text style={[styles.title, { color: theme.textPrimary, textAlign: 'center' }]}>{data.name}</Text>
          <Text style={[styles.dangerBadge, { backgroundColor: data.is_potentially_hazardous_asteroid ? theme.danger : theme.success }]}>
            {data.is_potentially_hazardous_asteroid ? '⚠️ Potencialmente Perigoso' : '✅ Seguro'}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.btnAction, { backgroundColor: theme.primary }]}
              onPress={() => toggleFavoriteAsteroid(data)}
            >
              <Text style={styles.btnText}>{isFav ? '❤️ Monitorando' : '🖤 Monitorar'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btnAction, { backgroundColor: theme.secondary }]}
              onPress={() => Linking.openURL(data.nasa_jpl_url)}
            >
              <Text style={styles.btnText}>🌐 NASA Orbit DB</Text>
            </TouchableOpacity>
          </View>

          <GlassCard style={styles.sdgCard}>
            <Text style={[styles.sdgTag, { backgroundColor: theme.accent }]}>ODS 11 - Cidades Sustentáveis</Text>
            <Text style={[styles.sdgText, { color: theme.textSecondary }]}>
              O monitoramento de Objetos Próximos à Terra (NEO) é um componente da segurança global e proteção de infraestruturas metropolitanas contra impactos cósmicos.
            </Text>
          </GlassCard>

          <Text style={[styles.heading, { color: theme.textPrimary }]}>Informações de Órbita</Text>
          <View style={styles.grid}>
            <View style={[styles.gridCol, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Magnitude Absoluta (H)</Text>
              <Text style={[styles.gridVal, { color: theme.textPrimary }]}>{data.absolute_magnitude_h}</Text>
            </View>
            <View style={[styles.gridCol, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Diâmetro Estimado</Text>
              <Text style={[styles.gridVal, { color: theme.textPrimary }]}>{diameterMin} - {diameterMax}</Text>
            </View>
            <View style={[styles.gridCol, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Velocidade de Aproximação</Text>
              <Text style={[styles.gridVal, { color: theme.textPrimary }]}>{velocity} </Text>
            </View>
            <View style={[styles.gridCol, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Distância Mínima (Erros)</Text>
              <Text style={[styles.gridVal, { color: theme.textPrimary }]}>{missDist} </Text>
            </View>
            <View style={[styles.gridCol, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Corpo de Órbita</Text>
              <Text style={[styles.gridVal, { color: theme.textPrimary }]}>{closeApproach?.orbiting_body || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderClimateDetail = () => {
    const weatherDescription = weatherData?.weather?.[0]?.description || 'Dados climáticos indisponíveis';
    const temperature = weatherData?.main?.temp != null ? `${weatherData.main.temp.toFixed(1)} ${settings.useMetric ? '°C' : '°F'}` : '—';
    const feelsLike = weatherData?.main?.feels_like != null ? `${weatherData.main.feels_like.toFixed(1)} ${settings.useMetric ? '°C' : '°F'}` : '—';
    const humidity = weatherData?.main?.humidity != null ? `${weatherData.main.humidity}%` : '—';
    const wind = weatherData?.wind?.speed != null ? formatVelocity(weatherData.wind.speed, settings.useMetric) : '—';

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.asteroidHeader, { backgroundColor: theme.isDark ? '#0f172a' : '#f1f5f9' }]}> 
          <Text style={styles.asteroidEmoji}>🌍</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{data.name}</Text>
          <Text style={[styles.date, { color: theme.textMuted }]}> 
            Lat: {data.latitude.toFixed(2)} | Lon: {data.longitude.toFixed(2)}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          {weatherLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textPrimary }]}>Carregando dados climáticos...</Text>
            </View>
          ) : weatherError ? (
            <Text style={[styles.errorText, { color: theme.danger }]}>{weatherError}</Text>
          ) : (
            <GlassCard style={styles.weatherCard}>
              <Text style={[styles.settingLabel, { color: theme.textPrimary, marginBottom: 8 }]}>Condição Atual</Text>
              <Text style={[styles.settingDesc, { color: theme.textMuted, marginBottom: 12 }]}>{weatherDescription}</Text>
              <View style={styles.grid}>
                <View style={[styles.gridCol, { borderBottomColor: theme.cardBorder }]}> 
                  <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Temperatura</Text>
                  <Text style={[styles.gridVal, { color: theme.textPrimary }]}>{temperature}</Text>
                </View>
                <View style={[styles.gridCol, { borderBottomColor: theme.cardBorder }]}> 
                  <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Sensação</Text>
                  <Text style={[styles.gridVal, { color: theme.textPrimary }]}>{feelsLike}</Text>
                </View>
                <View style={[styles.gridCol, { borderBottomColor: theme.cardBorder }]}> 
                  <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Umidade</Text>
                  <Text style={[styles.gridVal, { color: theme.textPrimary }]}>{humidity}</Text>
                </View>
                <View style={[styles.gridCol, { borderBottomColor: theme.cardBorder }]}> 
                  <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Vento</Text>
                  <Text style={[styles.gridVal, { color: theme.textPrimary }]}>{wind}</Text>
                </View>
              </View>
            </GlassCard>
          )}

          <GlassCard style={styles.sdgCard}>
            <Text style={[styles.sdgTag, { backgroundColor: theme.primary }]}>ODS 13 - Ação Climática</Text>
            <Text style={[styles.sdgText, { color: theme.textSecondary }]}>Dados de poluição derivados de satélites como o Sentinel-5 Precursor ajudam cidades globais a tomar medidas regulatórias baseadas em dados em tempo real.</Text>
          </GlassCard>

          <Text style={[styles.heading, { color: theme.textPrimary }]}>Impacto Ambiental Espacial</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>Sensores espectrais acoplados em órbita capturam a refração de gases nocivos na atmosfera. Esses dados fornecem a base de medição usada para monitorar o buraco da camada de ozônio e regular as taxas municipais de emissão de carbono.</Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerBar, { borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnBack}>
          <Text style={[styles.btnBackText, { color: theme.primary }]}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Detalhes Espaciais</Text>
        <View style={{ width: 60 }} />
      </View>

      {type === 'apod' && renderApodDetail()}
      {type === 'asteroid' && renderAsteroidDetail()}
      {type === 'climate' && renderClimateDetail()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  btnBack: {
    paddingVertical: 8,
    width: 60,
  },
  btnBackText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: Dimensions.get('window').height * 0.35,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 28,
  },
  date: {
    fontSize: 14,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    gap: 12,
  },
  btnAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sdgCard: {
    marginTop: 10,
    marginBottom: 20,
    padding: 16,
  },
  sdgTag: {
    alignSelf: 'flex-start',
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  sdgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  asteroidHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  asteroidEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  dangerBadge: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  grid: {
    marginTop: 10,
  },
  gridCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  gridLabel: {
    fontSize: 14,
  },
  gridVal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  weatherCard: {
    padding: 16,
    marginBottom: 16,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 10,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 13,
    marginTop: 4,
  },
});

export default DetailScreen;
