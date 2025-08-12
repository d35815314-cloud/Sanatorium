export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  category: string;
  medium: string;
  dimensions: string;
  description: string;
  imageUrl: string;
  price?: number;
  isAvailable: boolean;
  tags: string[];
}

export interface ArtworkFilter {
  category?: string;
  year?: number;
  artist?: string;
  medium?: string;
  priceRange?: [number, number];
  searchTerm?: string;
}
