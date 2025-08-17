// app/_layout.jsx
import { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { useAuthStore } from "../store/authStore";

export default function RootLayout() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isCheckingAuth = useAuthStore((s) => s.isCheckingAuth);

  // App açıldığında token & user yükle
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Token yüklenmeden önce beklet
  if (isCheckingAuth) {
    return (
      <SafeAreaProvider>
        <SafeScreen>
          {/* Buraya loader koyabilirsin */}
        </SafeScreen>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: true }} />
      </SafeScreen>
    </SafeAreaProvider>
  );
}
