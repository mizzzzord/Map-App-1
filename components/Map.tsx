// components/Map.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { LongPressEvent, Marker as MapMarker, Region } from 'react-native-maps';
import { MapProps } from '../types';

const Map: React.FC<MapProps> = ({ markers, onMarkerPress, onLongPress }) => {
  const [region, setRegion] = React.useState<Region>({
    latitude: 55.7558,
    longitude: 37.6173,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleMarkerPress = (marker: any) => {
    onMarkerPress(marker);
  };

  const handleLongPress = (event: LongPressEvent) => {
    onLongPress(event);
  };

  return (
    <MapView
      style={styles.map}
      region={region}
      onRegionChangeComplete={setRegion}
      onLongPress={handleLongPress}
    >
      {markers.map((marker) => (
        <MapMarker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          description={marker.description}
          onPress={() => handleMarkerPress(marker)}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});

export default Map;