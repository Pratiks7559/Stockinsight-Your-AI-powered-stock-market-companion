// src/components/NewsCard.js
import React from 'react';

const NewsCard = ({ article, isBookmarked, onBookmarkToggle }) => {
  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'Positive': return 'bg-green-100 text-green-800';
      case 'Negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={article.urlToImage || '/placeholder-image.jpg'} 
          alt={article.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
          }}
        />
        <button 
          onClick={onBookmarkToggle}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
        >
          <svg 
            className={`w-5 h-5 ${isBookmarked ? 'text-yellow-500 fill-current' : 'text-gray-500'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(article.sentiment)}`}>
          {article.sentiment}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{article.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{article.source}</span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;