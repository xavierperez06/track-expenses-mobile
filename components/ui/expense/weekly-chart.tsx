import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface WeeklyChartProps {
  data: {
    dayName: string;
    amount: number;
    isToday: boolean;
  }[];
  maxSpend: number;
  totalSpending: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WeeklyChart({ data, maxSpend, totalSpending }: WeeklyChartProps) {
  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#7c3aed" stopOpacity="1" />
            <Stop offset="100%" stopColor="#db2777" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Gastos semanales</Text>
            <Text style={styles.total}>${totalSpending.toFixed(2)}</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name="trending-up" size={20} color="white" />
          </View>
        </View>

        <View style={styles.chartContainer}>
          {data.map((day, idx) => {
            const heightPercentage = day.amount === 0 ? 0 : Math.max((day.amount / maxSpend) * 100, 5);
            return (
              <View key={idx} style={styles.barWrapper}>
                <View style={styles.barTrack}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: `${heightPercentage}%`,
                        backgroundColor: day.isToday ? '#fff' : 'rgba(255, 255, 255, 0.3)' 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.dayLabel, day.isToday && styles.todayLabel]}>
                  {day.dayName.charAt(0)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 24,
    height: 220,
    backgroundColor: '#7c3aed', // Matches start color
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  total: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 14,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', 
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
  },
  todayLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
});