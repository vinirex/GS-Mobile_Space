import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 6,
  style,
}) => {
  const { theme } = useTheme();
  
  // Animation opacity value
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  const loaderColor = theme.isDark 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(30, 58, 138, 0.08)';

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: loaderColor,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    marginVertical: 4,
  },
});

export default SkeletonLoader;
