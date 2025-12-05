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
          <Text style={styles.productTitle}>Detalles del producto</Text>
          <View style={styles.productDetailRow}><Text style={styles.productLabel}>Nombre:</Text><Text style={styles.productValue}>{product.nombre}</Text></View>
          <View style={styles.productDetailRow}><Text style={styles.productLabel}>Marca:</Text><Text style={styles.productValue}>{product.marca}</Text></View>
          <View style={styles.productDetailRow}><Text style={styles.productLabel}>Proveedor:</Text><Text style={styles.productValue}>{product.proveedor}</Text></View>
          <View style={styles.productDetailRow}><Text style={styles.productLabel}>Precio venta:</Text><Text style={styles.productValue}>${product.precioVenta}</Text></View>
          <View style={styles.productDetailRow}><Text style={styles.productLabel}>Stock:</Text><Text style={styles.productValue}>{product.stock}</Text></View>
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
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#007bff',
  },
  productDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  productLabel: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
    flex: 1,
  },
  productValue: {
    color: '#555',
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  productCloseButton: {
    marginTop: 18,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
});
