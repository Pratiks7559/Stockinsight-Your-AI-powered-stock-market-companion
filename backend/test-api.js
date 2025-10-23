// Test script to verify the FMP API endpoint
import fetch from 'node-fetch';

const FMP_API_KEY = 'shA2KL17hYtytGh1Is0ndplWDJnb1WYu';
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

async function testFMPAPI() {
  try {
    console.log('Testing Financial Modeling Prep API...');
    
    const response = await fetch(`${FMP_BASE_URL}/quotes/index?apikey=${FMP_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.length} indices`);
    
    // Show first 5 indices as sample
    console.log('\n📊 Sample indices data:');
    data.slice(0, 5).forEach((index, i) => {
      console.log(`${i + 1}. ${index.name || index.symbol}: $${index.price} (${index.changesPercentage >= 0 ? '+' : ''}${index.changesPercentage}%)`);
    });
    
    // Filter major indices
    const majorIndices = [
      '^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX', '^TNX', 
      '^FTSE', '^GDAXI', '^FCHI', '^N225', '^HSI', '^BSESN', '^NSEI'
    ];
    
    const majorIndicesData = data.filter(index => 
      majorIndices.includes(index.symbol) || 
      index.name.toLowerCase().includes('s&p') ||
      index.name.toLowerCase().includes('dow') ||
      index.name.toLowerCase().includes('nasdaq') ||
      index.name.toLowerCase().includes('nifty') ||
      index.name.toLowerCase().includes('sensex') ||
      index.name.toLowerCase().includes('russell')
    );
    
    console.log(`\n🎯 Found ${majorIndicesData.length} major indices:`);
    majorIndicesData.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name || index.symbol}: $${index.price} (${index.changesPercentage >= 0 ? '+' : ''}${index.changesPercentage}%)`);
    });
    
  } catch (error) {
    console.error('❌ Error testing FMP API:', error.message);
  }
}

testFMPAPI();