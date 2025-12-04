import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { CameraView, Camera, BarcodeScanningResult } from 'expo-camera';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import app from './firebaseConfig';

const db = getFirestore(app);

export default function SearchProductScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const [scanned, setScanned] = useState(false);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (modalVisible) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }
  }, [modalVisible]);

  const handleBarCodeScanned = async ({ barcodes }: { barcodes: any[] }) => {
    if (barcodes.length > 0 && !scanned) {
      setScanned(true);
      setModalVisible(false);
      const data = barcodes[0].data;
      // Buscar producto en Firebase por código
      const q = query(collection(db, 'productos'), where('codigo', '==', data));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const prod = querySnapshot.docs[0].data();
        setProduct(prod);
        Alert.alert('Producto encontrado', `Nombre: ${prod.nombre}\nMarca: ${prod.marca}\nProveedor: ${prod.proveedor}\nPrecio venta: ${prod.precioVenta}\nStock: ${prod.stock}`);
      } else {
        setProduct(null);
        Alert.alert('No encontrado', 'No existe un producto con ese código.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar Producto</Text>
      <Button title="Escanear código" onPress={() => { setModalVisible(true); setScanned(false); }} />
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
              onBarcodeScanned={scanned ? undefined : (result: BarcodeScanningResult) => handleBarCodeScanned({ barcodes: [{ data: result.data }] })}
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
      {product && (
        <View style={styles.productBox}>
          <Text>Nombre: {product.nombre}</Text>
          <Text>Marca: {product.marca}</Text>
          <Text>Proveedor: {product.proveedor}</Text>
          <Text>Precio venta: {product.precioVenta}</Text>
          <Text>Stock: {product.stock}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  closeButton: {
    backgroundColor: '#d32f2f',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  productBox: {
    marginTop: 30,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
});
