import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import TransactionsScreen from "../screens/transactions";
import AnalysisScreen from "../screens/analysis";
import CategoriesScreen from "../screens/categories";
import SavingsScreen from "../screens/savings";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const BottomNav = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home"; // Default value

          // Make sure route names here match Tab.Screen names
          if (route.name === "Transactions") {
            iconName = "list";
          } else if (route.name === "Analysis") {
            iconName = "analytics";
          } else if (route.name === "Categories") {
            iconName = "grid";
          } else if (route.name === "Savings") {
            iconName = "wallet";
          } else if (route.name === "Home") {
            iconName = "home";
          }

          // Return the icon with proper size and color
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Savings"
        component={SavingsScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default BottomNav;