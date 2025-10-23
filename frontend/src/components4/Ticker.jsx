// src/components/Ticker.js
import React from 'react';

const Ticker = ({ news }) => {
  return (
    <div className="bg-gray-800 text-white py-3 mb-8 rounded-lg overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {news.map((article, index) => (
          <div key={index} className="flex items-center mr-8">
            <span className="font-semibold mr-2">•</span>
            <span className="truncate max-w-xs">{article.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ticker;