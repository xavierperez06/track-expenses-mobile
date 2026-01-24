import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

interface MonthlySummaryProps {
  currentDate: Date;
  onChangeMonth: (offset: number) => void;
  monthlyData: {
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

const { width } = Dimensions.get("window");
const CHART_SIZE = width * 0.5;
const RADIUS = CHART_SIZE / 2;
const CENTER = RADIUS;

export default function MonthlySummary({
  currentDate,
  onChangeMonth,
  monthlyData,
}: MonthlySummaryProps) {
  // Helper to calculate SVG path for pie slices
  const getSlicePath = (startPercent: number, endPercent: number) => {
    const startAngle = (startPercent / 100) * 360 - 90;
    const endAngle = (endPercent / 100) * 360 - 90;

    const x1 = CENTER + RADIUS * Math.cos((Math.PI * startAngle) / 180);
    const y1 = CENTER + RADIUS * Math.sin((Math.PI * startAngle) / 180);
    const x2 = CENTER + RADIUS * Math.cos((Math.PI * endAngle) / 180);
    const y2 = CENTER + RADIUS * Math.sin((Math.PI * endAngle) / 180);

    const largeArcFlag = endPercent - startPercent > 50 ? 1 : 0;

    return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  let cumulativePercent = 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Month Navigator */}
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => onChangeMonth(-1)}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={20} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <TouchableOpacity
            onPress={() => onChangeMonth(1)}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Visual Pie Chart */}
        <View style={styles.chartWrapper}>
          <View style={styles.chartContainer}>
            {monthlyData.total > 0 ? (
              <Svg width={CHART_SIZE} height={CHART_SIZE}>
                <G>
                  {monthlyData.breakdown.map((cat, idx) => {
                    const start = cumulativePercent;
                    cumulativePercent += cat.percentage;
                    return (
                      <Path
                        key={idx}
                        d={getSlicePath(start, cumulativePercent)}
                        fill={cat.hex}
                      />
                    );
                  })}
                </G>
              </Svg>
            ) : (
              <Svg width={CHART_SIZE} height={CHART_SIZE}>
                <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#f3f4f6" />
              </Svg>
            )}
            {/* Center Hole for Donut Style */}
            <View style={styles.chartHole}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalAmount}>
                ${monthlyData.total.toFixed(0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Breakdown List */}
        <View style={styles.listContainer}>
          {monthlyData.breakdown.length > 0 ? (
            monthlyData.breakdown.map((cat, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemHeader}>
                  <View style={styles.catInfo}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: `${cat.hex}15` },
                      ]}
                    >
                      <Ionicons
                        name={(cat.iconName || "pricetag") as any}
                        size={14}
                        color={cat.hex}
                      />
                    </View>
                    <Text style={styles.catName}>{cat.name}</Text>
                  </View>
                  <View style={styles.catStats}>
                    <Text style={styles.catAmount}>
                      ${cat.total.toFixed(0)}
                    </Text>
                    <Text style={styles.catPercent}>
                      {cat.percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${cat.percentage}%`, backgroundColor: cat.hex },
                    ]}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No expenses this month</Text>
          )}
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  navButton: {
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  chartContainer: {
    position: "relative",
    width: CHART_SIZE,
    height: CHART_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  chartHole: {
    position: "absolute",
    width: CHART_SIZE * 0.65,
    height: CHART_SIZE * 0.65,
    backgroundColor: "#fff",
    borderRadius: (CHART_SIZE * 0.65) / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#9ca3af",
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  listContainer: {
    gap: 20,
  },
  itemRow: {
    gap: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  catStats: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  catAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  catPercent: {
    fontSize: 12,
    color: "#9ca3af",
    width: 35,
    textAlign: "right",
    fontWeight: "600",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    paddingVertical: 20,
    fontWeight: "500",
  },
});
