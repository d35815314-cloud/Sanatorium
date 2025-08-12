import { useState, useMemo } from "react";
import { Artwork, ArtworkFilter } from "@/types/artwork";
import { artworks } from "@/data/artworks";
import FilterPanel from "./FilterPanel";
import ArtworkGrid from "./ArtworkGrid";
import ArtworkDetail from "./ArtworkDetail";

export default function Gallery() {
  const [filters, setFilters] = useState<ArtworkFilter>({});
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter artworks based on active filters
  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          artwork.title.toLowerCase().includes(searchLower) ||
          artwork.artist.toLowerCase().includes(searchLower) ||
          artwork.description.toLowerCase().includes(searchLower) ||
          artwork.tags.some((tag) => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && artwork.category !== filters.category) {
        return false;
      }

      // Year filter
      if (filters.year && artwork.year !== filters.year) {
        return false;
      }

      // Artist filter
      if (filters.artist && artwork.artist !== filters.artist) {
        return false;
      }

      // Medium filter
      if (filters.medium && artwork.medium !== filters.medium) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const handleViewDetails = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedArtwork(null);
  };

  const handleNextArtwork = () => {
    if (!selectedArtwork) return;
    const currentIndex = filteredArtworks.findIndex(
      (a) => a.id === selectedArtwork.id,
    );
    const nextIndex = (currentIndex + 1) % filteredArtworks.length;
    setSelectedArtwork(filteredArtworks[nextIndex]);
  };

  const handlePreviousArtwork = () => {
    if (!selectedArtwork) return;
    const currentIndex = filteredArtworks.findIndex(
      (a) => a.id === selectedArtwork.id,
    );
    const prevIndex =
      currentIndex === 0 ? filteredArtworks.length - 1 : currentIndex - 1;
    setSelectedArtwork(filteredArtworks[prevIndex]);
  };

  const currentIndex = selectedArtwork
    ? filteredArtworks.findIndex((a) => a.id === selectedArtwork.id)
    : -1;
  const hasNext = currentIndex < filteredArtworks.length - 1;
  const hasPrevious = currentIndex > 0;

  return <></>;
}
