import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { View, Text } from "react-native";
//import HomeScreen from "../screens/HomeScreen";
import TransactionsScreen from "../screens/transactions";
//import AnalysisScreen from "../screens";
import CategoriesScreen from "../screens/categories";
import SavingsScreen from "../screens/savings";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const BottomNav = () => {
  return (
    
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "home") iconName = "home";
            else if (route.name === "transactions") iconName = "list";
            else if (route.name === "analysis") iconName = "analytics";
            else if (route.name === "categories") iconName = "grid";
            else if (route.name === "savings") iconName = "wallet";

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: "blue",
          tabBarInactiveTintColor: "gray",
        })}
      >
        
        <Tab.Screen name="Transactions" component={TransactionsScreen} />
       
        <Tab.Screen name="Categories" component={CategoriesScreen} />
        <Tab.Screen name="Savings" component={SavingsScreen} />
      </Tab.Navigator>
    
  );
};

export default BottomNav;