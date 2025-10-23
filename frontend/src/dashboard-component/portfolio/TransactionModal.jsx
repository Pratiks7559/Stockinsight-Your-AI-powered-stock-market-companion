// TransactionModal.jsx
import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { portfolioAPI } from '../../utils/api';
import { useStockSearch } from '../../hooks/useStockSearch';
import socketService from '../../services/socketService';

const TransactionModal = ({ type, symbol: initialSymbol, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    symbol: initialSymbol || '',
    quantity: '',
    mode: 'SIMULATION'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState(null);
  const [previousQuote, setPreviousQuote] = useState(null);
  const [fetchingQuote, setFetchingQuote] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [priceChange, setPriceChange] = useState(null); // 'up', 'down', or null
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const { searchResults, loading: searchingSymbols, searchStocks, clearSearch } = useStockSearch();
  // SELL: allow selling by target market value amount
  const [sellMode, setSellMode] = useState('QUANTITY'); // 'QUANTITY' | 'AMOUNT'
  const [sellAmount, setSellAmount] = useState('');
  // BUY: allow buying by target spend amount
  const [buyMode, setBuyMode] = useState('QUANTITY'); // 'QUANTITY' | 'AMOUNT'
  const [buyAmount, setBuyAmount] = useState('');
  // Enhanced pricing logic
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [executionPrice, setExecutionPrice] = useState(null);
  const [priceSlippage, setPriceSlippage] = useState(0);
  const [maxSlippage] = useState(0.05); // 5% maximum slippage allowed
  const [isExecuting, setIsExecuting] = useState(false);
  // Refs for throttling and cleanup
  const lastPriceUpdateRef = useRef(0);
  const priceHandlerRef = useRef(null);
  const executionPriceRef = useRef(null);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (formData.symbol && formData.symbol.length >= 1) {
      searchStocks(formData.symbol);
      setShowSuggestions(true);
    } else {
      clearSearch();
      setShowSuggestions(false);
    }
  }, [formData.symbol, searchStocks, clearSearch]);

  // Symbol search handled by useStockSearch

  const selectSymbol = async (selected) => {
    const picked = typeof selected === 'string' ? selected : selected.symbol;
    const upperSymbol = (picked || '').toUpperCase();
    setFormData(prev => ({ ...prev, symbol: upperSymbol }));
    setShowSuggestions(false);
    clearSearch();
    
    // Fetch quote for selected symbol
    console.log('Fetching quote for:', upperSymbol);
    await fetchQuoteForSymbol(upperSymbol);
  };

  const fetchQuoteForSymbol = async (symbolToFetch, isRealTimeUpdate = false) => {
    console.log('fetchQuoteForSymbol called with:', symbolToFetch, 'isRealTimeUpdate:', isRealTimeUpdate);
    try {
      if (!isRealTimeUpdate) {
        setFetchingQuote(true);
      }
      
      console.log('Calling portfolioAPI.getQuote...');
      const response = await portfolioAPI.getQuote(symbolToFetch);
      console.log('Quote response:', response);
      
      // Track price changes for visual indicators
      if (quote && quote.price !== response.price) {
        setPreviousQuote(quote);
        const change = response.price > quote.price ? 'up' : 'down';
        setPriceChange(change);
        
        // Clear price change indicator after animation
        setTimeout(() => setPriceChange(null), 2000);
      }
      
      setQuote(response);
      setLastUpdateTime(new Date());
      
      console.log(`Live price ${isRealTimeUpdate ? 'updated' : 'fetched'} for ${symbolToFetch}: ${response.price.toFixed(2)}`);
    } catch (err) {
      console.error('Error fetching quote:', err);
      if (!isRealTimeUpdate) {
        setQuote(null);
        setPreviousQuote(null);
      }
    } finally {
      if (!isRealTimeUpdate) {
        setFetchingQuote(false);
      }
    }
  };

  // Auto-fetch quote when symbol is typed (short debounce for snappier UX)
  useEffect(() => {
    if (formData.symbol && formData.symbol.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchQuoteForSymbol(formData.symbol);
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.symbol]);

  // Socket-based real-time price updates as soon as a symbol is present
  useEffect(() => {
    if (!formData.symbol) return;

    const handlePriceUpdate = (data) => {
      if (!data || data.symbol?.toUpperCase() !== formData.symbol.toUpperCase()) return;

      // Derive price change direction for visual indicator
      if (quote && data.price !== undefined && data.price !== quote.price) {
        setPreviousQuote(quote);
        setPriceChange(data.price > quote.price ? 'up' : 'down');
        setTimeout(() => setPriceChange(null), 2000);
      }

      // Throttle UI updates to ~100ms for smoothness
      const now = Date.now();
      if (now - lastPriceUpdateRef.current < 100) return;
      lastPriceUpdateRef.current = now;

      // Normalize fields to modal's quote shape
      setQuote({
        price: typeof data.price === 'number' ? data.price : Number(data.price),
        change: typeof data.change === 'number' ? data.change : Number(data.change ?? 0),
        percent_change: typeof data.changePercent === 'number' ? data.changePercent : Number(data.changePercent ?? 0)
      });
      setLastUpdateTime(new Date());
    };

    // Ensure socket connected and subscribe for this symbol
    socketService.connect();
    socketService.subscribeToPrices([formData.symbol], handlePriceUpdate);
    priceHandlerRef.current = handlePriceUpdate;

    return () => {
      try {
        // Remove our listener to avoid leaks/duplicates
        if (priceHandlerRef.current) {
          socketService.socket?.off('price:update', priceHandlerRef.current);
          priceHandlerRef.current = null;
        }
      } catch {}
    };
  }, [formData.symbol, showSuggestions, quote]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-correct symbol to uppercase
    const finalValue = name === 'symbol' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    setError('');
    
    // Clear quote when symbol changes
    if (name === 'symbol') {
      setQuote(null);
      setPreviousQuote(null);
      setPriceChange(null);
      setLastUpdateTime(null);
      setShowSuggestions(true);
    }

    if (name === 'sellAmount') {
      setSellAmount(finalValue);
    }
    if (name === 'buyAmount') {
      setBuyAmount(finalValue);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   const isSellAmountMode = type === 'SELL' && sellMode === 'AMOUNT';
  //   const isBuyAmountMode = type === 'BUY' && buyMode === 'AMOUNT';
  //   if (
  //     !formData.symbol ||
  //     (!isSellAmountMode && !isBuyAmountMode && !formData.quantity) ||
  //     !quote ||
  //     (isSellAmountMode && !sellAmount) ||
  //     (isBuyAmountMode && !buyAmount)
  //   ) {
  //     setError('Please select a symbol and enter quantity or amount. Market price will be fetched automatically.');
  //     return;
  //   }

  //   if (parseFloat(formData.quantity) <= 0 && !isSellAmountMode && !isBuyAmountMode) {
  //     setError('Quantity must be greater than 0');
  //     return;
  //   }

  //   // Show confirmation step with live pricing
  //   if (!showConfirmation) {
  //     try {
  //       setLoading(true);
  //       setError('');
        
  //       // Get the most current execution price
  //       const currentPrice = await getCurrentExecutionPrice(formData.symbol);
        
  //       const computedQuantity = isSellAmountMode
  //         ? Math.max(0, parseFloat(sellAmount || '0') / currentPrice)
  //         : isBuyAmountMode
  //           ? Math.max(0, parseFloat(buyAmount || '0') / currentPrice)
  //           : parseFloat(formData.quantity);
        
  //       // Calculate estimated slippage
  //       const slippage = calculatePriceSlippage(computedQuantity, currentPrice, type);
  //       const estimatedExecutionPrice = currentPrice * (1 + slippage);
        
  //       setPriceSlippage(slippage);
  //       setExecutionPrice(estimatedExecutionPrice);
  //       executionPriceRef.current = estimatedExecutionPrice;
  //       setShowConfirmation(true);
        
  //     } catch (err) {
  //       setError('Failed to get current market price. Please try again.');
  //     } finally {
  //       setLoading(false);
  //     }
  //     return;
  //   }

  //   // Execute the transaction with live pricing
  //   try {
  //     setIsExecuting(true);
  //     setError('');
      
  //     // Get final execution price (most current available)
  //     const finalPrice = await getCurrentExecutionPrice(formData.symbol);
      
  //     // Check for excessive slippage
  //     const priceDifference = Math.abs((finalPrice - quote.price) / quote.price);
  //     if (priceDifference > maxSlippage) {
  //       setError(`Price moved too much (${(priceDifference * 100).toFixed(2)}%). Please retry the transaction.`);
  //       setShowConfirmation(false);
  //       return;
  //     }
      
  //     const computedQuantity = isSellAmountMode
  //       ? Math.max(0, parseFloat(sellAmount || '0') / finalPrice)
  //       : isBuyAmountMode
  //         ? Math.max(0, parseFloat(buyAmount || '0') / finalPrice)
  //         : parseFloat(formData.quantity);

  //     const transactionData = {
  //       symbol: formData.symbol.toUpperCase(),
  //       quantity: computedQuantity,
  //       price: finalPrice,
  //       mode: formData.mode,
  //       executionNote: `Executed at live market price: ${finalPrice.toFixed(2)} (Est. slippage: ${(priceSlippage * 100).toFixed(3)}%)`
  //     };

  //     console.log('Executing transaction with live price:', finalPrice);
  //     await onSubmit(transactionData);
  //   } catch (err) {
  //     setError(err.response?.data?.error || 'Transaction failed');
  //     setShowConfirmation(false);
  //   } finally {
  //     setIsExecuting(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isSellAmountMode = type === 'SELL' && sellMode === 'AMOUNT';
    const isBuyAmountMode = type === 'BUY' && buyMode === 'AMOUNT';
    if (
      !formData.symbol ||
      (!isSellAmountMode && !isBuyAmountMode && !formData.quantity) ||
      !quote ||
      (isSellAmountMode && !sellAmount) ||
      (isBuyAmountMode && !buyAmount)
    ) {
      setError('Please select a symbol and enter quantity or amount. Market price will be fetched automatically.');
      return;
    }

    if (parseFloat(formData.quantity) <= 0 && !isSellAmountMode && !isBuyAmountMode) {
      setError('Quantity must be greater than 0');
      return;
    }

    // Show confirmation step with live pricing
    if (!showConfirmation) {
      try {
        setLoading(true);
        setError('');
        
        // Get the most current execution price
        const currentPrice = await getCurrentExecutionPrice(formData.symbol);
        
        const computedQuantity = isSellAmountMode
          ? Math.max(0, parseFloat(sellAmount || '0') / currentPrice)
          : isBuyAmountMode
            ? Math.max(0, parseFloat(buyAmount || '0') / currentPrice)
            : parseFloat(formData.quantity);
        
        // Calculate estimated slippage
        const slippage = calculatePriceSlippage(computedQuantity, currentPrice, type);
        const estimatedExecutionPrice = currentPrice * (1 + slippage);
        
        setPriceSlippage(slippage);
        setExecutionPrice(estimatedExecutionPrice);
        executionPriceRef.current = estimatedExecutionPrice;
        setShowConfirmation(true);
        
      } catch (err) {
        setError('Failed to get current market price. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Execute the transaction with live pricing
    try {
      setIsExecuting(true);
      setError('');
      
      // Get final execution price (most current available)
      const finalPrice = await getCurrentExecutionPrice(formData.symbol);
      
      // Check for excessive slippage
      const priceDifference = Math.abs((finalPrice - quote.price) / quote.price);
      if (priceDifference > maxSlippage) {
        setError(`Price moved too much (${(priceDifference * 100).toFixed(2)}%). Please retry the transaction.`);
        setShowConfirmation(false);
        return;
      }
      
      const computedQuantity = isSellAmountMode
        ? Math.max(0, parseFloat(sellAmount || '0') / finalPrice)
        : isBuyAmountMode
          ? Math.max(0, parseFloat(buyAmount || '0') / finalPrice)
          : parseFloat(formData.quantity);

      const transactionData = {
        symbol: formData.symbol.toUpperCase(),
        quantity: computedQuantity,
        price: finalPrice,
        mode: formData.mode,
        executionNote: `Executed at live market price: ${finalPrice.toFixed(2)} (Est. slippage: ${(priceSlippage * 100).toFixed(3)}%)`
      };

      console.log('Executing transaction with live price:', finalPrice);
      await onSubmit(transactionData);
    } catch (err) {
      setError(err.response?.data?.error || 'Transaction failed');
      setShowConfirmation(false);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleGoBack = () => {
    setShowConfirmation(false);
    setExecutionPrice(null);
    setPriceSlippage(0);
    setError('');
  };

  const calculateTotal = () => {
    const price = quote ? quote.price : 0;
    if (type === 'SELL' && sellMode === 'AMOUNT') {
      return parseFloat(sellAmount) || 0;
    }
    if (type === 'BUY' && buyMode === 'AMOUNT') {
      return parseFloat(buyAmount) || 0;
    }
    const quantity = parseFloat(formData.quantity) || 0;
    return quantity * price;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calculate price slippage based on order size and current price
  const calculatePriceSlippage = (quantity, currentPrice, orderType) => {
    if (!quantity || !currentPrice) return 0;
    
    const orderValue = quantity * currentPrice;
    // Simple slippage model: larger orders have more slippage
    let slippagePercent = 0;
    
    if (orderValue > 100000) slippagePercent = 0.02; // 2% for large orders (>$100k)
    else if (orderValue > 50000) slippagePercent = 0.015; // 1.5% for medium orders (>$50k)
    else if (orderValue > 10000) slippagePercent = 0.01; // 1% for moderate orders (>$10k)
    else slippagePercent = 0.005; // 0.5% for small orders
    
    // Buy orders typically face positive slippage, sell orders negative
    const slippageDirection = orderType === 'BUY' ? 1 : -1;
    return slippagePercent * slippageDirection;
  };

  // Get the most current live price for execution
  const getCurrentExecutionPrice = async (symbolToCheck) => {
    try {
      // First try to use the most recent WebSocket price
      if (quote && quote.price && (Date.now() - lastPriceUpdateRef.current < 5000)) {
        return quote.price;
      }
      
      // Fallback to fresh API call if WebSocket price is stale
      const freshQuote = await portfolioAPI.getQuote(symbolToCheck);
      return freshQuote.price;
    } catch (error) {
      console.error('Error getting execution price:', error);
      return quote?.price || 0;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 my-8 relative">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b transition-colors ${
          type === 'SELL' 
            ? 'border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900'
            : 'border-gray-200 dark:border-gray-700'
        }`}>
          <h2 className={`text-xl font-semibold flex items-center ${
            type === 'SELL' ? 'text-orange-900 dark:text-orange-100' : 'text-gray-900 dark:text-white'
          }`}>
            {type === 'BUY' ? '💰 Buy Stock' : '📈 Sell Stock'}
            {type === 'SELL' && (
              <span className="ml-2 px-2 py-1 text-xs bg-orange-200 text-orange-800 rounded-full">
                Market Price
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Confirmation Step */}
          {showConfirmation && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                🎯 Confirm {type} Order
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-yellow-700 dark:text-yellow-300">Symbol:</span>
                  <span className="font-medium text-yellow-900 dark:text-yellow-100">{formData.symbol}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-yellow-700 dark:text-yellow-300">Quantity:</span>
                  <span className="font-medium text-yellow-900 dark:text-yellow-100">
                    {(() => {
                      const isSellAmountMode = type === 'SELL' && sellMode === 'AMOUNT';
                      const isBuyAmountMode = type === 'BUY' && buyMode === 'AMOUNT';
                      if (isSellAmountMode || isBuyAmountMode) {
                        const currentPrice = quote?.price || 0;
                        const amount = isSellAmountMode ? sellAmount : buyAmount;
                        return (parseFloat(amount) / currentPrice).toFixed(4);
                      }
                      return formData.quantity;
                    })()} shares
                  </span>
                </div>
                
                <div className="flex justify-between border-t pt-2">
                  <span className="text-yellow-700 dark:text-yellow-300">Current Market Price:</span>
                  <span className="font-medium text-yellow-900 dark:text-yellow-100">
                    {formatCurrency(quote?.price || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-yellow-700 dark:text-yellow-300">Estimated Execution Price:</span>
                  <span className={`font-semibold ${
                    type === 'BUY' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(executionPrice || 0)}
                  </span>
                </div>
                
                {priceSlippage !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700 dark:text-yellow-300">Est. Slippage:</span>
                    <span className={`font-medium ${
                      Math.abs(priceSlippage) > 0.01 ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {priceSlippage > 0 ? '+' : ''}{(priceSlippage * 100).toFixed(3)}%
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span className="text-yellow-800 dark:text-yellow-200">Total {type === 'BUY' ? 'Cost' : 'Proceeds'}:</span>
                  <span className={`${
                    type === 'BUY' ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-2 bg-yellow-100 dark:bg-yellow-800 rounded text-xs text-yellow-600 dark:text-yellow-300">
                ⚠️ Prices shown are estimates. Final execution will use the live market price at the moment of transaction.
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {/* Order Form - Hidden during confirmation */}
          {!showConfirmation && (
            <>
              {/* Symbol Input */}
              <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Symbol *
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              onFocus={() => {
                // Pre-connect and show suggestions immediately for faster live updates
                try { socketService.connect(); } catch {}
                if (formData.symbol) setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
              placeholder="Search stocks (e.g., AAPL, Apple)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={loading}
            />
            
            {/* Auto-complete dropdown */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute z-[60] w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((symbol, index) => (
                  <div
                    key={index}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSymbol(symbol)}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {symbol.symbol}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {symbol.name} • {symbol.exchange}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchingSymbols && (
              <div className="absolute right-3 top-9 text-gray-400">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Quote Display */}
          {fetchingQuote && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
              <div className="text-sm text-blue-600 dark:text-blue-300">
                Fetching current price...
              </div>
            </div>
          )}

          {quote && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Current Price: 
                  <span className={`font-semibold ml-1 transition-all duration-300 ${
                    priceChange === 'up' ? 'text-green-600 animate-pulse' : 
                    priceChange === 'down' ? 'text-red-600 animate-pulse' : 
                    'text-gray-900 dark:text-white'
                  }`}>
                    {formatCurrency(quote.price)}
                    {priceChange === 'up' && <span className="ml-1 text-green-600">↗️</span>}
                    {priceChange === 'down' && <span className="ml-1 text-red-600">↘️</span>}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live Price"></div>
                  <span className="text-xs text-green-600 font-medium">LIVE</span>
                </div>
              </div>
              
              {quote.change !== undefined && (
                <div className={`text-sm mt-1 ${
                  quote.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.percent_change?.toFixed(2)}%)
                </div>
              )}
              
              {lastUpdateTime && (
                <div className="text-xs text-gray-400 mt-1">
                  Last updated: {lastUpdateTime.toLocaleTimeString()}
                </div>
              )}
              
              {previousQuote && (
                <div className="text-xs text-gray-500 mt-1">
                  Previous: {formatCurrency(previousQuote.price)}
                  <span className={`ml-2 ${
                    quote.price > previousQuote.price ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ({quote.price > previousQuote.price ? '+' : ''}{(quote.price - previousQuote.price).toFixed(2)})
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {type === 'SELL' && sellMode === 'AMOUNT'
                  ? 'Amount ($)'
                  : type === 'BUY' && buyMode === 'AMOUNT'
                    ? 'Amount ($)'
                    : 'Quantity *'}
              </label>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span>{type === 'SELL' ? 'Sell by' : 'Buy by'}</span>
                <button
                  type="button"
                  onClick={() => { setSellMode('QUANTITY'); setBuyMode('QUANTITY'); }}
                  className={`px-2 py-1 rounded border ${((type === 'SELL' && sellMode === 'QUANTITY') || (type === 'BUY' && buyMode === 'QUANTITY')) ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                  disabled={loading}
                >Qty</button>
                <button
                  type="button"
                  onClick={() => { setSellMode('AMOUNT'); setBuyMode('AMOUNT'); }}
                  className={`px-2 py-1 rounded border ${((type === 'SELL' && sellMode === 'AMOUNT') || (type === 'BUY' && buyMode === 'AMOUNT')) ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                  disabled={loading}
                >Amount</button>
              </div>
            </div>

            {(type === 'SELL' && sellMode === 'AMOUNT') || (type === 'BUY' && buyMode === 'AMOUNT') ? (
              <input
                type="number"
                name={type === 'SELL' ? 'sellAmount' : 'buyAmount'}
                value={type === 'SELL' ? sellAmount : buyAmount}
                onChange={handleInputChange}
                placeholder={type === 'SELL' ? 'Dollar amount to sell' : 'Dollar amount to buy'}
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={loading}
              />
            ) : (
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Number of shares"
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={loading}
              />
            )}
          </div>


          {/* Mode Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trading Mode
            </label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              <option value="SIMULATION">Simulation (Paper Trading)</option>
              <option value="BROKER">Live Trading (Broker)</option>
            </select>
          </div>

          {/* Total Calculation */}
          {formData.quantity && quote && (
            <div className={`mb-6 p-3 rounded-md border-l-4 transition-all duration-300 ${
              type === 'BUY' 
                ? 'bg-green-50 dark:bg-green-900 border-green-500' 
                : 'bg-orange-50 dark:bg-orange-900 border-orange-500'
            }`}>
              <div className="flex justify-between items-center">
                <div className={`text-sm flex items-center ${
                  type === 'BUY' ? 'text-green-600 dark:text-green-300' : 'text-orange-600 dark:text-orange-300'
                }`}>
                  <span>{type === 'BUY' ? 'Total Cost' : 'Market Value'}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2" title="Live Price"></div>
                </div>
                <div className={`text-lg font-bold transition-all duration-300 ${
                  priceChange === 'up' ? 'text-green-600 animate-pulse' : 
                  priceChange === 'down' ? 'text-red-600 animate-pulse' : 
                  type === 'BUY' ? 'text-green-700 dark:text-green-200' : 'text-orange-700 dark:text-orange-200'
                }`}>
                  {formatCurrency(calculateTotal())}
                  {priceChange === 'up' && <span className="ml-1 text-green-600">↗️</span>}
                  {priceChange === 'down' && <span className="ml-1 text-red-600">↘️</span>}
                </div>
              </div>
              <div className={`text-xs mt-1 ${
                type === 'BUY' ? 'text-green-500 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'
              }`}>
                {formData.quantity} shares × {formatCurrency(quote.price)} (live price)
              </div>
              
              {/* Price Impact Warning */}
              {(() => {
                const quantity = parseFloat(formData.quantity) || 0;
                const orderValue = quantity * (quote?.price || 0);
                const estimatedSlippage = calculatePriceSlippage(quantity, quote.price, type);
                
                if (orderValue > 50000) {
                  return (
                    <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-xs">
                      <div className="flex items-center text-yellow-600 dark:text-yellow-300">
                        <span className="mr-1">⚠️</span>
                        Large Order Alert: Est. slippage {Math.abs(estimatedSlippage * 100).toFixed(2)}%
                      </div>
                    </div>
                  );
                }
                return null;
              })()} 
              
              <div className="text-xs text-gray-400 mt-1">
                {type === 'SELL' ? 'You will receive this amount at current market price' : 'You will pay this amount at current market price'}
              </div>
            </div>
          )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {showConfirmation ? (
              <>
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isExecuting}
                >
                  ← Go Back
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                    type === 'BUY'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isExecuting}
                >
                  {isExecuting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Executing...
                    </span>
                  ) : (
                    `🚀 Execute ${type} Order`
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                    type === 'BUY'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={loading || !formData.symbol || (!formData.quantity && sellMode !== 'AMOUNT' && buyMode !== 'AMOUNT') || !quote}
                >
                  {loading ? 'Getting Price...' : `Review ${type === 'BUY' ? 'Buy' : 'Sell'} Order`}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;