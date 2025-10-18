// app/marker/[id].tsx
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MarkerImage } from '../../types';

export default function MarkerDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [images, setImages] = useState<MarkerImage[]>([]);
  const [loading, setLoading] = useState(false);

  const markerId = params.id as string;
  const latitude = parseFloat(params.latitude as string);
  const longitude = parseFloat(params.longitude as string);

  useEffect(() => {
    loadImages();
  }, [markerId]);

  const loadImages = async () => {
    // В реальном приложении здесь была бы загрузка из хранилища
    // Для демонстрации используем локальное состояние
    setLoading(false);
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Разрешение требуется',
          'Для добавления фото необходимо разрешение на доступ к галерее.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Ошибка запроса разрешения:', error);
      Alert.alert('Ошибка', 'Не удалось запросить разрешение для доступа к галерее.');
      return false;
    }
  };

  const handleAddImage = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage: MarkerImage = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          markerId,
          createdAt: new Date(),
        };

        setImages(prev => [...prev, newImage]);
        
        Alert.alert('Успех', 'Изображение успешно добавлено!');
      }
    } catch (error) {
      console.error('Ошибка выбора изображения:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение. Попробуйте снова.');
    }
  };

  const handleDeleteImage = (imageId: string) => {
    Alert.alert(
      'Удалить изображение',
      'Вы уверены, что хотите удалить это изображение?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            setImages(prev => prev.filter(img => img.id !== imageId));
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  if (!markerId || isNaN(latitude) || isNaN(longitude)) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ошибка: неверные параметры маркера</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Назад к карте</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Детали метки</Text>
      </View>

      <View style={styles.markerInfo}>
        <Text style={styles.coordinates}>
          Координаты: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Text>
        <Text style={styles.markerId}>ID: {markerId}</Text>
      </View>

      <View style={styles.imagesSection}>
        <View style={styles.imagesHeader}>
          <Text style={styles.imagesTitle}>Изображения ({images.length})</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddImage}>
            <Text style={styles.addButtonText}>+ Добавить</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : images.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Нет добавленных изображений</Text>
            <Text style={styles.emptyStateSubtext}>
              Нажмите "Добавить" чтобы прикрепить фото к этой метке
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.imagesList}>
            {images.map((image) => (
              <View key={image.id} style={styles.imageItem}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <View style={styles.imageInfo}>
                  <Text style={styles.imageDate}>
                    Добавлено: {image.createdAt.toLocaleDateString()}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteImage(image.id)}
                  >
                    <Text style={styles.deleteButtonText}>Удалить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  markerInfo: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  coordinates: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  markerId: {
    fontSize: 14,
    color: '#666',
  },
  imagesSection: {
    flex: 1,
    margin: 16,
  },
  imagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  loader: {
    marginTop: 32,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  imagesList: {
    flex: 1,
  },
  imageItem: {
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
  },
  imageInfo: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageDate: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 6,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    margin: 16,
  },
});