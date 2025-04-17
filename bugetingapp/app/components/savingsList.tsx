import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { Saving } from "../types/savings";
import Icon from "react-native-vector-icons/Ionicons";


// Define the interface for the props
// that the SavingsList component will receive
// This includes the savings data, a function to delete a saving, and a function to update the saving amount
interface SavingsListProps {
  savings: Saving[];
  onDeleteSaving: (id: number) => void;
  onUpdateSavingAmount: (savingId: number, newAmount: number) => Promise<void>;
}

// Define the Colors object for consistent styling

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
  progressBarBackground: "#e9ecef",
  success: "#28a745",
};

// Define the SavingsList component
// This component is responsible for displaying a list of savings goals
// and allowing the user to update or delete them
// The component uses React Native's FlatList to render the list of savings
const SavingsList: React.FC<SavingsListProps> = ({ savings, onDeleteSaving, onUpdateSavingAmount }) => {
  const [editAmountId, setEditAmountId] = React.useState<number | null>(null); // This state holds the ID of the saving goal being edited
  // This state holds the text input for the new amount
  // It is used to update the current amount of the saving goal
  const [editAmountText, setEditAmountText] = React.useState<string>(""); 
  const handleUpdateAmount = async (id: number, amountText: string) => {
    const newAmount = parseFloat(amountText);
    if (isNaN(newAmount) || newAmount < 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive number.");
      return;
    }

    try {
      await onUpdateSavingAmount(id, newAmount);
      setEditAmountId(null);
      setEditAmountText("");
    } catch (error) {
      console.error("Error updating saving amount:", error);
      Alert.alert("Error", "Could not update the saving amount.");
    }
  };

  const renderSavingItem = ({ item }: { item: Saving }) => {
    const progress = (item.targetAmount ?? 0) > 0
      ? Math.min(1, (item.currentAmount ?? 0) / item.targetAmount)
      : 0;

    const formattedCurrent = (Number(item.currentAmount) || 0).toFixed(2);
    const formattedTarget = (Number(item.targetAmount) || 0).toFixed(2);

    const handleDelete = () => {
      if (item.id != null) {
        onDeleteSaving(item.id);
      } else {
        console.warn("Attempted to delete saving goal with missing ID:", item);
      }
    };

    return (
      <View style={styles.savingItemContainer}>
        <View style={styles.savingDetails}>
          <Text style={styles.savingName}>{item.name}</Text>
          <Text style={styles.savingAmounts}>
            £{formattedCurrent} / £{formattedTarget}
            {progress >= 1 && <Text style={styles.goalReached}> (Goal Reached!)</Text>}
          </Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarForeground, { width: `${progress * 100}%` }]} />
          </View>

          {editAmountId === item.id ? (
            <View style={styles.editAmountContainer}>
              <TextInput
                style={styles.editAmountInput}
                keyboardType="decimal-pad"
                value={editAmountText}
                onChangeText={setEditAmountText}
                placeholder="New Amount"
              />
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => handleUpdateAmount(item.id!, editAmountText)}
              >
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addAmountButton}
              onPress={() => {
                setEditAmountId(item.id!);
                setEditAmountText(item.currentAmount.toString());
              }}
            >
              <Text style={styles.addAmountButtonText}>Add funds</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Icon name="trash-outline" size={22} color={Colors.expense} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={savings}
      renderItem={renderSavingItem}
      keyExtractor={(item, index) => item.id?.toString() ?? `saving-${index}`}
      contentContainerStyle={styles.listContentContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No savings goals found.</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingBottom: 20,
    paddingHorizontal: 5,
  },
  savingItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  savingDetails: {
    flex: 1,
    marginRight: 15,
  },
  savingName: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.primaryText,
    marginBottom: 5,
  },
  savingAmounts: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 8,
  },
  goalReached: {
    color: Colors.success,
    fontWeight: "bold",
    fontSize: 13,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.progressBarBackground,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarForeground: {
    height: "100%",
    backgroundColor: Colors.income,
    borderRadius: 4,
  },
  deleteButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    marginTop: 30,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.secondaryText,
    textAlign: "center",
  },
  editAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  editAmountInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: Colors.primaryText,
    marginRight: 8,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  updateButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  addAmountButton: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  addAmountButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default SavingsList;