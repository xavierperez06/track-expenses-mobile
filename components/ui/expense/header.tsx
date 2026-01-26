import { Ionicons } from "@expo/vector-icons"; // Using Expo standard icons
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  user: any;
  viewMode: "weekly" | "monthly";
  currentDate: Date;
  balance: number;
  spent: number;
  onToggleView: () => void;
  onEditBudget: () => void;
  onLogout: () => void;
}

export default function Header({
  user,
  viewMode,
  currentDate,
  balance,
  spent,
  onToggleView,
  onEditBudget,
  onLogout,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      {/* Top Row: Title & Icons */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.subtitle}>
            {viewMode === "monthly"
              ? currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })
              : "Current Status"}
          </Text>
        </View>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={onToggleView} style={styles.iconButton}>
            <Ionicons
              name={viewMode === "weekly" ? "pie-chart" : "bar-chart"}
              size={20}
              color="#7c3aed"
            />
          </TouchableOpacity>

          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email ? user.email[0].toUpperCase() : "U"}
            </Text>
          </View>

          <TouchableOpacity onPress={onLogout} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={20} color="#4b5563" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {/* Main Balance */}
        <View>
          <View style={styles.labelRow}>
            <Text style={styles.label}>BALANCE</Text>
            <TouchableOpacity onPress={onEditBudget} style={styles.editButton}>
              <Ionicons name="pencil" size={12} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceText}>${balance.toFixed(2)}</Text>
        </View>

        {/* Expenses Side-car */}
        <View>
          <View style={styles.labelRow}>
            <Text style={styles.label}>SPENT</Text>
          </View>
          <Text style={styles.spentText}>-${spent.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60, // Safe area padding
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#7c3aed",
  },
  avatarText: {
    color: "#7c3aed",
    fontWeight: "bold",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 32,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 20,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9ca3af",
  },
  editButton: {
    padding: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
  },
  spentText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ef4444",
    marginTop: 8,
  },
});
