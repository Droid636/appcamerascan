import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RegisterProductScreen from './RegisterProductScreen';
import SearchProductScreen from './SearchProductScreen';
import { useState } from 'react';

export default function App() {
  const [screen, setScreen] = useState<'register' | 'search'>('register');

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f6f9' }}>
      {screen === 'register' ? (
        <>
          <RegisterProductScreen />

          {/* BOTÓN ABAJO */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.customButton}
              onPress={() => setScreen('search')}
            >
              <Text style={styles.buttonText}>Buscar producto por scan</Text>
            </TouchableOpacity>
          </View>

          <StatusBar style="auto" />
        </>
      ) : (
        <>
          <SearchProductScreen />

          {/* BOTÓN ABAJO */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.customButton}
              onPress={() => setScreen('register')}
            >
              <Text style={styles.buttonText}>Volver al registro</Text>
            </TouchableOpacity>
          </View>

          <StatusBar style="auto" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f4f6f9',
  },

  customButton: {
    backgroundColor: '#0066ff',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#004ecc',
    width: '80%',
    alignItems: 'center',

    // sombra elegante
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
