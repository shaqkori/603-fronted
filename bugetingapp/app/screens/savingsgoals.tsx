import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Saving } from "../types/savings";
import { BASE_URL } from "../src/config";

interface UpdateSavingModalProps {
  visible: boolean;
  onClose: () => void;
  saving: Saving;
  onUpdate: () => void;
}

const UpdateSavingModal: React.FC<UpdateSavingModalProps> = ({ visible, onClose, saving, onUpdate }) => {
  const [newAmount, setNewAmount] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive number.");
      return;
    }
    if (amount > saving.targetAmount) {
      Alert.alert("Error", "Current amount cannot exceed target amount.");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`${BASE_URL}/savings/${saving.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentAmount: amount }),
      });

      if (!response.ok) {
        throw new Error("Failed to update saving.");
      }

      onUpdate();
      onClose();
    } catch (error) {
      Alert.alert("Update Failed", (error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Update Savings</Text>
          <Text style={styles.label}>Current Amount (£)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new amount"
            keyboardType="decimal-pad"
            value={newAmount}
            onChangeText={setNewAmount}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
              disabled={isUpdating}
            >
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 5,
  },
  updateButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default UpdateSavingModal;
