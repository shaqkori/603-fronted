import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native"; 
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from "victory"; // import VictoryLabel for graph creation 
import { BASE_URL } from "../src/config";
import TransactionList from "../components/transactionList"; // import TransactionList component to display transactions

const screenWidth = Dimensions.get("window").width - 40;


interface Transaction { // Define the Transaction interface
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";  
}

const Colors = {
  background: "#FAFBE5",
  surface: "#DDEB8E",
  primaryText: "#212529",
  secondaryText: "#6c757d",
  income: "#28a745",
  expense: "#dc3545",
  chartGrid: "#1E1E1E",
  chartLabel: "#495057",
};

// The useState hook is a built-in React hook used to declare state variables in functional components.
// It returns a pair: the current state value and a function to update it.
// This allows the component to "remember" values across re-renders and reactively update the UI when the state changes.

const AnalysisScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [maxValue, setMaxValue] = useState<number>(0);

  const fetchTransactions = async () => { // fetches transactions from the API
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/transactions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch transactions"
      );
    } finally {
      setLoading(false);
    }
  };

// useEffect is a React hook that lets you run side effects in function components.
// The first useEffect runs whenever the transactions array changes.
// It calculates the total income and expenses based on the filtered transaction types.
// Then, it updates the income, expenses, and a scaled maxValue for chart visualization.

  useEffect(() => {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0);

    setIncome(totalIncome);
    setExpenses(totalExpenses);
    setMaxValue(Math.max(totalIncome, totalExpenses) * 1.2); // Calculate max value for scale
  }, [transactions]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.income} />
        <Text style={styles.loadingText}>Loading Analysis...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const chartHeight = 200;
  const chartData = [
    { x: "Income", y: income || 0, fill: Colors.income },
    { x: "Expenses", y: expenses || 0, fill: Colors.expense },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Financial Analysis</Text>

      {/* Chart Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Income vs Expenses</Text>

        {/* VictoryChart renders the bar chart comparing income and expenses */}
        <VictoryChart
          width={screenWidth}
          height={chartHeight}
          domainPadding={{ x: 40 }} 
          padding={{ top: 20, bottom: 50, left: 50, right: 20 }} 
        >
          {/* Y-axis (dependent axis) settings */}
          <VictoryAxis
            dependentAxis
            tickFormat={(t: number) => `£${t}`}
            style={{
              axisLabel: { fontSize: 12, padding: 30, fill: Colors.primaryText },
              tickLabels: { fontSize: 10, fill: Colors.secondaryText },
              axis: { stroke: Colors.chartGrid, strokeWidth: 0.5 },
              grid: { stroke: Colors.chartGrid, strokeWidth: 0.5 },
            }}
            axisLabelComponent={<VictoryLabel style={{ ...styles.axisLabel }} dy={-10} />} 
          />
          {/* X-axis settings */}
          <VictoryAxis
            style={{
              axisLabel: { fontSize: 12, padding: 20, fill: Colors.primaryText },
              tickLabels: { fontSize: 10, fill: Colors.secondaryText },
              axis: { stroke: Colors.chartGrid, strokeWidth: 0.5 },
            }}
          />

          {/* Bar data using VictoryBar */}
          <VictoryBar
            data={chartData}
            x="x"
            y="y"
            style={{
              data: {
                fill: ({ datum }: { datum?: { fill: string } }) => datum?.fill || Colors.chartGrid,
                width: 30, // Adjust bar width
              },
              labels: { fill: Colors.primaryText, fontSize: 12 },
            }}
            labels={({ datum }: { datum: { y: number } }) =>
              typeof datum.y === "number" ? `£${datum.y.toFixed(2)}` : ""
            }
          />
        </VictoryChart>
      </View>

      {/* Totals Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.totalsRow}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Total Income</Text>
            <Text style={[styles.totalAmount, styles.incomeText]}>
              £{(Number(income) || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Total Expenses</Text>
            <Text style={[styles.totalAmount, styles.expenseText]}>
              £{(Number(expenses) || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Transaction List Section */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TransactionList
          transactions={transactions}
          onDeleteTransaction={fetchTransactions}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.secondaryText,
  },
  errorText: {
    fontSize: 16,
    color: Colors.expense,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primaryText,
    marginBottom: 25,
    textAlign: "left",
  },
  sectionContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
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
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  totalItem: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  incomeText: {
    color: Colors.income,
  },
  expenseText: {
    color: Colors.expense,
  },
  listContainer: {
    flex: 1,
    marginBottom: 20,
  },
  axisLabel: {
    color: Colors.primaryText,
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default AnalysisScreen;