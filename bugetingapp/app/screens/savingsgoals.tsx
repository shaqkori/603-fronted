import React, { useState, useEffect } from "react";
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
  ScrollView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { BASE_URL } from "../src/config"; // Adjust path as needed

// --- Define expected navigation parameter types ---
// Replace 'YourStackParamList' with the actual name of your Stack Navigator's param list type
type AddContributionRouteParams = {
    savingId: number;
    name: string;
    currentAmount: number;
    targetAmount: number;
};

// Use RouteProp with your Stack Param List and the screen name
type YourStackParamList = {
  AddContribution: {
    savingId: number;
    name: string;
    currentAmount: number;
    targetAmount: number;
  };
  // Add other screens and their parameters here if needed
};

type AddContributionScreenRouteProp = RouteProp<YourStackParamList, 'AddContribution'>;


// --- Color Palette (Import or Define) ---
const Colors = {
  background: "#f8f9fa",
  surface: "#ffffff",
  primaryText: "#212529",
  secondaryText: "#6c757d",
  placeholderText: "#adb5bd",
  primary: "#007bff",
  success: "#28a745",
  expense: "#dc3545",
  border: "#dee2e6",
  white: "#ffffff",
  disabled: "#ced4da",
  progressBarBackground: "#e9ecef",
};

const AddContributionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<AddContributionScreenRouteProp>(); // Use the typed route

  // --- State ---
  const [goalDetails, setGoalDetails] = useState<AddContributionRouteParams | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- API URL ---
  const API_URL = `${BASE_URL}/savings`; // Base URL for savings

  // --- Effect to get details from navigation params ---
  useEffect(() => {
    if (route.params) {
        // Basic validation of received params
        if (typeof route.params.savingId !== 'number' || !route.params.name) {
             console.error("Invalid navigation parameters received:", route.params);
             Alert.alert("Error", "Could not load goal details. Please go back and try again.");
             navigation.goBack(); // Go back if params are bad
             return;
        }
      setGoalDetails({
        savingId: route.params.savingId,
        name: route.params.name,
        // Ensure amounts are treated as numbers, default to 0 if missing/invalid
        currentAmount: Number(route.params.currentAmount) || 0,
        targetAmount: Number(route.params.targetAmount) || 0,
      });
    } else {
        // Handle case where params are missing (shouldn't happen with proper navigation)
        Alert.alert("Error", "No goal details provided. Please go back and select a goal.");
        navigation.goBack();
    }
  }, [route.params, navigation]); // Depend on params

  // --- Handlers ---
  const handleConfirmContribution = async () => {
    if (!goalDetails) return; // Should not happen if useEffect ran correctly

    Keyboard.dismiss();
    setError(null);

    // Validation
    const amountToAdd = parseFloat(contributionAmount);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive amount to add.");
      return;
    }

    setIsSubmitting(true);

    // Calculate the new total current amount
    const newCurrentAmount = goalDetails.currentAmount + amountToAdd;

    try {
        // --- IMPORTANT: Backend API Call ---
        // Your backend needs an endpoint to update the saving goal.
        // Common methods: PATCH or PUT.
        // PATCH is often preferred for partial updates.
        // Assuming a PATCH request to /savings/:id updating `currentAmount`.
        // **Adjust the URL and request body based on your actual API.**

      const response = await fetch(`${API_URL}/${goalDetails.savingId}`, {
        method: "PATCH", // Or PUT, depending on your API design
        headers: { "Content-Type": "application/json" },
        // Body should contain only the fields to update for PATCH
        body: JSON.stringify({ currentAmount: newCurrentAmount }),
        // If using PUT, you might need to send the whole updated object:
        // body: JSON.stringify({ ...goalDetails, currentAmount: newCurrentAmount }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update savings: ${response.status} ${errorText}`);
      }

      // Success
      Alert.alert("Success", `£${amountToAdd.toFixed(2)} added to "${goalDetails.name}"!`);
      // Navigate back. The previous screen (SavingsScreen) should ideally
      // refresh its data when it gets focus again (e.g., using useFocusEffect)
      // to show the updated amount.
      navigation.goBack();

    } catch (err) {
      console.error("Error updating saving:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(message);
      Alert.alert("Error", `Could not add contribution: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---

  // Display loading or placeholder if details haven't loaded yet
  if (!goalDetails) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Calculate progress for display
  const progress = goalDetails.targetAmount > 0
    ? Math.min(1, goalDetails.currentAmount / goalDetails.targetAmount)
    : 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.container}>
                {/* Display Goal Info */}
                <View style={styles.goalInfoCard}>
                    <Text style={styles.goalName}>{goalDetails.name}</Text>
                    <Text style={styles.goalStatus}>
                        Current: £{goalDetails.currentAmount.toFixed(2)} / Target: £{goalDetails.targetAmount.toFixed(2)}
                    </Text>
                    {/* Optional Progress Bar */}
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarForeground, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{(progress * 100).toFixed(0)}% Complete</Text>
                </View>

                {/* Input Section */}
                <Text style={styles.label}>Amount to Add (£)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={Colors.placeholderText}
                    value={contributionAmount}
                    onChangeText={setContributionAmount}
                    keyboardType="decimal-pad"
                    editable={!isSubmitting}
                />

                {/* Error Display */}
                {error && <Text style={styles.errorText}>{error}</Text>}

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleConfirmContribution}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                    <Text style={styles.submitButtonText}>Confirm Contribution</Text>
                    )}
                </TouchableOpacity>
            </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  centered: { // For initial loading state
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  goalInfoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  goalName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primaryText,
    marginBottom: 8,
    textAlign: 'center',
  },
  goalStatus: {
    fontSize: 16,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: 15,
  },
   progressBarBackground: {
    height: 10,
    backgroundColor: Colors.progressBarBackground,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 5,
  },
  progressText: {
      fontSize: 13,
      color: Colors.secondaryText,
      textAlign: 'right',
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.secondaryText,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: Colors.white, // Use white or light background for input
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 18, // Larger font for amount
    color: Colors.primaryText,
    marginBottom: 20,
    textAlign: 'center', // Center amount input
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: Colors.expense,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
  },
});

export default AddContributionScreen;