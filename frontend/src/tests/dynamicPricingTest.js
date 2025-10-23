// tests/dynamicPricingTest.js
import dynamicPricing from '../utils/dynamicPricing.js';

/**
 * Test suite for dynamic pricing system
 * Run this in browser console or as a module test
 */

// Test data
const testScenarios = [
  {
    name: "Small Buy Order",
    symbol: "AAPL",
    currentPrice: 150.00,
    quantity: 100,
    orderType: "BUY",
    averageVolume: 50000000,
    expectedSlippage: "< 0.5%"
  },
  {
    name: "Large Buy Order", 
    symbol: "TSLA",
    currentPrice: 250.00,
    quantity: 10000,
    orderType: "BUY", 
    averageVolume: 25000000,
    expectedSlippage: "1-2%"
  },
  {
    name: "Small Sell Order",
    symbol: "MSFT",
    currentPrice: 300.00,
    quantity: 50,
    orderType: "SELL",
    averageVolume: 30000000,
    expectedSlippage: "< 0.3%"
  },
  {
    name: "After Hours Buy",
    symbol: "GOOGL", 
    currentPrice: 2500.00,
    quantity: 500,
    orderType: "BUY",
    averageVolume: 1000000,
    isMarketHours: false,
    expectedSlippage: "0.5-1.5%"
  }
];

// Test functions
const runDynamicPricingTests = () => {
  console.log("🧪 Running Dynamic Pricing Tests...\n");
  
  testScenarios.forEach((scenario, index) => {
    console.log(`\n📊 Test ${index + 1}: ${scenario.name}`);
    console.log("=" .repeat(50));
    
    const options = {
      averageVolume: scenario.averageVolume,
      isMarketHours: scenario.isMarketHours ?? true,
      volatility: 0.02
    };
    
    // Test price estimation
    const estimation = dynamicPricing.getEstimatedExecutionPrice(
      scenario.currentPrice,
      scenario.quantity, 
      scenario.orderType,
      options
    );
    
    console.log(`Symbol: ${scenario.symbol}`);
    console.log(`Order: ${scenario.orderType} ${scenario.quantity} shares`);
    console.log(`Current Price: $${scenario.currentPrice.toFixed(2)}`);
    console.log(`Estimated Execution Price: $${estimation.estimatedPrice.toFixed(4)}`);
    console.log(`Total Impact: ${(estimation.totalImpact * 100).toFixed(3)}%`);
    console.log(`Expected Range: ${scenario.expectedSlippage}`);
    
    // Breakdown of impacts
    console.log("\n🔍 Impact Breakdown:");
    Object.entries(estimation.breakdown).forEach(([key, value]) => {
      console.log(`  ${key}: ${(value * 100).toFixed(3)}%`);
    });
    
    // Test validation
    const validation = dynamicPricing.validateExecutionPrice(
      scenario.currentPrice,
      estimation.estimatedPrice,
      scenario.orderType,
      0.05 // 5% max slippage
    );
    
    console.log(`\n✅ Validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
    if (!validation.isValid) {
      console.log(`❌ Reason: ${validation.reason}`);
    }
    
    // Test execution summary
    const summary = dynamicPricing.formatExecutionSummary(
      scenario.symbol,
      scenario.quantity,
      scenario.orderType,
      scenario.currentPrice,
      estimation.estimatedPrice
    );
    
    console.log(`\n📋 Execution Summary:`);
    console.log(`  ${summary.summary}`);
    console.log(`  Total Value: $${summary.totals.totalValue.toFixed(2)}`);
    console.log(`  Slippage Cost: $${summary.pricing.slippageCost.toFixed(2)}`);
    console.log(`  Est. Fees: $${summary.totals.estimatedFees.toFixed(2)}`);
    console.log(`  Net Amount: $${summary.totals.netAmount.toFixed(2)}`);
  });
  
  console.log("\n🎯 All tests completed!");
};

// Market hours test
const testMarketHours = () => {
  console.log("\n⏰ Testing Market Hours Detection:");
  console.log("=" .repeat(40));
  
  const isOpen = dynamicPricing.isMarketOpen();
  console.log(`Market is currently: ${isOpen ? '🟢 OPEN' : '🔴 CLOSED'}`);
  
  // Test different times
  const testTimes = [
    { hour: 8, expected: false, desc: "Before market open (8 AM)" },
    { hour: 10, expected: true, desc: "During market hours (10 AM)" },
    { hour: 15, expected: true, desc: "Market close approaching (3 PM)" },
    { hour: 17, expected: false, desc: "After market close (5 PM)" }
  ];
  
  testTimes.forEach(test => {
    // Note: This is simplified - in real implementation you'd mock the time
    console.log(`${test.hour}:00 - ${test.desc}: ${test.expected ? '🟢 Open' : '🔴 Closed'}`);
  });
};

// Price monitor test  
const testPriceMonitor = () => {
  console.log("\n📡 Testing Price Monitor:");
  console.log("=" .repeat(40));
  
  const monitor = dynamicPricing.createPriceMonitor();
  
  // Subscribe to price updates
  monitor.subscribe('AAPL', (data) => {
    console.log(`📈 AAPL price update: $${data.price} (${data.change > 0 ? '+' : ''}${data.change.toFixed(2)})`);
  });
  
  // Simulate price updates
  console.log("Simulating price updates...");
  monitor.updatePrice('AAPL', { price: 150.00, change: 0.50, changePercent: 0.33 });
  monitor.updatePrice('AAPL', { price: 150.75, change: 1.25, changePercent: 0.84 });
  monitor.updatePrice('AAPL', { price: 149.80, change: -0.70, changePercent: -0.46 });
  
  // Test price staleness
  console.log(`Price age: ${monitor.getPriceAge('AAPL')}ms`);
  console.log(`Is stale (5s): ${monitor.isStale('AAPL', 5000)}`);
  
  setTimeout(() => {
    console.log(`Price age after 1s: ${monitor.getPriceAge('AAPL')}ms`);
    console.log(`Is stale (500ms): ${monitor.isStale('AAPL', 500)}`);
  }, 1000);
};

// Edge cases test
const testEdgeCases = () => {
  console.log("\n⚠️  Testing Edge Cases:");
  console.log("=" .repeat(40));
  
  const edgeCases = [
    {
      name: "Zero Quantity",
      price: 100,
      quantity: 0,
      type: "BUY"
    },
    {
      name: "Negative Price",
      price: -10,
      quantity: 100,
      type: "BUY"
    },
    {
      name: "Very Large Order",
      price: 50,
      quantity: 10000000,
      type: "SELL"
    },
    {
      name: "Penny Stock",
      price: 0.01,
      quantity: 100000,
      type: "BUY"
    }
  ];
  
  edgeCases.forEach(test => {
    console.log(`\n🔸 Testing: ${test.name}`);
    try {
      const estimation = dynamicPricing.getEstimatedExecutionPrice(
        test.price,
        test.quantity,
        test.type
      );
      
      console.log(`  Result: $${estimation.estimatedPrice.toFixed(4)} (${(estimation.totalImpact * 100).toFixed(3)}% impact)`);
      
      const validation = dynamicPricing.validateExecutionPrice(
        test.price,
        estimation.estimatedPrice,
        test.type
      );
      
      console.log(`  Valid: ${validation.isValid ? '✅' : '❌'}`);
      if (!validation.isValid) {
        console.log(`  Issue: ${validation.reason}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  });
};

// Main test runner
export const runAllTests = () => {
  console.clear();
  console.log("🚀 Dynamic Pricing System Test Suite");
  console.log("=" .repeat(60));
  
  runDynamicPricingTests();
  testMarketHours();
  testPriceMonitor();
  testEdgeCases();
  
  console.log("\n✅ Test Suite Complete!");
  console.log("Check console output for detailed results.");
};

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log("Run 'runAllTests()' to start the test suite");
}

export default {
  runDynamicPricingTests,
  testMarketHours,
  testPriceMonitor,
  testEdgeCases,
  runAllTests
};