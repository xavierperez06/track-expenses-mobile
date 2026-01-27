import { auth } from '@/config/firebase';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useEffect } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {

useEffect(() => {
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        // IMPORTANTE: Usamos el ID de Cliente WEB (Type 3 en tu JSON)
        // NO cambies esto por el ID de Android, o fallará con "Developer Error".
        webClientId: "640825514836-887ndoranr487tva5ajv23h16jlvh4jt.apps.googleusercontent.com", 
        offlineAccess: true,
      });
    }
  }, []);

  const handleSignIn = async () => {
    // --- LÓGICA WEB ---
    if (Platform.OS === 'web') {
      try {
        const { signInWithPopup } = await import("firebase/auth");
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Web Error:", error);
      }
      return;
    }

    // --- LÓGICA NATIVA (Android) ---
    try {
      // Verifica Play Services
      await GoogleSignin.hasPlayServices();
      
      // Abre el modal de Google
      const userInfo = await GoogleSignin.signIn();
      
      // Obtiene el token (manejo seguro para versiones nuevas de la librería)
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      
      if (!idToken) throw new Error("No se obtuvo ID Token de Google");

      // Crea la credencial y entra a Firebase
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Usuario canceló");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Login en curso");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play Services no disponibles");
      } else {
        // Si sale "Developer Error", revisa el SHA-1 o el support email
        console.error("ERROR NATIVO:", error);
        alert(`Login falló: ${error.message || error.code}`);
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      
      {/* Background Gradient matching the icon */}
      <LinearGradient
        // Colors picked from your icon: Violet -> Pinkish -> Orange
        colors={['#8B5CF6', '#D946EF', '#F97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      <View style={styles.contentContainer}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
            <Image source={require('@/assets/images/icon.png')} style={styles.logoImage} />
            <Text style={styles.appName}>Xpenses</Text>
            <Text style={styles.tagline}>Control your money, free your mind.</Text>
        </View>

        {/* Button Section */}
        <View style={styles.bottomSection}>
            <TouchableOpacity 
                style={styles.googleButton} 
                onPress={handleSignIn}
                activeOpacity={0.9}
            >
                {/* Google "G" Visual */}
                <View style={styles.iconContainer}>
                     <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={styles.buttonText}>Sign in with Google</Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  logoContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  iconSymbol: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoImage: {
      width: 100,
      height: 100,
      marginBottom: 20,
      borderRadius: 20,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800', // Extra bold
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  bottomSection: {
    marginBottom: 40,
    width: '100%',
  },
  googleButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  googleG: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#4285F4' // Google Blue for the G
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});