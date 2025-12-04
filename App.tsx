import { StatusBar } from 'expo-status-bar';
import { Button } from 'react-native';
import RegisterProductScreen from './RegisterProductScreen';
import SearchProductScreen from './SearchProductScreen';
import { useState } from 'react';

export default function App() {
  const [screen, setScreen] = useState<'register' | 'search'>('register');
  return (
    <>
      {screen === 'register' ? (
        <>
          <RegisterProductScreen />
          <StatusBar style="auto" />
          <Button title="Buscar producto por scan" onPress={() => setScreen('search')} />
        </>
      ) : (
        <>
          <SearchProductScreen />
          <StatusBar style="auto" />
          <Button title="Volver al registro" onPress={() => setScreen('register')} />
        </>
      )}
    </>
  );
}

// ...existing code...
