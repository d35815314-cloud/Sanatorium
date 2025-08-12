import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Artwork } from "@/types/artwork";
import {
  Heart,
  Share2,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface ArtworkDetailProps {
  artwork?: Artwork;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export default function ArtworkDetail({
  artwork = {
    id: "1",
    title: "Sample Artwork",
    artist: "Unknown Artist",
    year: 2023,
    category: "Abstract",
    medium: "Oil on Canvas",
    dimensions: '24" x 36"',
    description:
      "A beautiful piece of art that showcases the artist's unique style and vision.",
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    price: 1000,
    isAvailable: true,
    tags: ["sample", "abstract"],
  },
  isOpen = false,
  onClose = () => {},
  onNext = () => {},
  onPrevious = () => {},
  hasNext = false,
  hasPrevious = false,
}: ArtworkDetailProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artwork.title,
          text: `Check out this artwork by ${artwork.artist}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="sr-only">{artwork.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg bg-gray-100">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className={`w-full h-auto max-h-[600px] object-contain transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="w-full h-96 bg-gray-200 animate-pulse" />
              )}
            </div>

            {/* Navigation arrows */}
            {hasPrevious && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={onPrevious}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {hasNext && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={onNext}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {artwork.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                by {artwork.artist} • {artwork.year}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={artwork.isAvailable ? "default" : "secondary"}>
                  {artwork.isAvailable ? "Available" : "Sold"}
                </Badge>
                <Badge variant="outline">{artwork.category}</Badge>
                <Badge variant="outline">{artwork.medium}</Badge>
              </div>
            </div>

            {/* Price */}
            {artwork.price && (
              <div className="text-3xl font-bold text-gray-900">
                ${artwork.price.toLocaleString()}
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {artwork.description}
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-900">Medium:</span>
                <p className="text-gray-700">{artwork.medium}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Dimensions:</span>
                <p className="text-gray-700">{artwork.dimensions}</p>
              </div>
            </div>

            {/* Tags */}
            {artwork.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-gray-900">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1">
                  {artwork.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {artwork.isAvailable && (
                <Button className="flex-1 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Inquire About Purchase
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className={isLiked ? "text-red-500 border-red-500" : ""}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
