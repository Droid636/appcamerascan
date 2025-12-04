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

      // Limpiar campos
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
      console.log('Error al guardar producto:', e);
      Alert.alert('Error', e?.message || 'No se pudo registrar el producto');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Producto</Text>

      <TextInput
        placeholder="Nombre del producto"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />

      <TextInput
        placeholder="Marca"
        value={marca}
        onChangeText={setMarca}
        style={styles.input}
      />

      <TextInput
        placeholder="Proveedor"
        value={proveedor}
        onChangeText={setProveedor}
        style={styles.input}
      />

      <TextInput
        placeholder="Precio de venta"
        value={precioVenta}
        onChangeText={setPrecioVenta}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Precio de compra"
        value={precioCompra}
        onChangeText={setPrecioCompra}
        keyboardType="numeric"
        style={styles.input}
      />

      {/* --- FECHA DE COMPRA --- */}
      <TouchableOpacity
        onPress={() => setPickerCompraVisible(true)}
        style={styles.input}
      >
        <Text>
          {fechaCompra
            ? fechaCompra.toISOString().split('T')[0]
            : 'Seleccionar fecha de compra'}
        </Text>
      </TouchableOpacity>

      {pickerCompraVisible && (
        <DateTimePicker
          value={fechaCompra || new Date()}
          mode="date"
          display="calendar"
          onChange={(_, date) => {
            setPickerCompraVisible(false);
            if (date) setFechaCompra(date);
          }}
        />
      )}

      {/* --- FECHA DE CADUCIDAD --- */}
      <TouchableOpacity
        onPress={() => setPickerCaducidadVisible(true)}
        style={styles.input}
      >
        <Text>
          {fechaCaducidad
            ? fechaCaducidad.toISOString().split('T')[0]
            : 'Seleccionar fecha de caducidad'}
        </Text>
      </TouchableOpacity>

      {pickerCaducidadVisible && (
        <DateTimePicker
          value={fechaCaducidad || new Date()}
          mode="date"
          display="calendar"
          onChange={(_, date) => {
            setPickerCaducidadVisible(false);
            if (date) setFechaCaducidad(date);
          }}
        />
      )}

      {/* CÓDIGO BARRAS */}
      <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
        <TextInput
          placeholder="Código (escaneado o manual)"
          value={codigo}
          onChangeText={setCodigo}
          style={[styles.input, { flex: 1, marginRight: 5 }]}
        />

        <TouchableOpacity
          onPress={() => {
            setModalVisible(true);
            setScanned(false);
          }}
          style={styles.scanButton}
        >
          <Text style={{ color: '#fff' }}>Escanear</Text>
        </TouchableOpacity>
      </View>

      {/* STOCK */}
      <TextInput
        placeholder="Stock"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Guardar" onPress={handleGuardar} />

      {/* MODAL CÁMARA */}
      <Modal visible={modalVisible} animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000',
          }}
        >
          {hasPermission === null ? (
            <Text style={{ color: '#fff' }}>Solicitando permiso de cámara...</Text>
          ) : hasPermission === false ? (
            <Text style={{ color: 'red' }}>Sin acceso a la cámara</Text>
          ) : (
            <CameraView
              style={{ width: '100%', height: '70%' }}
              facing={'back'}
              onBarcodeScanned={
                scanned
                  ? undefined
                  : (result: BarcodeScanningResult) => {
                      setCodigo(result.data);
                      setScanned(true);
                      setModalVisible(false);
                    }
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

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          >
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
