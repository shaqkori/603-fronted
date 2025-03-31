import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator, // Import ActivityIndicator
  Dimensions, // If needed for specific sizing
} from "react-native";
import { BASE_URL } from "../src/config";
import { Category } from "../types/category"; // Assuming Category has { id: number; name: string; }

// Assuming BASE_URL points to something like 'http://<your-ip>:<port>/api'
// And your endpoints are /categories and /transactions

// Define or import the professional color palette
const Colors = {
  background: "#f8f9fa", // Very light grey background
  surface: "#ffffff", // White for card backgrounds
  primaryText: "#212529", // Dark grey/black for main text
  secondaryText: "#6c757d", // Medium grey for subtitles/labels
  primary: "#007bff", // A standard primary blue for selection/actions
  primaryLight: "#e7f3ff", // Light blue for subtle backgrounds or borders
  income: "#28a745", // Green for income (if needed)
  expense: "#dc3545", // Red for expenses (used for error text)
  border: "#dee2e6", // Light grey for borders/dividers
  white: "#ffffff",
};

// Interface for Transaction specific to this screen
interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string; // Keep date if needed for display later
  category: string; // Keep category name if available from API
  categoryId: number; // Ensure you have categoryId if fetching by it
  type: "income" | "expense"; // Add type if needed for styling amount
}

const CategoriesScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(
    false
  );
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [errorTransactions, setErrorTransactions] = useState<string | null>(
    null
  );

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setErrorCategories(null);
    try {
      const response = await fetch(`${BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setErrorCategories(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchTransactionsByCategory = async (categoryId: number) => {
    // Reset previous transactions and error
    setTransactions([]);
    setErrorTransactions(null);
    setLoadingTransactions(true); // Set loading true when fetching starts

    try {
      // Construct the URL carefully. Ensure your API supports filtering by categoryId like this.
      // If your API uses category name or a different param, adjust accordingly.
      const response = await fetch(
        `${BASE_URL}/transactions?categoryId=${categoryId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setErrorTransactions(
        err instanceof Error ? err.message : "Failed to fetch transactions"
      );
    } finally {
      setLoadingTransactions(false); // Set loading false when fetching finishes
    }
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category); // Set selected category immediately for UI feedback
    fetchTransactionsByCategory(category.id); // Fetch transactions for the selected category
  };

  useEffect(() => {
    fetchCategories(); // Fetch categories when the component mounts
  }, []);

  // --- Render Helper Functions ---

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          isSelected && styles.selectedCategoryButton, // Apply selected style
        ]}
        onPress={() => handleCategoryPress(item)}
        disabled={loadingTransactions && isSelected} // Disable briefly if loading its transactions
      >
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.selectedCategoryText, // Apply selected text style
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        {/* Optional: Display date */}
        {/* <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text> */}
      </View>
      <Text
        style={[
          styles.transactionAmount,
          // Optional: Style amount based on type if available
          // item.type === 'income' ? styles.incomeText : styles.expenseText,
        ]}
      >
        £{item.amount.toFixed(2)}
      </Text>
    </View>
  );

  // --- Main Render Logic ---

  if (loadingCategories) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Categories...</Text>
      </View>
    );
  }

  if (errorCategories) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {errorCategories}</Text>
        {/* Optionally add a retry button */}
        <TouchableOpacity onPress={fetchCategories} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>

      {/* Categories List */}
      <View style={styles.listSection}>
        {/* <Text style={styles.sectionTitle}>Select a Category</Text> */}
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal={false} // Keep it vertical unless design calls for horizontal
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyListText}>No categories found.</Text>}
        />
      </View>

      {/* Transactions for Selected Category */}
      {selectedCategory && (
        <View style={[styles.listSection, styles.transactionListContainer]}>
          <Text style={styles.sectionTitle}>
            Transactions for {selectedCategory.name}
          </Text>

          {loadingTransactions ? (
            <ActivityIndicator style={styles.listLoadingIndicator} size="small" color={Colors.primary} />
          ) : errorTransactions ? (
             <View style={styles.centeredError}>
                <Text style={styles.errorTextSmall}>Error: {errorTransactions}</Text>
                <TouchableOpacity onPress={() => fetchTransactionsByCategory(selectedCategory.id)} style={styles.retryButtonSmall}>
                    <Text style={styles.retryButtonTextSmall}>Retry</Text>
                </TouchableOpacity>
             </View>
          ) : (
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.emptyListText}>No transactions found for this category.</Text>}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 15, // Consistent padding
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },
   centeredError: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.secondaryText,
  },
  errorText: {
    fontSize: 16,
    color: Colors.expense,
    textAlign: 'center',
    marginBottom: 15,
  },
  errorTextSmall: {
    fontSize: 14,
    color: Colors.expense,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
   retryButtonSmall: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  retryButtonTextSmall: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 26, // Slightly adjusted size
    fontWeight: "bold",
    color: Colors.primaryText,
    marginBottom: 20, // Space below title
  },
  listSection: {
    marginBottom: 20, // Space between sections
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primaryText,
    marginBottom: 12, // Space below section title
    paddingHorizontal: 5, // Align with list item padding
  },
  categoryButton: {
    backgroundColor: Colors.surface, // Use surface color
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 4, // Reduced vertical margin
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border, // Add a subtle border
    flexDirection: "row", // Prepare for potential icons later
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primaryLight, // Use light primary for selected background
    borderColor: Colors.primary, // Use primary color for selected border
  },
  categoryText: {
    color: Colors.primaryText, // Use primary text color
    fontSize: 16,
    fontWeight: "500", // Medium weight
  },
  selectedCategoryText: {
    color: Colors.primary, // Use primary color for selected text
    fontWeight: "bold", // Make selected text bold
  },
  // Transaction List specific container styling (optional card look)
  transactionListContainer: {
    flex: 1, // Allow this section to take remaining space if needed
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 15,
    // Add subtle shadow for depth (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    // Add elevation for depth (Android)
    elevation: 2,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 5, // Internal padding within the card
    borderBottomWidth: 1,
    borderBottomColor: Colors.border, // Use border color for separator
  },
  transactionDetails: {
    flex: 1, // Allow description to take available space
    marginRight: 10,
  },
  transactionDescription: {
    fontSize: 15,
    color: Colors.primaryText,
    marginBottom: 2, // Small space if date is added below
  },
  transactionDate: { // Optional date style
    fontSize: 12,
    color: Colors.secondaryText,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primaryText, // Default color, override if using type
  },
  incomeText: { // Optional: if transaction type is available
    color: Colors.income,
  },
  expenseText: { // Optional: if transaction type is available
    color: Colors.expense,
  },
  emptyListText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 15,
      color: Colors.secondaryText,
  },
  listLoadingIndicator: {
      marginTop: 20,
  }
});

export default CategoriesScreen; // Ensure correct export name