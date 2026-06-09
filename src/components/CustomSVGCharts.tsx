import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

interface LineChartProps {
  data: number[];
  labels: string[];
  height?: number;
  color?: string;
  fillColor?: string;
}

export const CustomLineChart: React.FC<LineChartProps> = ({
  data = [10, 25, 15, 30, 45, 20, 35],
  labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
  height = 160,
  color,
  fillColor,
}) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width - 64; // Account for card padding
  const chartWidth = screenWidth;
  
  const activeColor = color || theme.primary;
  const gradientFill = fillColor || theme.secondary;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const valRange = maxVal - minVal || 1;

  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  // Compute coordinates for data points
  const points = data.map((val, idx) => {
    const x = paddingLeft + (idx * graphWidth) / (data.length - 1);
    const y = paddingTop + graphHeight - ((val - minVal) / valRange) * graphHeight;
    return { x, y, value: val };
  });

  // Construct SVG path string for the line
  let linePath = '';
  points.forEach((pt, idx) => {
    if (idx === 0) {
      linePath += `M ${pt.x} ${pt.y}`;
    } else {
      linePath += ` L ${pt.x} ${pt.y}`;
    }
  });

  // Construct closed path for gradient fill underneath
  const fillPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + graphHeight} L ${points[0].x} ${paddingTop + graphHeight} Z`
    : '';

  // Calculate Y-axis grid labels
  const gridLines = 4;
  const yGrids = Array.from({ length: gridLines }).map((_, idx) => {
    const ratio = idx / (gridLines - 1);
    const val = minVal + ratio * valRange;
    const y = paddingTop + graphHeight - ratio * graphHeight;
    return { y, value: val.toFixed(1) };
  });

  return (
    <View style={styles.chartContainer}>
      <Svg width={chartWidth} height={height}>
        <Defs>
          <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={gradientFill} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={gradientFill} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Y-axis gridlines and labels */}
        {yGrids.map((grid, idx) => (
          <React.Fragment key={idx}>
            <Line
              x1={paddingLeft}
              y1={grid.y}
              x2={chartWidth - paddingRight}
              y2={grid.y}
              stroke={theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(30,58,138,0.05)'}
              strokeWidth="1"
            />
            <SvgText
              x={paddingLeft - 8}
              y={grid.y + 4}
              fontSize="10"
              fill={theme.textMuted}
              textAnchor="end"
            >
              {grid.value}
            </SvgText>
          </React.Fragment>
        ))}

        {/* X-axis labels */}
        {points.map((pt, idx) => (
          <SvgText
            key={idx}
            x={pt.x}
            y={height - 8}
            fontSize="9"
            fill={theme.textMuted}
            textAnchor="middle"
          >
            {labels[idx] || ''}
          </SvgText>
        ))}

        {/* Filled Area */}
        {fillPath !== '' && (
          <Path d={fillPath} fill="url(#chartGradient)" />
        )}

        {/* Line Path */}
        {linePath !== '' && (
          <Path
            d={linePath}
            fill="none"
            stroke={activeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {points.map((pt, idx) => (
          <Circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r="4"
            fill={theme.background}
            stroke={activeColor}
            strokeWidth="2.5"
          />
        ))}
      </Svg>
    </View>
  );
};

interface RadialProgressChartProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  rating?: string;
  color?: string;
}

export const CustomRadialChart: React.FC<RadialProgressChartProps> = ({
  value = 0,
  size = 110,
  strokeWidth = 10,
  label = 'AQI',
  rating = 'Bom',
  color,
}) => {
  const { theme } = useTheme();
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Dash offset represents the empty portion of the ring
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;
  const activeColor = color || theme.primary;

  return (
    <View style={styles.radialContainer}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="radialGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={activeColor} />
            <Stop offset="100%" stopColor={theme.secondary} />
          </LinearGradient>
        </Defs>

        {/* Track circle (Background ring) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(30,58,138,0.05)'}
          strokeWidth={strokeWidth}
        />

        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#radialGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} // Rotate to start progress from the top
        />

        {/* Center Labels */}
        <SvgText
          x={size / 2}
          y={size / 2 - 8}
          fontSize="22"
          fontWeight="bold"
          fill={theme.textPrimary}
          textAnchor="middle"
        >
          {Math.round(clampedValue)}
        </SvgText>

        <SvgText
          x={size / 2}
          y={size / 2 + 10}
          fontSize="10"
          fontWeight="600"
          fill={activeColor}
          textAnchor="middle"
        >
          {label}
        </SvgText>

        <SvgText
          x={size / 2}
          y={size / 2 + 22}
          fontSize="8"
          fill={theme.textMuted}
          textAnchor="middle"
        >
          {rating}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  radialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
