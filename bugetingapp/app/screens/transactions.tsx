import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Transaction } from "../types/transactions"; 

import { BASE_URL } from "../src/config"; // Importing base URL from the config file

const API_URL = `${BASE_URL}/transactions`; // Setting the URL for the transactions
const CATEGORIES_URL = `${BASE_URL}/categories`; // Setting the URL for the categories

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null); // To store selected category
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]); // To store categories fetched from the backend

  // Fetch Categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await fetch(CATEGORIES_URL);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data); // Set the categories to the state
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch Transactions from the backend
  const fetchTransactions = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Add a new transaction
  const handleAddTransaction = async () => {
    if (!description || !amount || !selectedCategory) return;

    const newTransaction = {
      description,
      amount: parseFloat(amount),
      date: new Date().toISOString().split("T")[0], // Get the current date
      category: selectedCategory.name, // Use the selected category name
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction),
      });

      if (response.ok) {
        setDescription("");
        setAmount("");
        setSelectedCategory(null); // Clear category selection
        fetchTransactions(); // Refresh the transactions list
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  // Delete a transaction
  const handleDeleteTransaction = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) fetchTransactions(); // Refresh the transactions list
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  useEffect(() => {
    fetchCategories(); // Fetch categories when the component mounts
    fetchTransactions(); // Fetch transactions when the component mounts
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      {/* Form to Add Transactions */}
      <TextInput 
        style={styles.input} 
        placeholder="Description" 
        value={description} 
        onChangeText={setDescription} 
      />
      
      {/* Category Selection */}
      <Text style={styles.categoryTitle}>Select Category</Text>
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryTile,
              selectedCategory?.id === item.id && styles.selectedCategoryTile,
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <TextInput 
        style={styles.input} 
        placeholder="Amount" 
        value={amount} 
        onChangeText={setAmount} 
        keyboardType="numeric" 
      />
      <Button title="Add Transaction" onPress={handleAddTransaction} />

      {/* Transaction List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <Text>{item.description} - £{item.amount.toFixed(2)} ({item.category})</Text>
            <Button title="Delete" onPress={() => handleDeleteTransaction(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 8, marginVertical: 5 },
  categoryTitle: { fontWeight: "bold", marginVertical: 10 },
  categoryTile: {
    padding: 10,
    marginRight: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
  selectedCategoryTile: {
    backgroundColor: "#4caf50",
  },
  categoryText: {
    color: "#fff",
  },
  transaction: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderBottomWidth: 1 },
});

export default TransactionsScreen;