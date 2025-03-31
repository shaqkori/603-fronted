import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  // Assuming SavingsList might be a FlatList or similar, adjust if needed
} from "react-native";
import { Saving } from "../types/savings"; // Make sure this path and type are correct
import SavingsList from "../components/savingsList"; // Import your styled SavingsList
import { BASE_URL } from "../src/config";

// Define or import the professional color palette
const Colors = {
  background: "#f8f9fa",
  surface: "#ffffff",
  primaryText: "#212529",
  secondaryText: "#6c757d",
  placeholderText: "#adb5bd",
  primary: "#007bff", // Blue for primary actions
  success: "#28a745", // Green for success/completion often used in savings
  expense: "#dc3545", // Red for errors
  border: "#dee2e6",
  white: "#ffffff",
  disabled: "#ced4da",
};

const API_URL = `${BASE_URL}/savings`;

const SavingsScreen = () => {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  // Loading and Error States
  const [loadingSavings, setLoadingSavings] = useState<boolean>(true);
  const [isAddingSaving, setIsAddingSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching ---
  const fetchSavings = async () => {
    setLoadingSavings(true);
    setError(null); // Clear previous errors on refetch
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Saving[] = await response.json();
      // Optional: Sort savings goals (e.g., by date created)
      data.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
      setSavings(data);
    } catch (err) {
      console.error("Error fetching savings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch savings goals");
    } finally {
      setLoadingSavings(false);
    }
  };

  // --- Actions ---
  const handleAddSaving = async () => {
    // Validation
    const trimmedName = name.trim();
    const numericTargetAmount = parseFloat(targetAmount);

    if (!trimmedName) {
      Alert.alert("Validation Error", "Please enter a name for the saving goal.");
      return;
    }
    if (isNaN(numericTargetAmount) || numericTargetAmount <= 0) {
      Alert.alert("Validation Error", "Please enter a valid positive target amount.");
      return;
    }

    Keyboard.dismiss();
    setIsAddingSaving(true);
    setError(null);

    const newSaving = {
      name: trimmedName,
      targetAmount: numericTargetAmount,
      currentAmount: 0, // Assuming new goals start at 0
      dateCreated: new Date().toISOString(), // Send full ISO string
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSaving),
      });

       if (!response.ok) {
         const errorData = await response.text();
         throw new Error(`Failed to add saving goal: ${response.status} ${errorData}`);
      }

      // Reset form and refresh list on success
      setName("");
      setTargetAmount("");
      await fetchSavings(); // Refresh the list
    } catch (err) {
      console.error("Error adding saving:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while adding the goal.";
      setError(errorMessage);
      Alert.alert("Error", `Could not add saving goal: ${errorMessage}`);
    } finally {
      setIsAddingSaving(false);
    }
  };

  const handleDeleteSaving = async (id: number) => {
     // Optional Confirmation
     Alert.alert("Confirm Delete", "Are you sure you want to delete this savings goal?", [
       { text: "Cancel", style: "cancel" },
       { text: "Delete", style: "destructive", onPress: async () => {
           // Indicate loading state if needed
           setError(null);
           try {
             const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
             if (!response.ok) {
               throw new Error(`Failed to delete saving goal: ${response.status}`);
             }
             await fetchSavings(); // Refresh list
           } catch (err) {
             console.error("Error deleting saving:", err);
             const errorMessage = err instanceof Error ? err.message : "Failed to delete saving goal.";
             setError(errorMessage);
             Alert.alert("Error", `Could not delete saving goal: ${errorMessage}`);
           } finally {
              // Clear loading indicator if used
           }
         }}
     ]);
  };

  // --- Effects ---
  useEffect(() => {
    fetchSavings();
  }, []);

  return (
    
      <View style={styles.container}>

        {/* --- Add Saving Form --- */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Add New Saving Goal</Text>

          {/* Goal Name Input */}
          <Text style={styles.label}>Goal Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., New Car, Vacation Fund"
            placeholderTextColor={Colors.placeholderText}
            value={name}
            onChangeText={setName}
            editable={!isAddingSaving}
          />

          {/* Target Amount Input */}
          <Text style={styles.label}>Target Amount (£)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={Colors.placeholderText}
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="decimal-pad"
            editable={!isAddingSaving}
          />

          {/* Add Button */}
          <TouchableOpacity
            style={[styles.addButton, isAddingSaving && styles.addButtonDisabled]}
            onPress={handleAddSaving}
            disabled={isAddingSaving}
          >
            {isAddingSaving ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.addButtonText}>Add Goal</Text>
            )}
          </TouchableOpacity>

           {/* Display Add/Delete errors here */}
           {error && !loadingSavings && <Text style={styles.errorTextForm}>{error}</Text>}
        </View>

        {/* --- Savings List --- */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          {loadingSavings ? (
            <ActivityIndicator size="large" color={Colors.primary} style={styles.listLoadingIndicator} />
          ) : error && savings.length === 0 ? ( // Show fetch error prominently if list is empty
             <Text style={styles.errorTextList}>{error}</Text>
          ) : (
            <SavingsList
              savings={savings}
              onDeleteSaving={handleDeleteSaving}
              // Add any other props your SavingsList needs, like onEdit, onAddContribution etc.
            />
            // Add ListEmptyComponent message directly here if SavingsList doesn't handle it
             // {savings.length === 0 && !loadingSavings && !error && (
             //   <Text style={styles.emptyListText}>You haven't added any savings goals yet.</Text>
             // )}
          )}
        </View>

      </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // --- Form Styles ---
  formContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20, // More padding for form
    paddingVertical: 20,
    margin: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primaryText,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.secondaryText,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.primaryText,
    marginBottom: 5,
  },
  // --- Add Button Styles ---
  addButton: {
    backgroundColor: Colors.primary, // Use primary color for add button
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20, // More space above button
    marginBottom: 5,
  },
  addButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  // --- List Styles ---
  listContainer: {
    flex: 1, // Make list take remaining space
    paddingHorizontal: 15,
    marginTop: 5,
    marginBottom: 10,
  },
  listLoadingIndicator: {
    marginTop: 30, // Give space from title
    alignSelf: 'center',
  },
  emptyListText: { // Style for empty list message if SavingsList doesn't provide one
      textAlign: 'center',
      marginTop: 20,
      fontSize: 15,
      color: Colors.secondaryText,
  },
  // --- Error Text Styles ---
   errorTextForm: { // Error text specific to the form area
    fontSize: 14,
    color: Colors.expense,
    marginTop: 10,
    textAlign: 'center',
  },
   errorTextList: { // Error text specific to the list area (e.g., fetch error)
    fontSize: 14,
    color: Colors.expense,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 10, // Keep it constrained
  },
});

export default SavingsScreen;