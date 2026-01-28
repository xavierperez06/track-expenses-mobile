import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Category {
  name: string;
  hex: string;
  iconName?: string;
}

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (expense: any) => void;
  onUpdate?: (id: string, expense: any) => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory?: (categoryName: string) => void;
  categories: Category[];
  expenseToEdit?: any;
}

const COLORS = [
  "#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#06b6d4", "#8b5cf6", 
  "#14b8a6", "#6366f1", "#d946ef", "#f43f5e", "#fb923c", "#22c55e", "#0ea5e9", "#475569",
  "#a855f7", "#be123c", "#15803d", "#1d4ed8"
];

const ICONS = [
  "pricetag", "cart", "restaurant", "bus", "home", "shirt", "medkit", "gift", 
  "game-controller", "fitness", "car", "cafe", "beer", "wine", "musical-notes", 
  "airplane", "paw", "heart", "school", "construct", "flash", "water", "phone-portrait", "tv"
];

export default function AddExpenseModal({
  visible,
  onClose,
  onAdd,
  onUpdate,
  onAddCategory,
  onDeleteCategory,
  categories,
  expenseToEdit,
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);

  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState(ICONS[0]);

  useEffect(() => {
    if (visible) {
      if (expenseToEdit) {
        setAmount(expenseToEdit.amount.toString().replace('.', ','));
        setDescription(expenseToEdit.description || "");
        setSelectedCategory(expenseToEdit.category || "");
        setDate(new Date(expenseToEdit.date));
      } else {
        setAmount("");
        setDescription("");
        setSelectedCategory(categories[0]?.name || "");
        setDate(new Date());
      }
      setShowPicker(false);
    }
  }, [visible, expenseToEdit]);

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9,]/g, "");
    const parts = cleaned.split(",");
    if (parts.length > 2) return; 
    setAmount(cleaned);
  };

  const handleSaveCategory = () => {
    if (!newCatName.trim()) {
      Alert.alert("Error", "Ingresa un nombre para la categoría");
      return;
    }
    onAddCategory({ name: newCatName.trim(), hex: newCatColor, iconName: newCatIcon });
    setNewCatName("");
    setShowCategoryCreator(false);
  };

  const handleQuickDate = (type: 'today' | 'yesterday') => {
    const d = new Date();
    if (type === 'yesterday') d.setDate(d.getDate() - 1);
    setDate(d);
  };

  const confirmDelete = (cat: Category) => {
    Alert.alert(
      "Eliminar Categoría",
      `¿Estás seguro de que quieres eliminar "${cat.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => onDeleteCategory?.(cat.name) }
      ]
    );
  };

  const handleSave = () => {
    const cleanAmount = amount.replace(',', '.');
    if (!amount || isNaN(parseFloat(cleanAmount))) {
      Alert.alert("Error", "Ingresa un monto válido");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Error", "Selecciona una categoría");
      return;
    }
    const data = {
      amount: parseFloat(cleanAmount),
      description,
      category: selectedCategory,
      date: date.toISOString(),
    };
    if (expenseToEdit) onUpdate?.(expenseToEdit.id, data);
    else onAdd(data);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{expenseToEdit ? "Editar Gasto" : "Nuevo Gasto"}</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={28} color="#cbd5e1" /></TouchableOpacity>
            </View>
            
            <View style={{ flex: 1 }}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={[
                  styles.amountContainer, 
                  isAmountFocused && { borderColor: "#7c3aed", backgroundColor: "#7c3aed05" }
                ]}>
                  <Text style={[styles.currency, { color: "#7c3aed" }]}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0,00"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={handleAmountChange}
                    onFocus={() => setIsAmountFocused(true)}
                    onBlur={() => setIsAmountFocused(false)}
                    autoFocus={!expenseToEdit}
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <Text style={styles.label}>Categoría</Text>
                <View style={styles.categoryGrid}>
                  <TouchableOpacity style={styles.addGridItem} onPress={() => setShowCategoryCreator(true)}>
                    <Ionicons name="add" size={18} color="#94a3b8" />
                    <Text style={styles.addGridText}>Nueva</Text>
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.name}
                      onPress={() => setSelectedCategory(cat.name)}
                      onLongPress={() => confirmDelete(cat)}
                      style={[
                        styles.gridItem, 
                        selectedCategory === cat.name && { borderColor: cat.hex, backgroundColor: cat.hex + '15' }
                      ]}
                    >
                      <Ionicons 
                        name={(cat.iconName as any) || "pricetag"} 
                        size={14} 
                        color={cat.hex} 
                        style={{ marginRight: 6 }} 
                      />
                      <Text style={[styles.gridText, selectedCategory === cat.name && { fontWeight: '700', color: cat.hex }]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Fecha</Text>
                <View style={styles.quickDateRow}>
                  <TouchableOpacity style={[styles.quickDateBtn, date.toDateString() === new Date().toDateString() && { backgroundColor: "#7c3aed", borderColor: "#7c3aed" }]} onPress={() => handleQuickDate('today')}>
                    <Text style={[styles.quickDateText, date.toDateString() === new Date().toDateString() && { color: '#fff' }]}>Hoy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickDateBtn, date.toDateString() === new Date(Date.now() - 86400000).toDateString() && { backgroundColor: "#7c3aed", borderColor: "#7c3aed" }]} onPress={() => handleQuickDate('yesterday')}>
                    <Text style={[styles.quickDateText, date.toDateString() === new Date(Date.now() - 86400000).toDateString() && { color: '#fff' }]}>Ayer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.customDateBtn} onPress={() => setShowPicker(true)}>
                    <Ionicons name="calendar-outline" size={16} color="#64748b" /><Text style={styles.customDateText}>{date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formCard}>
                  <View style={styles.formRow}>
                    <Ionicons name="pencil-outline" size={20} color="#64748b" />
                    <TextInput style={styles.textInput} placeholder="Descripción (opcional)" value={description} onChangeText={setDescription} placeholderTextColor="#94a3b8" />
                  </View>
                </View>

                {showPicker && <DateTimePicker value={date} mode="date" display="default" onChange={(e, d) => { setShowPicker(false); if (d) setDate(d); }} />}
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#8b5cf6', '#ec4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.saveBtn}
                  >
                    <Text style={styles.saveText}>{expenseToEdit ? "Actualizar" : "Guardar"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      <Modal visible={showCategoryCreator} transparent animationType="fade">
        <View style={styles.subOverlay}>
          <View style={styles.subCard}>
            <Text style={styles.subTitle}>Nueva Categoría</Text>
            <TextInput style={styles.subInput} placeholder="Nombre" value={newCatName} onChangeText={setNewCatName} autoFocus />
            
            <Text style={styles.subLabel}>Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subScroll} contentContainerStyle={styles.colorRow}>
              {COLORS.map(c => <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, newCatColor === c && styles.activeColor]} onPress={() => setNewCatColor(c)} />)}
            </ScrollView>

            <Text style={styles.subLabel}>Icono</Text>
            <ScrollView style={{ maxHeight: 150 }} contentContainerStyle={styles.iconRow}>
              {ICONS.map(i => (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.iconBox, newCatIcon === i && { backgroundColor: newCatColor + '20', borderColor: newCatColor }]} 
                  onPress={() => setNewCatIcon(i)}
                >
                  <Ionicons name={i as any} size={20} color={newCatIcon === i ? newCatColor : "#94a3b8"} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.subActionRow}>
              <TouchableOpacity onPress={() => setShowCategoryCreator(false)}><Text style={{ color: '#64748b', fontWeight: '600' }}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSaveCategory} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#8b5cf6', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.miniSaveBtn}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Crear</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  keyboardView: { width: '100%' },
  dismissArea: { flex: 1 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 20 : 10, height: '85%' },
  handle: { width: 40, height: 5, backgroundColor: '#e2e8f0', borderRadius: 3, alignSelf: 'center', marginVertical: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  scrollContent: { paddingBottom: 20 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 25, backgroundColor: '#fff', paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#f1f5f9', width: '100%' },
  currency: { fontSize: 20, fontWeight: '700', marginRight: 4 },
  amountInput: { fontSize: 32, fontWeight: '800', color: '#1e293b' },
  label: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 25 },
  gridItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  addGridItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  addGridText: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginLeft: 4 },
  gridText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  quickDateRow: { flexDirection: 'row', gap: 8, marginBottom: 25 },
  quickDateBtn: { flex: 1, height: 44, backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  quickDateText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  customDateBtn: { flex: 1.2, flexDirection: 'row', height: 44, backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#f1f5f9' },
  customDateText: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  formCard: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, marginBottom: 20 },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  textInput: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500' },
  footer: { paddingTop: 10, backgroundColor: '#fff' },
  saveBtn: { height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  subOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  subCard: { backgroundColor: '#fff', width: '85%', borderRadius: 24, padding: 24 },
  subTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, color: '#1e293b' },
  subLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' },
  subInput: { backgroundColor: '#f1f5f9', padding: 14, borderRadius: 12, marginBottom: 16, fontSize: 16, color: '#1e293b' },
  subScroll: { marginBottom: 16 },
  colorRow: { flexDirection: 'row', gap: 10, paddingRight: 20 },
  colorDot: { width: 34, height: 34, borderRadius: 17 },
  activeColor: { borderWidth: 3, borderColor: '#1e293b' },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9', backgroundColor: '#f8fafc' },
  subActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  miniSaveBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }
});