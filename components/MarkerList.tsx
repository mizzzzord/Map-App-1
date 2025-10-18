// components/MarkerList.tsx
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { MarkerListProps } from '../types';

const MarkerList: React.FC<MarkerListProps> = ({ markers, onMarkerPress }) => {
  if (markers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Нет добавленных меток</Text>
        <Text style={styles.emptySubtext}>
          Нажмите и удерживайте на карте чтобы добавить метку
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {markers.map((marker) => (
        <TouchableOpacity
          key={marker.id}
          style={styles.markerItem}
          onPress={() => onMarkerPress(marker)}
        >
          <View style={styles.markerInfo}>
            <Text style={styles.markerTitle}>
              {marker.title || `Метка ${marker.id}`}
            </Text>
            <Text style={styles.markerCoordinates}>
              {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
            </Text>
            {marker.description && (
              <Text style={styles.markerDescription}>{marker.description}</Text>
            )}
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  markerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  markerInfo: {
    flex: 1,
  },
  markerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  markerCoordinates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  markerDescription: {
    fontSize: 12,
    color: '#999',
  },
  arrow: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default MarkerList;