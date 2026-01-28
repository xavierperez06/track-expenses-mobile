import { Category } from "@/interfaces/category";
import { Expense } from "@/interfaces/expense";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (expense: Expense) => void;
  onUpdate?: (id: string, expense: Expense) => void;
  onAddCategory: (category: Category) => void;
  categories: Category[];
  expenseToEdit?:Expense;
}

// Helper functions for date formatting moved outside to ensure consistency
const formatDate = (d: Date) => {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDateString = (str: string) => {
  const parts = str.split("-");
  if (parts.length !== 3) return new Date();
  const [day, month, year] = parts.map(Number);
  // Use midday to avoid timezone shifts during simple date selection
  return new Date(year, month - 1, day, 12, 0, 0);
};

const AVAILABLE_COLORS = [
  { name: "Orange", hex: "#ea580c" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Red", hex: "#dc2626" },
  { name: "Pink", hex: "#db2777" },
  { name: "Purple", hex: "#9333ea" },
  { name: "Gray", hex: "#4b5563" },
  { name: "Blue", hex: "#2563eb" },
];

const AVAILABLE_ICONS = [
  "fast-food",
  "cart",
  "home",
  "medical",
  "paw",
  "beer",
  "cash",
  "cafe",
  "airplane",
  "gift",
  "musical-notes",
  "book",
  "briefcase",
  "game-controller",
  "phone-portrait",
  "construct",
  "star",
  "car",
  "cafe",
  "card",
  "checkmark",
  "fitness",
];

export default function AddExpenseModal({
  visible,
  onClose,
  onAdd,
  onUpdate,
  onAddCategory,
  categories,
  expenseToEdit,
}: AddExpenseModalProps) {
  // Main Form State
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(formatDate(new Date()));
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.name || "Other",
  );

  // UI Interaction State
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [showDescriptionError, setShowDescriptionError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Reset form and sync category whenever the modal becomes visible
  useEffect(() => {
    if (visible) {
      const now = new Date();
      setDate(formatDate(now));
      setAmount("");
      setDescription("");
      setShowDescriptionError(false);

      if (categories.length > 0) {
        setSelectedCategory(categories[0].name);
      }
    }
  }, [visible, categories]);

  // Updated useEffect to handle Edit Mode
  useEffect(() => {
    if (visible) {
      if (expenseToEdit) {
        // Edit Mode: Pre-fill data
        setAmount(expenseToEdit.amount.toString());
        setDescription(expenseToEdit.description);
        setDate(formatDate(new Date(expenseToEdit.date))); // Ensure date is formatted correctly
        setSelectedCategory(expenseToEdit.category);
      } else {
        // New Mode: Reset to defaults
        const now = new Date();
        setDate(formatDate(now));
        setAmount("");
        setDescription("");
        if (categories.length > 0) {
          setSelectedCategory(categories[0].name);
        }
      }
      setShowDescriptionError(false);
    }
  }, [visible, categories, expenseToEdit]);

  // Category Creator State
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(AVAILABLE_COLORS[0].hex);
  const [newCatIcon, setNewCatIcon] = useState("star");

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    setAmount(cleaned);
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (text.trim()) {
      setShowDescriptionError(false);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDate(formatDate(selectedDate));
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!description.trim()) {
      setShowDescriptionError(true);
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount greater than 0.",
        [{ text: "OK" }],
      );
      return;
    }

    const expenseDate = parseDateString(date);
    const expenseData = {
      amount: numericAmount,
      description: description.trim(),
      category: selectedCategory,
      date: expenseDate.toISOString(),
    };

    if (expenseToEdit && onUpdate) {
      onUpdate(expenseToEdit.id!, expenseData);
    } else {
      onAdd(expenseData);
    }

    onClose();
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    onAddCategory({
      name: newCatName.trim(),
      hex: newCatColor,
      iconName: newCatIcon,
    });
    setSelectedCategory(newCatName.trim());
    setShowCategoryCreator(false);
    setNewCatName("");
  };

  const getTodayStr = () => formatDate(new Date());
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDate(d);
  };

  const setDateQuick = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(formatDate(d));
  };

  if (showCategoryCreator) {
    return (
      <Modal visible={visible} animationType="fade" transparent={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setShowCategoryCreator(false)}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color="#4b5563" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nueva categoría</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOMBRE</Text>
              <TextInput
                style={styles.textInput}
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder="e.g. Gym, Travel"
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>COLOR</Text>
              <View style={styles.colorGrid}>
                {AVAILABLE_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color.hex}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color.hex },
                      newCatColor === color.hex && styles.activeBorder,
                    ]}
                    onPress={() => setNewCatColor(color.hex)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ICONO</Text>
              <View style={styles.iconGrid}>
                {AVAILABLE_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconCircle,
                      newCatIcon === icon
                        ? { backgroundColor: "#000" }
                        : { backgroundColor: "#f3f4f6" },
                    ]}
                    onPress={() => setNewCatIcon(icon)}
                  >
                    <Ionicons
                      name={icon as any}
                      size={20}
                      color={newCatIcon === icon ? "#fff" : "#6b7280"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, !newCatName.trim() && { opacity: 0.5 }]}
              onPress={handleCreateCategory}
              disabled={!newCatName.trim()}
            >
              <Text style={styles.saveBtnText}>Crear Categoría</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{expenseToEdit ? "Editar Gasto" : "Agregar Gasto"}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>MONTO</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[
                  styles.amountInput,
                  isAmountFocused && styles.inputFocused,
                ]}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                keyboardType="decimal-pad"
                onFocus={() => setIsAmountFocused(true)}
                onBlur={() => setIsAmountFocused(false)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CATEGORÍA</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat, idx) => {
                const isSelected = selectedCategory === cat.name;
                const catColor = cat.hex || "#6b7280";

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.catButton,
                      isSelected
                        ? {
                            borderColor: catColor,
                            backgroundColor: `${catColor}15`,
                          }
                        : {
                            borderColor: "#f3f4f6",
                            backgroundColor: "#fff",
                          },
                    ]}
                    onPress={() => setSelectedCategory(cat.name)}
                  >
                    <Ionicons
                      name={(cat.iconName || "pricetag") as any}
                      size={18}
                      color={catColor}
                    />
                    <Text
                      style={[
                        styles.catText,
                        { color: isSelected ? catColor : "#6b7280" },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[
                  styles.catButton,
                  {
                    borderStyle: "dashed",
                    borderColor: "#d1d5db",
                    backgroundColor: "transparent",
                  },
                ]}
                onPress={() => setShowCategoryCreator(true)}
              >
                <Ionicons name="add" size={16} color="#9ca3af" />
                <Text style={[styles.catText, { color: "#9ca3af" }]}>Nueva</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>FECHA</Text>
            <TouchableOpacity
              style={styles.textInput}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.datePickerContent}>
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                <Text style={styles.dateText}>{date}</Text>
              </View>
            </TouchableOpacity>

            {(showDatePicker || Platform.OS === "ios") && (
              <DateTimePicker
                value={parseDateString(date)}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={onDateChange}
                style={styles.iosDatePicker}
                accentColor="#7c3aed"
                textColor="#7c3aed"
              />
            )}

            <View style={styles.quickDateRow}>
              <TouchableOpacity
                onPress={() => setDateQuick(0)}
                style={
                  date === getTodayStr() ? styles.dateBtnActive : styles.dateBtn
                }
              >
                <Text
                  style={
                    date === getTodayStr()
                      ? styles.dateBtnTextActive
                      : styles.dateBtnText
                  }
                >
                  Hoy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDateQuick(1)}
                style={
                  date === getYesterdayStr()
                    ? styles.dateBtnActive
                    : styles.dateBtn
                }
              >
                <Text
                  style={
                    date === getYesterdayStr()
                      ? styles.dateBtnTextActive
                      : styles.dateBtnText
                  }
                >
                  Ayer
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DESCRIPCIÓN</Text>
            <TextInput
              style={[
                styles.textInput,
                isDescriptionFocused && styles.inputFocused,
                showDescriptionError && styles.inputError,
              ]}
              value={description}
              onChangeText={handleDescriptionChange}
              placeholder="What was this for?"
              onFocus={() => setIsDescriptionFocused(true)}
              onBlur={() => setIsDescriptionFocused(false)}
            />
            {showDescriptionError && (
              <Text style={styles.errorText}>Descripción requerida</Text>
            )}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
            <Text style={styles.saveBtnText}>
              {expenseToEdit ? "Guardar Cambios" : "Guardar Gasto"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  closeBtn: { padding: 8, backgroundColor: "#f3f4f6", borderRadius: 20 },
  backBtn: { padding: 8, backgroundColor: "#f3f4f6", borderRadius: 20 },
  content: { padding: 24, gap: 24 },
  inputGroup: { gap: 12 },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9ca3af",
    letterSpacing: 1,
  },
  amountContainer: { position: "relative" },
  currencySymbol: {
    position: "absolute",
    top: 18,
    left: 16,
    fontSize: 30,
    fontWeight: "bold",
    color: "#9ca3af",
    zIndex: 1,
  },
  amountInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    fontSize: 36,
    fontWeight: "bold",
    padding: 16,
    paddingLeft: 40,
    height: 80,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: "#7c3aed",
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  catText: { fontWeight: "700", fontSize: 14 },
  textInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: "500",
    borderWidth: 2,
    borderColor: "transparent",
    justifyContent: "center",
  },
  datePickerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  iosDatePicker: {
    alignSelf: "center",
    width: "100%",
    marginTop: 8,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
    marginTop: -8,
  },
  quickDateRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  dateBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  dateBtnActive: {
    flex: 1,
    backgroundColor: "#f5f2fa",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  dateBtnText: { color: "#6b7280", fontWeight: "bold", fontSize: 12 },
  dateBtnTextActive: { color: "#7c3aed", fontWeight: "bold", fontSize: 12 },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  colorCircle: { width: 44, height: 44, borderRadius: 22 },
  activeBorder: { borderWidth: 3, borderColor: "#000" },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    backgroundColor: "#7c3aed",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
