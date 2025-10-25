import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { LongPressEvent, Marker as MapMarker, PROVIDER_DEFAULT } from 'react-native-maps';

// Глобальные массивы
declare global {
  var ALL_MARKERS: any[];
  var ALL_MARKER_IMAGES: any[];
}

// Инициализация глобальных переменных
if (!global.ALL_MARKERS) global.ALL_MARKERS = [];
if (!global.ALL_MARKER_IMAGES) global.ALL_MARKER_IMAGES = [];

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
}

export default function MapScreen() {
  const router = useRouter();
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  // Загружаем маркеры при старте
  useEffect(() => {
    setMarkers(global.ALL_MARKERS);
  }, []);

  // Обработчик долгого нажатия на карту
  const handleMapLongPress = (event: LongPressEvent) => {
    const { coordinate } = event.nativeEvent;
    
    // Создание нового объекта маркера
    const newMarker: MapMarker = {
      id: Date.now().toString(),
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      title: `Метка ${global.ALL_MARKERS.length + 1}`
    };

    // Добавляем в глобальный массив и обновляем состояние
    global.ALL_MARKERS.push(newMarker);
    setMarkers([...global.ALL_MARKERS]);

    Alert.alert(
      'Метка добавлена', 
      `Метка создана в точке: ${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`,
      [{ text: 'OK' }]
    );
  };

  // Переходим на экран деталей маркера
  const handleMarkerPress = (marker: MapMarker) => {
    router.push({
      pathname: '/marker/[id]',
      params: {
        id: marker.id,
        latitude: marker.latitude,
        longitude: marker.longitude,
        title: marker.title,
      },
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: 58.0105,
          longitude: 56.2502,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onLongPress={handleMapLongPress}
      >
        {markers.map(marker => (
          <MapMarker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description="Нажмите для просмотра деталей"
            onPress={() => handleMarkerPress(marker)}
          />
        ))}
      </MapView>

      <View style={styles.infoPanel}>
        <Text style={styles.infoTitle}>Карта Перми</Text>
        <Text style={styles.infoText}>
          Количество меток: {markers.length}
        </Text>
        <Text style={styles.helpText}>
          Нажмите и удерживайте на карте чтобы добавить метку
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoPanel: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  helpText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});