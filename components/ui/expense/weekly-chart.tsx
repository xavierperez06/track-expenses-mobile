import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface WeeklyChartProps {
  data: {
    dayName: string;
    amount: number;
    isToday: boolean;
  }[];
  maxSpend: number;
  totalSpending: number;
}

export default function WeeklyChart({
  data,
  maxSpend,
  totalSpending,
}: WeeklyChartProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weekly Spending</Text>
          <Text style={styles.total}>${totalSpending.toFixed(2)}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="trending-up" size={20} color="white" />
        </View>
      </View>

      <View style={styles.chartContainer}>
        {data.map((day, idx) => {
          const heightPercentage =
            day.amount === 0 ? 0 : Math.max((day.amount / maxSpend) * 100, 5);
          return (
            <View key={idx} style={styles.barWrapper}>
              {/* Optional: Add tooltip logic here later */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercentage}%`,
                      backgroundColor: day.isToday ? "#fff" : "#a5b4fc",
                    },
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
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 24,
    padding: 24,
    backgroundColor: "#4f46e5", // Fallback for gradient
    // Note: React Native needs 'expo-linear-gradient' for real gradients.
    // Using solid color for simplicity in this file.
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  title: {
    color: "#c7d2fe",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  total: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  iconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 8,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 128,
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barTrack: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(49, 46, 129, 0.2)", // indigo-900/20
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  dayLabel: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: "600",
    color: "#a5b4fc",
    textTransform: "uppercase",
  },
  todayLabel: {
    color: "#fff",
    fontWeight: "bold",
  },
});
