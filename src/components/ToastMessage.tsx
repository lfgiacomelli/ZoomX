import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

type ToastMessageProps = {
  message: string;
  onHide?: () => void;
  status?: 'SUCCESS' | 'ERROR' | 'DEFAULT' | 'WARNING';
};

export default function ToastMessage({ message, onHide, status = 'DEFAULT' }: ToastMessageProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (onHide) onHide();
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [fadeAnim, onHide]);

  const backgroundColor =
    status === "SUCCESS"
      ? "rgba(0, 128, 0, 0.85)"
      : status === "ERROR"
      ? "rgba(220, 20, 60, 0.85)"     
      : "rgba(0, 0, 0, 0.8)";         

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 59,
    left: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 10,
    alignItems: "center",
    zIndex: 9999,
    pointerEvents: "none",
  },
  text: {
    textAlign: 'center',
    color: "#fff",
    fontSize: 16,
    fontFamily: "Righteous",    
  },
});
