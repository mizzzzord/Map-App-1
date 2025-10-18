export interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

export interface MarkerImage {
  id: string;
  uri: string;
  markerId: string;
  createdAt: Date;
}

export type RootStackParamList = {
  index: undefined;
  'marker/[id]': { id: string; latitude: number; longitude: number };
};

export interface ImagePickerError {
  code: string;
  message: string;
}

export interface MapProps {
  markers: Marker[];
  onMarkerPress: (marker: Marker) => void;
  onLongPress: (event: any) => void;
}

export interface MarkerListProps {
  markers: Marker[];
  onMarkerPress: (marker: Marker) => void;
}

export interface ImageListProps {
  images: MarkerImage[];
  onDeleteImage: (imageId: string) => void;
  loading?: boolean;
}