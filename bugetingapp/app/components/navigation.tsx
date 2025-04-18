import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import TransactionsScreen from "../screens/transactions";
import AnalysisScreen from "../screens/analysis";
import CategoriesScreen from "../screens/categories";
import SavingsScreen from "../screens/savings";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

  {/* Tab.Screen defines a single tab in the tab bar.
      - 'name' is the title of the tab.
      - 'component' is the React component (screen) rendered when this tab is active.
      - 'options' lets you configure settings like whether to show the top header. */}

const BottomNav = () => {
  return (
    <Tab.Navigator
    // Tab.Navigator is a component from React Navigation that creates a bottom tab navigation bar.
// It allows users to switch between major sections of the app using tabs at the bottom of the screen.
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home"; // Default value

          
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

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2E931A",
        tabBarInactiveTintColor: "#DDEB8E",
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