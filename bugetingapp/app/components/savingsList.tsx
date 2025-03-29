import React from "react";
import { View, Text, FlatList, Button, StyleSheet } from "react-native";
import { Saving } from "../types/savings";

interface SavingsListProps {
  savings: Saving[];
  onDeleteSaving: (id: number) => void;
}

const SavingsList: React.FC<SavingsListProps> = ({ savings, onDeleteSaving }) => {
  return (
    <View>
      <FlatList
        data={savings}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.saving}>
            <Text>{item.name} - £{item.currentAmount} / £{item.targetAmount}</Text>
            <Button title="Delete" onPress={() => onDeleteSaving(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  saving: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    padding: 10, 
    borderBottomWidth: 1 
  },
});

export default SavingsList;