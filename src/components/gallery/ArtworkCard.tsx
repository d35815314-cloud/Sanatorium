import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Artwork } from "@/types/artwork";
import { Eye, Heart } from "lucide-react";

interface ArtworkCardProps {
  artwork: Artwork;
  onViewDetails: (artwork: Artwork) => void;
}

export default function ArtworkCard({
  artwork = {
    id: "1",
    title: "Sample Artwork",
    artist: "Unknown Artist",
    year: 2023,
    category: "Abstract",
    medium: "Oil on Canvas",
    dimensions: '24" x 36"',
    description: "A beautiful piece of art.",
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
    price: 1000,
    isAvailable: true,
    tags: ["sample"],
  },
  onViewDetails = () => {},
}: ArtworkCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className={`w-full h-64 object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onClick={() => onViewDetails(artwork)}
          />
          {!imageLoaded && (
            <div className="w-full h-64 bg-gray-200 animate-pulse rounded-t-xl" />
          )}

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(artwork);
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className={`bg-white/90 hover:bg-white ${
                  isLiked ? "text-red-500" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Availability badge */}
          <div className="absolute top-3 right-3">
            <Badge variant={artwork.isAvailable ? "default" : "secondary"}>
              {artwork.isAvailable ? "Available" : "Sold"}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4">
        <div className="w-full">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">
            {artwork.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-2">
            by {artwork.artist} • {artwork.year}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {artwork.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {artwork.medium}
              </Badge>
            </div>
            {artwork.price && (
              <span className="font-semibold text-lg">
                ${artwork.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
