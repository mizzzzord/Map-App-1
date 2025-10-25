import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Глобальные массивы
declare global {
  var ALL_MARKERS: any[];
  var ALL_MARKER_IMAGES: any[];
}

// Инициализация глобальных переменных
if (!global.ALL_MARKERS) global.ALL_MARKERS = [];
if (!global.ALL_MARKER_IMAGES) global.ALL_MARKER_IMAGES = [];

// Компонент экрана деталей маркера
export default function MarkerDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const [markerTitle, setMarkerTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const markerId = params.id as string;
  const latitude = parseFloat(params.latitude as string);
  const longitude = parseFloat(params.longitude as string);
  const initialTitle = params.title as string;

  // Загружаем данные при открытии экрана
  useEffect(() => {
    // Загружаем изображения
    const markerImages = global.ALL_MARKER_IMAGES.filter(img => img.markerId === markerId);
    setImages(markerImages);
    
    // Загружаем название метки
    const marker = global.ALL_MARKERS.find(m => m.id === markerId);
    setMarkerTitle(marker?.title || initialTitle || 'Метка');
  }, [markerId, initialTitle]);

  const handleAddImage = async () => {
    try {
      // Запрашиваем разрешение
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Разрешение требуется',
          'Для добавления фото необходимо разрешение на доступ к галерее.'
        );
        return;
      }

      // Открываем выбор изображения
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          markerId: markerId,
          createdAt: new Date(),
        };

        // Добавляем в глобальный массив
        global.ALL_MARKER_IMAGES.push(newImage);
        
        // Обновляем локальное состояние
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
            // Удаляем из глобального массива
            global.ALL_MARKER_IMAGES = global.ALL_MARKER_IMAGES.filter(img => img.id !== imageId);
            
            // Обновляем локальное состояние
            setImages(prev => prev.filter(img => img.id !== imageId));
          },
        },
      ]
    );
  };

  const handleEditTitle = () => {
    setNewTitle(markerTitle);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (newTitle.trim() === '') {
      Alert.alert('Ошибка', 'Название не может быть пустым');
      return;
    }

    // Обновляем в глобальном массиве маркеров
    const markerIndex = global.ALL_MARKERS.findIndex(m => m.id === markerId);
    if (markerIndex !== -1) {
      global.ALL_MARKERS[markerIndex].title = newTitle.trim();
    }

    setMarkerTitle(newTitle.trim());
    setIsEditingTitle(false);
    Alert.alert('Успех', 'Название метки обновлено!');
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setNewTitle('');
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

      <View style={styles.markerInfo}>
        <View style={styles.titleContainer}>
          <Text style={styles.markerTitle}>{markerTitle}</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEditTitle}>
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
        </View>
        
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

        {images.length === 0 ? (
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
                    Добавлено: {new Date(image.createdAt).toLocaleDateString()}
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

      {/* Модальное окно для редактирования названия */}
      <Modal
        visible={isEditingTitle}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Изменить название метки</Text>
            <TextInput
              style={styles.textInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Введите новое название"
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveTitle}
              >
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  markerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 18,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});