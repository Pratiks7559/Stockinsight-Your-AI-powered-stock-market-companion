// src/components/BookmarkList.js
import React from 'react';
import NewsCard from './NewsCard';

const BookmarkList = ({ bookmarkedArticles, toggleBookmark }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Saved Articles</h2>
      
      {bookmarkedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedArticles.map((article, index) => (
            <NewsCard
              key={index}
              article={article}
              isBookmarked={true}
              onBookmarkToggle={() => toggleBookmark(article)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No bookmarks yet</h3>
          <p className="mt-1 text-gray-500">Start saving articles to read them later.</p>
        </div>
      )}
    </div>
  );
};

export default BookmarkList;