// src/components/ForYouSection.js
import React from 'react';
import NewsGrid from './NewsGrid';

const ForYouSection = ({ bookmarkedArticles, toggleBookmark }) => {
  // Mock personalized recommendations based on bookmarked articles
  const personalizedNews = [
    {
      title: "Apple Announces Record Quarterly Earnings",
      description: "Apple reported its highest ever quarterly revenue, driven by strong iPhone sales and services growth.",
      url: "https://example.com/apple-earnings",
      urlToImage: "https://placehold.co/600x400/3b82f6/ffffff?text=Apple",
      source: "Tech News",
      publishedAt: new Date().toISOString(),
      sentiment: "Positive"
    },
    {
      title: "Federal Reserve Holds Interest Rates Steady",
      description: "The Federal Reserve decided to maintain current interest rates, citing stable economic indicators.",
      url: "https://example.com/fed-rates",
      urlToImage: "https://placehold.co/600x400/059669/ffffff?text=Economy",
      source: "Financial Times",
      publishedAt: new Date().toISOString(),
      sentiment: "Neutral"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
      <p className="text-gray-600 mb-6">Based on your interests and reading history</p>
      
      {personalizedNews.length > 0 ? (
        <NewsGrid 
          news={personalizedNews} 
          loading={false}
          bookmarkedArticles={bookmarkedArticles}
          toggleBookmark={toggleBookmark}
        />
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No recommendations yet</h3>
          <p className="mt-1 text-gray-500">Start bookmarking articles to get personalized recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default ForYouSection;