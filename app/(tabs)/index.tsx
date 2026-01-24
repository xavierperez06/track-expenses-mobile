import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Imports from local files
import { Category } from "@/interfaces/category";
import { Expense } from "@/interfaces/expense";
import AddExpenseModal from "../../components/ui/expense/expense-modal";
import Header from "../../components/ui/expense/header";
import MonthlySummary from "../../components/ui/expense/montly-summary";
import WeeklyChart from "../../components/ui/expense/weekly-chart";
import { auth, db } from "../../config/firebase";

/**
 * MANDATORY RULE 1: Path Structure
 * We use /artifacts/{appId}/users/{userId}/{collectionName}
 */
// @ts-ignore
const appId = typeof __app_id !== "undefined" ? __app_id : "my-expense-app-v1";

const DEFAULT_CATEGORIES: Category[] = [
  { name: "Alimentación", hex: "#ea580c", iconName: "fast-food" },
  { name: "Supermercado", hex: "#10b981", iconName: "cart" },
  { name: "Casa", hex: "#4f46e5", iconName: "home" },
  { name: "Salud", hex: "#dc2626", iconName: "medical" },
  { name: "Juno", hex: "#172c3d", iconName: "paw" },
  { name: "Salidas", hex: "#9333ea", iconName: "pizza" },
  { name: "Gastos fijos", hex: "#ebcf34", iconName: "receipt" },
  { name: "Vacaciones", hex: "#9bc7b5", iconName: "airplane" },
  { name: "Transporte", hex: "#472247", iconName: "car" },
  { name: "Otros", hex: "#4b5563", iconName: "cash" },
];

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- Auth Lifecycle ---
  useEffect(() => {
    // Rule 3: Auth before Queries
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Auth initialization failed:", err);
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // --- Data Sync Lifecycle ---
  useEffect(() => {
    // Guard: Do not attempt queries until auth is confirmed (Rule 3)
    if (!user) return;

    setLoading(true);

    // 1. Expenses Listener
    const expensesRef = collection(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "expenses",
    );
    const unsubExpenses = onSnapshot(
      query(expensesRef),
      (snapshot) => {
        const loaded = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Expense,
        );
        loaded.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setExpenses(loaded);
        setLoading(false);
      },
      (err) => {
        console.error("Expenses permission error:", err);
        setLoading(false);
      },
    );

    // 2. Categories Listener
    const categoriesRef = collection(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "categories",
    );
    const unsubCategories = onSnapshot(
      query(categoriesRef),
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed defaults if account is fresh
          const batch = writeBatch(db);
          DEFAULT_CATEGORIES.forEach((cat) => {
            const newDoc = doc(categoriesRef);
            batch.set(newDoc, cat);
          });
          await batch.commit();
        } else {
          const loaded = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as Category,
          );
          setCategories(loaded);
        }
      },
      (err) => console.error("Categories permission error:", err),
    );

    // 3. Settings Listener
    const settingsRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "settings",
      "general",
    );
    const unsubSettings = onSnapshot(
      settingsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.monthlyBudget) setMonthlyBudget(data.monthlyBudget);
        }
      },
      (err) => console.error("Settings permission error:", err),
    );

    return () => {
      unsubExpenses();
      unsubCategories();
      unsubSettings();
    };
  }, [user]);

  // --- Calculations ---
  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return last7Days.map((day) => {
      const dayStr = day.toDateString();
      const dailyTotal = expenses
        .filter((e) => new Date(e.date).toDateString() === dayStr)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        dayName: days[day.getDay()],
        amount: dailyTotal,
        isToday: day.toDateString() === today.toDateString(),
      };
    });
  }, [expenses]);

  const maxSpend = Math.max(...weeklyData.map((d) => d.amount), 1);
  const totalSpending = expenses.reduce((sum, item) => sum + item.amount, 0);

  const monthlyData = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const currentMonthExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const total = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const breakdown = categories
      .map((cat) => {
        const catTotal = currentMonthExpenses
          .filter((e) => e.category === cat.name)
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          ...cat,
          total: catTotal,
          percentage: total === 0 ? 0 : (catTotal / total) * 100,
        };
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.percentage - a.percentage);
    return { expenses: currentMonthExpenses, total, breakdown };
  }, [expenses, categories, currentMonthDate]);

  // --- Actions ---
  const handleAddExpense = async (newExpense: any) => {
    if (!user) return;
    try {
      await addDoc(
        collection(db, "artifacts", appId, "users", user.uid, "expenses"),
        newExpense,
      );
    } catch (e) {
      Alert.alert("Error", "Check your Firestore rules");
    }
  };

  const handleAddCategory = async (newCategory: any) => {
    if (!user) return;
    try {
      await addDoc(
        collection(db, "artifacts", appId, "users", user.uid, "categories"),
        newCategory,
      );
    } catch (e) {
      Alert.alert("Error", "Check your Firestore rules");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(
        doc(db, "artifacts", appId, "users", user.uid, "expenses", id),
      );
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handleChangeMonth = (offset: number) => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + offset);
    setCurrentMonthDate(d);
  };

  const handleEditBudget = async () => {
    Alert.prompt(
      "Monthly Budget",
      "How much do you want to spend this month?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async (val: string | undefined) => {
            const num = parseFloat(val || "0");
            if (!isNaN(num) && user) {
              await setDoc(
                doc(
                  db,
                  "artifacts",
                  appId,
                  "users",
                  user.uid,
                  "settings",
                  "general",
                ),
                { monthlyBudget: num },
                { merge: true },
              );
            }
          },
        },
      ],
      "plain-text",
      monthlyBudget.toString(),
    );
  };

  const displayedExpenses =
    viewMode === "monthly" ? monthlyData.expenses : expenses;
  const currentBalance = monthlyBudget - monthlyData.total;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: "#6b7280" }}>
          Connecting to Cloud...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        user={user}
        viewMode={viewMode}
        currentDate={currentMonthDate}
        balance={currentBalance}
        spent={monthlyData.total}
        onToggleView={() =>
          setViewMode((prev) => (prev === "weekly" ? "monthly" : "weekly"))
        }
        onEditBudget={handleEditBudget}
        onLogout={() => auth.signOut()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {viewMode === "weekly" ? (
          <WeeklyChart
            data={weeklyData}
            maxSpend={maxSpend}
            totalSpending={totalSpending}
          />
        ) : (
          <MonthlySummary
            currentDate={currentMonthDate}
            onChangeMonth={handleChangeMonth}
            monthlyData={monthlyData}
          />
        )}

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>
            {viewMode === "monthly"
              ? "Monthly Transactions"
              : "Recent Transactions"}
          </Text>

          {displayedExpenses.map((expense) => {
            // Find category details to show the correct icon and color
            const category = categories.find(
              (c) => c.name === expense.category,
            );
            const iconName = (category?.iconName as any) || "pricetag";
            const categoryColor = category?.hex || "#2563eb";

            return (
              <View key={expense.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: `${categoryColor}20` },
                    ]}
                  >
                    <Ionicons name={iconName} size={20} color={categoryColor} />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>{expense.category}</Text>
                    <Text style={styles.cardDesc}>{expense.description}</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.amount}>
                    -${expense.amount.toFixed(2)}
                  </Text>
                  <View style={styles.cardActionRow}>
                    <Text style={styles.date}>
                      {new Date(expense.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(expense.id)}>
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}

          {displayedExpenses.length === 0 && (
            <Text style={styles.emptyText}>
              No expenses yet. Tap + to add one!
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsAddModalOpen(true)}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      <AddExpenseModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddExpense}
        onAddCategory={handleAddCategory}
        categories={categories}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  listSection: { paddingHorizontal: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1f2937",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardLeft: { flexDirection: "row", gap: 16, alignItems: "center", flex: 1 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontWeight: "bold", fontSize: 16, color: "#1f2937" },
  cardDesc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  cardRight: { alignItems: "flex-end" },
  amount: { fontWeight: "bold", fontSize: 16, color: "#1f2937" },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  date: { fontSize: 12, color: "#9ca3af" },
  emptyText: { textAlign: "center", color: "#9ca3af", marginTop: 20 },
  fabContainer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
