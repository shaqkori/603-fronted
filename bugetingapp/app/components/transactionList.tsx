import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Transaction } from "../types/transactions";
import { formatDate } from "../utils/dateFormatter"; // Ensure this import is correct

interface Props {
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onDeleteTransaction }) => {
  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === "income";
    const sign = isIncome ? "+" : "-";
    const textColor = isIncome ? styles.incomeText : styles.expenseText;
    const formattedDate = formatDate(item.date); // Format the date

    return (
      <View style={styles.transactionItem}>
        <View style={styles.leftColumn}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{formattedDate}</Text> {/* Display the formatted date */}
        </View>
        <Text style={[styles.amount, textColor]}>
          {sign}£{Number(item.amount).toFixed(2)}
        </Text>
        <TouchableOpacity onPress={() => onDeleteTransaction(item.id)}>
          <Text style={styles.deleteButton}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  leftColumn: {
    flexShrink: 1, // Allows text to wrap if needed
  },
  description: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  category: { fontSize: 12, color: "#777", marginBottom: 2 },
  date: { fontSize: 10, color: "#aaa" }, // Style for the date
  amount: { fontSize: 16, fontWeight: "bold" },
  incomeText: { color: "green" },
  expenseText: { color: "red" },
  deleteButton: { color: "red", fontSize: 16, fontWeight: "bold" },
});

export default TransactionList;