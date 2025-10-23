// Test script for stock search functionality
import { searchStocks } from './services/twelveDataService.js';

async function testSearch() {
  console.log('Testing stock search...');
  
  try {
    const results = await searchStocks('AAPL');
    console.log('Search results for AAPL:', results);
    
    const results2 = await searchStocks('TCS');
    console.log('Search results for TCS:', results2);
    
    const results3 = await searchStocks('Apple');
    console.log('Search results for Apple:', results3);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSearch();