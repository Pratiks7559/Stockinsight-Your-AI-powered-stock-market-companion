import { getStockData } from './services/twelveDataService.js';

const testSymbols = ['AAPL', 'TCS', 'CKN', 'GOOGL'];

console.log('Testing fixed TwelveData API...');

try {
  const results = await getStockData(testSymbols);
  
  console.log('\n=== API Test Results ===');
  results.forEach(stock => {
    console.log(`${stock.symbol}: $${stock.price} (${stock.changePercent}%) - ${stock.simulated ? 'SIMULATED' : 'REAL'}`);
  });
  
  console.log('\n✅ All symbols processed successfully!');
} catch (error) {
  console.error('❌ Test failed:', error.message);
}