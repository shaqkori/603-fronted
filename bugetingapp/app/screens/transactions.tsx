import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput, // Keep TextInput
  StyleSheet,
  TouchableOpacity, // Use TouchableOpacity for buttons
  ActivityIndicator, // Add for loading state feedback
  Alert, // For validation feedback
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView, // Added to ensure form doesn't get hidden by keyboard
} from "react-native";
import { Transaction } from "../types/transactions";
import TransactionList from "../components/transactionList"; // Assuming this is styled
import { BASE_URL } from "../src/config";

// --- Re-using the Professional Color Palette ---
const Colors = {
  background: "#f8f9fa",
  surface: "#ffffff", // Can be used for selected items background
  primaryText: "#212529",
  secondaryText: "#6c757d",
  placeholderText: "#adb5bd",
  primary: "#007bff", // Standard blue
  primaryLight: "#e7f3ff",
  income: "#28a745",
  expense: "#dc3545",
  border: "#dee2e6",
  white: "#ffffff",
  disabled: "#ced4da",
};

const API_URL = `${BASE_URL}/transactions`;
const CATEGORIES_URL = `${BASE_URL}/categories`;

// Simple Category Type (ensure it matches your actual type)
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

  // --- State for Loading/Errors ---
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetching Functions ---
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
      // Sort by date descending
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

  // --- Action Handlers ---
  const handleAddTransaction = async () => {
    // Basic Validation
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
      date: new Date().toISOString(), // Send full ISO string
      category: selectedCategory.name, // Adjust if backend needs categoryId
      // categoryId: selectedCategory.id,
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

      // Reset form & fetch
      setDescription("");
      setAmount("");
      setSelectedCategory(null);
      setType("expense");
      await fetchTransactions(); // Use await to ensure list updates before submit state changes
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
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  // --- Render Category Tile ---
   const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.categoryTile,
          isSelected && styles.selectedCategoryTile,
        ]}
        onPress={() => setSelectedCategory(item)}
        disabled={isSubmitting}
      >
        <Text style={[
          styles.categoryText,
          isSelected && styles.selectedCategoryText
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };


  return (
    // Wrap with ScrollView ONLY if the form itself might get long or hidden by keyboard
    // If TransactionList is the main scrollable part, View + flex:1 on list is better
     <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled" // Allows taps on buttons while keyboard is up
     >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        {/* Using a general View container might be unavoidable for padding/background */}
        <View style={styles.container}>
          <Text style={styles.title}>New Transaction</Text>

          {/* Description Input */}
          <TextInput
            style={styles.input}
            placeholder="Description (e.g., Coffee, Paycheck)"
            placeholderTextColor={Colors.placeholderText}
            value={description}
            onChangeText={setDescription}
            editable={!isSubmitting}
          />

          {/* Category Selector */}
          <Text style={styles.label}>Category</Text>
          {loadingCategories ? (
            <ActivityIndicator style={styles.loadingIndicator} />
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal={true} // Keep horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryList} // Add some margin below
              contentContainerStyle={{ paddingVertical: 5 }} // Internal padding
              ListEmptyComponent={<Text style={styles.emptyText}>No categories found</Text>}
            />
          )}

          {/* Amount Input */}
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

          {/* Type Selector */}
           <Text style={styles.label}>Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, type === "income" && styles.selectedTypeIncome]}
              onPress={() => setType("income")}
              disabled={isSubmitting}
            >
              <Text style={[styles.typeText, type === 'income' && styles.selectedTypeText]}>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === "expense" && styles.selectedTypeExpense]}
              onPress={() => setType("expense")}
               disabled={isSubmitting}
            >
              <Text style={[styles.typeText, type === 'expense' && styles.selectedTypeText]}>Expense</Text>
            </TouchableOpacity>
          </View>

          {/* Add Transaction Button (Replaced Button with TouchableOpacity) */}
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

           {/* Display Error */}
           {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Separator or Title for List */}
          <Text style={styles.listTitle}>History</Text>

          {/* Transaction List */}
          {loadingTransactions ? (
            <ActivityIndicator size="large" style={styles.loadingIndicator}/>
          ):(
             // Assuming TransactionList internally handles scrolling (e.g., uses FlatList)
             // If not, this structure might need adjustment.
            <TransactionList
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              // Add a style prop if TransactionList supports it for potential flex:1
              // style={styles.transactionListStyle}
            />
          )}

        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

// --- Simplified Styles ---
const styles = StyleSheet.create({
  scrollView: { // Style for the ScrollView container
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollViewContent: { // Style for the content within ScrollView
    flexGrow: 1, // Allows content to grow and enable scrolling
  },
  container: {
    flex: 1, // Takes available space within ScrollView
    padding: 20,
    backgroundColor: Colors.background, // Apply background here too
  },
  title: {
    fontSize: 24, // Larger title
    fontWeight: "bold",
    color: Colors.primaryText,
    marginBottom: 20, // More spacing
  },
  label: {
      fontSize: 14,
      color: Colors.secondaryText,
      fontWeight: '500',
      marginBottom: 5,
      marginTop: 15, // Space above labels
  },
  input: {
    // Removed explicit border, using bottom border for cleaner look
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 10, // Vertical padding for height
    paddingHorizontal: 5, // Small horizontal padding
    fontSize: 16,
    color: Colors.primaryText,
    marginBottom: 10, // Space below input
    backgroundColor: 'transparent', // Ensure no unwanted background
  },
  categoryList: {
    flexGrow: 0, // Prevent horizontal list from taking too much vertical space
    marginVertical: 5, // Add vertical margin around the list
  },
  categoryTile: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20, // Pill shape
    backgroundColor: Colors.surface, // White background
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedCategoryTile: {
    backgroundColor: Colors.primaryLight, // Light blue background for selected
    borderColor: Colors.primary, // Blue border for selected
  },
  categoryText: {
    fontSize: 14,
    color: Colors.secondaryText,
  },
  selectedCategoryText: {
    color: Colors.primary, // Blue text for selected
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: "row",
    // Removed justifyContent: space-around for closer buttons
    marginVertical: 10,
    gap: 15, // Use gap for spacing if RN version supports it, otherwise use margin
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  selectedTypeIncome: { // Specific selected style for income
    backgroundColor: Colors.income,
    borderColor: Colors.income,
  },
   selectedTypeExpense: { // Specific selected style for expense
    backgroundColor: Colors.expense,
    borderColor: Colors.expense,
  },
  typeText: {
    fontWeight: "500",
    color: Colors.secondaryText,
    fontSize: 14,
  },
  selectedTypeText: {
    color: Colors.white, // White text on colored background
     fontWeight: 'bold',
  },
  addButton: { // Styles for the replacement TouchableOpacity button
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // Space above button
    marginBottom: 15, // Space below button
    minHeight: 45, // Ensure decent button height
  },
  addButtonDisabled: {
      backgroundColor: Colors.disabled,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listTitle: { // Title for the transaction history section
      fontSize: 18,
      fontWeight: '600',
      color: Colors.primaryText,
      marginTop: 25, // Space above list title
      marginBottom: 10,
      borderTopWidth: 1, // Optional separator line
      borderTopColor: Colors.border,
      paddingTop: 15, // Padding above text after line
  },
   loadingIndicator: {
      marginVertical: 20, // Spacing for loading indicators
      alignSelf: 'center',
   },
   emptyText: {
       color: Colors.secondaryText,
       paddingVertical: 10,
   },
   errorText: {
       color: Colors.expense,
       textAlign: 'center',
       marginTop: 10,
       marginBottom: 5,
   }
   // If TransactionList needs explicit styling to take space:
   // transactionListStyle: {
   //   flex: 1,
   // }
});

export default TransactionsScreen;