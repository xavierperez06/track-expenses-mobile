import { Ionicons } from "@expo/vector-icons";
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
  
  const displayDate = viewMode === "monthly"
    ? currentDate.toLocaleString("es-ES", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase())
    : "Estado Actual";

  return (
    <View style={styles.container}>
      
      {/* Top Navigation Row */}
      <View style={styles.topRow}>
        <View style={styles.greetingBox}>
          <Text style={styles.greetingText}>Hola, {user?.email?.split('@')[0] || 'Usuario'}</Text>
          <Text style={styles.subtitle}>{displayDate}</Text>
        </View>

        <View style={styles.iconRow}>
          <TouchableOpacity onPress={onToggleView} style={styles.iconButton}>
            <Ionicons
              name={viewMode === "weekly" ? "pie-chart-outline" : "bar-chart-outline"}
              size={18}
              color="#374151"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onLogout} style={[styles.iconButton, styles.logoutBtn]}>
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ULTRA COMPACT CARD */}
      <View style={styles.balanceCard}>
        
        {/* FIX 1: Render Decoration FIRST so it is behind content */}
        {/* FIX 2: pointerEvents="none" ensures clicks pass through it */}
        <View style={styles.decorativeCircle} pointerEvents="none" />

        {/* Top of Card: Label and Edit */}
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="wallet-outline" size={14} color="#94a3b8" />
            <Text style={styles.cardLabel}>BALANCE DISPONIBLE</Text>
          </View>
          
          {/* Edit Button */}
          {/* Added zIndex to ensure it floats above everything */}
          <TouchableOpacity 
            onPress={onEditBudget} 
            style={styles.editBtn} 
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
            activeOpacity={0.6}
          >
             <Ionicons name="pencil" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Middle: Balance Amount - Also triggers edit */}
        <TouchableOpacity onPress={onEditBudget} activeOpacity={0.8}>
          <Text style={styles.balanceText}>
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </TouchableOpacity>

        {/* Bottom: Spent Indicator */}
        <View style={styles.cardFooter}>
           <View style={styles.spentBadge}>
              <Ionicons name="arrow-down" size={10} color="#fca5a5" />
              <Text style={styles.spentLabel}>Gastado</Text>
           </View>
           <Text style={styles.spentAmount}>
             -${spent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
           </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Exact alignment with MonthlySummary (paddingHorizontal: 24)
    paddingHorizontal: 24, 
    paddingTop: 50, 
    paddingBottom: 10, 
    backgroundColor: "#fff",
  },
  
  // Top Row
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16, 
  },
  greetingBox: {
    flexDirection: 'column',
  },
  greetingText: {
    fontSize: 16, 
    fontWeight: '800',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginTop: 0,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 32, 
    height: 32,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    backgroundColor: '#fef2f2',
  },

  // The Card
  balanceCard: {
    backgroundColor: '#1e293b', 
    borderRadius: 24, 
    paddingVertical: 20, 
    paddingHorizontal: 20, 
    position: 'relative',
    overflow: 'hidden',
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    zIndex: 10, // Ensure header is above decoration
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 10, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20, // Ensure button is clickable
  },
  balanceText: {
    fontSize: 28, 
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 14, 
    letterSpacing: -0.5,
    zIndex: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12, 
    paddingHorizontal: 12,
    paddingVertical: 8, 
    zIndex: 10,
  },
  spentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spentLabel: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '500',
  },
  spentAmount: {
    color: '#fca5a5', 
    fontSize: 13, 
    fontWeight: '700',
  },
  
  // Abstract shape
  decorativeCircle: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.06)',
    zIndex: 0, // Behind everything
  },
});