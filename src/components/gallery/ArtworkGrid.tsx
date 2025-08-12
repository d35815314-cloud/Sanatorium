import { Artwork } from "@/types/artwork";
import ArtworkCard from "./ArtworkCard";
import { artworks } from "@/data/artworks";

interface ArtworkGridProps {
  artworks?: Artwork[];
  onViewDetails: (artwork: Artwork) => void;
}

export default function ArtworkGrid({
  artworks: filteredArtworks = artworks,
  onViewDetails = () => {},
}: ArtworkGridProps) {
  if (filteredArtworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No artworks found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters to see more results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredArtworks.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}
