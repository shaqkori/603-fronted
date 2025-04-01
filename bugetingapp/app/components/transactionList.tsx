import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Transaction } from "../types/transactions";

interface Props {
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onDeleteTransaction }) => {
  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === "income";
    const sign = isIncome ? "+" : "-";
    const textColor = isIncome ? styles.incomeText : styles.expenseText;

    return (
      <View style={styles.transactionItem}>
        <View>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.category}>{item.category}</Text>
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
  description: { fontSize: 16, fontWeight: "bold" },
  category: { fontSize: 12, color: "#777" },
  amount: { fontSize: 16, fontWeight: "bold" },
  incomeText: { color: "green" }, // Green for income
  expenseText: { color: "red" }, // Red for expenses
  deleteButton: { color: "red", fontSize: 16, fontWeight: "bold" },
});

export default TransactionList;