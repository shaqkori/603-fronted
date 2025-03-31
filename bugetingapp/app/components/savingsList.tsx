import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Saving } from "../types/savings"; // Ensure this type includes id, name, currentAmount, targetAmount
import Icon from 'react-native-vector-icons/Ionicons'; // Example using Ionicons, change if needed

// Define or import the professional color palette
const Colors = {
  background: "#f8f9fa",
  surface: "#ffffff",
  primaryText: "#212529",
  secondaryText: "#6c757d",
  primary: "#007bff",
  success: "#28a745", // For progress
  expense: "#dc3545", // For delete action
  border: "#dee2e6",
  white: "#ffffff",
  progressBarBackground: "#e9ecef", // Light grey for progress bar background
};

interface SavingsListProps {
  savings: Saving[];
  onDeleteSaving: (id: number) => void;
  // Add other potential props like onSelectSaving, onAddContribution etc. if needed
}

const SavingsList: React.FC<SavingsListProps> = ({ savings, onDeleteSaving }) => {

  const renderSavingItem = ({ item }: { item: Saving }) => {
    // Calculate progress safely
    const progress = (item.targetAmount ?? 0) > 0
      ? Math.min(1, (item.currentAmount ?? 0) / item.targetAmount) // Clamp between 0 and 1
      : 0; // Avoid division by zero, assume 0 progress if target is 0

    const formattedCurrent = (item.currentAmount ?? 0).toFixed(2);
    const formattedTarget = (item.targetAmount ?? 0).toFixed(2);

    // Ensure item.id exists before calling onDeleteSaving
    const handleDelete = () => {
        if (item.id != null) { // Check for null or undefined
            onDeleteSaving(item.id);
        } else {
            console.warn("Attempted to delete saving goal with missing ID:", item);
            // Optionally show an alert to the user
            // Alert.alert("Error", "Cannot delete this item as it's missing an identifier.");
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
            {/* Progress Bar */}
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarForeground, { width: `${progress * 100}%` }]} />
            </View>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Icon name="trash-outline" size={22} color={Colors.expense} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    // FlatList handles the scroll view itself
    <FlatList
      data={savings}
      renderItem={renderSavingItem}
      // Use index as fallback key ONLY if IDs can be missing, warn if so
      keyExtractor={(item, index) => item.id?.toString() ?? `saving-${index}`}
      style={styles.list} // Add style to FlatList if needed (e.g., padding)
      contentContainerStyle={styles.listContentContainer} // For padding inside scroll area
      ItemSeparatorComponent={() => <View style={styles.separator} />} // Optional separator
      ListEmptyComponent={ // Handle empty list case
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No savings goals added yet.</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    // If the list container needs specific styles (rarely needed if parent uses flex: 1)
  },
  listContentContainer: {
    paddingBottom: 20, // Add padding at the bottom of the scrollable content
  },
  savingItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Vertically align items
    backgroundColor: Colors.surface, // White background for card look
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10, // Rounded corners
    marginBottom: 12, // Space between items
    // Add subtle shadow/elevation if desired (match other cards)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // Subtle elevation for Android
  },
  savingDetails: {
    flex: 1, // Take up available space before the button
    marginRight: 15, // Space between details and delete button
  },
  savingName: {
    fontSize: 17, // Slightly larger font for name
    fontWeight: "600", // Semi-bold
    color: Colors.primaryText,
    marginBottom: 5, // Space between name and amounts/progress
  },
  savingAmounts: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 8, // Space below amounts, above progress bar
  },
  goalReached: {
      color: Colors.success,
      fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 8, // Height of the progress bar
    backgroundColor: Colors.progressBarBackground, // Light grey background
    borderRadius: 4, // Rounded edges for the bar
    overflow: 'hidden', // Ensure foreground doesn't overflow
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: Colors.success, // Green color for progress
    borderRadius: 4,
  },
  deleteButton: {
    padding: 8, // Increase touchable area around the icon
    marginLeft: 'auto', // Push button to the right (alternative to space-between on container)
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: { // Optional: If you want a line separator instead of margin
    // height: 1,
    // backgroundColor: Colors.border,
    // marginVertical: 5, // Adjust spacing if using separator
  },
  emptyContainer: {
      flex: 1, // Ensure it can take space if needed
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
      marginTop: 20, // Add some top margin
  },
  emptyText: {
      fontSize: 16,
      color: Colors.secondaryText,
      textAlign: 'center',
  },
});

export default SavingsList;