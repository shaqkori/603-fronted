import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Transaction } from "../types/transactions";
import { formatDate } from "../utils/dateFormatter"; 
 
interface Props { // degines the props for the component 
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => void;
}
//

const TransactionList: React.FC<Props> = ({ transactions, onDeleteTransaction }) => {
  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === "income"; // Check if the transaction is income or expense
    // Set the sign and text color based on the transaction type
    const sign = isIncome ? "+" : "-"; // Set the sign for income and expense
    const textColor = isIncome ? styles.incomeText : styles.expenseText; // Set the text color for income and expense
    const formattedDate = formatDate(item.date); // Format the date

    return (
      // Render the transaction item
      <View style={styles.transactionItem}>
        <View style={styles.leftColumn}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{formattedDate}</Text> 
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
    borderWidth: 1,
    borderColor: "#1E1E1E",
  },
  leftColumn: {
    flexShrink: 1, 
  },
  description: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  category: { fontSize: 12, color: "#777", marginBottom: 2 },
  date: { fontSize: 10, color: "#aaa" }, 
  amount: { fontSize: 16, fontWeight: "bold" },
  incomeText: { color: "green" },
  expenseText: { color: "red" },
  deleteButton: { color: "red", fontSize: 16, fontWeight: "bold" },
});

export default TransactionList;