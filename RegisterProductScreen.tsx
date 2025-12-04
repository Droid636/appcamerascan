import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { CameraView, Camera, CameraType, BarcodeScanningResult } from 'expo-camera';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import app from './firebaseConfig';
const db = getFirestore(app);

export default function RegisterProductScreen() {
  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [codigo, setCodigo] = useState('');
  const [stock, setStock] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const [scanned, setScanned] = useState(false);

  React.useEffect(() => {
    if (modalVisible) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }
  }, [modalVisible]);

  const handleGuardar = async () => {
    if (!nombre || !marca || !proveedor || !precioVenta || !precioCompra || !fechaCompra || !fechaCaducidad || !codigo || !stock) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    try {
      await addDoc(collection(db, 'productos'), {
        nombre,
        marca,
        proveedor,
        precioVenta: parseFloat(precioVenta),
        precioCompra: parseFloat(precioCompra),
        fechaCompra,
        fechaCaducidad,
        codigo,
        stock: parseInt(stock, 10),
      });
      Alert.alert('Éxito', 'Producto registrado');
      setNombre(''); setMarca(''); setProveedor(''); setPrecioVenta(''); setPrecioCompra(''); setFechaCompra(''); setFechaCaducidad(''); setCodigo(''); setStock('');
    } catch (e: any) {
      console.log('Error al guardar producto:', e);
      Alert.alert('Error', e?.message || 'No se pudo registrar el producto');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Producto</Text>
      <TextInput placeholder="Nombre del producto" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Marca" value={marca} onChangeText={setMarca} style={styles.input} />
      <TextInput placeholder="Proveedor" value={proveedor} onChangeText={setProveedor} style={styles.input} />
      <TextInput placeholder="Precio de venta" value={precioVenta} onChangeText={setPrecioVenta} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Precio de compra" value={precioCompra} onChangeText={setPrecioCompra} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Fecha de compra (YYYY-MM-DD)" value={fechaCompra} onChangeText={setFechaCompra} style={styles.input} />
      <TextInput placeholder="Fecha de caducidad (YYYY-MM-DD)" value={fechaCaducidad} onChangeText={setFechaCaducidad} style={styles.input} />
      <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
        <TextInput placeholder="Código (escaneado o manual)" value={codigo} onChangeText={setCodigo} style={[styles.input, { flex: 1, marginRight: 5 }]} />
        <TouchableOpacity onPress={() => { setModalVisible(true); setScanned(false); }} style={styles.scanButton}>
          <Text style={{ color: '#fff' }}>Escanear</Text>
        </TouchableOpacity>
      </View>
      <TextInput placeholder="Stock" value={stock} onChangeText={setStock} style={styles.input} keyboardType="numeric" />
      <Button title="Guardar" onPress={handleGuardar} />

      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
          {hasPermission === null ? (
            <Text style={{ color: '#fff' }}>Solicitando permiso de cámara...</Text>
          ) : hasPermission === false ? (
            <Text style={{ color: 'red' }}>Sin acceso a la cámara</Text>
          ) : (
            <CameraView
              style={{ width: '100%', height: '70%' }}
              facing={"back"}
              onBarcodeScanned={scanned ? undefined : (result: BarcodeScanningResult) => {
                setCodigo(result.data);
                setScanned(true);
                setModalVisible(false);
              }}
              barcodeScannerSettings={{
                barcodeTypes: [
                  'ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code128', 'qr', 'pdf417', 'aztec', 'datamatrix'
                ],
              }}
            />
          )}
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={{ color: '#fff', fontSize: 18 }}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  scanButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: '#d32f2f',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
});
