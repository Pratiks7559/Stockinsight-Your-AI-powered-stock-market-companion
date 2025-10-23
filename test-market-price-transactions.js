// Test script to verify buy/sell functionality with market prices
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// Mock user token - replace with actual token for testing
const authToken = 'your_test_token_here';

const testBuyTransaction = async () => {
  try {
    console.log('\n=== Testing BUY Transaction ===');
    
    // First, get current market price for AAPL
    const quoteResponse = await axios.get(`${API_BASE_URL}/api/market-data/quotes?symbol=AAPL`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Current AAPL Price:', quoteResponse.data);
    const currentPrice = quoteResponse.data.price;
    
    // Now place buy order (no price needed - backend will use current market price)
    const buyResponse = await axios.post(`${API_BASE_URL}/api/transactions/buy`, {
      symbol: 'AAPL',
      quantity: 10,
      mode: 'SIMULATION'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'idempotency-key': `test_buy_${Date.now()}`
      }
    });
    
    console.log('Buy Order Result:', buyResponse.data);
    console.log(`✅ Buy order executed at market price: $${buyResponse.data.executedPrice}`);
    console.log(`💰 Total cost: $${buyResponse.data.totalCost}`);
    
    return buyResponse.data;
  } catch (error) {
    console.error('❌ Buy transaction failed:', error.response?.data || error.message);
  }
};

const testSellTransaction = async () => {
  try {
    console.log('\n=== Testing SELL Transaction ===');
    
    // Get current market price for AAPL
    const quoteResponse = await axios.get(`${API_BASE_URL}/api/market-data/quotes?symbol=AAPL`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Current AAPL Price:', quoteResponse.data);
    const currentPrice = quoteResponse.data.price;
    
    // Place sell order (no price needed - backend will use current market price)
    const sellResponse = await axios.post(`${API_BASE_URL}/api/transactions/sell`, {
      symbol: 'AAPL',
      quantity: 5,
      mode: 'SIMULATION'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'idempotency-key': `test_sell_${Date.now()}`
      }
    });
    
    console.log('Sell Order Result:', sellResponse.data);
    console.log(`✅ Sell order executed at market price: $${sellResponse.data.executedPrice}`);
    console.log(`💰 Total received: $${sellResponse.data.totalReceived}`);
    
    return sellResponse.data;
  } catch (error) {
    console.error('❌ Sell transaction failed:', error.response?.data || error.message);
  }
};

const testPortfolioFetch = async () => {
  try {
    console.log('\n=== Testing Portfolio Fetch ===');
    
    const portfolioResponse = await axios.get(`${API_BASE_URL}/api/portfolio`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Portfolio fetched successfully');
    console.log('Holdings:', portfolioResponse.data.portfolio.holdings.length);
    console.log('Total Value:', portfolioResponse.data.summary.totalCurrentValue);
    
    return portfolioResponse.data;
  } catch (error) {
    console.error('❌ Portfolio fetch failed:', error.response?.data || error.message);
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting Market Price Transaction Tests...');
  console.log('Backend URL:', API_BASE_URL);
  
  // Note: You need to replace authToken with actual token for testing
  if (authToken === 'your_test_token_here') {
    console.log('\n⚠️  Please update the authToken in this script with a valid JWT token');
    console.log('You can get a token by logging into the frontend and checking localStorage');
    return;
  }
  
  await testPortfolioFetch();
  await testBuyTransaction();
  await testSellTransaction();
  
  console.log('\n🎉 Tests completed!');
};

runTests();
