import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PhotoGrid = ({ userId }) => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}/photos`);
        setPhotos(response.data);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };
    fetchPhotos();
  }, [userId]);

  return (
    <div className="grid grid-cols-3 gap-1">
      {photos?.map((photo) => (
        <div key={photo.id} className="aspect-square">
          <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;