// src/components/HeroBanner.js
import React from 'react';

const HeroBanner = ({ article }) => {
  if (!article) return null;

  return (
    <div className="relative rounded-xl overflow-hidden h-96 mb-8 shadow-lg">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${article.urlToImage || '/placeholder-image.jpg'})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <span className="bg-blue-600 text-xs font-semibold px-2 py-1 rounded uppercase mb-2 inline-block">
          Featured
        </span>
        <h2 className="text-3xl font-bold mb-2">{article.title}</h2>
        <p className="text-lg mb-4 line-clamp-2">{article.description}</p>
        <div className="flex items-center text-sm">
          <span>{article.source}</span>
          <span className="mx-2">•</span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;