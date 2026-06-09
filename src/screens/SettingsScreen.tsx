import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAppState } from '../hooks/useAppState';
import GlassCard from '../components/GlassCard';

export const SettingsScreen: React.FC = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { settings, updateSettings, clearCache } = useAppState();
  
  const [nasaApiKeyInput, setNasaApiKeyInput] = useState<string>(settings.nasaApiKey);
  const [openWeatherApiKeyInput, setOpenWeatherApiKeyInput] = useState<string>(settings.openWeatherApiKey);

  const handleSaveApiKeys = () => {
    updateSettings({
      nasaApiKey: nasaApiKeyInput,
      openWeatherApiKey: openWeatherApiKeyInput,
    });
    Alert.alert('Sucesso', 'Chaves de API atualizadas com sucesso.');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpar Histórico',
      'Você tem certeza que deseja excluir todos os favoritos e configurações do dispositivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            setNasaApiKeyInput('kygtdfmYhvlSr7ot0vNtPBcUb359AK6AZkgQbaxt');
            setOpenWeatherApiKeyInput('');
            Alert.alert('Sucesso', 'Cache local excluído com sucesso.');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Configurações</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Customização visual e conexões espaciais</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Aparência e Preferências</Text>
        
        <GlassCard style={styles.settingRow}>
          <View>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Tema Escuro</Text>
            <Text style={[styles.settingDesc, { color: theme.textMuted }]}>Visual inspirado no Espaço Sideral</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: theme.secondary }}
            thumbColor={isDarkMode ? theme.primary : '#F1F5F9'}
          />
        </GlassCard>

        <GlassCard style={styles.settingRow}>
          <View>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Sistema Métrico</Text>
            <Text style={[styles.settingDesc, { color: theme.textMuted }]}>Km e °C vs Milhas e °F</Text>
          </View>
          <Switch
            value={settings.useMetric}
            onValueChange={(val) => updateSettings({ useMetric: val })}
            trackColor={{ false: '#CBD5E1', true: theme.secondary }}
            thumbColor={settings.useMetric ? theme.primary : '#F1F5F9'}
          />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Integrações e API Keys</Text>
        
        <GlassCard style={styles.keyCard}>
          <Text style={[styles.settingLabel, { color: theme.textPrimary, marginBottom: 8 }]}>NASA API Token</Text>
          
          <Text style={[styles.settingLabel, { color: theme.textPrimary, marginVertical: 12 }]}>OpenWeather API Token</Text>
       </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Manutenção</Text>
        <GlassCard style={styles.settingRow}>
          <View>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Limpar Todos os Dados</Text>
            <Text style={[styles.settingDesc, { color: theme.textMuted }]}>Esvazia o AsyncStorage local</Text>
          </View>
          <TouchableOpacity 
            style={[styles.btnDanger, { backgroundColor: theme.danger }]}
            onPress={handleClearCache}
          >
            <Text style={styles.btnDangerText}>Limpar</Text>
          </TouchableOpacity>
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Sobre o Projeto</Text>
        <GlassCard style={styles.devCard}>
          <Text style={[styles.devHeader, { color: theme.textPrimary }]}>Global Solution 2026</Text>
          <Text style={[styles.devDesc, { color: theme.textMuted }]}>
            Aplicativo desenvolvido como resposta integrada aos ODS 9, 11 e 13 da ONU, demonstrando a utilidade econômica e civil de tecnologias espaciais.
          </Text>
        </GlassCard>
          
          
          
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  keyCard: {
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 14,
  },
  btnSave: {
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  btnSaveText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnDanger: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDangerText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  devCard: {
    padding: 16,
  },
  devHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  devDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  memberName: {
    fontSize: 14,
  },
  memberRM: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
