import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from "react-native";
import { BASE_URL } from "../src/config";
import { Category } from "../types/category"; // Import category type

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTransactionsByCategory = async (categoryId: number) => {
    try {
      const response = await fetch(`${BASE_URL}/transactions?categoryId=${categoryId}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
    fetchTransactionsByCategory(category.id);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Category</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryButton} onPress={() => handleCategoryPress(item)}>
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      {selectedCategory && (
        <View>
          <Text style={styles.subtitle}>Transactions for {selectedCategory.name}</Text>
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.transaction}>
                <Text>{item.description} - ${item.amount.toFixed(2)}</Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  subtitle: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
  categoryButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  categoryText: { color: "white", fontSize: 16 },
  transaction: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
});

export default Categories;