import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArtworkFilter } from "@/types/artwork";
import { Search, Filter, X } from "lucide-react";
import { artworks } from "@/data/artworks";

interface FilterPanelProps {
  onFilterChange: (filters: ArtworkFilter) => void;
  activeFilters?: ArtworkFilter;
}

export default function FilterPanel({
  onFilterChange = () => {},
  activeFilters = {},
}: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState(activeFilters.searchTerm || "");
  const [selectedCategory, setSelectedCategory] = useState(
    activeFilters.category || "",
  );
  const [selectedYear, setSelectedYear] = useState(
    activeFilters.year?.toString() || "",
  );
  const [selectedArtist, setSelectedArtist] = useState(
    activeFilters.artist || "",
  );
  const [selectedMedium, setSelectedMedium] = useState(
    activeFilters.medium || "",
  );

  // Get unique values for filter options
  const categories = [...new Set(artworks.map((a) => a.category))];
  const years = [...new Set(artworks.map((a) => a.year))].sort((a, b) => b - a);
  const artists = [...new Set(artworks.map((a) => a.artist))].sort();
  const mediums = [...new Set(artworks.map((a) => a.medium))].sort();

  const handleFilterChange = () => {
    const filters: ArtworkFilter = {
      searchTerm: searchTerm || undefined,
      category: selectedCategory || undefined,
      year: selectedYear ? parseInt(selectedYear) : undefined,
      artist: selectedArtist || undefined,
      medium: selectedMedium || undefined,
    };
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedYear("");
    setSelectedArtist("");
    setSelectedMedium("");
    onFilterChange({});
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCategory ||
    selectedYear ||
    selectedArtist ||
    selectedMedium;

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search artworks, artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleFilterChange()}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={selectedCategory}
              onValueChange={(value) =>
                setSelectedCategory(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear}
              onValueChange={(value) =>
                setSelectedYear(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedArtist}
              onValueChange={(value) =>
                setSelectedArtist(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Artist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Artists</SelectItem>
                {artists.map((artist) => (
                  <SelectItem key={artist} value={artist}>
                    {artist}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedMedium}
              onValueChange={(value) =>
                setSelectedMedium(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Medium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Mediums</SelectItem>
                {mediums.map((medium) => (
                  <SelectItem key={medium} value={medium}>
                    {medium}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleFilterChange}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Apply
            </Button>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchTerm}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    setSearchTerm("");
                    handleFilterChange();
                  }}
                />
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedCategory}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    setSelectedCategory("");
                    handleFilterChange();
                  }}
                />
              </Badge>
            )}
            {selectedYear && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedYear}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    setSelectedYear("");
                    handleFilterChange();
                  }}
                />
              </Badge>
            )}
            {selectedArtist && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedArtist}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    setSelectedArtist("");
                    handleFilterChange();
                  }}
                />
              </Badge>
            )}
            {selectedMedium && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedMedium}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    setSelectedMedium("");
                    handleFilterChange();
                  }}
                />
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
