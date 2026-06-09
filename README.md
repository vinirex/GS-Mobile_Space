# 🚀 Space & Climate Tracker — Global Solution

Aplicação mobile moderna desenvolvida em **React Native (Expo SDK 55) + TypeScript** que integra as APIs abertas da NASA e sensores climáticos da Open-Meteo. O objetivo do projeto é demonstrar o impacto prático e econômico de infraestruturas aeroespaciais no monitoramento climático e no desenvolvimento global sustentável.

---

## 👥 Grupo de Desenvolvimento

| Nome do Integrante | RM |
| :--- | :--- |
| Vinicius Silva | RM553240 |
| Victor Didoff | RM552965 |
| Matheus Zottis | RM94119 |

---

## 🌍 Relação com a Indústria Espacial & ODS

O aplicativo materializa o uso prático de dados de sensoriamento remoto e logística orbital, alinhando-se com os Objetivos de Desenvolvimento Sustentável (ODS) da ONU:

1. **ODS 9 — Indústria, Inovação e Infraestrutura:** Exibe o monitoramento espacial profundo através da imagem astronômica do dia (APOD) e mostra como as inovações tecnológicas dos sensores em órbita são portadas para uso na Terra.
2. **ODS 11 — Cidades e Comunidades Sustentáveis:** Apresenta um rastreador de Near Earth Objects (asteroides de órbita próxima) usando a API **NASA NeoWs**, mostrando a importância de sistemas de defesa e infraestrutura de alerta orbital para a segurança metropolitana.
3. **ODS 13 — Ação Contra a Mudança Global do Clima:** Integra dados de satélite para medir a qualidade do ar (PM2.5, NO2, O3) em qualquer coordenada pesquisada, evidenciando como a constelação de satélites Copernicus mapeia poluentes em tempo real.
4. **Calculadora ODS Interativa (Space for SDGs):** Permite calcular a redução de emissão de CO₂ gerada pela adoção de tecnologias guiadas por GPS e satélites (como agricultura de precisão e otimização logística de rotas de transporte).

---

## 📱 Funcionalidades Principais

*   **Dashboard Principal (Início):**
    *   **Astronomy Picture of the Day (APOD):** Carrega a imagem astronômica diária oficial da NASA com explicações científicas detalhadas e histórico.
    *   **Imagens EPIC da Terra:** Exibe fotos em cores naturais do globo terrestre tiradas a 1 milhão de milhas de distância pelo satélite DSCOVR da NASA.
    *   **Calculadora de Carbono Interativa:** Demonstração empírica de toneladas de CO₂ poupadas por inteligência de rota e plantio orbital.
*   **Explorador Avançado (Explorar):**
    *   **Busca Geocodificada:** Pesquisa dinâmica por cidades globais reais (Open-Meteo Geocoding).
    *   **Rastreamento de Qualidade do Ar:** Retorna dados de material particulado e gases em tempo real a partir de coordenadas espaciais.
    *   **Catálogo de Asteroides (NeoWs):** Listagem de corpos celestes em rota de aproximação com filtros de ameaça perigosa e ordenação por velocidade, tamanho e distância.
*   **Monitoramento Local (Favoritos):**
    *   Armazena e gerencia localmente as localizações e asteroides de maior interesse, persistindo os dados entre sessões.
*   **Ajustes Customizados (Configurações):**
    *   **Dark Mode Nativo:** Interface de alta fidelidade com tema escuro (Space Dark) e claro (Cosmic Light).
    *   **Configuração de Unidades:** Conversão dinâmica entre sistema métrico e imperial.
    *   **NASA Token Manager:** Permite que o avaliador insira sua própria API Key, mas já vem configurado com uma chave funcional padrão (`kygtdfmYhvlSr7ot0vNtPBcUb359AK6AZkgQbaxt`).

---

## 🛠️ Tecnologias e Arquitetura

O projeto adota uma arquitetura modular limpa e tipada em **TypeScript**:

```
src/
 ├── components/   # Componentes visuais reutilizáveis (GlassCard, CustomSVGCharts, SkeletonLoader)
 ├── screens/      # Telas principais (Home, List, Favorites, Settings, Detail)
 ├── navigation/   # Navegação tipada por Abas (Tab) e Pilhas (Stack)
 ├── services/     # Camada de Serviços (Axios HTTP client com interceptadores)
 ├── hooks/        # Hooks Customizados para atalhos de contexto (useTheme, useAppState)
 ├── contexts/     # Provedores Globais de Estado (ThemeContext, AppStateContext)
 ├── storage/      # Persistência local segura em AsyncStorage
 ├── types/        # Interfaces TypeScript para APIs e Parâmetros de Navegação
 └── theme/        # Definição e variáveis de cores HSL das paletas
```

### Principais Bibliotecas Utilizadas:
*   `@react-navigation/native` & `@react-navigation/bottom-tabs` & `@react-navigation/native-stack` (Navegação)
*   `axios` (Camada de Serviços / Conexão de APIs)
*   `@react-native-async-storage/async-storage` (Persistência)
*   `react-native-svg` (Desenho de gráficos vetoriais nativos de alta performance)

---

## 🚀 Como Executar o Projeto

Certifique-se de ter o **Node.js** instalado em sua máquina.

1.  **Clone ou baixe** este repositório em sua máquina.
2.  Abra o terminal na pasta raiz do projeto.
3.  **Instale as dependências** executando:
    ```bash
    npm install
    ```
4.  **Inicie o servidor de desenvolvimento Expo**:
    ```bash
    npx expo start
    ```

### Executando nos Emuladores/Dispositivos:

*   **Android (Emulador ou Físico):** Pressione `a` no terminal ou escaneie o QR Code no app **Expo Go** em seu celular Android.
*   **iOS (Simulador ou Físico):** Pressione `i` no terminal (necessário macOS com Xcode) ou escaneie o QR Code usando a câmera padrão de um iPhone com o **Expo Go** instalado.
*   **Web (Navegador):** Pressione `w` no terminal para abrir a aplicação diretamente no seu navegador.
