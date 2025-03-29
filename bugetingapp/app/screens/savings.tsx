import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Saving } from "../types/savings";
import SavingsList from "../components/savingsList"; // Import SavingsList
import { BASE_URL } from "../src/config";

const API_URL = `${BASE_URL}/savings`;

const SavingsScreen = () => {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  // Fetch Savings from the backend
  const fetchSavings = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch savings");
      const data: Saving[] = await response.json();
      setSavings(data);
    } catch (error) {
      console.error("Error fetching savings:", error);
    }
  };

  // Add a new saving goal
  const handleAddSaving = async () => {
    if (!name || !targetAmount) return;

    const newSaving = {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      dateCreated: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSaving),
      });

      if (response.ok) {
        setName("");
        setTargetAmount("");
        fetchSavings(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding saving:", error);
    }
  };

  // Delete a saving goal
  const handleDeleteSaving = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) fetchSavings();
    } catch (error) {
      console.error("Error deleting saving:", error);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Savings Goals</Text>

      {/* Form to Add Savings */}
      <TextInput 
        style={styles.input} 
        placeholder="Saving Name" 
        value={name} 
        onChangeText={setName} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Target Amount" 
        value={targetAmount} 
        onChangeText={setTargetAmount} 
        keyboardType="numeric" 
      />
      <Button title="Add Saving" onPress={handleAddSaving} />

      {/* Savings List */}
      <SavingsList savings={savings} onDeleteSaving={handleDeleteSaving} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 8, marginVertical: 5 },
});

export default SavingsScreen;