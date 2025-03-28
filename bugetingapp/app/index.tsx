import { Text, View, SafeAreaView} from "react-native";
import React, { useState } from 'react';
import Home from './screens/home'
import Transactions from "./screens/transactions";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';


const queryClient = new QueryClient()

export default function Index() {

  
  return (
    <QueryClientProvider client={queryClient}> {/* allows entire app to be accesible by react query */}
      <SafeAreaView>
        <Transactions/>

      </SafeAreaView>

    </QueryClientProvider>

  );
}
