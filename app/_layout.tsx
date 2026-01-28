import { auth } from "@/config/firebase"; // Ensure this path is correct
import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import LoginScreen from "./login"; // Ensure you have created app/login.tsx

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
  // onAuthStateChanged triggers when Firebase reads the saved session
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    // Only set initializing to false once we have received the first auth response
    setInitializing(false);
  });

  return unsubscribe;
}, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 2. THE GATEKEEPER: If no user, show ONLY LoginScreen.
  // This completely replaces the navigation stack, so no modals or tabs can exist.
  if (!user) {
    return <LoginScreen />;
  }

  // 3. If user exists, show the App (Tabs + Modal)
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
