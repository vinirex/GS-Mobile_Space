import React, { useRef } from 'react';
import { StyleSheet, View, Pressable, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  activeOpacity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, onPress }) => {
  const { theme } = useTheme();
  
  // Animation scale value
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleValue, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 40,
        bounciness: 2,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }).start();
    }
  };

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.cardBg,
      borderColor: theme.cardBorder,
      shadowColor: theme.isDark ? '#000' : '#475569',
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.pressableContainer,
          { opacity: pressed ? 0.95 : 1 }
        ]}
      >
        <Animated.View style={[cardStyle, { transform: [{ scale: scaleValue }] }]}>
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  pressableContainer: {
    width: '100%',
    marginVertical: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3, // Android shadow
  },
});

export default GlassCard;
