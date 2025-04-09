// components/progressBar.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // Value between 0 and 1
  color?: string;
  backgroundColor?: string;
  height?: number;
  borderRadius?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'green',
  backgroundColor = '#e0e0e0',
  height = 10,
  borderRadius = 5,
}) => {
  const width = `${progress * 100}%`;

  return (
    <View style={[styles.background, { backgroundColor, height, borderRadius }]}>
      <View style={[styles.foreground, { backgroundColor: color, width: `${progress * 100}%`, height, borderRadius }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    width: '100%',
    overflow: 'hidden',
  },
  foreground: {
    height: '100%',
  },
});

export default ProgressBar;