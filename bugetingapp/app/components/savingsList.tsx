import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Saving } from "../types/savings"; // Adjust path if needed
import Icon from 'react-native-vector-icons/Ionicons'; // Using Ionicons again

// Adjust path to your Colors file

interface SavingsListProps {
  savings: Saving[];
  onDeleteSaving: (id: number) => void;
  onUpdateSavingAmount: (savingId: number, amountToAdd: number) => Promise<void>;
}

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
    progressBarBackground: "#e9ecef", // Light background for the progress bar
    success: "#28a745", // Green color for success
  };

const SavingsList: React.FC<SavingsListProps> = ({ savings, onDeleteSaving }) => {

  const renderSavingItem = ({ item }: { item: Saving }) => {
    // Calculate progress safely
    const progress = (item.targetAmount ?? 0) > 0
      ? Math.min(1, (item.currentAmount ?? 0) / item.targetAmount)
      : 0;

      const formattedCurrent = (Number(item.currentAmount) || 0).toFixed(2);
      const formattedTarget = (Number(item.targetAmount) || 0).toFixed(2);

    // Ensure item.id exists before calling onDeleteSaving
    const handleDelete = () => {
        if (item.id != null) {
            onDeleteSaving(item.id);
        } else {
            console.warn("Attempted to delete saving goal with missing ID:", item);
        }
    };

    return (
      // Container for each item, styled as a card
      <View style={styles.savingItemContainer}>
        {/* Container for the text details and progress bar */}
        <View style={styles.savingDetails}>
            <Text style={styles.savingName}>{item.name}</Text>
            <Text style={styles.savingAmounts}>
                £{formattedCurrent} / £{formattedTarget}
                 {/* Optional: Indicate goal reached */}
                 {progress >= 1 && <Text style={styles.goalReached}> (Goal Reached!)</Text>}
            </Text>
            {/* Progress Bar */}
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarForeground, { width: `${progress * 100}%` }]} />
            </View>
        </View>
        {/* Delete button using TouchableOpacity and Icon */}
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Icon name="trash-outline" size={22} color={Colors.expense} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    // Removed the outer View, FlatList is sufficient
    <FlatList
      data={savings}
      renderItem={renderSavingItem}
      keyExtractor={(item, index) => item.id?.toString() ?? `saving-${index}`} // Safe key extraction
      contentContainerStyle={styles.listContentContainer} // Padding for scrollable content
      ListEmptyComponent={ // Handle empty list case
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No savings goals found.</Text>
        </View>
      }
      // ItemSeparatorComponent={() => <View style={styles.separator} />} // Optional: If lines are preferred over margin
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingBottom: 20, // Padding at the end of the list
    paddingHorizontal: 5, // Consistent with parent screen padding if needed
  },
  savingItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Pushes details and button apart
    alignItems: "center", // Vertically aligns content
    backgroundColor: Colors.surface, // White card background
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10, // Rounded corners
    marginBottom: 12, // Space between cards
    marginHorizontal: 10, // Horizontal margin for centering effect
    // Optional Shadow/Elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  savingDetails: {
    flex: 1, // Allows details to take up available space
    marginRight: 15, // Space between details and delete button
  },
  savingName: {
    fontSize: 17,
    fontWeight: "600", // Semi-bold
    color: Colors.primaryText,
    marginBottom: 5, // Space below name
  },
  savingAmounts: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 8, // Space below amounts text
  },
  goalReached: {
    color: Colors.success, // Use existing green color for success
    fontWeight: 'bold',
    fontSize: 13, // Slightly smaller
  },
  progressBarBackground: {
    height: 8, // Progress bar height
    backgroundColor: Colors.progressBarBackground, // Light background for the bar
    borderRadius: 4, // Rounded edges
    overflow: 'hidden', // Clip the foreground bar
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: Colors.income, // Green color for progress
    borderRadius: 4,
  },
  deleteButton: {
    padding: 8, // Makes the touch target larger than just the icon
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: { // Styles for when the list is empty
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
      marginTop: 30, // Give some space from top
  },
  emptyText: {
      fontSize: 16,
      color: Colors.secondaryText,
      textAlign: 'center',
  },
  // separator: { // Optional separator style
  //   height: 1,
  //   backgroundColor: Colors.border,
  //   marginVertical: 0, // No extra vertical margin if using lines
  //   marginHorizontal: 15, // Indent separator slightly
  // },
});

export default SavingsList;