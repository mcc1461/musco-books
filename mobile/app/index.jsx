import { Image, Text, View, StyleSheet, SafeAreaView } from "react-native";
import { Link } from "expo-router";
import styles from "../assets/styles/home.styles";


export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Welcome to the Musco Books!</Text>
      <Link href="/(auth)/signup" style={{ fontSize: 20, color: "blue" }}>
        Signup
      </Link>
      <Link href="/(auth)" style={{ fontSize: 20, color: "blue" }}>
        Login
      </Link>
    </View>
  );
}
