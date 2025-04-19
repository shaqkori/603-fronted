import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator, 
  Dimensions, 
} from "react-native";
import { BASE_URL } from "../src/config";
import { Category } from "../types/category"; 



// Defines  color palette
const Colors = {
  background: "#FAFBE5", // Very light grey background
  surface: "#DDEB8E", // White for card backgrounds
  primaryText: "#212529", // Dark grey/black for main text
  secondaryText: "#6c757d", // Medium grey for subtitles/labels
  primary: "#2E931A", // A standard primary blue for selection/actions
  primaryLight: "#e7f3ff", // Light blue for subtle backgrounds or borders
  income: "#28a745", // Green for income (if needed)
  expense: "#dc3545", // Red for expenses (used for error text)
  border: "#191A04", // Light grey for borders/dividers
  white: "#ffffff",
};

// Interface for Transaction specific to this screen
interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string; 
  category: string; 
  categoryId: number; 
  type: "income" | "expense"; 
}


const CategoriesScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]); // Holds the list of categories fetched from the backend
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Holds the transactions filtered by the selected category
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(   // Tracks which category the user has selected
    null
  );
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true); // Manages loading state when categories are being fetched
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(
    false
  );
  const [errorCategories, setErrorCategories] = useState<string | null>(null);  // Stores any error message that occurs while fetching categories
  const [errorTransactions, setErrorTransactions] = useState<string | null>(
    null
  );

  const fetchCategories = async () => { 
    setLoadingCategories(true);
    setErrorCategories(null);
    try {
      const response = await fetch(`${BASE_URL}/categories`); // Fetch categories from the backend
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
   
    setTransactions([]);
    setErrorTransactions(null);
    setLoadingTransactions(true); 

    try {

      const response = await fetch(
        `${BASE_URL}/transactions?categoryId=${categoryId}` // Fetch transactions for the selected category
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

  const handleCategoryPress = (category: Category) => { //function to handle category selection
    setSelectedCategory(category); // Set selected category immediately for UI feedback
    fetchTransactionsByCategory(category.id); // Fetch transactions for the selected category
  };

  useEffect(() => { // useEffect to fetch categories when the component mounts
    fetchCategories(); 
  }, []);

  // --- Render Helper Functions ---

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          isSelected && styles.selectedCategoryButton, 
        ]}
        onPress={() => handleCategoryPress(item)}
        disabled={loadingTransactions && isSelected} 
      >
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.selectedCategoryText,
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
 
      </View>
      <Text
        style={[
          styles.transactionAmount,

        ]}
      >
        £{(Number(item.amount) || 0).toFixed(2)}
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
      
        <TouchableOpacity onPress={fetchCategories} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>

   
      <View style={styles.listSection}>
    
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal={false} 
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyListText}>No categories found.</Text>}
        />
      </View>

     
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
    paddingHorizontal: 15, 
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
    fontSize: 26, 
    fontWeight: "bold",
    color: Colors.primaryText,
    marginBottom: 20,
  },
  listSection: {
    marginBottom: 20, 
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primaryText,
    marginBottom: 12, 
    paddingHorizontal: 5,
  },
  categoryButton: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border, 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primaryLight, 
    borderColor: Colors.primary, 
  },
  categoryText: {
    color: Colors.primaryText,
    fontSize: 16,
    fontWeight: "500", 
  },
  selectedCategoryText: {
    color: Colors.primary, 
    fontWeight: "bold", 
  },
  
  transactionListContainer: {
    flex: 1, 
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 15,
    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
   
    elevation: 2,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 5, 
    borderBottomWidth: 1,
    borderBottomColor: Colors.border, 
  },
  transactionDetails: {
    flex: 1, 
    marginRight: 10,
  },
  transactionDescription: {
    fontSize: 15,
    color: Colors.primaryText,
    marginBottom: 2, 
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primaryText, 
  },
  incomeText: { 
    color: Colors.income,
  },
  expenseText: { 
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

export default CategoriesScreen; 