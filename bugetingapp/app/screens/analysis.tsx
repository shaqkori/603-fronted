import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView, // Use ScrollView for overall layout if content might exceed screen height
  ActivityIndicator, // Show loading state
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { BASE_URL } from "../src/config";
import TransactionList from "../components/transactionList"; // Assuming TransactionList handles its own scrolling

const screenWidth = Dimensions.get("window").width;

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";
}

// Define a professional color palette
const Colors = {
  background: "#f8f9fa", // Very light grey background
  surface: "#ffffff", // White for card backgrounds
  primaryText: "#212529", // Dark grey/black for main text
  secondaryText: "#6c757d", // Medium grey for subtitles/labels
  income: "#28a745", // Green for income
  expense: "#dc3545", // Red for expenses
  chartGrid: "#e9ecef", // Light grey for chart lines
  chartLabel: "#495057", // Darker grey for chart labels
};

const AnalysisScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  // Fetch all transactions from the server
  const fetchTransactions = async () => {
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
  }, [transactions]);

  // Fetch transactions initially
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle loading state
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.income} />
        <Text style={styles.loadingText}>Loading Analysis...</Text>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        {/* Optionally add a retry button */}
      </View>
    );
  }

  const chartHeight = 250; // Slightly taller chart
  // Dynamic interval calculation (optional, but can be better than fixed)
  const maxValue = Math.max(income, expenses, 100); // Ensure minimum height
  const yAxisInterval = Math.ceil(maxValue / 5 / 50) * 50; // Aim for ~5 labels, rounded nicely

  // Configure chart colors and style
  const chartConfig = {
    backgroundColor: Colors.surface, // Use surface color for background
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 2, // Show pounds and pence
    // Use a function for bar colors to assign specific colors
    color: (opacity = 1, index?: number) => {
        // Index 0 is Income, Index 1 is Expenses (based on labels array)
        const colors = [Colors.income, Colors.expense];
        // If index is provided, use the corresponding color, otherwise default
        const baseColor = index !== undefined ? colors[index] : Colors.primaryText;
        // Apply opacity - Ensure the baseColor is treated as hex
        // Convert hex to RGB if needed, or assume rgba format works
        // Basic hex to rgba approximation (might need a robust library for accuracy)
        const hexToRgb = (hex: string) => {
            let r = 0, g = 0, b = 0;
            if (hex.length == 4) { // #rgb
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length == 7) { // #rrggbb
                r = parseInt(hex[1] + hex[2], 16);
                g = parseInt(hex[3] + hex[4], 16);
                b = parseInt(hex[5] + hex[6], 16);
            }
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return hexToRgb(baseColor);
    },
    labelColor: (opacity = 1) => `rgba(73, 80, 87, ${opacity})`, // Use Colors.chartLabel with opacity
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: "", // solid lines
      stroke: Colors.chartGrid, // Use light grey for grid lines
    },
    propsForLabels: {
        fontSize: 11, // Slightly smaller labels if needed
    },
    barPercentage: 0.7, // Adjust bar width
  };

  return (
    // Use ScrollView if TransactionList itself isn't scrollable or if you have more content
    // If TransactionList handles its own scrolling (like FlatList), you might not need ScrollView here
    // Using View with flex: 1 for TransactionList container is often better
    <View style={styles.container}>
      <Text style={styles.title}>Financial Analysis</Text>

      {/* Chart Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Income vs Expenses</Text>
        <BarChart
          data={{
            labels: ["Income", "Expenses"],
            datasets: [
              {
                data: [income, expenses],
                // Optional: Define colors per bar directly if the config function is tricky
                // colors: [
                //   (opacity = 1) => `rgba(40, 167, 69, ${opacity})`, // Income Green
                //   (opacity = 1) => `rgba(220, 53, 69, ${opacity})`  // Expense Red
                // ]
              },
            ],
          }}
          width={screenWidth - 40} // Adjust width based on container padding
          height={chartHeight}
          yAxisLabel="£"
          yAxisSuffix=""
          yAxisInterval={yAxisInterval > 0 ? yAxisInterval : 1} // Ensure interval is positive
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero={true}
          showValuesOnTopOfBars={true}
          verticalLabelRotation={0} // Keep labels horizontal
        />
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
      {/* Wrap TransactionList in a View with flex: 1 to take remaining space */}
      <View style={styles.listContainer}>
         <Text style={styles.sectionTitle}>Recent Transactions</Text>
         <TransactionList
            transactions={transactions}
            onDeleteTransaction={fetchTransactions} // Refresh list on delete
         />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20, // Use horizontal padding
    paddingTop: 20, // Add padding at the top
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
    textAlign: 'center',
  },
  title: {
    fontSize: 28, // Larger title
    fontWeight: "bold",
    color: Colors.primaryText,
    marginBottom: 25, // More space below title
    textAlign: 'left', // Align to left
  },
  sectionContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12, // Consistent border radius
    padding: 15,
    marginBottom: 20, // Space between sections
    // Add subtle shadow for depth (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    // Add elevation for depth (Android)
    elevation: 2,
  },
   sectionTitle: {
    fontSize: 18,
    fontWeight: "600", // Semi-bold
    color: Colors.primaryText,
    marginBottom: 15, // Space below section title
  },
  chart: {
    // Remove marginVertical here, handled by sectionContainer
    borderRadius: 8, // Match container or slightly less
    // The chartConfig handles internal styling like background
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute totals evenly
    alignItems: 'center',
  },
  totalItem: {
    alignItems: 'center', // Center text within each item
    paddingHorizontal: 10, // Add some padding if needed
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 5, // Space between label and amount
  },
  totalAmount: {
    fontSize: 18, // Make amount stand out
    fontWeight: 'bold',
  },
  incomeText: {
    color: Colors.income, // Use income color
  },
  expenseText: {
    color: Colors.expense, // Use expense color
  },
  listContainer: {
      flex: 1, // Allows TransactionList to take remaining vertical space
      // Optional: Add background and padding if TransactionList doesn't have its own card style
      // backgroundColor: Colors.surface,
      // borderRadius: 12,
      // padding: 15,
      marginBottom: 20, // Space at the bottom
  },
});

export default AnalysisScreen;