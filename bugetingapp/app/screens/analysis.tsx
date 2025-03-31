import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { BASE_URL } from "../src/config"; // Assuming you're fetching transactions from the backend

const screenWidth = Dimensions.get("window").width; // Get the screen width dynamically

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";
}

const AnalysisScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);

  // Fetch all transactions from the server
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/transactions`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Recalculate income and expenses whenever transactions change
  useEffect(() => {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0);

    setIncome(totalIncome);
    setExpenses(totalExpenses);
  }, [transactions]); // Recalculate income/expenses whenever transactions change

  // Fetch transactions initially
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Define a fixed maximum value for the Y-axis
  const fixedMaxValue = 1000; // Set a fixed Y-axis maximum value (this can be adjusted as needed)
  const chartHeight = 220; // Adjust the height as needed
  const yAxisInterval = 100; // Fixed Y-axis interval

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analysis</Text>
      <Text style={styles.subtitle}>Income vs Expenses</Text>

      {/* Bar Chart with Fixed Y-Axis Scale */}
      <BarChart
        data={{
          labels: ["Income", "Expenses"], // Bar labels
          datasets: [
            {
              data: [income, expenses], // Bar data (income and expenses)
            },
          ],
        }}
        width={screenWidth - 40} // Adjust the width dynamically based on screen size
        height={chartHeight} // Height of the chart
        yAxisLabel="£" // Prefix for Y-axis (currency)
        yAxisSuffix="" // Suffix for Y-axis (empty string if not needed)
        yAxisInterval={yAxisInterval} // Fixed interval for Y-axis
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2, // Number of decimal places for values
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Bar color
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Label color
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726",
          },
        }}
        style={styles.chart}
        fromZero={true} // Ensures that the Y-axis starts at 0
        showValuesOnTopOfBars={true} // Display values on top of bars
      />

      {/* Display income and expenses totals */}
      <View style={styles.totalContainer}>
        <Text style={styles.total}>Total Income: £{income.toFixed(2)}</Text>
        <Text style={styles.total}>Total Expenses: £{expenses.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
  totalContainer: {
    marginTop: 20,
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default AnalysisScreen;