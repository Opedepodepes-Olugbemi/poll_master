import { useState } from 'react';
import { Search, X, Image as ImageIcon, Loader } from 'lucide-react';

interface ImageSearchProps {
  onImageSelect: (url: string) => void;
  onClose: () => void;
}

const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // Replace with your Unsplash API key

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
  };
  alt_description: string;
}

export default function ImageSearch({ onImageSelect, onClose }: ImageSearchProps) {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);

  const searchImages = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );
      const data = await response.json();
      setImages(data.results);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-reddit-card-dark rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-reddit-text-dark">
            Search Images
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            title="Close image search"
            aria-label="Close image search"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchImages()}
                placeholder="Search for images..."
                className="w-full px-4 py-2 pl-10 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-reddit-dark focus:ring-2 focus:ring-reddit-orange focus:border-transparent dark:text-reddit-text-dark"
              />
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            <button
              onClick={searchImages}
              className="px-4 py-2 bg-reddit-orange text-white rounded-md hover:bg-reddit-hover transition-colors"
            >
              Search
            </button>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader size={24} className="animate-spin text-reddit-orange" />
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {images.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => onImageSelect(image.urls.regular)}
                    className="relative group aspect-square overflow-hidden rounded-md hover:ring-2 hover:ring-reddit-orange focus:ring-2 focus:ring-reddit-orange"
                    title={`Select ${image.alt_description || 'image'}`}
                    aria-label={`Select ${image.alt_description || 'image'}`}
                  >
                    <img
                      src={image.urls.small}
                      alt={image.alt_description}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Select</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p>Search for images to add to your poll</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}