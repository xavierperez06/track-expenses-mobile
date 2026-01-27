import { auth } from "@/config/firebase";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import React, { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  // 1. Hook de Expo (Solo se usará activamente en Móvil)
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId:
      "640825514836-887ndoranr487tva5ajv23h16jlvh4jt.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
  });

  // 2. Efecto para manejar la respuesta en Móvil (Android/iOS)
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      if (id_token) {
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential).catch((err) =>
          console.error("Mobile Login Error:", err),
        );
      }
    }
  }, [response]);

  // 3. Función unificada de Login
  const handleSignIn = async () => {
    if (Platform.OS === "web") {
      // Importación dinámica para que el compilador de móvil lo ignore
      const { signInWithPopup } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Error en Web Login:", error);
      }
    } else {
      // Móvil sigue usando el hook que ya tienes
      promptAsync();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Track Expenses</Text>
      <TouchableOpacity
        // Deshabilitamos el botón solo en móvil si el request no está listo
        disabled={Platform.OS !== "web" && !request}
        style={[
          styles.button,
          Platform.OS !== "web" && !request && { opacity: 0.5 },
        ]}
        onPress={handleSignIn}
      >
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
