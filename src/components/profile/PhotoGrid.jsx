import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PhotoGrid = ({ userId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}/photos`);
        setPhotos(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching photos:', error);
        setError('Failed to load photos. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [userId]);

  // Function to get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') 
      ? imagePath 
      : `http://localhost:5000${imagePath}`;
  };

  // Close the photo modal when clicking outside or pressing escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-2 sm:px-0">Photos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="aspect-square bg-gray-200 animate-pulse rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-2 sm:px-0">Photos</h2>
        <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
          {error}
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-2 sm:px-0">Photos</h2>
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500">No photos yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 px-2 sm:px-0">Photos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="aspect-square relative overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img 
              src={getImageUrl(photo.image_url)} 
              alt="" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="max-w-4xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity"
              onClick={() => setSelectedPhoto(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={getImageUrl(selectedPhoto.image_url)} 
              alt="" 
              className="max-h-[90vh] max-w-full object-contain"
            />
            {selectedPhoto.content && (
              <div className="bg-black bg-opacity-70 text-white p-4 absolute bottom-0 left-0 right-0">
                <p>{selectedPhoto.content}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGrid;