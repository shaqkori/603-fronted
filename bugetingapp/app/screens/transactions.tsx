import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Transaction } from "../types/transactions";
import TransactionList from "../components/transactionList"; // Updated import
import { BASE_URL } from "../src/config";

const API_URL = `${BASE_URL}/transactions`;
const CATEGORIES_URL = `${BASE_URL}/categories`;

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null);
  const [type, setType] = useState<"income" | "expense">("expense"); // Default to expense
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(CATEGORIES_URL);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

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

  const handleAddTransaction = async () => {
    if (!description || !amount || !selectedCategory || !type) return;

    const newTransaction = {
      description,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString().split("T")[0],
      category: selectedCategory.name,
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
        setSelectedCategory(null);
        setType("expense"); // Reset to default
        fetchTransactions();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Description" 
        value={description} 
        onChangeText={setDescription} 
      />
      
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

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, type === "income" && styles.selectedType]}
          onPress={() => setType("income")}
        >
          <Text style={styles.typeText}>Income</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === "expense" && styles.selectedType]}
          onPress={() => setType("expense")}
        >
          <Text style={styles.typeText}>Expense</Text>
        </TouchableOpacity>
      </View>

      <Button title="Add Transaction" onPress={handleAddTransaction} />

      {/* Pass transactions to TransactionList */}
      <TransactionList transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />
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
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  typeButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  selectedType: {
    backgroundColor: "#4caf50",
  },
  typeText: {
    fontWeight: "bold",
  },
});

export default TransactionsScreen;