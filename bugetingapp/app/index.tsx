import { Text, View, SafeAreaView} from "react-native";
import React, { useState } from 'react';
import Home from './screens/home'
import Transactions from "./screens/transactions";
import Categories from "./screens/categories";
import  SavingsScreen  from "./screens/savings";
import BottomNav from "./components/navigation";


import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";




export default function Index() {

  
  return (
   
      
        
        
          <BottomNav />
        
        
        
        

      
      



  );
}
