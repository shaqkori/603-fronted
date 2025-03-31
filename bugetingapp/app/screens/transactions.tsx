import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Transaction } from "../types/transactions";
import TransactionList from "../components/transactionList";
import { BASE_URL } from "../src/config";

const Colors = {
  background: "#f8f9fa",
  surface: "#ffffff",
  primaryText: "#212529",
  secondaryText: "#6c757d",
  placeholderText: "#adb5bd",
  primary: "#007bff",
  primaryLight: "#e7f3ff",
  income: "#28a745",
  expense: "#dc3545",
  border: "#dee2e6",
  white: "#ffffff",
  disabled: "#ced4da",
};

const API_URL = `${BASE_URL}/transactions`;
const CATEGORIES_URL = `${BASE_URL}/categories`;

interface Category {
  id: number;
  name: string;
}

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch(CATEGORIES_URL);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data: Category[] = await response.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err instanceof Error ? err.message : "Could not load categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data: Transaction[] = await response.json();
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "Could not load transactions.");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!description.trim()) {
      Alert.alert("Input Required", "Please enter a description.");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Input Required", "Please select a category.");
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Input Required", "Please enter a valid positive amount.");
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);
    setError(null);

    const newTransaction = {
      description: description.trim(),
      amount: numericAmount,
      type,
      date: new Date().toISOString(),
      category: selectedCategory.name,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add transaction: ${response.status} ${errorText}`);
      }

      setDescription("");
      setAmount("");
      setSelectedCategory(null);
      setType("expense");
      await fetchTransactions();
    } catch (err) {
      console.error("Error adding transaction:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(message);
      Alert.alert("Error", `Could not add transaction: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete transaction");
            fetchTransactions();
          } catch (err) {
            console.error("Error deleting transaction:", err);
            Alert.alert("Error", "Could not delete transaction.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.categoryTile, isSelected && styles.selectedCategoryTile]}
        onPress={() => setSelectedCategory(item)}
        disabled={isSubmitting}
      >
        <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.title}>New Transaction</Text>

            <TextInput
              style={styles.input}
              placeholder="Description (e.g., Coffee, Paycheck)"
              placeholderTextColor={Colors.placeholderText}
              value={description}
              onChangeText={setDescription}
              editable={!isSubmitting}
            />

            <Text style={styles.label}>Category</Text>
            {loadingCategories ? (
              <ActivityIndicator style={styles.loadingIndicator} />
            ) : (
              <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryList}
                contentContainerStyle={{ paddingVertical: 5 }}
                ListEmptyComponent={<Text style={styles.emptyText}>No categories found</Text>}
              />
            )}

            <Text style={styles.label}>Amount (£)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.placeholderText}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              editable={!isSubmitting}
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, type === "income" && styles.selectedTypeIncome]}
                onPress={() => setType("income")}
                disabled={isSubmitting}
              >
                <Text style={[styles.typeText, type === "income" && styles.selectedTypeText]}>
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === "expense" && styles.selectedTypeExpense]}
                onPress={() => setType("expense")}
                disabled={isSubmitting}
              >
                <Text style={[styles.typeText, type === "expense" && styles.selectedTypeText]}>
                  Expense
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.addButton, isSubmitting && styles.addButtonDisabled]}
              onPress={handleAddTransaction}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.addButtonText}>Add Transaction</Text>
              )}
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.listTitle}>History</Text>
            {loadingTransactions ? (
              <ActivityIndicator size="large" style={styles.loadingIndicator} />
            ) : (
              <TransactionList
                transactions={transactions}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}
          </View>
        </ScrollView>
      
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: Colors.background },
  scrollViewContent: { flexGrow: 1 },
  container: { flex: 1, padding: 20, backgroundColor: Colors.background },
  title: { fontSize: 24, fontWeight: "bold", color: Colors.primaryText, marginBottom: 20 },
  label: { fontSize: 14, color: Colors.secondaryText, fontWeight: "500", marginBottom: 5, marginTop: 15 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 5,
    fontSize: 16,
    color: Colors.primaryText,
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  categoryList: { flexGrow: 0, marginVertical: 5 },
  categoryTile: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCategoryTile: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  categoryText: { fontSize: 14, color: Colors.secondaryText },
  selectedCategoryText: { color: Colors.primary, fontWeight: "600" },
  typeSelector: { flexDirection: "row", marginVertical: 10, gap: 15 },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  selectedTypeIncome: { backgroundColor: Colors.income, borderColor: Colors.income },
  selectedTypeExpense: { backgroundColor: Colors.expense, borderColor: Colors.expense },
  typeText: { fontWeight: "500", color: Colors.secondaryText, fontSize: 14 },
  selectedTypeText: { color: Colors.white, fontWeight: "bold" },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 15,
    minHeight: 45,
  },
  addButtonDisabled: { backgroundColor: Colors.disabled },
  addButtonText: { color: Colors.white, fontSize: 16, fontWeight: "bold" },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primaryText,
    marginTop: 25,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 15,
  },
  loadingIndicator: { marginVertical: 20, alignSelf: "center" },
  emptyText: { color: Colors.secondaryText, paddingVertical: 10 },
  errorText: { color: Colors.expense, textAlign: "center", marginTop: 10, marginBottom: 5 },
});

export default TransactionsScreen;