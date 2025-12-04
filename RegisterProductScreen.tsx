import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';


import { CameraView, Camera, BarcodeScanningResult } from 'expo-camera';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import app from './firebaseConfig';
const db = getFirestore(app);

export default function RegisterProductScreen() {
  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [fechaCompra, setFechaCompra] = useState<Date | null>(null);
  const [fechaCaducidad, setFechaCaducidad] = useState<Date | null>(null);
  const [codigo, setCodigo] = useState('');
  const [stock, setStock] = useState('');

  const [pickerCompraVisible, setPickerCompraVisible] = useState(false);
  const [pickerCaducidadVisible, setPickerCaducidadVisible] = useState(false);

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

  // ===================
  // VALIDACIONES
  // ===================
  const handleGuardar = async () => {
    if (
      !nombre ||
      !marca ||
      !proveedor ||
      !precioVenta ||
      !precioCompra ||
      !fechaCompra ||
      !fechaCaducidad ||
      !codigo ||
      !stock
    ) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    // Validar precios
    if (isNaN(Number(precioVenta)) || Number(precioVenta) <= 0) {
      Alert.alert('Error', 'Precio de venta inválido');
      return;
    }

    if (isNaN(Number(precioCompra)) || Number(precioCompra) <= 0) {
      Alert.alert('Error', 'Precio de compra inválido');
      return;
    }

    // Validar stock
    if (isNaN(Number(stock)) || parseInt(stock) <= 0) {
      Alert.alert('Error', 'El stock debe ser un número entero mayor a cero');
      return;
    }

    // Validar fechas
    if (fechaCaducidad <= fechaCompra) {
      Alert.alert(
        'Error en fechas',
        'La fecha de caducidad debe ser MAYOR que la fecha de compra'
      );
      return;
    }

    try {
      await addDoc(collection(db, 'productos'), {
        nombre,
        marca,
        proveedor,
        precioVenta: parseFloat(precioVenta),
        precioCompra: parseFloat(precioCompra),
        fechaCompra: fechaCompra.toISOString().split('T')[0],
        fechaCaducidad: fechaCaducidad.toISOString().split('T')[0],
        codigo,
        stock: parseInt(stock, 10),
      });

      Alert.alert('Éxito', 'Producto registrado');

      setNombre('');
      setMarca('');
      setProveedor('');
      setPrecioVenta('');
      setPrecioCompra('');
      setFechaCompra(null);
      setFechaCaducidad(null);

      setCodigo('');
      setStock('');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo registrar el producto');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.card}>
        <Text style={styles.title}>Registrar Producto</Text>

        {/* ------------------ BOTÓN ARRIBA ------------------ */}
        <View style={styles.row}>
          <TextInput
            placeholder="Código (escaneado o manual)"
            value={codigo}
            onChangeText={setCodigo}
            style={[styles.input, { flex: 1 }]}
          />

          <TouchableOpacity
            onPress={() => { setModalVisible(true); setScanned(false); }}
            style={styles.scanButton}>
            <Text style={styles.scanButtonText}>Escanear</Text>
          </TouchableOpacity>
        </View>
        {/* --------------------------------------------------- */}

        <TextInput placeholder="Nombre del producto" value={nombre} onChangeText={setNombre} style={styles.input} />
        <TextInput placeholder="Marca" value={marca} onChangeText={setMarca} style={styles.input} />
        <TextInput placeholder="Proveedor" value={proveedor} onChangeText={setProveedor} style={styles.input} />
        <TextInput placeholder="Precio de venta" value={precioVenta} onChangeText={setPrecioVenta} style={styles.input} keyboardType="numeric" />
        <TextInput placeholder="Precio de compra" value={precioCompra} onChangeText={setPrecioCompra} style={styles.input} keyboardType="numeric" />
        <TextInput placeholder="Fecha de compra (YYYY-MM-DD)" value={fechaCompra} onChangeText={setFechaCompra} style={styles.input} />
        <TextInput placeholder="Fecha de caducidad (YYYY-MM-DD)" value={fechaCaducidad} onChangeText={setFechaCaducidad} style={styles.input} />
        <TextInput placeholder="Stock" value={stock} onChangeText={setStock} style={styles.input} keyboardType="numeric" />

        <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DEL ESCANEO */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          {hasPermission === null ? (
            <Text style={{ color: '#fff' }}>Solicitando permiso...</Text>
          ) : hasPermission === false ? (
            <Text style={{ color: 'red' }}>Sin acceso a la cámara</Text>
          ) : (
            <CameraView

              style={styles.camera}
              facing="back"
              onBarcodeScanned={scanned ? undefined : (result: BarcodeScanningResult) => {
                setCodigo(result.data);
                setScanned(true);
                setModalVisible(false);
              }}
              barcodeScannerSettings={{
                barcodeTypes: [
                  'ean13', 'ean8', 'upc_a', 'upc_e',
                  'code39', 'code128', 'qr',
                  'pdf417', 'aztec', 'datamatrix'
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

// ===================
// ESTILOS
// ===================
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
  },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    marginTop: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'center',
    marginBottom: 20,
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    fontSize: 16,
  },

  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },

  scanButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginLeft: 10,
  },

  scanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },

  camera: {
    width: '100%',
    height: '75%',
  },

  closeButton: {
    backgroundColor: '#d32f2f',
    padding: 14,
    borderRadius: 12,
    margin: 20,
    alignItems: 'center',
  },
});
