import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Imports from local files
import { Category } from '@/interfaces/category';
import AddExpenseModal from '../../components/ui/expense/expense-modal';
import Header from '../../components/ui/expense/header';
import MonthlySummary from '../../components/ui/expense/montly-summary';
import WeeklyChart from '../../components/ui/expense/weekly-chart';
import { auth, db } from '../../config/firebase';

// @ts-ignore
const appId = typeof __app_id !== 'undefined' ? __app_id : 'my-expense-app-v1';

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
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  
  // UI State
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [periodMode, setPeriodMode] = useState<'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState('');

  // 1. Auth Lifecycle
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        await signInAnonymously(auth);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Data Sync Lifecycle
  useEffect(() => {
    if (!user) return;

    const categoriesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'categories');
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

    const expensesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'expenses');
    const unsubExpenses = onSnapshot(query(expensesRef), (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loaded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setExpenses(loaded);
      setLoading(false);
    });

    const settingsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'general');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const val = docSnap.data().monthlyBudget || 0;
        setMonthlyBudget(val);
        setTempBudget(val.toString());
      }
    });

    return () => {
      unsubCategories();
      unsubExpenses();
      unsubSettings();
    };
  }, [user]);

  // 3. Stats Calculations
  const statsData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const filtered = expenses.filter(e => {
      const d = new Date(e.date);
      if (periodMode === 'year') return d.getFullYear() === year;
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    const breakdown = categories.map(cat => {
      const catTotal = filtered
        .filter(e => e.category === cat.name)
        .reduce((sum, e) => sum + e.amount, 0);
      return { 
        ...cat, 
        total: catTotal, 
        percentage: total === 0 ? 0 : (catTotal / total) * 100 
      };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

    return { total, breakdown };
  }, [expenses, categories, currentDate, periodMode]);

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const amount = expenses
        .filter(e => new Date(e.date).toDateString() === d.toDateString())
        .reduce((sum, e) => sum + e.amount, 0);
      return { dayName: days[d.getDay()], amount, isToday: i === 6 };
    });
  }, [expenses]);

  // Handlers
  const handleChangeDate = (offset: number) => {
    const d = new Date(currentDate);
    if (periodMode === 'month') d.setMonth(d.getMonth() + offset);
    else d.setFullYear(d.getFullYear() + offset);
    setCurrentDate(d);
  };

  const handleAddExpense = async (newExpense: any) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'expenses'), newExpense);
    setIsAddModalOpen(false);
  };

  // New Handler for Updating
  const handleUpdateExpense = async (id: string, updatedExpense: any) => {
    if (!user) return;
    try {
      const expenseRef = doc(db, 'artifacts', appId, 'users', user.uid, 'expenses', id);
      await updateDoc(expenseRef, updatedExpense);
      setEditingExpense(null); // Clear editing state
    } catch (error) {
      console.error("Error updating expense:", error);
      Alert.alert("Error", "Could not update the expense.");
    }
  };

  const handleAddCategory = async (newCategory: any) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'categories'), newCategory);
  };

  const handleSaveBudget = async () => {
    const num = parseFloat(tempBudget || '0');
    if (user && !isNaN(num)) {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'general'), { monthlyBudget: num }, { merge: true });
      setIsBudgetModalOpen(false);
    } else {
      Alert.alert("Invalid input", "Please enter a valid number");
    }
  };

  const openEditModal = (expense: any) => {
    setEditingExpense(expense);
    setIsAddModalOpen(true);
  };

  const openNewModal = () => {
    setEditingExpense(null);
    setIsAddModalOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
  if (!user) return;

  Alert.alert(
    "Delete Transaction",
    "Are you sure you want to delete this expense?",
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'expenses', id));
          } catch (error) {
            console.error("Error deleting expense:", error);
            Alert.alert("Error", "Could not delete the expense.");
          }
        } 
      },
    ]
  );
};

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <View style={styles.container}>
      <Header
        user={user}
        viewMode={viewMode}
        currentDate={currentDate}
        balance={monthlyBudget - (periodMode === 'month' ? statsData.total : 0)} 
        spent={statsData.total}
        onToggleView={() => setViewMode(prev => prev === 'weekly' ? 'monthly' : 'weekly')}
        onEditBudget={() => setIsBudgetModalOpen(true)}
        onLogout={() => auth.signOut()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
        {viewMode === 'weekly' ? (
          <WeeklyChart 
            data={weeklyData} 
            maxSpend={Math.max(...weeklyData.map(d => d.amount), 1)} 
            totalSpending={weeklyData.reduce((acc, d) => acc + d.amount, 0)} 
          />
        ) : (
          <MonthlySummary 
            currentDate={currentDate}
            periodMode={periodMode}
            onTogglePeriod={setPeriodMode}
            onChangeDate={handleChangeDate}
            statsData={statsData}
          />
        )}

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Transacciones recientes</Text>
          {expenses.slice(0, 15).map((expense) => {
            const cat = categories.find(c => c.name === expense.category);
  return (
    <View key={expense.id} style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconBox, { backgroundColor: `${cat?.hex || '#2563eb'}20` }]}>
          <Ionicons name={(cat?.iconName || 'pricetag') as any} size={20} color={cat?.hex || '#2563eb'} />
        </View>
        <View>
          <Text style={styles.cardTitle}>{expense.category}</Text>
          <Text style={styles.cardDesc}>{expense.description}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.amount}>-${expense.amount.toFixed(2)}</Text>
            <Text style={styles.dateText}>
              {new Date(expense.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
            </Text>
          </View>

          {/* EDIT BUTTON */}
                    <TouchableOpacity 
                      onPress={() => openEditModal(expense)}
                      style={[styles.deleteBtn, { marginRight: -8 }]} // Adjust styling as needed
                    >
                      <Ionicons name="pencil-outline" size={20} color="#7c3aed" />
                    </TouchableOpacity>
                    
          {/* Add Delete Button */}
          <TouchableOpacity 
            onPress={() => handleDeleteExpense(expense.id)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
})}
        </View>
      </ScrollView>

      {/* Budget Modal */}
      <Modal visible={isBudgetModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.budgetModal}>
            <Text style={styles.modalTitle}>Configurar presupuesto mensual</Text>
            <TextInput
              style={styles.budgetInput}
              keyboardType="numeric"
              value={tempBudget}
              onChangeText={setTempBudget}
              placeholder="0.00"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsBudgetModalOpen(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveBudget} style={styles.saveButton}>
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={openNewModal}>
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      <AddExpenseModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddExpense}
        onUpdate={handleUpdateExpense}
        onAddCategory={handleAddCategory}
        categories={categories}
        expenseToEdit={editingExpense}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  listSection: { paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1f2937' },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#f3f4f6',
  },
  cardLeft: { flexDirection: 'row', gap: 16, alignItems: 'center', flex: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#1f2937' },
  cardDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  amount: { fontWeight: 'bold', fontSize: 16, color: '#1f2937' },
  dateText: { fontSize: 10, color: '#9ca3af', fontWeight: 'bold', marginTop: 4 },
  fabContainer: { position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' },
  fab: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center', elevation: 8
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  budgetModal: { backgroundColor: '#fff', width: '80%', padding: 24, borderRadius: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  budgetInput: { backgroundColor: '#f3f4f6', width: '100%', borderRadius: 12, padding: 16, fontSize: 24, textAlign: 'center', fontWeight: 'bold', marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelButton: { flex: 1, padding: 12, alignItems: 'center' },
  saveButton: { flex: 1, padding: 12, backgroundColor: '#7c3aed', borderRadius: 12, alignItems: 'center' },
  cancelText: { color: '#6b7280', fontWeight: 'bold' },
  saveText: { color: '#fff', fontWeight: 'bold' },
  deleteBtn: {
    padding: 8,
    marginLeft: 4,
  },
});