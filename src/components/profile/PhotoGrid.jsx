import React from 'react';

function PhotoGrid({ photos }) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Photos</h3>
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="aspect-square overflow-hidden rounded-lg">
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhotoGrid;