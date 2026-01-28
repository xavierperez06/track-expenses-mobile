import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

export default function WeeklyChart({ data, maxSpend, totalSpending }: WeeklyChartProps) {
  return (
    <View style={styles.container}>
      {/* Cool Gradient Background */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" /> 
            <Stop offset="100%" stopColor="#ec4899" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      {/* Glossy Overlay for "Glass" effect */}
      <View style={styles.glassOverlay} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>GASTOS SEMANALES</Text>
            <Text style={styles.total}>${totalSpending.toFixed(0)}</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name="stats-chart" size={18} color="#fff" />
          </View>
        </View>

        <View style={styles.chartContainer}>
          {data.map((day, idx) => {
            // Calculate height but ensure a tiny minimum so bar is always visible
            const heightPercentage = day.amount === 0 ? 5 : Math.max((day.amount / maxSpend) * 100, 5);
            
            return (
              <View key={idx} style={styles.barWrapper}>
                
                {/* Bar Track */}
                <View style={styles.barTrack}>
                  {/* The Bar Itself */}
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: `${heightPercentage}%`,
                        // Today gets solid white, others get translucent white
                        backgroundColor: day.isToday ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                        // Add shadow only to today for "pop"
                        shadowColor: day.isToday ? '#000' : 'transparent',
                        shadowOpacity: day.isToday ? 0.3 : 0,
                        shadowOffset: { width: 0, height: 2 },
                        shadowRadius: 4,
                        elevation: day.isToday ? 4 : 0,
                      }
                    ]} 
                  />
                </View>
                
                {/* Day Label */}
                <Text style={[styles.dayLabel, day.isToday && styles.todayLabel]}>
                  {day.dayName.charAt(0)}
                </Text>
                
                {/* Dot indicator - ALWAYS RENDERED (Transparent if not today) to keep alignment */}
                <View 
                  style={[
                    styles.activeDot, 
                    { backgroundColor: day.isToday ? '#fff' : 'transparent' }
                  ]} 
                />
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
    borderRadius: 30, 
    height: 240, 
    backgroundColor: '#7c3aed',
    shadowColor: '#ec4899', 
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  total: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120, 
    paddingBottom: 4,
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2, 
  },
  barTrack: {
    width: 12, 
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)', 
    overflow: 'hidden', 
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4, // Increased slightly to give room from the dot
  },
  todayLabel: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
    // Background color is handled inline to support transparent
  },
});