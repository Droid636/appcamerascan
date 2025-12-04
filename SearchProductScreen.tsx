import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
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

      const q = query(collection(db, 'productos'), where('codigo', '==', data));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const prod = querySnapshot.docs[0].data();
        setProduct(prod);

        Alert.alert(
          'Producto encontrado',
          `Nombre: ${prod.nombre}\nMarca: ${prod.marca}\nProveedor: ${prod.proveedor}\nPrecio venta: ${prod.precioVenta}\nStock: ${prod.stock}`
        );
      } else {
        setProduct(null);
        Alert.alert('No encontrado', 'No existe un producto con ese código.');
      }
    }
  };

  return (
    <View style={styles.container}>

      {/* HEADER PROFESIONAL */}
      <Text style={styles.title}>Buscar Producto</Text>
      <Text style={styles.subtitle}>Escanea el código de barras para ver sus detalles</Text>

      {/* BOTÓN CENTRADO */}
      <View style={styles.middleContainer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => {
            setModalVisible(true);
            setScanned(false);
          }}
        >
          <Text style={styles.scanButtonText}>Escanear código</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {hasPermission === null ? (
              <Text style={{ color: '#fff' }}>Solicitando permiso de cámara...</Text>
            ) : hasPermission === false ? (
              <Text style={{ color: 'red' }}>Sin acceso a la cámara</Text>
            ) : (
              <CameraView
                style={styles.camera}
                facing={'back'}
                onBarcodeScanned={
                  scanned
                    ? undefined
                    : (result: BarcodeScanningResult) =>
                        handleBarCodeScanned({ barcodes: [{ data: result.data }] })
                }
                barcodeScannerSettings={{
                  barcodeTypes: [
                    'ean13',
                    'ean8',
                    'upc_a',
                    'upc_e',
                    'code39',
                    'code128',
                    'qr',
                    'pdf417',
                    'aztec',
                    'datamatrix',
                  ],
                }}
              />
            )}

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* RESULTADO DEL PRODUCTO */}
      {product && (
        <View style={styles.productBox}>
          <Text style={styles.productTitle}>📦 Información del producto</Text>
          <Text style={styles.item}>• Nombre: <Text style={styles.value}>{product.nombre}</Text></Text>
          <Text style={styles.item}>• Marca: <Text style={styles.value}>{product.marca}</Text></Text>
          <Text style={styles.item}>• Proveedor: <Text style={styles.value}>{product.proveedor}</Text></Text>
          <Text style={styles.item}>• Precio venta: <Text style={styles.value}>${product.precioVenta}</Text></Text>
          <Text style={styles.item}>• Stock: <Text style={styles.value}>{product.stock}</Text></Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1a1a1a',
  },

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6c6c6c',
    marginBottom: 20,
  },

  middleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scanButton: {
    backgroundColor: '#0077ff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '75%',
    alignItems: 'center',
    shadowColor: '#0077ff',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 10,
  },

  scanButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#000',
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
  },

  camera: {
    width: '100%',
    height: '80%',
  },

  closeButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },

  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  productBox: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#fff',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },

  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
  },

  item: {
    color: '#555',
    fontSize: 16,
    marginBottom: 4,
  },

  value: {
    fontWeight: '700',
    color: '#000',
  },

});
