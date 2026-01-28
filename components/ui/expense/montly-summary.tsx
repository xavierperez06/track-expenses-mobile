import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface StatsSummaryProps {
  currentDate: Date;
  periodMode: 'month' | 'year';
  onTogglePeriod: (mode: 'month' | 'year') => void;
  onChangeDate: (offset: number) => void;
  statsData: {
    total: number;
    breakdown: Array<{
      name: string;
      total: number;
      percentage: number;
      hex: string;
      iconName?: string;
    }>;
  };
}

const CHART_SIZE = 140;
const RADIUS = CHART_SIZE / 2;
const STROKE_WIDTH = 25;
const CIRCLE_RADIUS = RADIUS - STROKE_WIDTH / 2;
const CENTER = RADIUS;

export default function MonthlySummary({ 
  currentDate, 
  periodMode,
  onTogglePeriod,
  onChangeDate, 
  statsData 
}: StatsSummaryProps) {
  
  // -- Donut Logic --
  const circumference = 2 * Math.PI * CIRCLE_RADIUS;
  let currentAngle = 0;

  const donutSegments = statsData.breakdown.map((cat, index) => {
    const angle = (currentAngle / 100) * 360;
    currentAngle += cat.percentage;
    
    return {
      ...cat,
      strokeDasharray: [circumference * (cat.percentage / 100), circumference].join(' '),
      rotation: angle,
    };
  });

  const displayTitle = periodMode === 'month' 
    ? currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())
    : currentDate.getFullYear().toString();

  return (
    <View style={styles.container}>
      
      {/* 1. Header & Controls */}
      <View style={styles.headerRow}>
        {/* Date Nav */}
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={() => onChangeDate(-1)} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={18} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.dateTitle}>{displayTitle}</Text>
          <TouchableOpacity onPress={() => onChangeDate(1)} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Period Toggle */}
        <View style={styles.togglePill}>
          <TouchableOpacity 
            style={[styles.pillBtn, periodMode === 'month' && styles.pillBtnActive]}
            onPress={() => onTogglePeriod('month')}
          >
            <Text style={[styles.pillText, periodMode === 'month' && styles.pillTextActive]}>Mes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.pillBtn, periodMode === 'year' && styles.pillBtnActive]}
            onPress={() => onTogglePeriod('year')}
          >
            <Text style={[styles.pillText, periodMode === 'year' && styles.pillTextActive]}>Año</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Main Dashboard Card */}
      <View style={styles.card}>
        
        {/* Content Row */}
        <View style={styles.contentRow}>
          
          {/* Left: The Chart */}
          <View style={styles.chartWrapper}>
            <View style={{ width: CHART_SIZE, height: CHART_SIZE }}>
              <Svg height={CHART_SIZE} width={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
                <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
                  {statsData.total === 0 ? (
                    // Empty State Ring (Light Gray)
                     <Circle
                      cx={CENTER}
                      cy={CENTER}
                      r={CIRCLE_RADIUS}
                      stroke="#e2e8f0" 
                      strokeWidth={STROKE_WIDTH}
                      fill="transparent"
                    />
                  ) : (
                    donutSegments.map((segment, i) => (
                      <Circle
                        key={i}
                        cx={CENTER}
                        cy={CENTER}
                        r={CIRCLE_RADIUS}
                        stroke={segment.hex}
                        strokeWidth={STROKE_WIDTH}
                        fill="transparent"
                        strokeDasharray={segment.strokeDasharray}
                        strokeDashoffset={0}
                        rotation={segment.rotation}
                        origin={`${CENTER}, ${CENTER}`}
                        strokeLinecap="butt"
                      />
                    ))
                  )}
                </G>
              </Svg>
              {/* Inner Text (Dark for contrast) */}
              <View style={styles.centerTextContainer}>
                <Text style={styles.centerLabel}>TOTAL</Text>
                <Text style={styles.centerValue}>${statsData.total.toLocaleString("es-AR", { maximumFractionDigits: 0, notation: "compact", compactDisplay: "short" })}</Text>
              </View>
            </View>
          </View>

          {/* Right: The Breakdown List */}
          <View style={styles.listWrapper}>
            {statsData.breakdown.slice(0, 4).map((cat, idx) => (
              <View key={idx} style={styles.compactRow}>
                <View style={[styles.dot, { backgroundColor: cat.hex }]} />
                <View style={{ flex: 1 }}>
                  
                  {/* Row with Name, Amount and % */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                     <Text style={styles.compactName} numberOfLines={1}>{cat.name}</Text>
                     
                     {/* Amount & Percent grouped */}
                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                       <Text style={styles.compactAmount}>${cat.total.toLocaleString("es-AR", { maximumFractionDigits: 0 })}</Text>
                       <Text style={styles.compactPercent}>{cat.percentage.toFixed(0)}%</Text>
                     </View>
                  </View>
                  
                  {/* Tiny Progress Bar (Gray background) */}
                  <View style={styles.miniBarBg}>
                    <View style={[styles.miniBarFill, { width: `${cat.percentage}%`, backgroundColor: cat.hex }]} />
                  </View>
                </View>
              </View>
            ))}
            {statsData.breakdown.length === 0 && (
               <Text style={styles.noDataText}>Sin gastos registrados</Text>
            )}
          </View>

        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  
  // Header Row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    padding: 4,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'capitalize',
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    padding: 2,
  },
  pillBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  pillBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  pillTextActive: {
    color: '#0f172a',
    fontWeight: '700',
  },

  // Main Card - SUPER LIGHT GRAY
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, 
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  
  // Left: Chart
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerTextContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    marginBottom: 2,
  },
  centerValue: {
    fontSize: 18,
    color: '#0f172a',
    fontWeight: '800',
  },

  // Right: List
  listWrapper: {
    flex: 1,
    gap: 16, // Increased gap for better spacing with amounts
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align to top of text line
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6, // Align visually with text
  },
  compactName: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    flex: 1, // Name takes available space
    marginRight: 8,
  },
  // New Styles for Amount & Percent
  compactAmount: {
    color: '#0f172a', // Dark/Bold for Value
    fontSize: 13,
    fontWeight: '700',
  },
  compactPercent: {
    color: '#94a3b8', // Gray for %
    fontSize: 11,
    fontWeight: '500',
  },
  
  miniBarBg: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginTop: 2, // Closer to text
    width: '100%',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  noDataText: {
    color: '#94a3b8',
    fontSize: 13,
    fontStyle: 'italic',
  },
});